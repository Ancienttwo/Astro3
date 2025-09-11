# Login System Product Requirements Document (PRD)

## 1. Executive Summary

### 1.1 Product Overview
AstroZi is transitioning from traditional email-based authentication to a Web3-first authentication system using Privy SDK. This system will provide seamless wallet connections and social login options while maintaining security and user experience.

### 1.2 Objectives
- Eliminate email/password authentication completely
- Implement pure Web3 wallet-based authentication
- Integrate social logins through Privy (Google, Twitter, Discord, GitHub, Apple)
- Maintain user data continuity with Supabase backend
- Provide seamless user experience across Web3 and Web2 login methods

## 2. User Personas

### 2.1 Crypto Native User
- **Profile**: Experienced with Web3, owns multiple wallets
- **Needs**: Quick wallet connection, multi-chain support
- **Pain Points**: Cumbersome email registration, password management

### 2.2 Web2 User
- **Profile**: New to crypto, familiar with social logins
- **Needs**: Simple onboarding, familiar login methods
- **Pain Points**: Complex wallet setup, seed phrase management

### 2.3 Power User
- **Profile**: Uses both Web3 and traditional services
- **Needs**: Flexibility, multiple linked accounts
- **Pain Points**: Managing multiple authentication methods

## 3. Functional Requirements

### 3.1 Authentication Methods

#### 3.1.1 Wallet Connection
- **Supported Wallets**:
  - MetaMask
  - WalletConnect
  - Coinbase Wallet
  - Trust Wallet
  - OKX Wallet
  - Rainbow
  - Phantom
  - Rabby

- **Supported Chains**:
  - Ethereum Mainnet
  - BSC (Binance Smart Chain) - Primary
  - Polygon
  - Arbitrum (future)
  - Optimism (future)

#### 3.1.2 Social Logins (via Privy)
- Google OAuth
- Twitter OAuth
- Discord OAuth
- GitHub OAuth
- Apple Sign-In

#### 3.1.3 Embedded Wallets
- Auto-create embedded wallets for social login users
- Secure key management by Privy
- Seamless Web3 functionality for Web2 users

### 3.2 User Journey

#### 3.2.1 First-Time User Flow
1. User lands on login page
2. Sees "Connect" button with wallet/social options
3. Selects preferred method:
   - **Wallet**: Opens wallet connection modal → Signs message → Account created
   - **Social**: OAuth flow → Embedded wallet created → Account created
4. Redirected to dashboard with onboarding
5. Optional: Link additional accounts

#### 3.2.2 Returning User Flow
1. User clicks "Connect"
2. System detects previous connection method
3. Auto-connects if wallet available
4. One-click login for social accounts
5. Session restored from Supabase

### 3.3 Account Management

#### 3.3.1 Account Linking
- Link multiple wallets to single account
- Link social accounts to wallet account
- Primary authentication method designation
- Account recovery options

#### 3.3.2 Session Management
- JWT-based sessions with Supabase
- Auto-refresh tokens
- Multi-device support
- Session expiry: 7 days (configurable)

### 3.4 Security Requirements

#### 3.4.1 Authentication Security
- Message signing for wallet authentication (EIP-4361)
- Nonce-based replay attack prevention
- Rate limiting on authentication attempts
- IP-based suspicious activity detection

#### 3.4.2 Data Protection
- No password storage
- Encrypted wallet addresses in database
- Secure JWT generation and validation
- HTTPS-only communication

### 3.5 User Interface Requirements

#### 3.5.1 Login Page
- Clean, modern design with Web3 aesthetics
- Clear wallet/social options
- Multi-language support (Chinese/English/Japanese)
- Loading states and error handling
- Mobile-responsive design

#### 3.5.2 Connected State
- Display connected wallet/account
- Show network/chain indicator
- Quick disconnect option
- Account switcher for multiple accounts

## 4. Non-Functional Requirements

### 4.1 Performance
- Login completion < 3 seconds
- Wallet detection < 500ms
- Page load < 1 second
- 99.9% uptime

