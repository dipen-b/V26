# SkillProof AI - Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 15)                    │
│                        Tailwind CSS                          │
│                      Shadcn/UI Components                    │
│                      Recharts Visualizations                 │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     Employee Dashboard      │  Supervisor Dashboard  │   │
│  │  • Tasks & Submissions      │  • Team Management     │   │
│  │  • Evaluations              │  • Evaluations Form    │   │
│  │  • Performance Tracking      │  • Analytics          │   │
│  │  • Growth & Learning        │  • Readiness Trends   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                    Axios HTTP Client
                     JWT Bearer Token
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend API (NestJS)                        │
│                    Port: 3001                                │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Auth Module        Users Module      Tasks Module   │   │
│  │  • Register         • Profile         • Get Tasks    │   │
│  │  • Login            • View Team       • Submit Work  │   │
│  │  • JWT Strategy     • Permissions     • Submissions  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Evaluations Module  Projects Module   Analytics Mod  │   │
│  │ • Create Eval       • Get Projects    • Dashboard    │   │
│  │ • Score Calc        • Task Query      • Team Perf    │   │
│  │ • Override Logic    • Relations       • Trends       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                        TypeORM
                     PostgreSQL Driver
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database                             │
│                    Port: 5432                                │
│                                                               │
│  Users  │  Tasks  │  Projects  │  Submissions               │
│  ──────┼─────────┼────────────┼──────────────               │
│  • id   │ • id    │ • id       │ • id                       │
│  • email│ • title │ • name     │ • type                     │
│  • role │ • status│ • dept     │ • content                  │
│  • dept │ • assign│ • active   │ • url                      │
│         │ • due   │            │ • submittedBy (FK)         │
│         │         │            │ • task (FK)                │
│                                                               │
│  Evaluations  │  PerformanceMetrics                         │
│  ────────────┼──────────────────                            │
│  • id         │ • id                                         │
│  • employee   │ • user (FK)                                  │
│  • supervisor │ • readinessScore                            │
│  • scores     │ • performanceScore                          │
│  • evidence   │ • detailedScores                            │
│  • readiness  │ • recordedAt                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Module Architecture

### Authentication Module
**Purpose**: User authentication and authorization
**Components**:
- `auth.service.ts` - Login, register, token validation
- `auth.controller.ts` - Auth endpoints
- `jwt.strategy.ts` - JWT passport strategy
- `jwt-auth.guard.ts` - Protected route guard

**Flow**:
1. User registers/logs in
2. Server validates credentials and hashes password
3. JWT token issued (24h expiry)
4. Token stored in localStorage
5. Axios interceptor adds token to all requests
6. JwtAuthGuard validates token on protected routes

### Users Module
**Purpose**: User profile and team management
**Components**:
- `users.service.ts` - Profile operations, team queries
- `users.controller.ts` - User endpoints
- Enforces permission checks (supervisors only see their department)

**Endpoints**:
- `GET /users/profile` - Get own profile
- `PATCH /users/profile` - Update profile
- `GET /users/employees` - List team (supervisor only)
- `GET /users/employees/:id` - Employee details (supervisor only)

### Tasks Module
**Purpose**: Task assignment and work submission
**Components**:
- `tasks.service.ts` - Task queries, submission handling
- `tasks.controller.ts` - Task endpoints
- `create-submission.dto.ts` - Submission validation

**Submission Types**:
- CODE: Inline code snippets
- GITHUB_PR: Pull request links
- DOCUMENTATION: Written documentation
- TEST_EVIDENCE: Test results
- AI_PROMPT: AI prompts used
- OTHER: Additional materials

**Flow**:
1. Employee views assigned tasks
2. Completes work and updates progress
3. Submits work with appropriate type
4. Supervisor can review submissions
5. Evaluation created based on submissions

