import { NextRequest, NextResponse } from 'next/server'
import { PrivyClient } from '@privy-io/server-auth'

export async function GET(request: NextRequest) {
  try {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
    const appSecret = process.env.PRIVY_APP_SECRET

    console.log('🔍 Privy Config Check:', {
      hasAppId: !!appId,
      appIdPrefix: appId?.substring(0, 10),
      hasAppSecret: !!appSecret,
      appSecretPrefix: appSecret?.substring(0, 10),
    })

    if (!appId || !appSecret) {
      return NextResponse.json({
        error: 'Missing Privy configuration',
        hasAppId: !!appId,
        hasAppSecret: !!appSecret,
      }, { status: 500 })
    }

    // Try to create Privy client
    try {
      const privy = new PrivyClient(appId, appSecret)
      return NextResponse.json({
        success: true,
        message: 'Privy client initialized successfully',
        appId: appId.substring(0, 10) + '...',
      })
    } catch (error) {
      return NextResponse.json({
        error: 'Failed to create Privy client',
        details: error instanceof Error ? error.message : 'Unknown error',
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Privy test failed:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
