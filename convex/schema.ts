import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  userProfile: defineTable({
    name: v.string(),
    height: v.number(), // cm
    weight: v.number(), // kg
    age: v.optional(v.number()),
    gender: v.optional(
      v.union(v.literal("male"), v.literal("female"), v.literal("other"))
    ),
    activityLevel: v.optional(
      v.union(
        v.literal("sedentary"),
        v.literal("lightly_active"),
        v.literal("active"),
        v.literal("very_active")
      )
    ),
    fitnessGoal: v.union(
      v.literal("lose_weight"),
      v.literal("build_muscle"),
      v.literal("maintain")
    ),
    dailyCalorieTarget: v.optional(v.number()),
    proteinTarget: v.optional(v.number()), // grams/day
    carbsTarget: v.optional(v.number()), // grams/day
    fatTarget: v.optional(v.number()), // grams/day
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("system"))
    ),
    // PIN Protection
    pinHash: v.optional(v.string()), // Hashed PIN (never plaintext)
    pinSalt: v.optional(v.string()), // Salt for hashing
    pinEnabled: v.optional(v.boolean()), // Is PIN protection enabled?
    pinFailedAttempts: v.optional(v.number()), // Failed attempt counter (0-5)
    pinLockedUntil: v.optional(v.number()), // Lockout expiry timestamp (ms)
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  exerciseLogs: defineTable({
    date: v.string(), // "2026-02-05"
    muscleGroup: v.optional(
      v.union(
        v.literal("chest"),
        v.literal("back"),
        v.literal("shoulders"),
        v.literal("arms"),
        v.literal("legs"),
        v.literal("core"),
        v.literal("cardio"),
        v.literal("full_body")
      )
    ),
    exerciseName: v.string(),
    sets: v.number(),
    reps: v.number(),
    weight: v.optional(v.number()), // kg
    duration: v.optional(v.number()), // minutes (for cardio)
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_date", ["date"])
    .index("by_muscle_group", ["muscleGroup"]),

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
    updatedAt: v.optional(v.number()),
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
