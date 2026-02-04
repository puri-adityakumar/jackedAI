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

export const remove = mutation({
  args: { id: v.id("mealLogs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
