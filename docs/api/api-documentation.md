# AstroZi Mutual Aid System - API Documentation

## Document Information
- **API Version**: 1.0
- **Base URL**: `https://api.astrozi.com/v1`
- **Authentication**: Web3 Wallet Signature + JWT Token
- **Date**: 2025-01-10
- **Status**: Development Ready

---

## Table of Contents
1. [Authentication](#authentication)
2. [Core API Endpoints](#core-api-endpoints)
3. [Mutual Aid System APIs](#mutual-aid-system-apis)
4. [NFT & Collection APIs](#nft--collection-apis)
5. [Community Governance APIs](#community-governance-apis)
6. [User Profile & Analytics APIs](#user-profile--analytics-apis)
7. [Webhook Events](#webhook-events)
8. [Rate Limits & Error Handling](#rate-limits--error-handling)
9. [SDK & Integration](#sdk--integration)

---

## Authentication

### 🔐 **Web3 Wallet Authentication Flow**

#### **Step 1: Request Challenge**
```http
POST /auth/challenge
Content-Type: application/json

{
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

**Response:**
```json
{
  "challenge": "AstroZi Mutual Aid Authentication\nWallet: 0x1234567890123456789012345678901234567890\nNonce: 8f7e9d6c\nTimestamp: 1704902400000\nPlease sign this message to verify your wallet ownership.",
  "nonce": "8f7e9d6c",
  "expiresIn": 300
}
```

#### **Step 2: Verify Signature & Get JWT**
```http
POST /auth/verify
Content-Type: application/json

{
  "walletAddress": "0x1234567890123456789012345678901234567890",
  "signature": "0x...",
  "challenge": "AstroZi Mutual Aid Authentication..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "profileComplete": true,
    "memberSince": "2025-01-10T00:00:00Z"
  }
}
```

#### **Headers for Authenticated Requests**
```http
Authorization: Bearer <jwt_token>
X-Wallet-Address: 0x1234567890123456789012345678901234567890
```

---

## Core API Endpoints

### 🔮 **Fortune Slip & AI Analysis APIs**

#### **Draw Guandi Fortune Slip**
```http
POST /fortune/guandi/draw
Authorization: Bearer <token>
Content-Type: application/json

{
  "birthData": {
    "year": 1990,
    "month": 5,
    "day": 15,
    "hour": 14
  },
  "question": "Career guidance for 2025",
  "jiaobeiConfirmed": true
}
```

**Response:**
```json
{
  "success": true,
  "drawing": {
    "id": "uuid-v4",
    "slipNumber": 23,
    "title": "求財如意",
    "titleEn": "Fortune and Prosperity",
    "content": "身安家吉利亨通...",
    "contentEn": "Family peace and prosperity...",
    "fortuneLevel": "中吉",
    "timestamp": "2025-01-10T08:30:00Z",
    "nftGenerated": true,
    "nftTokenId": "12345"
  },
  "aiAnalysis": {
    "severityLevel": 3,
    "mutualAidEligible": false,
    "prediction": {
      "timeframe": "接下来30天",
      "challenges": ["工作压力", "人际关系"],
      "opportunities": ["财运提升", "合作机会"],
      "advice": "保持耐心，积极沟通..."
    },
    "categories": [
      {
        "category": "功名",
        "categoryEn": "Career & Fame",
        "judgment": "宜守舊業，不宜創新",
        "judgmentEn": "Maintain current position, avoid major changes"
      }
    ]
  }
}
```

#### **Get Fortune History**
```http
GET /fortune/history?limit=20&offset=0&timeframe=3months
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "total": 45,
  "drawings": [
    {
      "id": "uuid-v4",
      "slipNumber": 23,
      "title": "求財如意",
      "drawnAt": "2025-01-10T08:30:00Z",
      "severityLevel": 3,
      "mutualAidReceived": false,
      "nftTokenId": "12345"
    }
  ],
  "analytics": {
    "averageSeverity": 4.2,
    "totalMutualAid": "150.5",
    "predictionsAccurate": 28,
    "nftsCollected": 12
  }
}
```

---

## Mutual Aid System APIs

### 💰 **Adversity Analysis & Aid Request**

#### **Request AI Adversity Analysis**
```http
POST /mutual-aid/adversity-analysis
Authorization: Bearer <token>
Content-Type: application/json

{
  "walletAddress": "0x1234567890123456789012345678901234567890",
  "fortuneSlipNumber": 95,
  "birthData": {
    "year": 1990,
    "month": 5,
    "day": 15,
    "hour": 14
  },
  "jiaobeiConfirmed": true,
  "personalContext": {
    "currentSituation": "Lost job last week, financial stress",
    "duration": "1week",
    "severity": "high"
  }
}
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "id": "pred-uuid-v4",
    "severityLevel": 8,
    "mutualAidEligible": true,
    "recommendedAidAmount": "50.0",
    "timeframe": "接下来7天",
    "analysis": {
      "fortuneSlipWeight": 0.4,
      "baziWeight": 0.3,
      "ziweiWeight": 0.2,
      "contextWeight": 0.1,
      "confidenceScore": 0.85
    },
    "supportRecommendations": [
      {
        "type": "financial",
        "description": "Immediate financial support for basic needs",
        "amount": "50.0",
        "priority": "high"
      },
      {
        "type": "emotional",
        "description": "Community peer support matching",
        "priority": "medium"
      }
    ],
    "validationRequired": true,
    "estimatedValidationTime": "12-24 hours"
  }
}
```

#### **Submit Mutual Aid Request**
```http
POST /mutual-aid/request-help
Authorization: Bearer <token>
Content-Type: application/json

{
  "predictionId": "pred-uuid-v4",
  "additionalContext": {
    "description": "Lost job due to company downsizing. Need support for rent and basic needs while job hunting.",
    "evidence": "termination_letter.pdf",
    "timeline": "Need support for next 2 weeks while actively job searching",
    "amount": "50.0"
  },
  "agreement": {
    "transparentProcess": true,
    "communityValidation": true,
    "updatesCommunity": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "request": {
    "id": "req-uuid-v4",
    "status": "pending_validation",
    "submittedAt": "2025-01-10T09:15:00Z",
    "validationDeadline": "2025-01-11T09:15:00Z",
    "estimatedValidators": 12,
    "currentValidators": 3,
    "requiredApprovals": 8
  },
  "nextSteps": [
    "Community validation in progress",
    "You'll be notified of the outcome within 24 hours",
    "Track progress in your dashboard"
  ]
}
```

#### **Check Aid Request Status**
```http
GET /mutual-aid/request/{requestId}/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "request": {
    "id": "req-uuid-v4",
    "status": "approved",
    "currentVotes": {
      "approve": 9,
      "reject": 2,
      "total": 11
    },
    "approvalThreshold": 8,
    "validationCompleteAt": "2025-01-10T21:30:00Z",
    "distributionStatus": "completed",
    "distributionTxHash": "0xabc123...",
    "amountDistributed": "50.0",
    "distributedAt": "2025-01-10T21:45:00Z"
  }
}
```

### 🤝 **Community Validation APIs**

#### **Get Pending Validation Requests**
```http
GET /mutual-aid/validation/pending?limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "pendingRequests": [
    {
      "id": "req-uuid-v4",
      "requesterId": "0x9876543210987654321098765432109876543210",
      "severityLevel": 7,
      "requestedAmount": "75.0",
      "submittedAt": "2025-01-10T10:00:00Z",
      "timeRemaining": "18 hours",
      "context": {
        "situation": "Medical emergency - hospital bills",
        "evidence": "medical_bills.pdf",
        "duration": "Immediate need"
      },
      "requesterHistory": {
        "previousRequests": 1,
        "previousApprovals": 1,
        "communityReputation": 4.2,
        "memberSince": "2024-08-15T00:00:00Z"
      },
      "currentVotes": {
        "approve": 5,
        "reject": 1,
        "myVote": null
      }
    }
  ],
  "myValidationPower": 1.5,
  "validationsPendingCount": 3,
  "validationsCompletedToday": 7
}
```

#### **Submit Validation Vote**
```http
POST /mutual-aid/validation/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "requestId": "req-uuid-v4",
  "vote": "approve",
  "reasoning": "Medical emergency with documented evidence. Requestor has good community reputation.",
  "confidenceLevel": 0.9,
  "nftTokenIds": ["12345", "12346", "12347"]
}
```

**Response:**
```json
{
  "success": true,
  "vote": {
    "id": "vote-uuid-v4",
    "weight": 1.5,
    "submittedAt": "2025-01-10T11:30:00Z",
    "reputationBonus": 0.1
  },
  "requestUpdate": {
    "currentStatus": "pending_validation",
    "totalVotes": {
      "approve": 6,
      "reject": 1
    },
    "approvalProgress": "75% (6/8 needed)"
  }
}
```

#### **Get Validation History**
```http
GET /mutual-aid/validation/history?limit=20&status=all
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "validations": [
    {
      "id": "vote-uuid-v4",
      "requestId": "req-uuid-v4",
      "myVote": "approve",
      "finalOutcome": "approved",
      "voteWeight": 1.5,
      "votedAt": "2025-01-10T11:30:00Z",
      "reputationEarned": 0.1,
      "wasCorrect": true
    }
  ],
  "statistics": {
    "totalVotes": 45,
    "accuracyRate": 0.87,
    "reputationScore": 4.2,
    "votingPower": 1.5
  }
}
```

---

## NFT & Collection APIs

### 🎨 **NFT Management**

#### **Get User NFT Collection**
```http
GET /nft/collection?limit=50&rarity=all&sortBy=newest
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "collection": {
    "totalNfts": 15,
    "byRarity": {
      "legendary": 1,
      "epic": 2,
      "common": 12
    },
    "collectionBonuses": {
      "milestone5": {
        "achieved": true,
        "reward": "Extra fortune reading per day",
        "achievedAt": "2025-01-05T00:00:00Z"
      },
      "milestone10": {
        "achieved": true,
        "reward": "1.5x mutual aid validation power",
        "achievedAt": "2025-01-08T00:00:00Z"
      },
      "milestone25": {
        "achieved": false,
        "progress": "15/25",
        "reward": "Community moderator privileges"
      }
    }
  },
  "nfts": [
    {
      "tokenId": "12345",
      "slipNumber": 23,
      "title": "求財如意",
      "titleEn": "Fortune and Prosperity",
      "rarity": "epic",
      "mintedAt": "2025-01-10T08:30:00Z",
      "metadata": {
        "image": "https://cdn.astrozi.com/nft/12345.png",
        "attributes": [
          {"trait_type": "Fortune Level", "value": "中吉"},
          {"trait_type": "Rarity", "value": "Epic"},
          {"trait_type": "Temple System", "value": "Guandi"}
        ]
      },
      "transferable": true,
      "governanceWeight": 2
    }
  ]
}
```

#### **Transfer NFT**
```http
POST /nft/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "tokenId": "12345",
  "recipientAddress": "0x9876543210987654321098765432109876543210",
  "message": "Hope this brings you guidance and good fortune!",
  "transferType": "gift"
}
```

**Response:**
```json
{
  "success": true,
  "transfer": {
    "id": "transfer-uuid-v4",
    "txHash": "0xdef456...",
    "status": "pending",
    "estimatedConfirmation": "2-5 minutes",
    "gasUsed": "45000",
    "transferFee": "0.001"
  }
}
```

#### **Claim Collection Bonus**
```http
POST /nft/collection/claim-bonus
Authorization: Bearer <token>
Content-Type: application/json

