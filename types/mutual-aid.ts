// Mutual Aid DTOs

export type MutualAidUrgency = 'low' | 'medium' | 'high' | 'critical'
export type MutualAidCategory = 'financial' | 'medical' | 'education' | 'family' | 'disaster' | 'other'
export type MutualAidStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed' | 'expired' | 'cancelled'

export interface RequesterInfo {
  walletAddress: string
  reputationScore: number
  totalContributions: number
  verificationStatus: string
  memberSince: string
}

export interface ValidationSummary {
  total: number
  approved: number
  rejected: number
  requiredValidations: number
}

export interface PredictionInfo {
  severityLevel: number
  confidenceScore?: number
  timeframe?: string
  supportRecommendations?: any
  analysisWeights?: any
  challenges?: string[]
  opportunities?: string[]
  advice?: string
}

// Pending validation list item
export interface PendingValidationRequestDTO {
  id: string
  amount: string
  reason: string
  severityLevel: number
  urgency: MutualAidUrgency
  category: MutualAidCategory
  status: MutualAidStatus
  publicMessage?: string
  createdAt: string
  expiresAt?: string | null
  requester: RequesterInfo
  validationSummary: ValidationSummary
  prediction?: PredictionInfo
  reward: {
    baseReward: number
    bonusMultiplier: number
    estimatedTotal: number
  }
}

// My requests summary item
export interface MyRequestSummaryDTO {
  id: string
  amount: string
  reason: string
  severityLevel: number
  urgency: MutualAidUrgency
  category: MutualAidCategory
  status: MutualAidStatus
  publicMessage?: string
  supportingDocuments?: string[]
  createdAt: string
  updatedAt?: string
  expiresAt?: string | null
  cancelledAt?: string | null
  completedAt?: string | null
  validationSummary: {
    total: number
    approved: number
    rejected: number
    averageConfidence: number
    requiredValidations: number
    isComplete: boolean
  }
}

// Validation history item
export interface ValidationHistoryItemDTO {
  id: string
  vote: 'approve' | 'reject'
  confidenceScore: number
  reason?: string
  reviewTimeSeconds?: number
  createdAt: string
  request: {
    id: string
    amount: string
    reason: string
    category: MutualAidCategory | 'unknown'
    urgency: MutualAidUrgency
    status: MutualAidStatus
    severityLevel: number
    createdAt: string
    requester: {
      walletAddress: string
      reputationScore: number
    }
  }
  resultStatus: {
    status: MutualAidStatus | 'unknown'
    isCorrect: boolean | null
    description: string
    impact: {
      type: 'positive' | 'protective' | 'conservative' | 'generous' | 'neutral'
      description: string
    }
  }
}

export interface SubmitValidationResultDTO {
  validation: {
    id: string
    vote: 'approve' | 'reject'
    confidenceScore: number
    createdAt: string
  }
  validationResult:
    | { isComplete: true; approved: boolean; finalStatus: MutualAidStatus }
    | { isComplete: false; progress: { current: number; required: number } }
  reward: { base: number; multiplier: number; total: number }
  message: string
}

