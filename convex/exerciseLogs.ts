import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const muscleGroupValidator = v.union(
  v.literal("chest"),
  v.literal("back"),
  v.literal("shoulders"),
  v.literal("arms"),
  v.literal("legs"),
  v.literal("core"),
  v.literal("cardio"),
  v.literal("full_body")
);

export const create = mutation({
  args: {
    date: v.string(),
    muscleGroup: v.optional(muscleGroupValidator),
    exerciseName: v.string(),
    sets: v.number(),
    reps: v.number(),
    weight: v.optional(v.number()),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("exerciseLogs", {
      ...args,
      createdAt: Date.now(),
    });
    return logId;
  },
});

export const update = mutation({
  args: {
    id: v.id("exerciseLogs"),
    date: v.optional(v.string()),
    muscleGroup: v.optional(muscleGroupValidator),
    exerciseName: v.optional(v.string()),
    sets: v.optional(v.number()),
    reps: v.optional(v.number()),
    weight: v.optional(v.number()),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(id, { ...filteredUpdates, updatedAt: Date.now() });
  },
});

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("exerciseLogs")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
    return logs;
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const logs = await ctx.db
      .query("exerciseLogs")
      .order("desc")
      .take(limit);
    return logs;
  },
});

export const getWeekSummary = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, args) => {
    const logs = await ctx.db.query("exerciseLogs").collect();
    // Filter by date range
    const filtered = logs.filter(
      (log) => log.date >= args.startDate && log.date <= args.endDate
    );
    // Group by date
    const byDate: Record<string, number> = {};
    for (const log of filtered) {
      byDate[log.date] = (byDate[log.date] || 0) + 1;
    }
    return byDate;
  },
});

export const remove = mutation({
  args: { id: v.id("exerciseLogs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getStreak = query({
  handler: async (ctx) => {
    const logs = await ctx.db.query("exerciseLogs").collect();
    
    // Get unique dates sorted descending
    const uniqueDates = [...new Set(logs.map((log) => log.date))].sort(
      (a, b) => b.localeCompare(a)
    );

    if (uniqueDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Calculate current streak (consecutive days from today or yesterday)
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    
    let currentStreak = 0;
    let checkDate = uniqueDates[0] === today || uniqueDates[0] === yesterday 
      ? new Date(uniqueDates[0]) 
      : null;

    if (checkDate) {
      for (const dateStr of uniqueDates) {
        const expectedDate = checkDate.toISOString().split("T")[0];
        if (dateStr === expectedDate) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (dateStr < expectedDate) {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffDays = (prevDate.getTime() - currDate.getTime()) / 86400000;
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  },
});

export const getMonthSummary = query({
  args: { year: v.number(), month: v.number() },
  handler: async (ctx, args) => {
    const { year, month } = args;
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

    const logs = await ctx.db.query("exerciseLogs").collect();
    const filtered = logs.filter(
      (log) => log.date >= startDate && log.date < endDate
    );

    // Group by date with exercise count and primary muscle group
    const byDate: Record<
      string,
      { count: number; muscleGroups: string[]; exercises: string[] }
    > = {};

    for (const log of filtered) {
      if (!byDate[log.date]) {
        byDate[log.date] = { count: 0, muscleGroups: [], exercises: [] };
      }
      byDate[log.date].count++;
      if (log.muscleGroup && !byDate[log.date].muscleGroups.includes(log.muscleGroup)) {
        byDate[log.date].muscleGroups.push(log.muscleGroup);
      }
      byDate[log.date].exercises.push(log.exerciseName);
    }

    const totalWorkouts = Object.keys(byDate).length;
    const totalExercises = filtered.length;

    return { byDate, totalWorkouts, totalExercises };
  },
});

export const getAll = query({
  handler: async (ctx) => {
    const logs = await ctx.db.query("exerciseLogs").order("desc").collect();
    return logs;
  },
});