### Evaluations Module
**Purpose**: Employee performance evaluation
**Components**:
- `evaluations.service.ts` - Evaluation logic, scoring
- `evaluations.controller.ts` - Evaluation endpoints
- `create-evaluation.dto.ts` - Evaluation form schema
- `update-evaluation.dto.ts` - Override schema

**Readiness Score Calculation**:
```
readinessScore = Average of (
  codingQuality,
  deliverySpeed,
  testingQuality,
  architecture,
  problemSolving,
  documentation,
  ownership,
  aiUsage
) / 8
```

**Evaluation Flow**:
1. Supervisor selects employee
2. Enters scores for 8 dimensions (0-100)
3. Provides evidence for each score
4. Adds improvement areas and recommendations
5. System calculates readiness score
6. Stores in Evaluations table
7. Creates PerformanceMetric record for trending

**Override Capability**:
- Supervisor can override any score
- Must provide reason/notes
- Changes marked as "isOverridden"
- Supports replacing scores and recommendations

### Projects Module
**Purpose**: Project management and task association
**Components**:
- `projects.service.ts` - Project queries
- `projects.controller.ts` - Project endpoints

**Features**:
- View assigned projects
- See tasks within projects
- Track project-wide progress

### Analytics Module
**Purpose**: Team insights and performance analytics
**Components**:
- `analytics.service.ts` - Complex aggregations
- `analytics.controller.ts` - Analytics endpoints

**Metrics Provided**:
- `dashboard` - Total employees, ready count, at-risk count, team health
- `team-performance` - All employees with current scores
- `top-performers` - Top 5 employees by performance
- `readiness-trends` - Historical readiness data
- `skill-gap-analysis` - Lowest scores per dimension

## Frontend Architecture

### State Management (Zustand)
**AuthStore** (`stores/authStore.ts`):
```typescript
{
  user: User | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  login: (email, password) => Promise<void>,
  register: (data) => Promise<void>,
  logout: () => void,
  setUser: (user) => void,
  initializeAuth: () => Promise<void>
}
```

### API Client (Axios)
**Features**:
- Automatic JWT token injection
- 401 error handling (redirect to login)
- Base URL from environment

**Interceptors**:
```typescript
// Request interceptor
- Adds Authorization header
- Includes stored JWT token

// Response interceptor
- Handles 401 (unauthorized)
- Clears auth on token expiry
- Redirects to login
```

### Page Structure

**Employee Routes**:
- `/employee/dashboard` - Performance overview
- `/employee/tasks` - Task list and submission
- `/employee/projects` - Project list
- `/employee/evaluations` - Evaluation history
- `/employee/growth` - Learning and trends
- `/employee/profile` - Profile management

**Supervisor Routes**:
- `/supervisor/dashboard` - Team metrics
- `/supervisor/team` - Team management
- `/supervisor/evaluations` - Create/manage evaluations
- `/supervisor/analytics` - Detailed analytics
- `/supervisor/profile` - Profile management

**Public Routes**:
- `/login` - Authentication
- `/register` - Account creation

### Layout Architecture

**Sidebar Navigation**:
- Different links per role
- Active state tracking
- User info display
- Logout button

**Dashboard Patterns**:
- Metric cards (KPIs)
- Data tables
- Charts (Recharts)
- Forms
- Modal overlays

## Data Flow Examples

### Employee Submission Flow
```
Employee Views Task
    ↓
Click Task → Details Load
    ↓
Select Submission Type (Code/PR/Doc)
    ↓
Enter Content or URL
    ↓
POST /tasks/:id/submit
    ↓
Backend Creates Submission Record
    ↓
UI Refreshes Task Status
    ↓
Notification: Submitted Successfully
```

### Supervisor Evaluation Flow
```
Supervisor Views Team
    ↓
Click Employee → Details Load
    ↓
Click "Create Evaluation"
    ↓
Evaluation Form Opens
    ↓
Set 8 Performance Scores (0-100)
    ↓
Add Evidence for Each Score
    ↓
Add Improvement Areas & Recommendations
    ↓
POST /evaluations/employee/:id
    ↓
Backend Calculates Readiness Score
    ↓
Creates Evaluation & Performance Metric
    ↓
Success Message
    ↓
Employee Can View Evaluation
```

