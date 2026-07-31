# TransformX UI/UX Guide

## 🎨 Design System

### Color Palette
```
Primary:        #4F46E5 (Indigo)     - Main CTAs, highlights
Secondary:      #7C3AED (Purple)     - Accents, premium features
Accent:         #10B981 (Emerald)    - Success, weight loss progress
Warning:        #F59E0B (Amber)      - Alerts, calorie tracking
Background:     #0F172A (Dark)       - Main background
Card:           #1E293B (Slate)      - Card backgrounds (80% opacity)
Text Primary:   #F8FAFC (Light)      - Main text
Text Secondary: #CBD5E1 (Gray)       - Secondary text
```

### Typography
- **Headlines**: Poppins Bold (weight: 700)
- **Body**: Inter Regular (weight: 400)
- **Accent**: Inter SemiBold (weight: 600)
- **Small**: Inter Regular 12px

### Design Pattern: Glassmorphism
- Semi-transparent card backgrounds (80% opacity)
- Subtle blur effects on backdrop
- Gradient overlays (white 15% → white 5%)
- Border: White 20% opacity, 1.5px
- Rounded corners: 12-16px

## 📱 Screen Layouts

### 1. Login Screen
**Location**: `/auth/login`

**Features**:
- Welcome gradient header with "TransformX" text
- Animated background elements (gradient circles)
- Email and password input fields with validation icons
- "Forgot Password?" link
- Sign in button with loading state
- Google sign-in option
- Link to signup page
- Smooth fade-in animation on load

**Key Components**:
- Glassmorphic input fields
- Gradient text for logo
- Smooth 300ms transitions

### 2. Signup Screen
**Location**: `/auth/signup`

**Features**:
- Multi-field form: First Name, Last Name
- Email validation
- Password with strength indicator
- Transformation goal selector (4 options with emoji):
  - ⬇️ Weight Loss
  - ⬆️ Weight Gain
  - 💪 Muscle Building
  - 🏃 Fitness
- Gender selector (Male, Female, Other)
- Terms & Conditions checkbox
- Create Account button (disabled until terms agreed)
- Back navigation

**Key Components**:
- Grid layout for goal selection
- Highlighted selected cards
- Smooth form transitions

### 3. Onboarding Screen
**Location**: `/auth/onboarding`

**Features**:
- 4-page carousel with PageView
- Page 1: Welcome to TransformX
- Page 2: Track Progress (weight, calories, water, etc)
- Page 3: Daily Challenges (motivational)
- Page 4: Join Community (social features)
- Animated dot indicators
- Back/Next/Skip buttons
- Smooth page transitions (500ms)
- Large emoji illustrations for each page

**Key Components**:
- PageController for carousel
- Animated dot indicators
- Gradient backgrounds
- Bottom navigation buttons

### 4. Dashboard Screen
**Location**: `/home`

**Features**:
- Header: "Good Morning" greeting + profile avatar
- Weight Progress Card (Glassmorphic):
  - Current weight (75 kg) in Emerald
  - Goal weight (70 kg)
  - Weight lost badge (5 kg)
  - Progress ring showing 62.5% completion
- Quick Stats Row 1:
  - Active Challenges (3) - Indigo
  - Workouts this month (12) - Purple
- Quick Stats Row 2:
  - Current Streak (7 days) - Amber
  - Achievements (8 badges) - Emerald
- Trackers Grid (4 cards):
  - Water Intake (6/8 glasses) - Blue
  - Calories (1,850/2,000) - Amber
  - Steps (8,342/10k) - Indigo
  - Protein (95/120g) - Emerald
- Today's Challenge Card:
  - Title: "30-Day Weight Loss"
  - Progress: 15/30 days
  - Linear progress bar
- Action Buttons Grid (4 options):
  - 📊 Analytics
  - 🎯 Challenges
  - 🖼️ Transformation
  - 👥 Community
- Bottom Navigation with 5 tabs
- Floating Action Button (center docked)

**Animations**:
- Progress ring animates in on load (1.5s)
- Smooth stat transitions
- Button hover effects

**Key Components**:
- ProgressRing custom widget
- StatCard components
- CompactStatCard for quick metrics
- GlassmorphismDecoration utility

### 5. Challenge Center Screen
**Location**: `/challenges`

**Features**:
- Active Challenges Section (if joined):
  - Shows 2+ active challenges
  - Each shows emoji, title, progress, percentage
  - Linear progress bar
  - Example: "30-Day Weight Loss" - 15/30 days (50%)
- Available Challenges Section:
  - Category filter chips: All, Weight Loss, Muscle, Fitness
  - Grid layout (2 columns)
  - 6 featured challenges

**Challenge Card Details**:
- Emoji icon (40px)
- Category badge with color (top-right)
- Title (max 2 lines)
- Description (max 2 lines)
- Duration: "30 days"
- Participants: "2,847 joined"
- Tap to view details

