import { query, mutation } from "./_generated/server";

// Badge chain definitions - simple progression chains
interface BadgeChain {
  id: string;
  name: string;
  icon: string;
  unit: string;
  milestones: number[];
  statKey: string;
}

export const BADGE_CHAINS: BadgeChain[] = [
  {
    id: "workout_streak",
    name: "Streak",
    icon: "flame",
    unit: "days",
    milestones: [7, 14, 30, 60, 90, 180, 365],
    statKey: "exercise_streak",
  },
  {
    id: "exercise_count",
    name: "Exercises",
    icon: "dumbbell",
    unit: "",
    milestones: [10, 50, 100, 250, 500, 1000],
    statKey: "exercise_count",
  },
  {
    id: "pr_count",
    name: "PRs",
    icon: "trophy",
    unit: "",
    milestones: [1, 5, 10, 25, 50],
    statKey: "pr_count",
  },
  {
    id: "variety",
    name: "Variety",
    icon: "target",
    unit: "groups",
    milestones: [2, 4, 6, 8],
    statKey: "muscle_group_count",
  },
];

function getCurrentStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let streak = 0;
  let checkDate =
    dates[0] === today || dates[0] === yesterday ? new Date(dates[0]) : null;

  if (checkDate) {
    for (const dateStr of dates) {
      const expected = checkDate.toISOString().split("T")[0];
      if (dateStr === expected) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr < expected) {
        break;
      }
    }
  }
  return streak;
}

// Get badge progress for all 4 chains
export const getBadgeProgress = query({
  handler: async (ctx) => {
    const [exerciseLogs, prs] = await Promise.all([
      ctx.db.query("exerciseLogs").collect(),
      ctx.db.query("personalRecords").collect(),
    ]);

    // Compute stats
    const exerciseCount = exerciseLogs.length;
    const prCount = new Set(prs.map((pr) => pr.exerciseName)).size;
    const muscleGroupCount = new Set(
      exerciseLogs.map((l) => l.muscleGroup).filter(Boolean)
    ).size;

    // Compute exercise streak
    const exerciseDates = [
      ...new Set(exerciseLogs.map((log) => log.date)),
    ].sort((a, b) => b.localeCompare(a));
    const exerciseStreak = getCurrentStreak(exerciseDates);

    const stats: Record<string, number> = {
      exercise_streak: exerciseStreak,
      exercise_count: exerciseCount,
      pr_count: prCount,
      muscle_group_count: muscleGroupCount,
    };

    return BADGE_CHAINS.map((chain) => {
      const currentValue = stats[chain.statKey] ?? 0;
      const earnedMilestones = chain.milestones.filter(
        (m) => m <= currentValue
      );
      const nextMilestone =
        chain.milestones.find((m) => m > currentValue) ?? null;
      const prevMilestone =
        earnedMilestones.length > 0
          ? earnedMilestones[earnedMilestones.length - 1]
          : 0;

      let progressPercent = 0;
      if (nextMilestone !== null) {
        const range = nextMilestone - prevMilestone;
        const progress = currentValue - prevMilestone;
        progressPercent = range > 0 ? Math.round((progress / range) * 100) : 0;
      } else {
        progressPercent = 100;
      }

      return {
        id: chain.id,
        name: chain.name,
        icon: chain.icon,
        unit: chain.unit,
        milestones: chain.milestones,
        currentValue,
        earnedMilestones,
        nextMilestone,
        prevMilestone,
        progressPercent,
        isComplete: nextMilestone === null,
      };
    });
  },
});

// Check and unlock badge milestones
export const checkAndUnlock = mutation({
  handler: async (ctx) => {
    const [unlocked, exerciseLogs, prs] = await Promise.all([
      ctx.db.query("achievements").collect(),
      ctx.db.query("exerciseLogs").collect(),
      ctx.db.query("personalRecords").collect(),
    ]);

    const unlockedIds = new Set(unlocked.map((a) => a.achievementId));

    const exerciseCount = exerciseLogs.length;
    const prCount = new Set(prs.map((pr) => pr.exerciseName)).size;
    const muscleGroupCount = new Set(
      exerciseLogs.map((l) => l.muscleGroup).filter(Boolean)
    ).size;

    const exerciseDates = [
      ...new Set(exerciseLogs.map((log) => log.date)),
    ].sort((a, b) => b.localeCompare(a));
    const exerciseStreak = getCurrentStreak(exerciseDates);

    const stats: Record<string, number> = {
      exercise_streak: exerciseStreak,
      exercise_count: exerciseCount,
      pr_count: prCount,
      muscle_group_count: muscleGroupCount,
    };

    const newlyUnlocked: { chainId: string; milestone: number }[] = [];

    for (const chain of BADGE_CHAINS) {
      const currentValue = stats[chain.statKey] ?? 0;

      for (const milestone of chain.milestones) {
        const achievementId = `${chain.id}_${milestone}`;

        if (unlockedIds.has(achievementId)) continue;

        if (currentValue >= milestone) {
          await ctx.db.insert("achievements", {
            achievementId,
            unlockedAt: Date.now(),
            notified: false,
            metadata: { count: currentValue },
          });
          newlyUnlocked.push({ chainId: chain.id, milestone });
        }
      }
    }

    return { newlyUnlocked };
  },
});
