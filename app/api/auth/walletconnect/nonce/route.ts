/**
 * WalletConnect Nonce Generation API
 * Generates nonces for wallet signature verification
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// In production, use Redis for nonce storage
// For now, using in-memory storage (will reset on server restart)
const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
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
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    nonceStore.set(walletAddress.toLowerCase(), {
      nonce,
      expiresAt
    });
    
    // Clean expired nonces
    for (const [key, value] of nonceStore.entries()) {
      if (value.expiresAt < Date.now()) {
        nonceStore.delete(key);
      }
    }
    
    // Log nonce generation
    console.log(`Generated nonce for wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);
    
    return NextResponse.json({ 
      nonce,
      expiresIn: 300 // 5 minutes in seconds
    });
    
  } catch (error) {
    console.error('Nonce generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}

// Export the nonce store for use in the main auth route
export { nonceStore };