import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    date: v.string(),
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
