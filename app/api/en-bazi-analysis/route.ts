import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/server/db'

const supabaseAdmin = getSupabaseAdminClient()
import { calculatePeachBlossomStarsEn, getPeachBlossomAnalysisEn } from '@/lib/bazi/peach-blossom-stars-en'

// Simplified authentication function
async function authenticateRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return { success: false, error: 'Missing authentication token' }
    }
    
    const token = authHeader.substring(7)
    
    // Verify token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return { success: false, error: 'Authentication failed' }
    }
    
    return { success: true, user }
  } catch {
    return { success: false, error: 'Authentication error' }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    console.log('🎯 Received English Bazi analysis request:', body)

    const { year, month, day, hour, gender, yearBranch, dayBranch, dayStem, allBranches } = body

    // Parameter validation
    if (!year || !month || !day || !hour || !gender) {
      return NextResponse.json({
        error: 'Missing required parameters',
        details: 'Complete birth information is required'
      }, { status: 400 })
    }

    console.log('🔍 Preparing English Bazi analysis request')

    // Calculate peach blossom stars
    let peachBlossomAnalysis = ""
    if (yearBranch && dayBranch && dayStem && allBranches) {
      const peachBlossomStars = calculatePeachBlossomStarsEn(yearBranch, dayBranch, dayStem, allBranches)
      peachBlossomAnalysis = getPeachBlossomAnalysisEn(peachBlossomStars)
      console.log('🌸 Peach blossom stars analysis:', peachBlossomStars)
    }

    // Basic Bazi analysis
    const analysis = `Bazi Analysis Results:
    
Birth Information: ${year}/${month}/${day} ${hour}:00
Gender: ${gender}

${peachBlossomAnalysis ? `Peach Blossom Stars Analysis: ${peachBlossomAnalysis}` : ''}

Note: Complete Bazi analysis functionality is under development.`

    // Save analysis record (database logic can be added here)
    console.log('💾 Saving English Bazi analysis record')

    return NextResponse.json({
      success: true,
      analysis,
      peachBlossomStars: yearBranch && dayBranch && dayStem && allBranches ? 
        calculatePeachBlossomStarsEn(yearBranch, dayBranch, dayStem, allBranches) : null,
      metadata: {
        analysisType: 'bazi-en',
        timestamp: new Date().toISOString(),
        powered_by: 'Traditional Chinese Astrology'
      }
    })

  } catch (error) {
    console.error('❌ English Bazi analysis failed:', error)
    return NextResponse.json({
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