### 4.2 Scalability
- Support 100,000+ concurrent users
- Handle 1,000 login requests/second
- Horizontal scaling capability

### 4.3 Compatibility
- **Browsers**: Chrome, Firefox, Safari, Edge, Brave
- **Mobile**: iOS Safari, Chrome Mobile
- **Wallet Apps**: All major mobile wallet apps

### 4.4 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## 5. Technical Specifications

### 5.1 Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Authentication**: Privy SDK
- **Wallet Integration**: WalletConnect v2, Ethers.js
- **Backend**: Supabase (PostgreSQL, Auth, Functions)
- **State Management**: Zustand, React Context

### 5.2 API Endpoints
- `POST /api/auth/privy` - Verify Privy token and create session
- `GET /api/auth/session` - Get current session
- `POST /api/auth/logout` - End session
- `POST /api/auth/link` - Link additional accounts
- `DELETE /api/auth/unlink` - Unlink accounts

### 5.3 Database Schema
```sql
-- Users table
users (
  id UUID PRIMARY KEY,
  privy_did TEXT UNIQUE NOT NULL,
  wallet_address TEXT UNIQUE,
  ens_name TEXT,
  linked_accounts JSONB,
  credits INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_sign_in TIMESTAMP
)

-- Sessions table
user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  privy_token TEXT,
  supabase_jwt TEXT,
  device_info JSONB,
  ip_address INET,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
)

-- Account links table
account_links (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  linked_at TIMESTAMP,
  UNIQUE(provider, provider_id)
)
```

## 6. Migration Strategy

### 6.1 Phase 1: Parallel Systems (Week 1-2)
- Deploy Privy alongside existing email auth
- Add "Login with Wallet" option
- Monitor adoption and issues

### 6.2 Phase 2: Migration Campaign (Week 3-4)
- Prompt email users to link wallets
- Offer incentives (bonus credits)
- Provide migration guides

### 6.3 Phase 3: Deprecation (Week 5-6)
- Disable new email registrations
- Warning notices for email users
- Support for account migration

### 6.4 Phase 4: Sunset (Week 7-8)
- Remove email login completely
- Archive email auth code
- Full Web3/Social only system

## 7. Success Metrics

### 7.1 Adoption Metrics
- 80% users migrated within 30 days
- 95% login success rate
- < 2% authentication errors

### 7.2 Performance Metrics
- Average login time < 2 seconds
- 99.9% authentication service uptime
- < 100ms API response time

### 7.3 User Satisfaction
- NPS score > 8
- Support tickets < 5% of users
- User retention > 90%

## 8. Risks and Mitigation

### 8.1 Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Privy service outage | High | Implement fallback mechanisms, caching |
| Wallet compatibility issues | Medium | Extensive testing, multiple wallet support |
| Session sync problems | Medium | Robust error handling, retry logic |

### 8.2 User Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| User resistance to change | High | Gradual migration, clear communication |
| Lost access to wallets | High | Account recovery options, support |
| Confusion with new system | Medium | Comprehensive docs, onboarding |

## 9. Future Enhancements

### 9.1 Version 2.0
- Biometric authentication
- Hardware wallet support
- Multi-signature accounts
- Advanced MFA options

### 9.2 Version 3.0
- Cross-chain identity
- Decentralized identity (DID)
- Zero-knowledge proofs
- Social recovery mechanisms

## 10. Appendix

### 10.1 Glossary
- **DID**: Decentralized Identifier
- **EIP-4361**: Sign-In with Ethereum standard
- **MFA**: Multi-Factor Authentication
- **OAuth**: Open Authorization protocol
- **RLS**: Row Level Security
- **JWT**: JSON Web Token

### 10.2 References
- [Privy Documentation](https://docs.privy.io)
- [WalletConnect Specs](https://docs.walletconnect.com)
- [EIP-4361 Standard](https://eips.ethereum.org/EIPS/eip-4361)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

---

**Document Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: In Development  
**Owner**: AstroZi Development Team