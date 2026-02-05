import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    date: v.string(),
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack")
    ),
    foodName: v.string(),
    quantity: v.optional(v.string()),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    fiber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const logId = await ctx.db.insert("mealLogs", {
      ...args,
      createdAt: Date.now(),
    });
    return logId;
  },
});

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("mealLogs")
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
      .query("mealLogs")
      .order("desc")
      .take(limit);
    return logs;
  },
});

export const getDailySummary = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("mealLogs")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    const summary = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      mealCount: logs.length,
    };

    for (const log of logs) {
      summary.totalCalories += log.calories;
      summary.totalProtein += log.protein;
      summary.totalCarbs += log.carbs;
      summary.totalFat += log.fat;
    }

    return summary;
  },
});

export const getWeekSummary = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, args) => {
    const logs = await ctx.db.query("mealLogs").collect();
    // Filter by date range
    const filtered = logs.filter(
      (log) => log.date >= args.startDate && log.date <= args.endDate
    );
    // Group by date
    const byDate: Record<string, { calories: number; protein: number }> = {};
    for (const log of filtered) {
      if (!byDate[log.date]) {
        byDate[log.date] = { calories: 0, protein: 0 };
      }
      byDate[log.date].calories += log.calories;
      byDate[log.date].protein += log.protein;
    }
    return byDate;
  },
});

export const update = mutation({
  args: {
    id: v.id("mealLogs"),
    date: v.optional(v.string()),
    mealType: v.optional(
      v.union(
        v.literal("breakfast"),
        v.literal("lunch"),
        v.literal("dinner"),
        v.literal("snack")
      )
    ),
    foodName: v.optional(v.string()),
    quantity: v.optional(v.string()),
    calories: v.optional(v.number()),
    protein: v.optional(v.number()),
    carbs: v.optional(v.number()),
    fat: v.optional(v.number()),
    fiber: v.optional(v.number()),
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

export const remove = mutation({
  args: { id: v.id("mealLogs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getStreak = query({
  handler: async (ctx) => {
    const logs = await ctx.db.query("mealLogs").collect();

    // Get unique dates sorted descending
    const uniqueDates = [...new Set(logs.map((log) => log.date))].sort(
      (a, b) => b.localeCompare(a)
    );

    if (uniqueDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Calculate current streak
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    let currentStreak = 0;
    let checkDate =
      uniqueDates[0] === today || uniqueDates[0] === yesterday
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

    const logs = await ctx.db.query("mealLogs").collect();
    const filtered = logs.filter(
      (log) => log.date >= startDate && log.date < endDate
    );

    // Group by date with totals
    const byDate: Record<
      string,
      { calories: number; protein: number; carbs: number; fat: number; mealCount: number }
    > = {};

    for (const log of filtered) {
      if (!byDate[log.date]) {
        byDate[log.date] = { calories: 0, protein: 0, carbs: 0, fat: 0, mealCount: 0 };
      }
      byDate[log.date].calories += log.calories;
      byDate[log.date].protein += log.protein;
      byDate[log.date].carbs += log.carbs;
      byDate[log.date].fat += log.fat;
      byDate[log.date].mealCount++;
    }

    const totalDays = Object.keys(byDate).length;
    const avgCalories =
      totalDays > 0
        ? Math.round(
            Object.values(byDate).reduce((sum, d) => sum + d.calories, 0) / totalDays
          )
        : 0;

    return { byDate, totalDays, avgCalories };
  },
});

export const getAll = query({
  handler: async (ctx) => {
    const logs = await ctx.db.query("mealLogs").order("desc").collect();
    return logs;
  },
});
