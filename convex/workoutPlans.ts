import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    exercises: v.array(
      v.object({
        name: v.string(),
        sets: v.number(),
        reps: v.string(),
        notes: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const planId = await ctx.db.insert("workoutPlans", {
      ...args,
      createdAt: Date.now(),
    });
    return planId;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const plans = await ctx.db
      .query("workoutPlans")
      .order("desc")
      .collect();
    return plans;
  },
});

export const getById = query({
  args: { id: v.id("workoutPlans") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: { id: v.id("workoutPlans") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