{
  "bonusType": "milestone10",
  "nftTokenIds": ["12345", "12346", "12347", "12348", "12349", "12350", "12351", "12352", "12353", "12354"]
}
```

**Response:**
```json
{
  "success": true,
  "bonus": {
    "type": "milestone10",
    "reward": "1.5x mutual aid validation power",
    "claimedAt": "2025-01-10T12:00:00Z",
    "newValidationPower": 1.5,
    "previousValidationPower": 1.0,
    "additionalBenefits": [
      "Priority access to community governance proposals",
      "Enhanced profile badge",
      "Increased daily $luck point rewards"
    ]
  }
}
```

---

## Community Governance APIs

### 🗳️ **Governance & Proposals**

#### **Get Active Governance Proposals**
```http
GET /governance/proposals?status=active&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "proposals": [
    {
      "id": "prop-uuid-v4",
      "title": "Increase mutual aid pool allocation to 65%",
      "description": "Proposal to increase community mutual aid allocation from 60% to 65% of new $AZI tokens",
      "proposer": "0xabc123...",
      "proposalType": "tokenomics",
      "status": "active",
      "votingPeriod": {
        "startDate": "2025-01-08T00:00:00Z",
        "endDate": "2025-01-15T23:59:59Z",
        "remainingTime": "4 days, 12 hours"
      },
      "currentVotes": {
        "for": {
          "count": 1250,
          "weight": 2847.5
        },
        "against": {
          "count": 340,
          "weight": 612.3
        },
        "abstain": {
          "count": 89,
          "weight": 156.8
        }
      },
      "requiredQuorum": 3000,
      "currentQuorum": 3616.6,
      "myVote": null,
      "myVotingPower": 1.5
    }
  ]
}
```

#### **Submit Governance Vote**
```http
POST /governance/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "proposalId": "prop-uuid-v4",
  "vote": "for",
  "reasoning": "Increasing mutual aid allocation aligns with our community values and will help more people during difficult times.",
  "nftTokenIds": ["12345", "12346", "12347"]
}
```

**Response:**
```json
{
  "success": true,
  "vote": {
    "id": "vote-uuid-v4",
    "weight": 1.5,
    "submittedAt": "2025-01-10T13:00:00Z",
    "txHash": "0x789def..."
  },
  "proposalUpdate": {
    "newTotals": {
      "for": {
        "count": 1251,
        "weight": 2849.0
      }
    },
    "quorumStatus": "Met (3617.6/3000)"
  }
}
```

#### **Create Community Proposal**
```http
POST /governance/proposals
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Add Japanese language support",
  "description": "Proposal to add full Japanese language support to expand our community in Japan",
  "category": "platform_improvement",
  "proposalType": "feature_request",
  "implementationPlan": {
    "timeline": "3 months",
    "estimatedCost": "$50,000",
    "team": "External translation partner + internal dev team"
  },
  "stakingAmount": "100.0"
}
```

**Response:**
```json
{
  "success": true,
  "proposal": {
    "id": "prop-new-uuid",
    "status": "draft",
    "reviewPeriod": "7 days",
    "stakingTxHash": "0x123abc...",
    "reviewStartDate": "2025-01-10T13:30:00Z"
  }
}
```

---

## User Profile & Analytics APIs

### 👤 **User Profile Management**

#### **Get User Profile**
```http
GET /user/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "memberSince": "2024-08-15T00:00:00Z",
    "profileStatus": "verified",
    "reputation": {
      "score": 4.2,
      "level": "trusted_member",
      "validationsAccuracy": 0.87,
      "totalValidations": 45
    },
    "balances": {
      "aziTokens": "245.75",
      "luckPoints": "1,250"
    },
    "achievements": [
      {
        "id": "first_mutual_aid",
        "name": "Community Helper",
        "description": "Received your first mutual aid",
        "earnedAt": "2024-09-01T00:00:00Z"
      },
      {
        "id": "nft_collector_10",
        "name": "NFT Collector",
        "description": "Collected 10 unique NFTs",
        "earnedAt": "2025-01-08T00:00:00Z"
      }
    ],
    "statistics": {
      "fortuneReadings": 67,
      "mutualAidReceived": "150.5",
      "mutualAidValidated": "2,350.0",
      "nftsOwned": 15,
      "governanceVotes": 12,
      "communityReferrals": 3
    }
  }
}
```

#### **Update Profile Settings**
```http
PUT /user/profile/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "preferences": {
    "language": "zh-TW",
    "timezone": "Asia/Taipei",
    "notifications": {
      "mutualAidRequests": true,
      "governanceProposals": true,
      "nftUpdates": false,
      "communityMessages": true
    },
    "privacy": {
      "showProfile": "community_only",
      "showValidationHistory": false,
      "showNftCollection": true
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "updated": [
    "language",
    "notifications",
    "privacy"
  ],
  "effective": "immediately"
}
```

### 📊 **Analytics & Insights**

#### **Get Community Analytics**
```http
GET /analytics/community?timeframe=30days
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "timeframe": "30days",
  "community": {
    "totalMembers": 8547,
    "activeMembers": 3234,
    "newMembers": 456,
    "mutualAid": {
      "totalDistributed": "45,678.25",
      "activeRequests": 12,
      "averageAmount": "67.5",
      "successRate": 0.83
    },
    "nfts": {
      "totalMinted": 12456,
      "uniqueCollectors": 2890,
      "averageCollection": 4.3
    },
    "governance": {
      "activeProposals": 3,
      "participationRate": 0.42,
      "averageVotingPower": 1.8
    }
  },
  "trends": {
    "memberGrowth": "+12.5%",
    "mutualAidVolume": "+8.3%",
    "communityEngagement": "+15.7%"
  }
}
```

#### **Get Personal Analytics**
```http
GET /analytics/personal?timeframe=90days
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "timeframe": "90days",
  "personal": {
    "fortuneAccuracy": {
      "predictions": 23,
      "accurate": 18,
      "accuracy": 0.78,
      "improvement": "+12% vs previous period"
    },
    "communityImpact": {
      "aidValidated": "2,350.0",
      "validationAccuracy": 0.87,
      "communityReputation": 4.2,
      "helpedUsers": 28
    },
    "nftCollection": {
      "totalNfts": 15,
      "rarityDistribution": {
        "legendary": 1,
        "epic": 2,
        "common": 12
      },
      "collectionValue": "estimated $450",
      "tradingActivity": 3
    },
    "luckPointsEarned": {
      "total": 1250,
      "sources": {
        "dailyCheckin": 400,
        "fortuneReadings": 350,
        "communityValidation": 300,
        "referrals": 150,
        "governance": 50
      }
    }
  }
}
```

---

## Webhook Events

### 📡 **Real-time Event Notifications**

#### **Webhook Registration**
```http
POST /webhooks/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://yourapp.com/webhooks/astrozi",
  "events": [
    "mutual_aid.request_created",
    "mutual_aid.validation_completed",
    "mutual_aid.tokens_distributed",
    "nft.minted",
    "governance.proposal_created"
  ],
  "secret": "your_webhook_secret_for_verification"
}
```

#### **Event Types & Payloads**

**Mutual Aid Request Created**
```json
{
  "event": "mutual_aid.request_created",
  "timestamp": "2025-01-10T09:15:00Z",
  "data": {
    "requestId": "req-uuid-v4",
    "requesterAddress": "0x1234567890123456789012345678901234567890",
    "amount": "50.0",
    "severityLevel": 8,
    "validationRequired": true
  }
}
```

**Tokens Distributed**
```json
{
  "event": "mutual_aid.tokens_distributed",
  "timestamp": "2025-01-10T21:45:00Z",
  "data": {
    "requestId": "req-uuid-v4",
    "recipientAddress": "0x1234567890123456789012345678901234567890",
    "amount": "50.0",
    "txHash": "0xabc123...",
    "distributionType": "mutual_aid"
  }
}
```

**NFT Minted**
```json
{
  "event": "nft.minted",
  "timestamp": "2025-01-10T08:30:00Z",
  "data": {
    "tokenId": "12345",
    "ownerAddress": "0x1234567890123456789012345678901234567890",
    "slipNumber": 23,
    "rarity": "epic",
    "metadataUri": "https://metadata.astrozi.com/12345"
  }
}
```

---

## Rate Limits & Error Handling

### ⚡ **Rate Limiting**

| Endpoint Category | Rate Limit | Reset Period |
|-------------------|------------|--------------|
| Authentication | 10 requests/minute | 1 minute |
| Fortune Readings | 50 requests/hour | 1 hour |
| Mutual Aid | 20 requests/hour | 1 hour |
| Validation | 100 requests/hour | 1 hour |
| NFT Operations | 30 requests/minute | 1 minute |
| Governance | 10 requests/minute | 1 minute |
| Analytics | 100 requests/hour | 1 hour |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1704906000
```

