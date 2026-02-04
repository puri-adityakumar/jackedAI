import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("userProfile").collect();
    return profiles[0] ?? null;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    height: v.number(),
    weight: v.number(),
    age: v.optional(v.number()),
    fitnessGoal: v.union(
      v.literal("lose_weight"),
      v.literal("build_muscle"),
      v.literal("maintain")
    ),
    dailyCalorieTarget: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const profileId = await ctx.db.insert("userProfile", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return profileId;
  },
});

export const update = mutation({
  args: {
    name: v.optional(v.string()),
    height: v.optional(v.number()),
    weight: v.optional(v.number()),
    age: v.optional(v.number()),
    fitnessGoal: v.optional(
      v.union(
        v.literal("lose_weight"),
        v.literal("build_muscle"),
        v.literal("maintain")
      )
    ),
    dailyCalorieTarget: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("userProfile").collect();
    const profile = profiles[0];
    if (!profile) {
      throw new Error("No profile found");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.height !== undefined) updates.height = args.height;
    if (args.weight !== undefined) updates.weight = args.weight;
    if (args.age !== undefined) updates.age = args.age;
    if (args.fitnessGoal !== undefined) updates.fitnessGoal = args.fitnessGoal;
    if (args.dailyCalorieTarget !== undefined)
      updates.dailyCalorieTarget = args.dailyCalorieTarget;

    await ctx.db.patch(profile._id, updates);
    return profile._id;
  },
});
