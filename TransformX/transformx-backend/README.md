# TransformX Backend

Premium Body Transformation Ecosystem API built with Node.js, Express, and PostgreSQL.

## Tech Stack

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Password**: bcryptjs
- **File Storage**: Firebase Cloud Storage
- **Payments**: RevenueCat

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

## Installation

1. **Clone and install dependencies**
```bash
cd transformx-backend
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your values
```

3. **Create PostgreSQL database**
```bash
createdb transformx
```

4. **Run migrations** (coming soon)
```bash
npm run migrate
```

5. **Start development server**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/validate-email` - Check email availability

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/goals` - Update transformation goals
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/:userId` - Get public user profile

### Challenges
- `GET /api/challenges` - List all challenges
- `GET /api/challenges/:id` - Get challenge details
- `POST /api/challenges/:id/join` - Join challenge
- `GET /api/challenges/user/active` - Get user's active challenges
- `PUT /api/challenges/:id/progress` - Update challenge progress
- `POST /api/challenges/:id/complete` - Complete challenge

### Transformations
- `POST /api/transformations` - Upload transformation photo
- `GET /api/transformations` - Get user transformations
- `GET /api/transformations/timeline` - Get transformation timeline

### Analytics
- `GET /api/analytics/weight` - Weight progress data
- `GET /api/analytics/calories` - Calorie data
- `GET /api/analytics/water` - Water intake data
- `GET /api/analytics/steps` - Steps data
- `GET /api/analytics/insights` - AI insights

### Community
- `POST /api/community/friends/add` - Add friend
- `GET /api/community/friends` - Get friends list
- `GET /api/community/achievements` - Get achievements

### Leaderboard
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/friends` - Friends leaderboard
- `GET /api/leaderboard/challenge/:id` - Challenge leaderboard

### Nutrition
- `POST /api/nutrition/meal-plan` - Generate meal plan
- `GET /api/nutrition/meal-plan` - Get current meal plan
- `POST /api/nutrition/analyze` - Analyze food

### Subscriptions
- `GET /api/subscriptions/plans` - Get subscription plans
- `POST /api/subscriptions/verify-receipt` - Verify purchase
- `GET /api/subscriptions/status` - Get subscription status

## Scripts

```bash
npm run dev        # Start development server with hot reload
npm run build      # Build TypeScript to JavaScript
npm start          # Run built server (production)
npm run test       # Run tests
npm run typecheck  # Type checking without compilation
npm run lint       # Run ESLint
```

## Database Schema

Tables are defined in PostgreSQL:
- `users` - User accounts and profiles
- `challenges` - Challenge definitions
- `user_challenges` - User challenge participation
- `daily_progress` - Daily tracking data
- `transformations` - Before/after and progress photos
- `subscriptions` - Subscription information
- `leaderboard` - Challenge leaderboards
- `achievements` - User achievements

## Security

- JWT token validation on protected routes
- Bcryptjs password hashing
- CORS configuration
- Rate limiting (100 req/15min per user)
- Helmet.js security headers
- Environment variable protection

## Environment Variables

See `.env.example` for complete list. Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `FIREBASE_*` - Firebase configuration
- `ADMOB_PUBLISHER_ID` - AdMob ID
- `REVENUECAT_API_KEY` - RevenueCat API key

## Development

- Use TypeScript for type safety
- Follow Express middleware patterns
- Create services for business logic
- Use prepared statements to prevent SQL injection
- Validate input on all endpoints
- Return consistent JSON responses

## Deployment

1. Build the project:
```bash
npm run build
```

2. Set production environment variables

3. Run migrations on production database

4. Start server:
```bash
npm start
```

## Next Steps

1. Set up PostgreSQL database and migrations
2. Implement challenge service
3. Implement progress tracking
4. Add Firebase Cloud Storage integration
5. Add RevenueCat subscription handling
6. Add AI nutrition features
7. Implement WebSocket for real-time features
8. Add comprehensive testing

## Support

For issues or questions, refer to the main TransformX documentation.
