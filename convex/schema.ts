import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  userProfile: defineTable({
    name: v.string(),
    height: v.number(), // cm
    weight: v.number(), // kg
    age: v.optional(v.number()),
    fitnessGoal: v.union(
      v.literal("lose_weight"),
      v.literal("build_muscle"),
      v.literal("maintain")
    ),
    dailyCalorieTarget: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  exerciseLogs: defineTable({
    date: v.string(), // "2026-02-05"
    exerciseName: v.string(),
    sets: v.number(),
    reps: v.number(),
    weight: v.optional(v.number()), // kg
    duration: v.optional(v.number()), // minutes (for cardio)
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_date", ["date"]),

  mealLogs: defineTable({
    date: v.string(), // "2026-02-05"
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack")
    ),
    foodName: v.string(),
    quantity: v.optional(v.string()), // "1 bowl", "200g"
    calories: v.number(),
    protein: v.number(), // grams
    carbs: v.number(), // grams
    fat: v.number(), // grams
    fiber: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_date", ["date"]),

  workoutPlans: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    exercises: v.array(
      v.object({
        name: v.string(),
        sets: v.number(),
        reps: v.string(), // "8-12" or "10"
        notes: v.optional(v.string()),
      })
    ),
    createdAt: v.number(),
  }),
});
