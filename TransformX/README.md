# TransformX

Premium Body Transformation Ecosystem - A world-class fitness app for weight loss, weight gain, muscle building, habit formation, and daily challenges.

**Status**: Phase 1 MVP Core - Foundation setup complete

## 🎯 Vision

Build a superior alternative to MyFitnessPal with:
- Apple-level UI with premium dark mode
- Glassmorphism design system
- Highly addictive user experience
- Monetization through AdMob and Premium subscriptions
- Support for 100M+ users across US, Canada, UK, Australia, and New Zealand

## 📱 Tech Stack

### Frontend
- **Framework**: Flutter (iOS/Android)
- **State Management**: Riverpod
- **Navigation**: GoRouter
- **UI**: Material Design 3 + Custom Glassmorphism
- **Animations**: Lottie
- **Charts**: FL Chart, Syncfusion
- **Local Storage**: Hive, GetStorage

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Storage**: Firebase Cloud Storage
- **Authentication**: JWT
- **Payments**: RevenueCat
- **Analytics**: Firebase Analytics, Sentry

## 📁 Project Structure

```
TransformX/
├── transformx-app/              # Flutter mobile app
│   ├── lib/
│   │   ├── config/             # Theme, routes, constants
│   │   ├── models/             # Data models
│   │   ├── screens/            # UI screens
│   │   ├── services/           # Business logic
│   │   ├── providers/          # Riverpod state
│   │   └── widgets/            # Reusable components
│   └── pubspec.yaml
│
└── transformx-backend/          # Node.js backend
    ├── src/
    │   ├── config/             # Database, Redis, Firebase
    │   ├── models/             # TypeScript interfaces
    │   ├── controllers/        # Route handlers
    │   ├── services/           # Business logic
    │   ├── routes/             # API endpoints
    │   ├── middleware/         # Auth, validation, errors
    │   ├── jobs/               # Scheduled tasks
    │   └── utils/              # Helpers
    ├── scripts/                # Database migrations
    ├── package.json
    └── tsconfig.json
```

## 🚀 Quick Start

### Backend Setup

```bash
cd transformx-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Install PostgreSQL and Redis
# macOS:
brew install postgresql redis
brew services start postgresql
brew services start redis

# Create database
createdb transformx

# Initialize schema
psql transformx < scripts/init-db.sql

# Start development server
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

```bash
cd transformx-app

# Get dependencies
flutter pub get

# Configure Firebase
# Add google-services.json (Android) and GoogleService-Info.plist (iOS)

# Run app
flutter run
```

## 🏗️ Architecture Overview

### Authentication Flow
1. User registers/logs in via Flutter app
2. Backend validates credentials and returns JWT tokens
3. App stores tokens in secure local storage
4. All API requests include JWT in Authorization header
5. Backend validates JWT before processing requests

### Feature Layers

**Presentation Layer** (Flutter)
- Screens with Riverpod state management
- Responsive UI with animations
- Native ad integration

**Business Logic Layer**
- Services for API communication
- Providers for state management
- Validation and transformation

**API Layer** (Node.js)
- RESTful endpoints
- JWT authentication middleware
- Input validation
- Error handling

**Data Layer**
- PostgreSQL for persistent data
- Redis for caching and real-time features
- Firebase Cloud Storage for images

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh token
- `POST /api/auth/validate-email` - Check email

### Users
- `GET /api/users/profile` - Current user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/goals` - Update goals
- `GET /api/users/stats` - User statistics

### Challenges (TODO: Implement)
- `GET /api/challenges` - List challenges
- `POST /api/users/challenges` - Join challenge
- `PUT /api/users/challenges/:id/progress` - Update progress

### Analytics (TODO: Implement)
- `GET /api/analytics/weight` - Weight data
- `GET /api/analytics/calories` - Calorie data
- `GET /api/analytics/insights` - AI insights

