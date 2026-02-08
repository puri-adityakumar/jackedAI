<h1 align="center">JackedAI</h1>

<p align="center">
  <img src="public/logo.svg" alt="JackedAI" width="60" />
  &nbsp;&nbsp;<b>x</b>&nbsp;&nbsp;
  <img src="public/Tambo-Lockup.svg" alt="Tambo" width="120" />
</p>

<p align="center">
  <a href="https://youtu.be/SDbjxEYgZVc?si=ADw7NUsnS_C5VVcX">Demo Video</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Convex-EE342F?style=for-the-badge&logo=convex&logoColor=white" alt="Convex" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Tambo_AI-8B5CF6?style=for-the-badge" alt="Tambo AI" />
</p>

<p align="center">AI-powered gym tracker — log workouts, meals, and calories through natural language conversations.</p>

<h3 align="center">
  <a href="https://jacked-ai.vercel.app/">LIVE</a> &nbsp;|&nbsp; <a href="https://youtu.be/SDbjxEYgZVc?si=ADw7NUsnS_C5VVcX">DEMO</a>
</h3>

> **PIN:** `123456` — Use this PIN to access the demo.

---

## Architecture

```mermaid
graph TD
    subgraph Client["Next.js 15 App"]
        UI["Dashboard / Chat / Settings"]
        UI --> Tambo

        subgraph Tambo["Tambo AI Provider"]
            Butler["Butler Mode<br/><i>Quick Logging</i>"]
            Trainer["Trainer Mode<br/><i>Fitness Advice</i>"]
            Butler --> Tools
            Trainer --> Tools
            Tools["Tool Selection<br/><i>fitness-tools.ts</i>"]
        end

        subgraph GenUI["Generative UI Components"]
            ELC["ExerciseLogCard"]
            MLC["MealLogCard"]
            DPC["DailyProgressCard"]
            RC["ReminderCard"]
            GR["Graph"]
        end

        Tools --> API["API Routes<br/>/api/*"]
        Tools --> GenUI
    end

    API --> Convex
    API --> ExerciseDB["ExerciseDB API<br/><i>RapidAPI</i>"]

    subgraph Convex["Convex (Real-time DB)"]
        exerciseLogs
        mealLogs
        workoutPlans
        reminders
        userProfile
        bodyStats
        personalRecords
        achievements
    end

    Convex --> GenUI
```

### Data Flow

```mermaid
flowchart LR
    A["User Input"] --> B["Tambo AI"]
    B --> C["Tool Selection"]
    C --> D["API Route"]
    D --> E["Convex DB"]
    E --> F["Tool Output"]
    F --> G["Component Render"]
```

### Key Concepts

- **Two AI Modes** — **Butler** for quick data logging ("Log 3 sets of bench at 60kg"), **Trainer** for fitness advice ("How do I fix my squat form?")
- **Generative UI** — Tambo renders rich components (cards, charts, progress summaries) inline in the chat based on tool outputs
- **Real-time Database** — Convex provides reactive queries, so dashboards update instantly when data changes
- **PIN Protection** — App-level lock screen with hashed PIN storage and lockout after failed attempts

### Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main app (tabs + chat sidebar)
│   ├── chat/                 # Full-screen chat view
│   └── api/                  # API routes (Convex bridge)
├── components/
│   ├── tambo/                # AI-rendered components
│   └── ui/                   # Shared UI components
├── lib/
│   └── tambo.ts              # Component & tool registry
└── services/
    ├── fitness-tools.ts      # Tool implementations
    └── exercisedb.ts         # ExerciseDB API client
convex/
├── schema.ts                 # Database schema
├── exerciseLogs.ts           # Exercise CRUD + queries
├── mealLogs.ts               # Meal CRUD + queries
├── workoutPlans.ts           # Workout plan management
├── reminders.ts              # Reminder system
├── bodyStats.ts              # Body measurements
├── personalRecords.ts        # PR tracking
└── achievements.ts           # Badge system
```

---

## Setup

```bash
git clone https://github.com/puri-adityakumar/jackedAI.git
cd jackedAI
npm install
cp .env.example .env.local  # fill in your keys
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_TAMBO_API_KEY` | Tambo API key ([get one](https://tambo.co/dashboard)) |
| `CONVEX_DEPLOYMENT` | Convex dev deployment reference |
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Convex site URL |
| `NEXT_CONVEX_DEPLOY_KEY` | Convex production deploy key |
| `EXERCISEDB_API_KEY` | RapidAPI key for ExerciseDB |

## Scripts

```bash
npm run dev          # Run Convex + Next.js dev servers
npm run build        # Production build
npm run lint         # ESLint
```

## License

[MIT](./LICENSE)
