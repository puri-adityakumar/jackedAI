# Product Requirements Document (PRD)
# FitTrack - AI-Powered Gym Report Tracker

## Document Information
| Field | Value |
|-------|-------|
| Version | 1.0 |
| Created | February 4, 2026 |
| Status | Draft |

---

## 1. Executive Summary

FitTrack is a single-user gym report tracking web application powered by AI agents built with Tambo. The app enables users to track exercises, meals, and calories through natural language conversations with two specialized AI assistants: **Butler** (for quick data logging) and **Trainer** (for expert fitness advice).

### Key Value Proposition
- **Conversational Logging**: Say "I did 5 sets of bench press at 60kg" instead of filling forms
- **Auto-Nutrition Estimation**: Say "I ate chicken rice" and get automatic calorie/macro breakdown
- **Smart Exercise Suggestions**: Get exercises from ExerciseDB API based on body part or equipment
- **Expert Advice On-Demand**: Ask the Trainer for form corrections and workout plans

---

## 2. Problem Statement

### Current Pain Points
1. **Manual Data Entry is Tedious**: Traditional fitness apps require filling multiple form fields
2. **Nutrition Tracking is Complex**: Users don't know the nutritional content of foods
3. **Lack of Personalized Guidance**: Generic apps don't provide exercise-specific advice
4. **Expensive AI Features**: Most AI fitness apps use expensive models for simple tasks

### Solution
FitTrack solves these by:
- Using natural language for all data entry
- AI-powered nutrition estimation from food descriptions
- Single AI model with two system prompts (Butler + Trainer behaviors)
- Comprehensive dashboard for progress visualization

---

## 3. Target User

### Primary Persona: Fitness Enthusiast
- **Demographics**: Age 18-45, tech-savvy
- **Goals**: Track workouts consistently, monitor nutrition, improve fitness
- **Behavior**: Works out 3-5x per week, wants quick logging without friction
- **Pain Points**: Hates manual form filling, forgets to log meals

### User Assumptions
- Single user (no multi-user authentication required)
- Desktop/mobile web browser access
- Basic fitness knowledge

---

## 4. Product Features

### 4.1 Onboarding Flow

| Feature | Description | Priority |
|---------|-------------|----------|
| First-Time Dialog | Modal on first visit to collect user info | P0 |
| Profile Fields | Name, height (cm), weight (kg), age, fitness goal | P0 |
| Goal Selection | Lose weight / Build muscle / Maintain | P0 |
| Calorie Target | Auto-calculate or manual daily calorie target | P1 |

**Acceptance Criteria:**
- [ ] Dialog appears only on first visit (check localStorage/Convex)
- [ ] All required fields validated before submission
- [ ] Profile saved to Convex database
- [ ] User redirected to Dashboard after completion

### 4.2 Butler Agent (Daily Tracking)

**Model**: Single shared model (configured in Tambo project)

| Feature | Description | Priority |
|---------|-------------|----------|
| Exercise Suggestions | Query ExerciseDB by body part/equipment | P0 |
| Exercise Logging | Parse natural language to log workouts | P0 |
| Meal Logging | Parse food descriptions, auto-estimate nutrition | P0 |
| Daily Progress | Show today's summary on request | P0 |
| Quick Confirmations | Confirm logged data with visual cards | P1 |

**Example Interactions:**

```
User: "Suggest chest exercises"
Butler: [ExerciseSuggestionList] Here are 5 chest exercises from ExerciseDB...

User: "I did bench press 3 sets of 10 at 60kg and incline dumbbell press 3x12 at 20kg"
Butler: [ExerciseLogCard x2] Logged 2 exercises for today!

User: "For lunch I had grilled chicken with rice and vegetables"
Butler: [MealLogCard] Logged lunch: ~550 cal | 42g protein | 58g carbs | 12g fat

User: "How am I doing today?"
Butler: [DailyProgressCard] 3 exercises done, 1200/2000 calories consumed
```

**Tools Required:**
- `suggestExercises(bodyPart?, equipment?, limit?)` - Query ExerciseDB MCP
- `logExercise(name, sets, reps, weight?, date?)` - Save to Convex
- `logMeal(foodName, mealType, quantity?, date?)` - Estimate nutrition & save
- `getDailyProgress(date?)` - Fetch today's logs from Convex

### 4.3 Trainer Agent (Expert Advice)

**Model**: Single shared model (configured in Tambo project)