### Community (TODO: Implement)
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/community/friends` - Friends list
- `GET /api/community/achievements` - Achievements

See `transformx-backend/README.md` for complete API documentation.

## 🎨 Design System

### Color Palette
- **Primary**: Indigo #4F46E5
- **Secondary**: Purple #7C3AED
- **Accent**: Emerald #10B981
- **Warning**: Amber #F59E0B
- **Background**: Dark #0F172A
- **Card**: Slate #1E293B

### Key Features
- Glassmorphism with transparency and blur
- Smooth animations (300ms default)
- Premium dark mode
- Material Design 3 compliance

## 💰 Monetization Strategy

### Free Plan
- Google AdMob banner ads
- Native ads (dashboard, challenges)
- Rewarded video ads
- Limited AI features

### Premium Plan ($9.99/month or $79.99/year)
- No advertisements
- Unlimited AI meal plans
- All challenges
- Advanced analytics
- Priority support

## 📈 Development Roadmap

### Phase 1: MVP Core (Weeks 1-3) ✅ IN PROGRESS
- [x] Backend setup (Express, PostgreSQL, Redis)
- [x] Database schema and migrations
- [x] Authentication system (JWT)
- [x] User profile management
- [ ] API route stubs (challenges, progress, etc.)
- [ ] Flutter app setup
- [ ] Dashboard screen

### Phase 2: Core Features (Weeks 4-6)
- [ ] Challenge system
- [ ] Daily progress tracking
- [ ] Analytics screens
- [ ] Photo upload and transformation tracking
- [ ] Leaderboard
- [ ] RevenueCat subscription integration
- [ ] AdMob integration (banner ads)

### Phase 3: Community & AI (Weeks 7-9)
- [ ] Friends system
- [ ] Achievement badges
- [ ] AI nutrition meal plans
- [ ] Notifications system
- [ ] Native ads
- [ ] Global leaderboard

### Phase 4: Polish (Weeks 10-12)
- [ ] Glassmorphism UI refinement
- [ ] Lottie animations
- [ ] Performance optimization
- [ ] Image caching
- [ ] Offline support
- [ ] A/B testing setup

### Phase 5: Launch (Weeks 13-14)
- [ ] Rewarded video ads
- [ ] Premium feature gating
- [ ] App Store submissions
- [ ] Marketing materials
- [ ] Beta testing
- [ ] Public launch

## 🔐 Security

- JWT token validation (15min access, 7day refresh)
- Bcryptjs password hashing (12 salt rounds)
- HTTPS/TLS for all API communication
- Rate limiting (100 req/min per user)
- CORS configuration
- Helmet.js security headers
- Input validation and sanitization

## 📊 Database Schema

Key tables:
- `users` - User accounts and profiles
- `challenges` - Challenge definitions
- `user_challenges` - User challenge participation
- `daily_progress` - Daily tracking (weight, calories, water, steps)
- `transformations` - Photos and progress
- `subscriptions` - Subscription tracking
- `leaderboard` - Challenge rankings
- `achievements` - User badges

See `transformx-backend/scripts/init-db.sql` for complete schema.

## 🧪 Testing

```bash
# Backend
cd transformx-backend
npm run test

# Frontend
cd transformx-app
flutter test
```

## 🚢 Deployment

### Backend
```bash
npm run build
npm start
```

Deploy to: Heroku, Railway, DigitalOcean, AWS, or similar

### Frontend
```bash
# iOS
flutter build ios --release

# Android
flutter build appbundle --release
```

Deploy to: App Store, Google Play Console

## 📱 Supported Devices

- **iOS**: 14.0+
- **Android**: 5.0+ (API level 21+)
- **Screen Sizes**: Mobile (3.5" to 6.7"), Tablet support in Phase 2

## 🌍 Target Markets

- United States
- Canada
- United Kingdom
- Australia
- New Zealand

## 📚 Documentation

- [Backend README](./transformx-backend/README.md) - API documentation and setup
- [Frontend README](./transformx-app/README.md) - Flutter app documentation
- [Implementation Plan](../.claude/plans/foamy-marinating-yeti.md) - Detailed technical plan

## 🤝 Contributing

1. Create a feature branch
2. Follow code style guidelines
3. Write tests for new features
4. Submit pull request for review

## 📞 Support

For issues, questions, or feedback, refer to the documentation in respective README files.

## 📄 License

Copyright © 2024 TransformX. All rights reserved.

---

**Last Updated**: July 31, 2024
**Phase**: 1 - MVP Core Setup
**Next Steps**: Implement challenge system and Flask app dashboard
