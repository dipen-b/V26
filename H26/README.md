# SkillProof AI - Employee & Supervisor Performance Platform

A comprehensive enterprise SaaS web application for managing employee performance, evaluations, and career development with AI-powered insights.

## Project Structure

```
skillproof-ai/
├── apps/
│   ├── backend/           # NestJS Backend API
│   ├── frontend/          # Next.js 15 Frontend
│   └── shared/            # Shared types and utilities
├── package.json           # Root workspace configuration
└── README.md              # This file
```

## Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Recharts** - Data visualization
- **Zustand** - State management
- **Axios** - HTTP client

### Backend
- **NestJS** - Node.js framework
- **TypeORM** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Passport.js** - Authorization

## Features

### Employee Dashboard
- ✅ View assigned tasks with progress tracking
- ✅ Submit work (code, GitHub PRs, documentation, tests, AI prompts)
- ✅ View evaluation results and feedback
- ✅ Track performance scores and competencies
- ✅ View readiness score and improvement suggestions
- ✅ Access historical performance data
- ✅ View assigned projects

### Supervisor Dashboard
- ✅ Executive overview of team metrics
- ✅ View all employees with readiness scores
- ✅ Create and manage evaluations
- ✅ Override AI recommendations with notes
- ✅ Team analytics and performance trends
- ✅ Skill gap analysis
- ✅ Top performers identification
- ✅ Readiness trends visualization

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
cd H26
npm install
```

2. **Setup PostgreSQL Database**
```bash
# Create a new database
createdb skillproof_ai

# Or update .env with your database credentials
```

3. **Configure Environment Variables**

Backend (.env):
```bash
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=skillproof_ai
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

Frontend (.env.local):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Running the Application

**Option 1: Run both services**
```bash
npm run dev
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Demo Credentials

### Employee
- Email: `employee@example.com`
- Password: `password`

### Supervisor
- Email: `supervisor@example.com`
- Password: `password`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Users
- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update profile
- `GET /users/employees` - List team employees (supervisor only)
- `GET /users/employees/:id` - Get employee details (supervisor only)

### Tasks
- `GET /tasks` - Get user's tasks
- `GET /tasks/:id` - Get task details
- `POST /tasks/:id/submit` - Submit work
- `GET /tasks/:id/submissions` - Get task submissions
- `PATCH /tasks/:id/completion` - Update task completion

### Projects
- `GET /projects` - Get user's projects
- `GET /projects/:id` - Get project details
- `GET /projects/:id/tasks` - Get project tasks

### Evaluations
- `GET /evaluations` - Get user's evaluations
- `GET /evaluations/employee/:employeeId` - Get employee evaluations (supervisor)
- `POST /evaluations/employee/:employeeId` - Create evaluation (supervisor)
- `PATCH /evaluations/:id/approve` - Approve evaluation (supervisor)
- `PATCH /evaluations/:id/override` - Override evaluation (supervisor)
- `GET /evaluations/history/:employeeId` - Get performance history (supervisor)

### Analytics
- `GET /analytics/dashboard` - Team dashboard metrics
- `GET /analytics/team-performance` - Team performance overview
- `GET /analytics/top-performers` - Top performers list
- `GET /analytics/readiness-trends` - Readiness trends data
- `GET /analytics/skill-gap-analysis` - Skill gap analysis

## Database Schema

### Users Table
- id, email, firstName, lastName, password, role, department, position, managerId, isActive, createdAt, updatedAt

### Tasks Table
- id, title, description, status, priority, dueDate, estimatedHours, completionPercentage, assignedTo (FK), project (FK), createdAt, updatedAt

### Projects Table
- id, name, description, department, startDate, endDate, isActive, createdAt, updatedAt

### Submissions Table
- id, type, content, url, metadata, submittedBy (FK), task (FK), createdAt, updatedAt

### Evaluations Table
- id, employee (FK), supervisor (FK), scores (JSON), evidence (JSON), improvementAreas (JSON), recommendations (JSON), readinessScore, supervisorNotes, isApproved, isOverridden, overrideReason (JSON), createdAt, updatedAt

### Performance Metrics Table
- id, user (FK), readinessScore, performanceScore, detailedScores (JSON), trends (JSON), recordedAt

## Key Features Explained

### Readiness Score System
Calculated from 8 performance dimensions:
- **Coding Quality**: Code structure, design patterns, best practices
- **Delivery Speed**: Task completion time, sprint velocity
- **Testing Quality**: Test coverage, bug detection
- **Architecture**: System design, scalability decisions
- **Problem Solving**: Approach to complex problems, innovation
- **Documentation**: Code comments, documentation quality
- **Ownership**: Taking responsibility, initiative
- **AI Usage**: Effective use of AI tools, productivity

Readiness levels:
- **95+**: Ready for Critical Project
- **85-95**: Ready for Independent Project
- **70-85**: Ready with Guidance
- **50-70**: Developing
- **Below 50**: Needs Mentoring

### Work Submission Types
Employees can submit:
- **Code**: Inline code snippets
- **GitHub PR**: Pull request links
- **Documentation**: Written documentation
- **Test Evidence**: Test results and screenshots
- **AI Prompt**: AI prompts used during work
- **Other**: Additional materials

### Supervisor Controls
Supervisors can:
- Create comprehensive evaluations with evidence for each dimension
- View team analytics and performance trends
- Override AI-generated scores with justification
- Track individual and team progress over time
- Identify skill gaps and learning needs
- Mark readiness for specific project types

## Building for Production

```bash
# Build backend
npm run build -w apps/backend

# Build frontend
npm run build -w apps/frontend

# Start production services
npm start -w apps/backend
npm start -w apps/frontend
```

## Security Considerations

- Passwords are hashed using bcryptjs
- JWT tokens for authentication (24hr expiry)
- RBAC (Role-Based Access Control) enforced
- Supervisors can only see their department's employees
- Employees cannot see other employees' data
- All API endpoints require authentication

## Future Enhancements

- [ ] AI-powered evaluation generation using Claude API
- [ ] Real-time notifications for evaluations
- [ ] Email notifications and reminders
- [ ] Export evaluations to PDF
- [ ] Team goal setting and tracking
- [ ] Peer feedback collection
- [ ] 360-degree reviews
- [ ] Career path recommendations
- [ ] Integration with external tools (Jira, GitHub, etc.)
- [ ] Multi-language support
- [ ] Advanced reporting and dashboards

## Support

For questions or issues, please contact the development team.

## License

Proprietary - SkillProof AI
