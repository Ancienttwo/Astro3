/**
 * WalletConnect Authentication API
 * 纯Web3钱包认证端点，不依赖Privy
 * 面向Web3原生用户
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyMessage } from 'viem';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRY = '7d';

// Nonce storage (in production, use Redis)
const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

/**
 * POST /api/auth/walletconnect/nonce
 * Generate nonce for wallet signature
 */
export async function POST(request: NextRequest) {
  // Handle nonce generation
  if (request.nextUrl.pathname.endsWith('/nonce')) {
    try {
      const { walletAddress } = await request.json();
      
      if (!walletAddress) {
        return NextResponse.json(
          { error: 'Wallet address required' },
          { status: 400 }
        );
      }
      
      // Generate random nonce
      const nonce = crypto.randomBytes(32).toString('hex');
      
      // Store nonce with 5 minute expiry
      nonceStore.set(walletAddress.toLowerCase(), {
        nonce,
        expiresAt: Date.now() + 5 * 60 * 1000
      });
      
      // Clean expired nonces
      for (const [key, value] of nonceStore.entries()) {
        if (value.expiresAt < Date.now()) {
          nonceStore.delete(key);
        }
      }
      
      return NextResponse.json({ nonce });
    } catch (error) {
      console.error('Nonce generation failed:', error);
      return NextResponse.json(
        { error: 'Failed to generate nonce' },
        { status: 500 }
      );
    }
  }
  
  // Handle wallet authentication
  try {
    const { walletAddress, signature, message, nonce } = await request.json();
    
    if (!walletAddress || !signature || !message || !nonce) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Verify nonce
    const storedNonce = nonceStore.get(walletAddress.toLowerCase());
    if (!storedNonce || storedNonce.nonce !== nonce) {
      return NextResponse.json(
        { error: 'Invalid or expired nonce' },
        { status: 401 }
      );
    }
    
    if (storedNonce.expiresAt < Date.now()) {
      nonceStore.delete(walletAddress.toLowerCase());
      return NextResponse.json(
        { error: 'Nonce expired' },
        { status: 401 }
      );
    }
    
    // Verify signature (viem)
    const ok = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message,
      signature: (signature.startsWith('0x') ? signature : `0x${signature}`) as `0x${string}`,
    })
    if (!ok) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Remove used nonce
    nonceStore.delete(walletAddress.toLowerCase());
    
    // Get or create user
    const normalizedAddress = walletAddress.toLowerCase();
    const virtualEmail = `${normalizedAddress}@web3.wallet`;
    
    // Check if user exists
    let { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', normalizedAddress)
      .single();
    
    if (!existingUser) {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          wallet_address: normalizedAddress,
          email: virtualEmail,
          username: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
          auth_type: 'walletconnect',
          auth_provider: 'walletconnect',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_sign_in: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Failed to create user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }
      
      existingUser = newUser;
      
      // Create initial credits
      await supabaseAdmin
        .from('user_credits')
        .insert({
          user_id: existingUser.id,
          free_credits: 10,
          paid_credits: 0,
          total_used: 0
        })
        .single();
    } else {
      // Update last sign in
      await supabaseAdmin
        .from('users')
        .update({
          last_sign_in: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id);
    }
    
    // Get user credits
    const { data: credits } = await supabaseAdmin
      .from('user_credits')
      .select('free_credits, paid_credits, subscription_tier')
      .eq('user_id', existingUser.id)
      .single();
    
    // Generate JWT (custom for legacy clients)
    const jwtPayload = {
      userId: existingUser.id,
      walletAddress: normalizedAddress,
      authType: 'walletconnect',
      email: virtualEmail,
      role: 'authenticated',
      iss: 'astrozi',
      aud: 'astrozi-users'
    };
    
    const token = jwt.sign(jwtPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256'
    });
    
    // Create session record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await supabaseAdmin
      .from('user_sessions')
      .insert({
        user_id: existingUser.id,
        supabase_jwt: token,
        device_info: {
          wallet: 'walletconnect',
          address: normalizedAddress
        },
        expires_at: expiresAt.toISOString()
      });
    
    // Log authentication event
    await supabaseAdmin
      .from('auth_logs')
      .insert({
        user_id: existingUser.id,
        event_type: 'login',
        provider: 'walletconnect',
        wallet_address: normalizedAddress,
        success: true,
        created_at: new Date().toISOString()
      });
    
    // Additionally, generate a standard Supabase session (unified with Privy flow)
    let accessToken: string | null = null
    let refreshToken: string | null = null

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: virtualEmail,
    })
    if (linkError || !(linkData as any)?.action_link) {
      const { data: recData, error: recErr } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: virtualEmail,
      })
      if (!recErr && (recData as any)?.action_link) {
        const u = new URL((recData as any).action_link)
        accessToken = u.searchParams.get('access_token')
        refreshToken = u.searchParams.get('refresh_token')
      }
    } else {
      const u = new URL((linkData as any).action_link)
      accessToken = u.searchParams.get('access_token')
      refreshToken = u.searchParams.get('refresh_token')
    }

    const now = new Date()
    const sessionExpiresAt = Math.floor((now.getTime() + 24 * 60 * 60 * 1000) / 1000)
    const session = accessToken ? {
      access_token: accessToken,
      refresh_token: refreshToken || accessToken,
      expires_in: 86400,
      expires_at: sessionExpiresAt,
      token_type: 'bearer' as const,
      user: {
        id: existingUser.id,
        aud: 'authenticated',
        role: 'authenticated',
        email: virtualEmail,
        email_confirmed_at: now.toISOString(),
        phone: '',
        confirmed_at: now.toISOString(),
        last_sign_in_at: now.toISOString(),
        app_metadata: { provider: 'walletconnect', providers: ['walletconnect'] },
        user_metadata: {
          auth_type: 'web3',
          auth_provider: 'walletconnect',
          wallet_address: normalizedAddress,
        },
        identities: [],
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
    } : null

    return NextResponse.json({
      success: true,
      jwt: token,
      session,
      user: {
        id: existingUser.id,
        walletAddress: normalizedAddress,
        username: existingUser.username,
        email: existingUser.email
      },
      credits: credits?.free_credits || 0,
      isPremium: credits?.subscription_tier !== 'free'
    });
    
  } catch (error) {
    console.error('WalletConnect auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/walletconnect
 * Get current wallet session
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authentication token' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    
    // Verify JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Check if this is a WalletConnect user
    if (decoded.authType !== 'walletconnect') {
      return NextResponse.json(
        { error: 'Not a WalletConnect session' },
        { status: 403 }
      );
    }
    
    // Get user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/walletconnect
 * Logout wallet session
 */
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: true });
    }
    
    const token = authHeader.substring(7);
    
    // Verify JWT to get user ID
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ success: true });
    }
    
    // Delete sessions
    await supabaseAdmin
      .from('user_sessions')
      .delete()
      .eq('user_id', decoded.userId);
    
    // Log logout event
    await supabaseAdmin
      .from('auth_logs')
      .insert({
        user_id: decoded.userId,
        event_type: 'logout',
        provider: 'walletconnect',
        wallet_address: decoded.walletAddress,
        success: true,
        created_at: new Date().toISOString()
      });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
