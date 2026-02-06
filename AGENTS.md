# AGENTS.md

Guidelines for AI agents working on JackedAI.

## Commands

```bash
# Development (requires both)
npm run dev          # Run Convex + Next.js in parallel
npm run dev:next     # Next.js only (port 3000)
npm run dev:convex   # Convex dev server only

# Build & Quality
npm run build        # Production build
npm run lint         # ESLint check
npm run lint:fix     # ESLint with auto-fix
```

**Note**: This project does not have a test suite configured. If adding tests, use Vitest or Jest with React Testing Library.

## Code Style Guidelines

### TypeScript & Types
- Strict mode enabled - all types must be explicit
- Use `interface` for object shapes, `type` for unions/complex types
- Export schemas from components: `export const componentSchema = z.object({...})`
- Type props with: `type Props = z.infer<typeof componentSchema>`
- Use path alias `@/*` for imports from `src/`

### Naming Conventions
- **Components**: PascalCase (e.g., `ExerciseLogCard`, `DailyProgressCard`)
- **Files**: PascalCase for components, camelCase for utilities/hooks
- **Interfaces**: PascalCase with descriptive names (e.g., `LogExerciseInput`, `CreateReminderOutput`)
- **Functions**: camelCase, descriptive verbs (e.g., `getDailyProgress`, `createReminder`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `MUSCLE_GROUP_LABELS`)

### Imports & Exports
```typescript
// 1. React/Next imports
import { useState } from "react";
import { NextResponse } from "next/server";

// 2. Third-party libraries
import { z } from "zod";
import { format } from "date-fns";

// 3. Internal aliases (@/*)
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";

// 4. Relative imports (only when necessary)
import { ExerciseLogCard } from "./ExerciseLogCard";
```

### Component Structure
```typescript
"use client"; // If needed

import { z } from "zod";

// 1. Schema export
export const myComponentSchema = z.object({
  title: z.string(),
  count: z.number(),
});

// 2. Type from schema
type MyComponentProps = z.infer<typeof myComponentSchema>;

// 3. Constants (if any)
const LABELS: Record<string, string> = { ... };

// 4. Component function
export function MyComponent({ title, count }: MyComponentProps) {
  return <div>...</div>;
}
```

### Error Handling
- Use try/catch with specific error messages
- Return structured error responses in tools/services
- Log errors to console with context: `console.error("Context:", error)`
- API routes: Return `NextResponse.json({ error: "..." }, { status: 500 })`

### Documentation
- Add JSDoc for complex functions, especially tools
- Describe parameters and return types
- Include usage examples for reusable utilities

### Database (Convex)
- Define schemas in `convex/schema.ts` with validators
- Use indexes for frequently queried fields
- Mutations: Use `ctx.db.insert()`, `ctx.db.patch()`, `ctx.db.delete()`
- Queries: Use `ctx.db.query().withIndex().collect()`
- Generated types auto-update in `convex/_generated/`

### Tambo AI Components
- Export Zod schema with `.describe()` on each field
- Register in `src/lib/tambo.ts` components array
- Include `purpose` in description for AI to know when to render
- Use Tailwind for styling with semantic color classes

### API Routes
- Use `ConvexHttpClient` for database access
- Validate inputs before processing
- Return consistent response shapes
- Handle errors with appropriate HTTP status codes

### Styling
- Tailwind CSS v4 with utility classes
- Use `cn()` from `@/lib/utils` for conditional classes
- Color scheme: Use semantic colors (e.g., `bg-green-50`, `text-green-900`)
- Responsive design with Tailwind breakpoints

## Architecture Reminders

- **Data Flow**: User → Tambo AI → Tool → API Route → Convex DB
- **Key Files**:
  - `src/lib/tambo.ts` - Register all AI tools/components
  - `convex/schema.ts` - Database schema
  - `src/services/fitness-tools.ts` - Tool implementations
- **Two AI Modes**: Butler (logging) vs Trainer (advice) via `ModeToggle`

## Environment Variables

```env
NEXT_PUBLIC_TAMBO_API_KEY=
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
```
