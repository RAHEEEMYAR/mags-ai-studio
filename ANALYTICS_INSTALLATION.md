# Install Analytics Dependencies
cd packages/backend
pnpm install

cd packages/frontend
pnpm install

# Setup Analytics Database
cd packages/backend
npx prisma migrate dev --name add-analytics

# Start Analytics Workers
# Terminal 1: Metrics Aggregation Worker
cd packages/backend
pnpm queue:worker:metrics-aggregation

# Terminal 2: Anomaly Detection Worker
cd packages/backend
pnpm queue:worker:anomaly-detection

# Terminal 3: Error Tracking Worker
cd packages/backend
pnpm queue:worker:error-tracking

# Terminal 4: Backend with Analytics Module
cd packages/backend
pnpm start:dev

# Terminal 5: Frontend with Analytics Dashboard
cd packages/frontend
pnpm dev

# Access URLs
# Frontend: http://localhost:3000
# Analytics Dashboard: http://localhost:3000/analytics
# AI Usage Dashboard: http://localhost:3000/analytics/ai-usage
# System Monitoring: http://localhost:3000/analytics/system
# Error Explorer: http://localhost:3000/analytics/errors
# Backend API: http://localhost:3001
# WebSocket: ws://localhost:3001/analytics
