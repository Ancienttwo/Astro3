import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    // Validate Ethereum address format
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
    if (!ethAddressRegex.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      )
    }

    const normalizedAddress = address.toLowerCase()

    // Generate nonce directly (temporary solution for testing)
    const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    console.log('Generated nonce for address:', normalizedAddress, 'nonce:', nonce)

    return NextResponse.json({ nonce })

  } catch (error) {
    console.error('Get nonce API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}