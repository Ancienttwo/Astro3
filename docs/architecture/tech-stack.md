# Tech Stack

## Core Technologies

### Frontend Framework
- **Next.js 15.3.4** - React-based framework with App Router
  - Server Components for optimal performance
  - API Routes for backend functionality
  - Image optimization and lazy loading
  - Built-in internationalization support

### Language & Type System
- **TypeScript 5.8.3** - Primary development language
  - Gradual type adoption (strict mode disabled)
  - Type safety for new components
  - Enhanced IDE support and autocomplete

### UI & Styling
- **React 19.1.0** - UI library
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Radix UI** - Headless component primitives
  - Accessible and customizable components
  - Dialog, Dropdown, Accordion, etc.
- **Framer Motion 12.20.2** - Animation library
- **Lucide React** - Icon library

### State Management
- **Zustand 5.0.6** - Lightweight state management
  - Global application state
  - Persistent state with localStorage
- **React Context** - Feature-specific state
  - Language context
  - Settings context
  - User preferences

### Database & Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication service
  - Edge Functions support

### Authentication
- **Supabase Auth** - Primary authentication
  - Email/password authentication
  - OAuth providers
  - Session management
- **Web3 Integration**
  - WalletConnect 2.21.5
  - Ethereum wallet authentication
  - BSC network support

### Blockchain & Web3
- **Ethers.js 6.15.0** - Ethereum library
- **WalletConnect** - Wallet integration
  - Multi-chain support
  - QR code connection
- **OpenZeppelin Contracts 5.3.0** - Smart contract libraries
- **Hardhat 2.25.0** - Ethereum development environment

### API & Services
- **Axios 1.10.0** - HTTP client
- **Nodemailer 7.0.5** - Email service
- **Google APIs 154.1.0** - Google services integration
- **Notion Client 4.0.1** - Notion API integration

### Data Processing
- **Lunar (JavaScript/TypeScript)** - Chinese calendar calculations
  - Lunar-javascript 1.7.3
  - Lunar-typescript 1.6.3
- **Zod 3.25.74** - Schema validation
- **UUID 11.1.0** - Unique identifier generation
- **JSONWebToken 9.0.2** - JWT handling

### Caching & Performance
- **Redis 5.5.6** - Caching layer
- **IORedis 5.6.1** - Redis client
- **React Window 1.8.11** - Virtual scrolling

### Development Tools

#### Build & Bundle
- **Next.js Bundler** - Webpack-based bundling
- **SWC** - Rust-based compilation
- **Bundle Analyzer** - Bundle size optimization

#### Code Quality
- **ESLint 9.30.0** - Linting
- **Prettier** - Code formatting
- **TypeScript Compiler** - Type checking

#### Testing
- **Jest 29.7.0** - Unit testing framework
- **Playwright 1.53.2** - E2E testing
- **Supertest 6.3.3** - API testing
- **Testing Library** - React component testing

#### Development Environment
- **PNPM 8.14.0** - Package manager
- **Docker** - Containerization
- **Hardhat** - Smart contract development

### Deployment & Infrastructure

#### Hosting
- **Vercel** - Primary deployment platform
  - Automatic deployments
  - Edge functions
  - Preview deployments
- **Cloudflare** - CDN and China access

#### Monitoring
- **Vercel Analytics** - Performance monitoring
- **Error tracking** - Built-in error handling

#### CI/CD
- **GitHub Actions** - Automated workflows
- **Vercel GitHub Integration** - Automatic deployments

### AI & Automation
- **MCP SDK 1.17.0** - Model Context Protocol

### Payment Processing
- **Stripe 18.2.1** - Payment gateway
  - Subscription management
  - Payment processing
  - Webhook handling

## Environment Requirements

### Node.js
- **Minimum Version**: 18.0.0
- **Recommended**: 20.x LTS

### Package Manager
- **PNPM**: 8.14.0 or higher
- Workspace support for monorepo structure

## API Integrations

### External Services
1. **Supabase**
   - Database operations
   - Authentication
   - Real-time updates
   - File storage

2. **Stripe**
   - Payment processing
   - Subscription management
   - Invoice generation

3. **WalletConnect**
   - Web3 wallet connections
   - Transaction signing
   - Multi-chain support

4. **Email Services**
   - SMTP configuration
   - Transactional emails
   - Newsletter support

## Database Schema

### Key Tables
- `users` - User profiles and authentication
- `user_credits` - Credit balance system
- `divinations` - Fortune telling records
- `charts` - Astrology chart data
- `tasks` - User task tracking
- `transactions` - Payment records

### Database Features
- Row Level Security (RLS)
- Real-time subscriptions
- Database functions
- Triggers for automated tasks

## Security Stack

### Authentication & Authorization
- JWT-based session management
- Role-based access control
- API key authentication for services

### Data Protection
- Environment variable management
- Encrypted sensitive data
- HTTPS enforcement
- CORS configuration

### Smart Contract Security
- OpenZeppelin secure contracts
- Reentrancy guards
- Access control modifiers
- Pausable functionality

## Performance Optimizations

### Frontend
- Server-side rendering (SSR)
- Static site generation (SSG)
- Incremental static regeneration (ISR)
- Image optimization
- Code splitting
- Lazy loading

### Backend
- Database indexing
- Query optimization
- Redis caching
- Connection pooling

### Bundle Optimization
- Tree shaking
- Minification
- Compression
- Dynamic imports

## Monitoring & Analytics

### Performance Monitoring
- Core Web Vitals tracking
- Error boundary implementation
- Performance budgets

### User Analytics
- Page view tracking
- User behavior analysis
- Conversion tracking

## Multi-language Support

### Supported Languages
- Chinese (zh) - Default
- English (en)
- Japanese (ja)

### Implementation
- JSON-based translations
- Dynamic language switching
- Persistent language preference
- SEO optimization per language

## Development Workflow

### Version Control
- Git for source control
- GitHub for repository hosting
- Conventional commits

### Code Review
- Pull request workflow
- Automated testing
- Code quality checks

### Documentation
- README files
- API documentation
- Code comments
- Architecture diagrams

---

*Last Updated: 2024*
*Version: 1.0.0*