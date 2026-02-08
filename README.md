<h1 align="center">JackedAI</h1>

<p align="center">
  <a href="#">Demo Video (coming soon)</a>
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
  <a href="#">LIVE</a> &nbsp;|&nbsp; <a href="#">DEMO</a>
</h3>

> **PIN:** `123456` — Use this PIN to access the demo.

---

## Setup

```bash
git clone https://github.com/your-username/jackedAI.git
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