### ❌ **Error Response Format**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Wallet signature verification failed",
    "details": {
      "field": "signature",
      "reason": "Invalid signature format"
    },
    "requestId": "req-12345",
    "timestamp": "2025-01-10T12:00:00Z"
  }
}
```

**Common Error Codes:**
- `AUTHENTICATION_REQUIRED` (401)
- `INSUFFICIENT_PERMISSIONS` (403)
- `RESOURCE_NOT_FOUND` (404)
- `VALIDATION_FAILED` (400)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_SERVER_ERROR` (500)
- `SERVICE_UNAVAILABLE` (503)

---

## SDK & Integration

### 💻 **JavaScript SDK**

#### **Installation**
```bash
npm install @astrozi/mutual-aid-sdk
```

#### **Basic Usage**
```javascript
import { AstroZiSDK } from '@astrozi/mutual-aid-sdk';

const sdk = new AstroZiSDK({
  apiUrl: 'https://api.astrozi.com/v1',
  walletProvider: window.ethereum
});

// Authenticate
await sdk.auth.connect();

// Draw fortune slip
const fortune = await sdk.fortune.drawGuandiSlip({
  birthData: { year: 1990, month: 5, day: 15, hour: 14 },
  question: "Career guidance",
  jiaobeiConfirmed: true
});

// Request mutual aid if eligible
if (fortune.aiAnalysis.mutualAidEligible) {
  const request = await sdk.mutualAid.requestHelp({
    predictionId: fortune.aiAnalysis.prediction.id,
    description: "Need support for job transition"
  });
}
```

