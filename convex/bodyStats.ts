import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    date: v.string(),
    weight: v.number(),
    bodyFat: v.optional(v.number()),
    waist: v.optional(v.number()),
    chest: v.optional(v.number()),
    hips: v.optional(v.number()),
    bicepsLeft: v.optional(v.number()),
    bicepsRight: v.optional(v.number()),
    thighLeft: v.optional(v.number()),
    thighRight: v.optional(v.number()),
    neck: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if entry exists for this date
    const existing = await ctx.db
      .query("bodyStats")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (existing) {
      // Update existing entry
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new entry
    const id = await ctx.db.insert("bodyStats", {
      ...args,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("bodyStats"),
    date: v.optional(v.string()),
    weight: v.optional(v.number()),
    bodyFat: v.optional(v.number()),
    waist: v.optional(v.number()),
    chest: v.optional(v.number()),
    hips: v.optional(v.number()),
    bicepsLeft: v.optional(v.number()),
    bicepsRight: v.optional(v.number()),
    thighLeft: v.optional(v.number()),
    thighRight: v.optional(v.number()),
    neck: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(id, { ...filteredUpdates, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("bodyStats") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("bodyStats")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();
    return entry;
  },
});

export const getLatest = query({
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("bodyStats")
      .order("desc")
      .take(1);
    return entries[0] ?? null;
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const entries = await ctx.db
      .query("bodyStats")
      .order("desc")
      .take(limit);
    return entries;
  },
});

export const getAll = query({
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("bodyStats")
      .order("desc")
      .collect();
    return entries;
  },
});

export const getRange = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, args) => {
    const entries = await ctx.db.query("bodyStats").collect();
    const filtered = entries.filter(
      (e) => e.date >= args.startDate && e.date <= args.endDate
    );
    // Sort by date ascending for charts
    return filtered.sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const getTrends = query({
  args: {
    metric: v.union(
      v.literal("weight"),
      v.literal("bodyFat"),
      v.literal("waist"),
      v.literal("chest")
    ),
    period: v.union(
      v.literal("week"),
      v.literal("month"),
      v.literal("3months"),
      v.literal("year"),
      v.literal("all")
    ),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    let startDate: string;

    switch (args.period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];
        break;
      case "3months":
        startDate = new Date(now.getTime() - 90 * 86400000).toISOString().split("T")[0];
        break;
      case "year":
        startDate = new Date(now.getTime() - 365 * 86400000).toISOString().split("T")[0];
        break;
      case "all":
      default:
        startDate = "2000-01-01";
    }

    const entries = await ctx.db.query("bodyStats").collect();
    const filtered = entries
      .filter((e) => e.date >= startDate)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Extract the specific metric
    const data = filtered
      .map((e) => ({
        date: e.date,
        value: e[args.metric] as number | undefined,
      }))
      .filter((d) => d.value !== undefined);

    // Calculate stats
    const values = data.map((d) => d.value as number);
    const min = values.length > 0 ? Math.min(...values) : null;
    const max = values.length > 0 ? Math.max(...values) : null;
    const current = values.length > 0 ? values[values.length - 1] : null;
    const previous = values.length > 1 ? values[0] : null;
    const change = current !== null && previous !== null ? current - previous : null;

    return {
      data,
      stats: { min, max, current, previous, change },
    };
  },
});

// Get change from previous entry (for logging confirmation)
export const getChangeFromPrevious = query({
  args: { excludeDate: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("bodyStats")
      .order("desc")
      .take(2);

    // Filter out current date if provided
    const filtered = args.excludeDate
      ? entries.filter((e) => e.date !== args.excludeDate)
      : entries;

    if (filtered.length === 0) {
      return null;
    }

    const latest = filtered[0];
    const previous = filtered.length > 1 ? filtered[1] : null;

    return {
      latest,
      previous,
      weightChange: previous ? latest.weight - previous.weight : null,
      bodyFatChange:
        previous && latest.bodyFat && previous.bodyFat
          ? latest.bodyFat - previous.bodyFat
          : null,
    };
  },
});

// Get month summary for calendar view
export const getMonthSummary = query({
  args: { year: v.number(), month: v.number() },
  handler: async (ctx, args) => {
    const { year, month } = args;
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

    const entries = await ctx.db.query("bodyStats").collect();
    const filtered = entries.filter(
      (e) => e.date >= startDate && e.date < endDate
    );

    // Return dates with entries for calendar dots
    const datesWithEntries = filtered.map((e) => e.date);

    return {
      datesWithEntries,
      count: filtered.length,
    };
  },
});
