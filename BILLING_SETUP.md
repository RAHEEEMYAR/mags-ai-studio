# Billing System Setup Guide

## Installation & Run Commands

### Install Dependencies
```bash
cd packages/backend
pnpm install

cd packages/frontend
pnpm install
```

### Setup Database
```bash
cd packages/backend
npx prisma migrate dev --name add-billing-system
npx prisma generate
```

### Seed Plans
```bash
npx ts-node scripts/seed-plans.ts
```

## Start Services

### Terminal 1: Billing Worker
```bash
cd packages/backend
pnpm queue:worker:billing
```

### Terminal 2: Backend
```bash
cd packages/backend
pnpm start:dev
```

### Terminal 3: Frontend
```bash
cd packages/frontend
pnpm dev
```

## Access URLs

- **Frontend**: http://localhost:3000
- **Billing Dashboard**: http://localhost:3000/billing
- **Pricing Page**: http://localhost:3000/pricing
- **Backend API**: http://localhost:3001

## File Structure

### Frontend Components
- `packages/frontend/src/components/billing/SubscriptionStatus.tsx` - Subscription status display
- `packages/frontend/src/components/billing/CreditWalletCard.tsx` - Credit wallet display
- `packages/frontend/src/components/billing/PricingTable.tsx` - Pricing plans table
- `packages/frontend/src/components/billing/PaymentHistory.tsx` - Payment history list
- `packages/frontend/src/components/billing/CreditHistory.tsx` - Credit transactions list

### Database Schema
- `packages/backend/prisma/billing.schema.prisma` - Prisma schema for billing models

### Environment Configuration
- `packages/backend/.env.billing` - Billing system environment variables

## Configuration

Update `.env.billing` with your actual values:
- Stripe API keys (get from https://dashboard.stripe.com)
- Billing currency and tax rate
- Invoice settings
- Credit system settings
- Payment retry settings
- Redis configuration
