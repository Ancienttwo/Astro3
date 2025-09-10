import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWeb3Auth } from '@/lib/auth';
import { ethers } from 'ethers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AdversityAnalysisRequest {
  walletAddress: string;
  fortuneSlipNumber: number;
  birthData: {
    year: number;
    month: number;
    day: number;
    hour: number;
  };
  jiaobeiConfirmed: boolean;
  personalContext: {
    currentSituation: string;
    duration: string;
    severity: 'low' | 'medium' | 'high';
  };
}

interface AIAnalysisResult {
  severityLevel: number; // 1-10 scale
  mutualAidEligible: boolean;
  recommendedAidAmount: string;
  timeframe: string;
  analysis: {
    fortuneSlipWeight: number;
    baziWeight: number;
    ziweiWeight: number;
    contextWeight: number;
    confidenceScore: number;
  };
  supportRecommendations: Array<{
    type: 'financial' | 'emotional' | 'practical';
    description: string;
    amount?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  validationRequired: boolean;
  estimatedValidationTime: string;
}

/**
 * POST /api/mutual-aid/adversity-analysis
 * Request AI-powered adversity analysis for potential mutual aid
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: AdversityAnalysisRequest = await request.json();
    const { 
      walletAddress, 
      fortuneSlipNumber, 
      birthData, 
      jiaobeiConfirmed,
      personalContext 
    } = body;

    // Validate required fields
    if (!walletAddress || !fortuneSlipNumber || !birthData || !jiaobeiConfirmed) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_FAILED',
            message: 'Missing required fields',
            details: {
              required: ['walletAddress', 'fortuneSlipNumber', 'birthData', 'jiaobeiConfirmed']
            }
          }
        }, 
        { status: 400 }
      );
    }

    // Verify Web3 authentication
    const authResult = await verifyWeb3Auth(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Invalid or missing authentication',
            details: authResult.error
          }
        },
        { status: 401 }
      );
    }

    // Verify wallet address matches authenticated user
    if (walletAddress.toLowerCase() !== authResult.walletAddress.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'WALLET_MISMATCH',
            message: 'Wallet address does not match authenticated user',
          }
        },
        { status: 403 }
      );
    }

    // Get fortune slip data
    const { data: fortuneSlip, error: fortuneError } = await supabase
      .from('fortune_slips')
      .select(`
        *,
        temple_systems!inner(temple_code)
      `)
      .eq('slip_number', fortuneSlipNumber)
      .eq('temple_systems.temple_code', 'guandi')
      .single();

    if (fortuneError || !fortuneSlip) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORTUNE_SLIP_NOT_FOUND',
            message: `Fortune slip ${fortuneSlipNumber} not found`,
          }
        },
        { status: 404 }
      );
    }

    // Get user's historical data for analysis
    const { data: userHistory } = await supabase
      .from('user_reputation_scores')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    // Perform AI analysis
    const analysis = await performAdversityAnalysis({
      fortuneSlip,
      birthData,
      personalContext,
      userHistory
    });

    // Store prediction in database
    const { data: prediction, error: predictionError } = await supabase
      .from('mutual_aid_predictions')
      .insert({
        user_id: authResult.userId,
        wallet_address: walletAddress,
        fortune_slip_number: fortuneSlipNumber,
        birth_data: birthData,
        jiaobei_confirmed: jiaobeiConfirmed,
        personal_context: personalContext,
        severity_level: analysis.severityLevel,
        mutual_aid_eligible: analysis.mutualAidEligible,
        recommended_aid_amount: analysis.recommendedAidAmount,
        analysis_weights: analysis.analysis,
        confidence_score: analysis.analysis.confidenceScore,
        timeframe: analysis.timeframe,
        challenges: extractChallenges(analysis),
        opportunities: extractOpportunities(analysis),
        advice: generateAdvice(analysis),
        support_recommendations: analysis.supportRecommendations
      })
      .select()
      .single();

    if (predictionError) {
      console.error('Error storing prediction:', predictionError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to store prediction',
          }
        },
        { status: 500 }
      );
    }

    // Return analysis results
    return NextResponse.json({
      success: true,
      prediction: {
        id: prediction.id,
        severityLevel: analysis.severityLevel,
        mutualAidEligible: analysis.mutualAidEligible,
        recommendedAidAmount: analysis.recommendedAidAmount,
        timeframe: analysis.timeframe,
        analysis: analysis.analysis,
        supportRecommendations: analysis.supportRecommendations,
        validationRequired: analysis.validationRequired,
        estimatedValidationTime: analysis.estimatedValidationTime
      }
    });

  } catch (error) {
    console.error('Adversity analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error during analysis',
          requestId: generateRequestId()
        }
      },
      { status: 500 }
    );
  }
}

/**
 * Perform comprehensive adversity analysis using multiple traditional systems
 */
async function performAdversityAnalysis({
  fortuneSlip,
  birthData,
  personalContext,
  userHistory
}: {
  fortuneSlip: any;
  birthData: any;
  personalContext: any;
  userHistory: any;
}): Promise<AIAnalysisResult> {
  
  // 1. Fortune Slip Analysis (40% weight)
  const fortuneAnalysis = analyzeFortuneSlip(fortuneSlip);
  
  // 2. Bazi Analysis (30% weight)
  const baziAnalysis = analyzeBazi(birthData);
  
  // 3. Ziwei Analysis (20% weight)  
  const ziweiAnalysis = analyzeZiwei(birthData);
  
  // 4. Personal Context Analysis (10% weight)
  const contextAnalysis = analyzePersonalContext(personalContext);

  // Calculate weighted severity level
  const severityLevel = Math.round(
    fortuneAnalysis.severity * 0.4 +
    baziAnalysis.severity * 0.3 +
    ziweiAnalysis.severity * 0.2 +
    contextAnalysis.severity * 0.1
  );

  // Determine mutual aid eligibility (severity >= 6)
  const mutualAidEligible = severityLevel >= 6;
  
  // Calculate recommended aid amount based on severity and user history
  const baseAmount = Math.min(severityLevel * 10, 100); // Max 100 AZI
  const historyModifier = userHistory ? Math.min(userHistory.overall_score / 3.0, 1.5) : 1.0;
  const recommendedAidAmount = Math.round(baseAmount * historyModifier).toString();

  // Generate support recommendations
  const supportRecommendations = generateSupportRecommendations(
    severityLevel, 
    personalContext, 
    recommendedAidAmount
  );

  return {
    severityLevel,
    mutualAidEligible,
    recommendedAidAmount,
    timeframe: getTimeframe(severityLevel),
    analysis: {
      fortuneSlipWeight: 0.4,
      baziWeight: 0.3,
      ziweiWeight: 0.2,
      contextWeight: 0.1,
      confidenceScore: calculateConfidenceScore([
        fortuneAnalysis.confidence,
        baziAnalysis.confidence, 
        ziweiAnalysis.confidence,
        contextAnalysis.confidence
      ])
    },
    supportRecommendations,
    validationRequired: mutualAidEligible,
    estimatedValidationTime: mutualAidEligible ? '12-24 hours' : 'N/A'
  };
}

/**
 * Analyze fortune slip for adversity indicators
 */
function analyzeFortuneSlip(fortuneSlip: any) {
  const fortuneLevel = fortuneSlip.fortune_level || '';
  const categories = fortuneSlip.categories || [];
  
  let severity = 5; // Default neutral
  let confidence = 0.7;
  
  // Analyze fortune level
  if (fortuneLevel.includes('下下') || fortuneLevel.includes('凶')) {
    severity = 8;
    confidence = 0.9;
  } else if (fortuneLevel.includes('下') || fortuneLevel.includes('小凶')) {
    severity = 7;
    confidence = 0.8;
  } else if (fortuneLevel.includes('中') || fortuneLevel.includes('平')) {
    severity = 5;
    confidence = 0.7;
  } else if (fortuneLevel.includes('上') || fortuneLevel.includes('吉')) {
    severity = 3;
    confidence = 0.8;
  } else if (fortuneLevel.includes('大吉') || fortuneLevel.includes('上上')) {
    severity = 2;
    confidence = 0.9;
  }
  
  // Analyze categories for specific challenges
  if (Array.isArray(categories)) {
    const challengeCount = categories.filter((cat: any) => {
      const judgment = typeof cat === 'string' ? JSON.parse(cat).judgment : cat.judgment;
      return judgment && (
        judgment.includes('不利') || 
        judgment.includes('困難') ||
        judgment.includes('破財') ||
        judgment.includes('失敗')
      );
    }).length;
    
    severity += Math.min(challengeCount, 3); // Add up to 3 points for multiple challenges
  }
  
  return { severity: Math.min(severity, 10), confidence };
}

/**
 * Analyze Bazi (Eight Characters) for adversity periods
 */
function analyzeBazi(birthData: any) {
  // Simplified Bazi analysis - in production, this would use a proper Bazi library
  const { year, month, day, hour } = birthData;
  
  let severity = 5;
  let confidence = 0.6;
  
  // Check for challenging periods based on current lunar calendar
  const currentYear = new Date().getFullYear();
  const birthYear = year;
  const ageGroup = Math.floor((currentYear - birthYear) / 12);
  
  // Simplified conflict analysis
  if (ageGroup % 3 === 2) { // Every 3rd 12-year cycle can be challenging
    severity += 1;
  }
  
  // Month-based seasonal analysis
  const currentMonth = new Date().getMonth() + 1;
  const birthMonth = month;
  const monthDiff = Math.abs(currentMonth - birthMonth);
  
  if (monthDiff === 6) { // Opposite seasons can indicate challenges
    severity += 1;
    confidence = 0.7;
  }
  
  return { severity: Math.min(severity, 10), confidence };
}

/**
 * Analyze Ziwei for current fortune periods
 */
function analyzeZiwei(birthData: any) {
  // Simplified Ziwei analysis - in production, this would use proper Ziwei calculations
  const { year, month, day } = birthData;
  
  let severity = 5;
  let confidence = 0.5;
  
  // Simplified life palace analysis
  const lifePalace = (year + month + day) % 12;
  const currentPeriod = Math.floor(new Date().getFullYear() / 10) % 12;
  
  // Check for conflicting periods
  if (Math.abs(lifePalace - currentPeriod) === 6) {
    severity += 2;
    confidence = 0.8;
  } else if (Math.abs(lifePalace - currentPeriod) <= 2) {
    severity -= 1;
    confidence = 0.7;
  }
  
  return { severity: Math.max(1, Math.min(severity, 10)), confidence };
}

/**
 * Analyze personal context for severity indicators
 */
function analyzePersonalContext(personalContext: any) {
  const { currentSituation, duration, severity: userSeverity } = personalContext;
  
  let severity = 5;
  let confidence = 0.9; // High confidence in user-provided context
  
  // Map user severity to numeric scale
  const severityMap = {
    'low': 3,
    'medium': 6,
    'high': 9
  };
  
  severity = severityMap[userSeverity] || 5;
  
  // Adjust based on duration
  if (duration.includes('week') || duration.includes('急')) {
    severity += 1;
  } else if (duration.includes('month') || duration.includes('持續')) {
    severity += 2;
  }
  
  // Analyze situation keywords
  const highSeverityKeywords = ['失業', '疾病', '破產', '離婚', '死亡'];
  const mediumSeverityKeywords = ['壓力', '困難', '挫折', '損失'];
  
  const situationText = currentSituation.toLowerCase();
  const highCount = highSeverityKeywords.filter(keyword => situationText.includes(keyword)).length;
  const mediumCount = mediumSeverityKeywords.filter(keyword => situationText.includes(keyword)).length;
  
  severity += highCount * 2 + mediumCount;
  
  return { severity: Math.min(severity, 10), confidence };
}

/**
 * Generate support recommendations based on analysis
 */
function generateSupportRecommendations(
  severityLevel: number, 
  personalContext: any, 
  recommendedAmount: string
) {
  const recommendations = [];
  
  if (severityLevel >= 7) {
    recommendations.push({
      type: 'financial' as const,
      description: 'Immediate financial support for basic needs',
      amount: recommendedAmount,
      priority: 'high' as const
    });
  }
  
  if (severityLevel >= 5) {
    recommendations.push({
      type: 'emotional' as const,
      description: 'Community peer support matching',
      priority: severityLevel >= 7 ? 'high' as const : 'medium' as const
    });
  }
  
  recommendations.push({
    type: 'practical' as const,
    description: 'Traditional wisdom guidance and advice',
    priority: 'medium' as const
  });
  
  return recommendations;
}

/**
 * Helper functions
 */
function getTimeframe(severityLevel: number): string {
  if (severityLevel >= 8) return '接下来3天';
  if (severityLevel >= 6) return '接下来7天';
  if (severityLevel >= 4) return '接下来30天';
  return '接下来90天';
}

function calculateConfidenceScore(confidenceScores: number[]): number {
  const average = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;
  return Math.round(average * 100) / 100;
}

function extractChallenges(analysis: AIAnalysisResult): string[] {
  const challenges = [];
  if (analysis.severityLevel >= 7) challenges.push('財務壓力');
  if (analysis.severityLevel >= 6) challenges.push('人際關係');
  if (analysis.severityLevel >= 5) challenges.push('工作挑戰');
  return challenges;
}

function extractOpportunities(analysis: AIAnalysisResult): string[] {
  const opportunities = [];
  if (analysis.severityLevel <= 4) opportunities.push('新的合作機會');
  opportunities.push('個人成長機會');
  opportunities.push('社群支持網絡');
  return opportunities;
}

function generateAdvice(analysis: AIAnalysisResult): string {
  if (analysis.severityLevel >= 7) {
    return '當前正處於挑戰期，建議尋求社區支持，保持耐心和積極心態。';
  } else if (analysis.severityLevel >= 5) {
    return '面臨一些困難，但通過努力和社區協助可以克服。保持信心。';
  } else {
    return '整體運勢平穩，適合穩步前進，可以考慮幫助他人。';
  }
}

function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}