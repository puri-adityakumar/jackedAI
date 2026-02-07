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
        weight: v.optional(v.number()),
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

export const update = mutation({
  args: {
    id: v.id("workoutPlans"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    exercises: v.optional(
      v.array(
        v.object({
          name: v.string(),
          sets: v.number(),
          reps: v.string(),
          weight: v.optional(v.number()),
          notes: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const duplicate = mutation({
  args: { id: v.id("workoutPlans") },
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.id);
    if (!original) throw new Error("Plan not found");

    const newPlanId = await ctx.db.insert("workoutPlans", {
      name: `${original.name} (Copy)`,
      description: original.description,
      exercises: original.exercises,
      createdAt: Date.now(),
    });
    return newPlanId;
  },
});
