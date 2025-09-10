# CLAUDE.md - Project Configuration

This is the project configuration file for Claude Code to understand the project context and requirements.

## Project Overview

This is AstroZi, a Chinese astrology and fortune-telling web application built with Next.js and Supabase. The project includes:

- Bazi (Eight Characters) and Ziwei (Purple Star) astrology calculations
- Guandi fortune slip divination system
- Multi-language support (Chinese, English, Japanese)
- Web3 integration with wallet authentication
- Task and points systems for user engagement

## Technology Stack

- **Frontend**: Next.js 14+ with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL database with RLS)
- **Authentication**: Supabase Auth + Web3 wallet integration
- **Deployment**: Vercel with Cloudflare for China access
- **Web3**: WalletConnect integration on BSC network

## Development Guidelines

### Code Quality Standards
- Maximum 200 lines per file for JavaScript/TypeScript
- Use TypeScript for all new code
- Follow established component patterns
- Maintain consistent code style with Prettier/ESLint

### Database Management
- Use Supabase CLI for database migrations
- Always test migrations locally first
- Use English names for database objects to avoid encoding issues
- Implement proper RLS policies for data security

### Security Requirements
- Never commit secrets or API keys
- Use environment variables for all configuration
- Implement proper input validation
- Follow OWASP security guidelines

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - React components organized by feature
- `/lib` - Utility functions, services, and configurations
- `/hooks` - Custom React hooks
- `/types` - TypeScript type definitions
- `/supabase` - Database migrations and functions

## Environment Setup

Required environment variables in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://fbtumedqykpgichytumn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Deployment Process

1. Test changes locally
2. Run database migrations via Supabase CLI
3. Deploy to Vercel
4. Verify functionality in production

---

*Project configuration for AstroZi astrology application*