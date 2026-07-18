# SkillProof AI - Setup Guide

Complete guide to setting up and running SkillProof AI on your local machine.

## Quick Start (5 minutes)

### 1. Prerequisites
Ensure you have installed:
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/downloads)

### 2. Setup Database

**Option A: Using Docker (Recommended)**
```bash
# Install Docker Desktop if not already installed
# https://www.docker.com/products/docker-desktop

# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker ps
```

**Option B: Local PostgreSQL**
```bash
# Create database
createdb skillproof_ai

# Optional: Create a user
psql -c "CREATE USER skillproof WITH PASSWORD 'password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE skillproof_ai TO skillproof;"
```

### 3. Install Dependencies
```bash
# From project root
npm install
```

### 4. Configure Environment

**Backend (.env)**
```bash
# Copy the example file
cp .env.example apps/backend/.env

# Edit and verify (use values from setup above):
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=skillproof_ai
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Frontend (.env.local)**
```bash
cd apps/frontend
echo 'NEXT_PUBLIC_API_URL=http://localhost:3001' > .env.local
cd ../..
```

### 5. Start the Application

```bash
# From project root - starts both services
npm run dev
```

Or separately:
```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api

## Login with Demo Accounts

### Employee Account
```
Email: employee@example.com
Password: password
```
Features: View tasks, submit work, view evaluations, track progress

### Supervisor Account
```
Email: supervisor@example.com
Password: password
```
Features: Manage team, create evaluations, view analytics

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000 or 3001
lsof -i :3000
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
psql -U postgres -c "\l"

# Check .env file has correct credentials
cat apps/backend/.env

# Recreate database if needed
dropdb skillproof_ai
createdb skillproof_ai
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear build caches
rm -rf apps/backend/dist
rm -rf apps/frontend/.next
```

### Port 5432 Already in Use
```bash
# If using Docker, stop container
docker-compose down

# If local PostgreSQL, find and kill process
lsof -i :5432
kill -9 <PID>
```

## Development Workflow

### Project Structure
```
H26/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── auth/              # Authentication & JWT
│   │   │   ├── users/             # User management
│   │   │   ├── tasks/             # Task management
│   │   │   ├── evaluations/       # Evaluation logic
│   │   │   ├── projects/          # Project management
│   │   │   ├── analytics/         # Team analytics
│   │   │   └── common/            # Entities & enums
│   │   ├── .env                   # Backend config
│   │   └── package.json
│   │
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── app/               # Next.js pages
│   │   │   │   ├── (auth)/        # Public pages
│   │   │   │   ├── employee/      # Employee dashboard
│   │   │   │   └── supervisor/    # Supervisor dashboard
│   │   │   ├── components/        # Reusable components
│   │   │   ├── lib/               # Utilities (API client)
│   │   │   ├── stores/            # Zustand stores
│   │   │   └── app/globals.css    # Global styles
│   │   ├── .env.local             # Frontend config
│   │   └── package.json
│   │
│   └── shared/                    # Shared types (future)
│
├── docker-compose.yml             # PostgreSQL container
├── README.md                       # Project overview
├── SETUP.md                        # This file
└── package.json                   # Root workspace config
```

### Common Tasks

**Create New Page**
```bash
# Frontend page
touch apps/frontend/src/app/employee/new-page/page.tsx

# Add to sidebar in components/layout/Sidebar.tsx
```

**Create New API Endpoint**
```bash
# 1. Create controller action
# 2. Create service method
# 3. Add route in module

# Example: apps/backend/src/tasks/tasks.controller.ts
```

**Run Tests**
```bash
npm run test

# Test specific module
npm run test -w apps/backend -- tasks
```

**Format Code**
```bash
# ESLint
npm run lint

# Prettier (configure in IDE)
```

## Database Schema Maintenance

### View Database
```bash
# Connect to database
psql -U postgres -d skillproof_ai

# List tables
\dt

# View table structure
\d users

# Exit
\q
```

### Reset Database
```bash
# Danger: This deletes all data!
# Backend will auto-recreate schema on startup

dropdb skillproof_ai
createdb skillproof_ai

# Restart backend to recreate schema
npm run dev:backend
```

### Backup Database
```bash
# Backup
pg_dump -U postgres skillproof_ai > backup.sql

# Restore
psql -U postgres skillproof_ai < backup.sql
```

## Performance Optimization

### Build Optimization
```bash
# Production build
npm run build

# Check bundle size
npm run build -- --analyze
```

### Database Optimization
- Add indexes on frequently queried fields
- Use query pagination for large datasets
- Consider caching for read-heavy operations

## Deployment Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a strong random value
- [ ] Update database credentials
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Setup environment variables securely
- [ ] Run database migrations
- [ ] Test all critical workflows
- [ ] Setup monitoring and logging
- [ ] Configure backup strategy
- [ ] Setup CDN for static assets

## Environment Variables Reference

### Backend
| Variable | Purpose | Default |
|----------|---------|---------|
| NODE_ENV | Environment | development |
| PORT | API port | 3001 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | password |
| DB_NAME | Database name | skillproof_ai |
| JWT_SECRET | JWT signing key | change-me |

### Frontend
| Variable | Purpose | Default |
|----------|---------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:3001 |

## Getting Help

### Check Logs
```bash
# Frontend errors
# Open browser DevTools (F12) → Console

# Backend errors
# Watch terminal output for stack traces
```

### Debug Mode
```bash
# Backend with debugging
NODE_OPTIONS="--inspect" npm run dev:backend
# Then open chrome://inspect in Chrome
```

### Documentation
- Backend API: See README.md for endpoint docs
- Frontend: Check component JSDoc comments
- Database: Review entity definitions in src/common/entities/

## Next Steps

1. **Create test data** - Use the login/register flows
2. **Explore features** - Click through both dashboards
3. **Read the code** - Understand the architecture
4. **Make changes** - Try modifying something
5. **Deploy** - Follow deployment checklist when ready

## Support

For issues:
1. Check this document's troubleshooting section
2. Review GitHub issues (if available)
3. Check backend console for errors
4. Check frontend browser DevTools

Good luck! 🚀
