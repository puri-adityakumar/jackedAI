# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JackedAI is an AI-powered gym tracking web application. Users track exercises, meals, and calories through natural language conversations with two AI modes: **Butler** (quick data logging) and **Trainer** (fitness advice).

## Essential Commands

```bash
npm run dev          # Run Convex + Next.js in parallel (required for development)
npm run dev:next     # Next.js only (port 3000)
npm run dev:convex   # Convex dev server only
npm run build        # Production build
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
```

## Architecture

### Tech Stack
- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Convex** for real-time database and backend functions
- **Tambo AI** for generative UI and natural language processing
- **Tailwind CSS v4**

### Data Flow

```
User Input → Tambo AI → Tool Selection → API Route → ConvexHttpClient → Convex DB
                                                                            ↓
                          Component Render ← Tool Output ← Convex Response ←
```

### Key Files

- **`src/lib/tambo.ts`** - Central hub: register all AI components and tools here
- **`convex/schema.ts`** - Database schema (userProfile, exerciseLogs, mealLogs, workoutPlans)
- **`src/services/fitness-tools.ts`** - Tool implementations with nutrition estimation
- **`src/app/api/`** - API routes that bridge tools to Convex

### Two-Mode Pattern

Single AI model with different system prompts controlled by `ModeToggle` component:
- **Butler Mode**: Quick logging ("Log 3 sets of bench press at 60kg")
- **Trainer Mode**: Expert advice ("How do I improve my deadlift form?")

### Registered Tools (src/lib/tambo.ts)

| Tool | Purpose |
|------|---------|
| `logExercise` | Save workout to exerciseLogs |
| `logMeal` | Estimate nutrition & save to mealLogs |
| `getDailyProgress` | Fetch daily summary |
| `getUserProfile` | Get user stats for personalization |

### Registered Components

| Component | Use Case |
|-----------|----------|
| `ExerciseLogCard` | Confirmation after logging exercise |
| `MealLogCard` | Shows meal with macro breakdown |
| `DailyProgressCard` | Daily stats summary |
| `Graph` | Recharts visualization |

## Adding New Features

### New AI Component
1. Create component in `src/components/tambo/`
2. Export Zod schema for props, type with `z.infer<typeof schema>`
3. Register in `src/lib/tambo.ts` components array

### New AI Tool
1. Implement in `src/services/fitness-tools.ts`
2. Create API route in `src/app/api/` if needed
3. Define input/output Zod schemas
4. Register in `src/lib/tambo.ts` tools array

### Database Changes
1. Edit `convex/schema.ts`
2. Add queries/mutations in `convex/*.ts`
3. Types auto-generate in `convex/_generated/`

## Convex Database Tables

- **userProfile**: name, height, weight, age, fitnessGoal, dailyCalorieTarget
- **exerciseLogs**: date, exerciseName, sets, reps, weight, duration (indexed by date)
- **mealLogs**: date, mealType, foodName, calories, protein, carbs, fat (indexed by date)
- **workoutPlans**: name, exercises array

## Environment Variables

```env
NEXT_PUBLIC_TAMBO_API_KEY=     # Tambo API key (get from tambo.co/dashboard)
NEXT_PUBLIC_CONVEX_URL=        # Convex deployment URL
CONVEX_DEPLOYMENT=             # Convex project reference
```

## Tambo AI Reference

- **Docs**: https://docs.tambo.co/llms.txt
- **CLI**: `npx tambo help` - add components, upgrade SDK
- Before writing new code, check `node_modules/@tambo-ai/react` for latest hooks and features