### Override Evaluation Flow
```
Supervisor Reviews Evaluation
    ↓
Disagrees with AI Score
    ↓
Click "Override"
    ↓
Edit Scores and Evidence
    ↓
Provide Override Reason
    ↓
PATCH /evaluations/:id/override
    ↓
Backend Updates with isOverridden = true
    ↓
Tracks reason in overrideReason JSON
    ↓
Final score takes precedence
```

## Security Implementation

### Authentication
- JWT tokens with 24-hour expiry
- Passwords hashed with bcryptjs (10 rounds)
- Tokens stored in localStorage (client)
- Cleared on logout or token expiry

### Authorization (RBAC)
- Three roles: EMPLOYEE, SUPERVISOR, ADMIN
- Middleware checks role on protected routes
- Department-based filtering (supervisors only see their dept)
- Endpoint-level permission checks

### Data Access Control
- Employees only see their own data
- Supervisors see their team's data
- No cross-department visibility
- API enforces user context on all queries

### Input Validation
- Class-validator on all DTOs
- Type checking with TypeScript
- Password minimum 6 characters
- Email format validation
- Score ranges (0-100) enforced

## Performance Optimizations

### Frontend
- Server-side pagination ready
- Lazy loading for lists
- Chart data limited to last 10 items
- Debounced API calls
- Next.js image optimization

### Backend
- Query relations selectively
- Limit/offset on list endpoints
- Database indexes on FK/unique fields
- Caching for team metrics possible
- Computed scores (not stored redundantly)

### Database
- Composite indexes on foreign keys
- UUID primary keys (efficient)
- JSON columns for flexible data
- Created/Updated timestamps

## Deployment Considerations

### Frontend
- Build output: `.next/` directory
- Static export: `next build && next export`
- Environment: `NEXT_PUBLIC_API_URL`
- CDN suitable for static assets

### Backend
- Build output: `dist/` directory
- No external dependencies needed at runtime
- Database must be accessible
- Port configurable via environment

### Database
- PostgreSQL 12+ required
- Schema auto-created by TypeORM
- Backups recommended for production
- Connection pooling for multiple instances

## Monitoring Points

1. **Authentication**: Track failed logins, token expiries
2. **Tasks**: Monitor submission volumes, completion times
3. **Evaluations**: Track creation frequency, override rates
4. **Performance**: Database query times, API response times
5. **Users**: Active users, team health scores

## Future Extensibility

### Ready for Enhancement
- AI integration for automatic evaluation
- Real-time notifications (WebSocket)
- Email notifications (SMTP)
- File uploads (S3/cloud storage)
- Third-party integrations (Jira, GitHub, etc.)
- Multi-language support
- Dark mode (already styled)

### Architectural Patterns Used
- MVC (Model-View-Controller)
- Module-based organization
- Service/Repository pattern
- DTO validation pattern
- Guard-based authorization
- Interceptor-based middleware

## Code Quality Guidelines

### Backend
- Typed services and controllers
- Clear error handling
- Input validation on all endpoints
- Consistent naming conventions
- Module-based organization

### Frontend
- React hooks with proper dependencies
- Custom hooks for reusable logic
- Component composition
- Type-safe stores
- Consistent styling with Tailwind

## Testing Strategy

### Backend Unit Tests
- Service methods
- Authentication logic
- Score calculations
- Permission checks

### Backend Integration Tests
- Full API endpoint flows
- Database persistence
- Authentication flows
- Multi-step operations

### Frontend Component Tests
- Form submission
- Navigation flows
- State management
- API error handling

## Deployment Scripts

```bash
# Production build
npm run build

# Run tests
npm run test

# Type check
npm run type-check

# Lint
npm run lint
```

---

**Last Updated**: 2024
**Maintained By**: Development Team