**Challenges Available**:
1. ⬇️ 30-Day Weight Loss (30 days, 2847 participants)
2. ⚡ 90-Day Transformation (90 days, 1523 participants)
3. 💪 Muscle Gain Challenge (60 days, 1124 participants)
4. 🏖️ Summer Body Challenge (45 days, 956 participants)
5. 💒 Wedding Transformation (120 days, 643 participants)
6. 🔥 Core Strength Challenge (21 days, 782 participants)

**Key Components**:
- ChallengeCard reusable widget
- JoinedChallengeCard widget
- Category chip filter
- GridView.builder for responsive layout

### 6. Profile Screen
**Location**: `/profile`

**Features**:
- Profile Header:
  - Large circular avatar (100x100) with gradient
  - Name: "Sarah Anderson"
  - Email: "sarah.anderson@email.com"
- Stat Boxes (3 columns):
  - Achievements: 8
  - Day Streak: 7
  - Active Challenges: 3
- Premium Subscription Card:
  - "Premium Subscription"
  - "Active until Dec 31, 2024"
  - Green "Active" badge
  - "Manage Subscription" button
- Settings Menu:
  - Personal Info
  - Transformation Goals
  - Preferences
  - Privacy Settings
  - Notifications
  - Help & Support
  - About TransformX
- Logout button (red) at bottom

**Key Components**:
- Gradient circular avatar
- Menu items with arrow icons
- Status badges

## 🎯 Color Usage by Feature

### Weight Loss Feature
- Primary: Indigo #4F46E5 (buttons, main progress)
- Accent: Emerald #10B981 (weight loss indicators, success)
- Secondary color for secondary actions

### Challenges
- Weight Loss: Emerald
- Muscle Gain: Amber
- Transformation: Indigo
- Beach Body: Purple
- Wedding: Pink

### Trackers
- Water: Blue (#3B82F6)
- Calories: Amber (#F59E0B)
- Steps: Indigo (#4F46E5)
- Protein: Emerald (#10B981)

## ✨ Animation Guidelines

### Timing
- Standard transition: 300ms
- Short animation: 150ms
- Long animation: 500ms
- Progress ring: 1500ms (easeInOutCubic)

### Curves
- Standard: `Curves.easeInOut`
- Entrance: `Curves.easeIn`
- Exit: `Curves.easeOut`
- Progress: `Curves.easeInOutCubic`

### Animation Examples
1. Page transitions: 300ms, easeInOut
2. Card elevation on tap
3. Progress ring grows from 0 to target
4. Stat numbers animate when updated
5. FAB scale on press
6. Bottom sheet slide up

## 📐 Responsive Design

### Breakpoints
- Mobile: < 600px (default)
- Tablet: 600px - 1200px (future)
- Desktop: > 1200px (future)

### Current Focus: Mobile
- Single column layouts
- Full-width buttons
- Bottom navigation bar
- Bottom-docked FAB
- Vertical scrolling

### Spacing Standards
- Small: 8px
- Medium: 12-16px
- Large: 24-32px
- X-Large: 48px

## 🔧 Implementation Details

### Glassmorphism Implementation
```dart
// Basic glassmorphic card
Container(
  decoration: GlassmorphismDecoration.card,
  // Content
)

// Card with gradient
Container(
  decoration: GlassmorphismDecoration.cardWithGradient,
  // Content
)
```

### Progress Ring Custom Painter
- Draws SVG-like circular progress
- Animated arc from -90° to target angle
- Smooth stroke caps
- Customizable colors and size

### Navigation Pattern
- GoRouter for declarative routing
- Bottom tab bar for main sections
- Nested routes for details
- Smooth transitions between screens

## 🌙 Dark Mode
- All screens optimized for dark mode
- White text on dark backgrounds
- Subtle contrast for secondary text
- Gradient overlays instead of plain colors
- No light mode (premium dark theme only)

## 📱 Screen Navigation Flow

```
/auth/login → /auth/signup → /auth/onboarding → /home (Dashboard)
                                                   ↓
                                    /challenges, /analytics, etc.

Bottom Navigation:
[Home] [Analytics] [FAB+] [Nutrition] [Profile]
```

## 🎨 UI Components Library

### Reusable Widgets
- `StatCard`: Displays metric with icon and value
- `CompactStatCard`: Smaller stat display
- `ProgressRing`: Animated circular progress
- `ChallengeCard`: Challenge grid item
- `JoinedChallengeCard`: Active challenge display
- `GlassmorphismDecoration`: Theme helper

### Patterns
- Glassmorphic cards for all content
- Gradient avatars for profiles
- Animated progress indicators
- Bottom navigation with FAB
- Modal bottom sheets (future)
- Snackbars and dialogs (future)

## 🚀 Next Steps for Implementation

1. **Connect to Backend**: Integrate API services
2. **Add Analytics Screen**: Charts and insights
3. **Photo Upload**: Transformation photo gallery
4. **Real Leaderboard**: Community rankings
5. **Notifications**: Toast and push notifications
6. **Animations**: Lottie for achievements
7. **Offline Support**: Cached data display
8. **Testing**: Screenshot and visual regression tests

---

**Design Philosophy**: Premium, modern, motivational, and addictive. Every interaction should feel smooth and rewarding.
