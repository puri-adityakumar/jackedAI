import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const prTypeValidator = v.union(
  v.literal("max_weight"),
  v.literal("max_volume"),
  v.literal("estimated_1rm")
);

// Check if a new exercise log beats existing PRs and update if so
export const checkAndUpdatePR = mutation({
  args: {
    exerciseName: v.string(),
    sets: v.number(),
    reps: v.number(),
    weight: v.number(),
    exerciseLogId: v.id("exerciseLogs"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const { exerciseName, sets, reps, weight, exerciseLogId, date } = args;
    const normalizedName = exerciseName.toLowerCase().trim();
    const newPRs: Array<{
      type: "max_weight" | "max_volume" | "estimated_1rm";
      value: number;
      previousValue: number | null;
    }> = [];

    // Calculate metrics
    const volume = sets * reps * weight;
    const estimated1RM = weight * (1 + reps / 30); // Epley formula approximation

    // Check max weight PR
    const currentMaxWeight = await ctx.db
      .query("personalRecords")
      .withIndex("by_exercise_type", (q) =>
        q.eq("exerciseName", normalizedName).eq("prType", "max_weight")
      )
      .first();

    if (!currentMaxWeight || weight > currentMaxWeight.value) {
      if (currentMaxWeight) {
        await ctx.db.patch(currentMaxWeight._id, {
          value: weight,
          reps,
          exerciseLogId,
          achievedDate: date,
          previousValue: currentMaxWeight.value,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("personalRecords", {
          exerciseName: normalizedName,
          prType: "max_weight",
          value: weight,
          reps,
          exerciseLogId,
          achievedDate: date,
          createdAt: Date.now(),
        });
      }
      newPRs.push({
        type: "max_weight",
        value: weight,
        previousValue: currentMaxWeight?.value ?? null,
      });
    }

    // Check max volume PR
    const currentMaxVolume = await ctx.db
      .query("personalRecords")
      .withIndex("by_exercise_type", (q) =>
        q.eq("exerciseName", normalizedName).eq("prType", "max_volume")
      )
      .first();

    if (!currentMaxVolume || volume > currentMaxVolume.value) {
      if (currentMaxVolume) {
        await ctx.db.patch(currentMaxVolume._id, {
          value: volume,
          exerciseLogId,
          achievedDate: date,
          previousValue: currentMaxVolume.value,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("personalRecords", {
          exerciseName: normalizedName,
          prType: "max_volume",
          value: volume,
          exerciseLogId,
          achievedDate: date,
          createdAt: Date.now(),
        });
      }
      newPRs.push({
        type: "max_volume",
        value: volume,
        previousValue: currentMaxVolume?.value ?? null,
      });
    }

    // Check estimated 1RM PR
    const currentMax1RM = await ctx.db
      .query("personalRecords")
      .withIndex("by_exercise_type", (q) =>
        q.eq("exerciseName", normalizedName).eq("prType", "estimated_1rm")
      )
      .first();

    if (!currentMax1RM || estimated1RM > currentMax1RM.value) {
      if (currentMax1RM) {
        await ctx.db.patch(currentMax1RM._id, {
          value: Math.round(estimated1RM * 10) / 10, // Round to 1 decimal
          exerciseLogId,
          achievedDate: date,
          previousValue: currentMax1RM.value,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("personalRecords", {
          exerciseName: normalizedName,
          prType: "estimated_1rm",
          value: Math.round(estimated1RM * 10) / 10,
          exerciseLogId,
          achievedDate: date,
          createdAt: Date.now(),
        });
      }
      newPRs.push({
        type: "estimated_1rm",
        value: Math.round(estimated1RM * 10) / 10,
        previousValue: currentMax1RM?.value ?? null,
      });
    }

    return { newPRs };
  },
});

// Get all PRs grouped by exercise
export const getAllPRs = query({
  handler: async (ctx) => {
    const prs = await ctx.db.query("personalRecords").collect();

    // Group by exercise name
    const grouped: Record<
      string,
      {
        exerciseName: string;
        maxWeight?: { value: number; reps?: number; date: string };
        maxVolume?: { value: number; date: string };
        estimated1RM?: { value: number; date: string };
      }
    > = {};

    for (const pr of prs) {
      if (!grouped[pr.exerciseName]) {
        grouped[pr.exerciseName] = { exerciseName: pr.exerciseName };
      }

      if (pr.prType === "max_weight") {
        grouped[pr.exerciseName].maxWeight = {
          value: pr.value,
          reps: pr.reps,
          date: pr.achievedDate,
        };
      } else if (pr.prType === "max_volume") {
        grouped[pr.exerciseName].maxVolume = {
          value: pr.value,
          date: pr.achievedDate,
        };
      } else if (pr.prType === "estimated_1rm") {
        grouped[pr.exerciseName].estimated1RM = {
          value: pr.value,
          date: pr.achievedDate,
        };
      }
    }

    return Object.values(grouped);
  },
});

// Get PRs for a specific exercise
export const getPRsForExercise = query({
  args: { exerciseName: v.string() },
  handler: async (ctx, args) => {
    const normalizedName = args.exerciseName.toLowerCase().trim();
    const prs = await ctx.db
      .query("personalRecords")
      .withIndex("by_exercise", (q) => q.eq("exerciseName", normalizedName))
      .collect();

    const result: {
      maxWeight?: { value: number; reps?: number; date: string; previousValue?: number };
      maxVolume?: { value: number; date: string; previousValue?: number };
      estimated1RM?: { value: number; date: string; previousValue?: number };
    } = {};

    for (const pr of prs) {
      if (pr.prType === "max_weight") {
        result.maxWeight = {
          value: pr.value,
          reps: pr.reps,
          date: pr.achievedDate,
          previousValue: pr.previousValue,
        };
      } else if (pr.prType === "max_volume") {
        result.maxVolume = {
          value: pr.value,
          date: pr.achievedDate,
          previousValue: pr.previousValue,
        };
      } else if (pr.prType === "estimated_1rm") {
        result.estimated1RM = {
          value: pr.value,
          date: pr.achievedDate,
          previousValue: pr.previousValue,
        };
      }
    }

    return result;
  },
});

// Get recently achieved PRs
export const getRecentPRs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const prs = await ctx.db.query("personalRecords").collect();

    // Sort by achieved date descending, then by createdAt
    const sorted = prs.sort((a, b) => {
      const dateCompare = b.achievedDate.localeCompare(a.achievedDate);
      if (dateCompare !== 0) return dateCompare;
      return b.createdAt - a.createdAt;
    });

    return sorted.slice(0, limit);
  },
});

// Get count of total PRs
export const getPRCount = query({
  handler: async (ctx) => {
    const prs = await ctx.db.query("personalRecords").collect();
    // Count unique exercises with at least one PR
    const uniqueExercises = new Set(prs.map((pr) => pr.exerciseName));
    return {
      totalPRs: prs.length,
      uniqueExercises: uniqueExercises.size,
    };
  },
});

// Get PR history for an exercise (for progression tracking)
// Note: This requires storing historical data, for now we just show current
export const getPRTimeline = query({
  args: { exerciseName: v.string() },
  handler: async (ctx, args) => {
    const normalizedName = args.exerciseName.toLowerCase().trim();

    // Get all exercise logs for this exercise, sorted by date
    const logs = await ctx.db.query("exerciseLogs").collect();
    const filtered = logs
      .filter((log) => log.exerciseName.toLowerCase().trim() === normalizedName && log.weight)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Track max weight progression
    let maxWeight = 0;
    const progression: Array<{ date: string; weight: number; wasNewPR: boolean }> = [];

    for (const log of filtered) {
      const weight = log.weight!;
      const wasNewPR = weight > maxWeight;
      if (wasNewPR) {
        maxWeight = weight;
      }
      progression.push({
        date: log.date,
        weight,
        wasNewPR,
      });
    }

    return progression;
  },
});