| Feature | Description | Priority |
|---------|-------------|----------|
| Exercise Advice | Detailed form tips and common mistakes | P0 |
| Workout Planning | Create personalized workout plans | P1 |
| Form Corrections | Specific corrections with visual aids | P1 |
| Progress Analysis | Analyze workout history and suggest improvements | P2 |
| Nutrition Advice | Diet recommendations based on goals | P2 |

**Example Interactions:**

```
User: "How do I properly do deadlifts?"
Trainer: [ExerciseAdviceCard] [FormCorrectionCard]
Detailed breakdown of deadlift form, common mistakes, and tips...

User: "Create a 3-day workout plan for building muscle"
Trainer: [WorkoutPlanCard] Here's your personalized plan...

User: "I've been stuck at 60kg bench for 2 weeks, how do I progress?"
Trainer: [ProgressAnalysis] Based on your logs, here are strategies...
```

**Tools Required:**
- `getExerciseInfo(exerciseName)` - Detailed info from ExerciseDB
- `getUserProgress(days)` - Fetch user's workout history
- `createWorkoutPlan(name, exercises[])` - Save plan to Convex
- `getUserProfile()` - Get user stats for personalized advice

### 4.4 Dashboard

| Feature | Description | Priority |
|---------|-------------|----------|
| Today's Summary | Exercises done, calories consumed vs target | P0 |
| Weekly Overview | 7-day exercise and calorie chart | P0 |
| Exercise History | List of recent workouts with details | P0 |
| Meal History | List of logged meals by day | P1 |
| Goal Progress | Visual progress toward fitness goals | P1 |
| Workout Plans | Saved plans from Trainer | P2 |