### 🔌 **Integration Examples**

#### **React Hook for Mutual Aid**
```typescript
import { useMutualAid } from '@astrozi/react-sdk';

function MutualAidComponent() {
  const { 
    requestAnalysis,
    requestHelp,
    status,
    loading,
    error 
  } = useMutualAid();

  const handleAnalysis = async () => {
    const result = await requestAnalysis({
      fortuneSlipNumber: 95,
      personalContext: "Lost job last week"
    });
    
    if (result.mutualAidEligible) {
      await requestHelp({
        predictionId: result.id,
        description: "Need support during job search"
      });
    }
  };

  return (
    <div>
      <button onClick={handleAnalysis} disabled={loading}>
        Request Analysis
      </button>
      {status && <div>Status: {status}</div>}
    </div>
  );
}
```

#### **Node.js Server Integration**
```javascript
const { AstroZiWebhook } = require('@astrozi/webhook-sdk');

const webhook = new AstroZiWebhook({
  secret: process.env.ASTROZI_WEBHOOK_SECRET
});

// Handle webhook events
app.post('/webhooks/astrozi', (req, res) => {
  const event = webhook.verify(req.body, req.headers);
  
  switch (event.type) {
    case 'mutual_aid.tokens_distributed':
      // Update your internal records
      updateUserBalance(event.data.recipientAddress, event.data.amount);
      break;
      
    case 'nft.minted':
      // Notify user of new NFT
      notifyUser(event.data.ownerAddress, 'New NFT minted!');
      break;
  }
  
  res.status(200).send('OK');
});
```

---

## API Testing

### 🧪 **Postman Collection**
Download our complete Postman collection:
- **Production**: `https://api.astrozi.com/v1/postman/collection.json`
- **Staging**: `https://staging-api.astrozi.com/v1/postman/collection.json`

### 🔧 **Testing Environment**
- **Staging API**: `https://staging-api.astrozi.com/v1`
- **Test Tokens**: Available through faucet at `/test/faucet`
- **Mock Data**: Predefined test scenarios for all endpoints

---

## Conclusion

This comprehensive API documentation provides everything needed to integrate with the AstroZi Mutual Aid System. The API is designed for:

- **Ease of Use**: Clear endpoints with consistent response formats
- **Security**: Web3 authentication with JWT tokens
- **Scalability**: Rate limiting and caching for production use
- **Reliability**: Comprehensive error handling and webhook events
- **Developer Experience**: SDKs, examples, and testing tools

**Ready for integration. Build the future of community-supported spiritual guidance.**

---

**Document Status**: ✅ **Complete**  
**API Status**: Development Ready  
**SDK Availability**: In Development

*For technical support: api-support@astrozi.com*