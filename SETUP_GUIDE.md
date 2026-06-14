# Installation & Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for caching)
- pnpm or npm

## Installation Steps

### 1. Install Dependencies

```bash
# Backend dependencies
cd packages/backend
pnpm install

# Frontend dependencies
cd ../frontend
pnpm install
```

### 2. Setup Environment Variables

```bash
# Copy example env files
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.local.example packages/frontend/.env.local

# Edit and configure the .env files with your values
```

### 3. Database Setup

```bash
cd packages/backend

# Generate Prisma Client
pnpm prisma generate

# Push schema to database
pnpm prisma db push

# (Optional) Seed database
pnpm prisma db seed
```

## Running the Application

### Option 1: Separate Terminals (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd packages/backend
pnpm start:dev
```

**Terminal 2 - Frontend:**
```bash
cd packages/frontend
pnpm dev
```

### Option 2: Using Turbo (from root)

```bash
pnpm turbo dev
```

## Access Points

- **Frontend Application:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Documentation:** http://localhost:3001/api (if Swagger enabled)
- **App Builder:** http://localhost:3000/builder
- **Code Explorer:** http://localhost:3000/explorer
- **Semantic Search:** http://localhost:3000/search

## Key Features

### Phase 6 - Repository Intelligence
- ✅ Import GitHub repositories
- ✅ Code analysis and semantic search
- ✅ Vector embeddings with pgvector
- ✅ Code intelligence (explain, summarize, bug detection)

### Phase 7 - AI App Builder
- ✅ Generate full-stack apps from prompts
- ✅ Multi-step generation pipeline
- ✅ Code validation and type checking
- ✅ Build system integration
- ✅ Deployment support (Vercel, Heroku, Docker)
- ✅ AI-powered code editing

## Development Commands

```bash
# Format code
pnpm format

# Run linting
pnpm lint

# Type checking
pnpm type-check

# Build for production
pnpm build

# Run tests
pnpm test
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
# Update DATABASE_URL in .env
# Reset database: pnpm prisma db push --force-reset
```

### Port Already in Use
```bash
# Change API_PORT in backend .env
# Frontend typically uses 3000, change with: npm run dev -- -p 3001
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

## Architecture Overview

```
mags-ai-studio/
├── packages/
│   ├── frontend/          # Next.js + React frontend
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── stores/       # Zustand state management
│   │   │   ├── lib/          # API clients, utilities
│   │   │   └── types/        # TypeScript types
│   │   └── package.json
│   ├── backend/           # NestJS backend
│   │   ├── src/
│   │   │   ├── repositories/ # Repository intelligence (Phase 6)
│   │   │   ├── generation/   # App generation engine (Phase 7)
│   │   │   ├── build/        # Build system
│   │   │   ├── embeddings/   # Vector embeddings
│   │   │   └── config/       # Configuration files
│   │   └── package.json
│   └── database/          # Prisma schema & migrations
└── README.md
```

## Support & Documentation

- Backend API: See `packages/backend/README.md`
- Frontend: See `packages/frontend/README.md`
- Database: See `packages/database/README.md`

## Deployment

See individual package READMEs for deployment instructions.