**Dashboard Components:**
- Stats Cards (today's numbers)
- Calorie Line/Bar Chart (Recharts)
- Exercise History Table
- Weekly Calendar View

### 4.5 Settings

| Feature | Description | Priority |
|---------|-------------|----------|
| Edit Profile | Update name, height, weight, age | P0 |
| Change Goal | Switch fitness goal | P0 |
| Calorie Target | Adjust daily calorie target | P1 |
| Data Export | Export logs as CSV/JSON | P2 |
| Clear Data | Reset all tracking data | P2 |

---

## 5. Technical Architecture

### 5.1 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 (App Router) | React framework with SSR |
| AI Layer | Tambo React SDK | Generative UI with AI agents |
| Exercise API | ExerciseDB (RapidAPI) | Exercise database with 1300+ exercises |
| Database | Convex | Real-time, type-safe database |
| Styling | Tailwind CSS + shadcn/ui | Modern UI components |
| Charts | Recharts | Data visualization |

### 5.2 Two-Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Application                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐           ┌──────────────────┐        │
│  │  Butler Agent    │           │  Trainer Agent   │        │
│  │  (GPT-4o-mini)   │           │  (GPT-4/Claude)  │        │
│  │                  │           │                  │        │
│  │  - Log exercises │           │  - Form advice   │        │
│  │  - Log meals     │           │  - Workout plans │        │
│  │  - Suggest       │           │  - Progress      │        │
│  │    exercises     │           │    analysis      │        │
│  └────────┬─────────┘           └────────┬─────────┘        │
│           │                              │                   │
│           └──────────┬───────────────────┘                   │
│                      │                                       │
│           ┌──────────▼──────────┐                           │
│           │   ExerciseDB MCP    │                           │
│           │   (RapidAPI)        │                           │
│           └──────────┬──────────┘                           │
│                      │                                       │
│           ┌──────────▼──────────┐                           │
│           │   Convex Database   │                           │
│           │                     │                           │
│           │  - userProfile      │                           │
│           │  - exerciseLogs     │                           │
│           │  - mealLogs         │                           │
│           │  - workoutPlans     │                           │
│           └─────────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Data Models

#### User Profile
```typescript
{
  name: string,
  height: number,        // cm
  weight: number,        // kg
  age?: number,
  fitnessGoal: "lose_weight" | "build_muscle" | "maintain",
  dailyCalorieTarget?: number,
  createdAt: string,
  updatedAt: string
}
```

#### Exercise Log
```typescript
{
  date: string,          // "2026-02-04"
  exerciseId?: string,   // ExerciseDB ID
  exerciseName: string,
  sets: number,
  reps: number,
  weight?: number,       // kg
  duration?: number,     // minutes (cardio)
  notes?: string,
  createdAt: string
}
```

#### Meal Log
```typescript
{
  date: string,
  mealType: "breakfast" | "lunch" | "dinner" | "snack",
  foodName: string,
  quantity?: string,     // "1 bowl", "200g"
  calories: number,
  protein: number,       // grams
  carbs: number,         // grams
  fat: number,           // grams
  fiber?: number,
  createdAt: string
}
```

### 5.4 API Integration

#### ExerciseDB API (via MCP)
- **Endpoint**: `exercisedb.p.rapidapi.com`
- **Authentication**: RapidAPI Key
- **Key Endpoints**:
  - GET `/exercises` - All exercises
  - GET `/exercises/bodyPart/{bodyPart}` - By body part
  - GET `/exercises/equipment/{equipment}` - By equipment
  - GET `/exercises/name/{name}` - Search by name

---

## 6. User Interface

### 6.1 Navigation Structure

```
┌─────────────────────────────────────────┐
│  FitTrack                    [Settings] │
├─────────┬───────────────────────────────┤
│         │                               │
│ Dashboard│       Main Content Area      │
│         │                               │
│ Butler  │                               │
│         │                               │
│ Trainer │                               │
│         │                               │
└─────────┴───────────────────────────────┘
```

### 6.2 Key Screens

1. **Onboarding Dialog**
   - Modal overlay
   - Step-by-step or single form
   - Progress indicator

2. **Dashboard**
   - Today's stats cards at top
   - Weekly chart in center
   - Recent activity feed

3. **Butler Chat**
   - Message thread interface
   - Generated UI cards inline
   - Input at bottom

4. **Trainer Chat**
   - Similar to Butler but different header/theme
   - More detailed response cards

5. **Settings**
   - Form to edit profile
   - Danger zone for data reset

### 6.3 Tambo Generated Components

| Component | Agent | Visual Description |
|-----------|-------|-------------------|
| ExerciseSuggestionList | Butler | Grid of exercise cards with images |
| ExerciseLogCard | Butler | Compact card showing logged exercise |
| MealLogCard | Butler | Card with food name and macro breakdown |
| DailyProgressCard | Butler | Summary with progress bars |
| ExerciseAdviceCard | Trainer | Detailed card with tips list |
| WorkoutPlanCard | Trainer | Expandable plan with exercise list |
| FormCorrectionCard | Trainer | Card with do's and don'ts |

---

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to Log Exercise | < 10 seconds | From user message to confirmation |
| Nutrition Accuracy | ±20% of actual | Compare AI estimates to USDA data |
| Daily Active Usage | 1+ interaction/day | Track daily sessions |
| Token Cost per Session | < $0.05 | Monitor Tambo usage |

---

## 8. Future Enhancements (Post-MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| Progress Photos | Upload and compare body photos | P2 |
| Social Sharing | Share achievements | P3 |
| Wearable Integration | Sync with Fitbit/Apple Watch | P3 |
| Voice Input | Log via voice commands | P2 |
| Workout Timer | Built-in rest timer | P2 |
| Exercise Videos | Embedded form videos | P2 |

---

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Nutrition estimation inaccuracy | User frustration | Show estimates with disclaimer, allow manual edit |
| ExerciseDB API rate limits | Feature unavailable | Cache common exercises, implement retry logic |
| High token costs | Budget overrun | Use cheap model for Butler, monitor usage |
| Convex downtime | Data loss | Implement local fallback, show offline state |

---

## 10. Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Setup | 1 day | Project scaffold, Convex schema, Tambo config |
| Phase 2: Core Features | 2-3 days | Butler agent, exercise/meal logging, dashboard |
| Phase 3: Trainer | 1-2 days | Trainer agent, advice components |
| Phase 4: Polish | 1 day | UI refinements, error handling, testing |

---

## 11. Open Questions

1. Should we support multiple workout plans or just one active plan?
2. Do we need exercise history search/filter functionality?
3. Should meals be editable after logging?
4. Do we want weekly/monthly reports?

---

## Appendix A: Environment Variables

```env
# Tambo AI
NEXT_PUBLIC_TAMBO_API_KEY=            # Tambo project API key

# ExerciseDB (RapidAPI)
EXERCISEDB_API_KEY=                   # RapidAPI key

# Convex
NEXT_PUBLIC_CONVEX_URL=               # Convex deployment URL
CONVEX_DEPLOY_KEY=                    # Convex deploy key
```

## Appendix B: ExerciseDB MCP Configuration

```json
{
  "mcpServers": {
    "RapidAPI Hub - ExerciseDB": {
      "command": "bunx",
      "args": [
        "mcp-remote",
        "https://mcp.rapidapi.com",
        "--header",
        "x-api-host: exercisedb.p.rapidapi.com",
        "--header",
        "x-api-key: YOUR_API_KEY"
      ]
    }
  }
}
```