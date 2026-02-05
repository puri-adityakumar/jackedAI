import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Reminder category validator
const reminderCategoryValidator = v.union(
  v.literal("medicine"),
  v.literal("supplement"),
  v.literal("workout"),
  v.literal("meal"),
  v.literal("water"),
  v.literal("custom")
);

// Reminder frequency validator
const reminderFrequencyValidator = v.union(
  v.literal("once"),
  v.literal("daily"),
  v.literal("weekly"),
  v.literal("monthly")
);

// Reminder status validator
const reminderStatusValidator = v.union(
  v.literal("completed"),
  v.literal("missed"),
  v.literal("skipped"),
  v.literal("snoozed")
);

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

  // Universal Reminder System
  reminders: defineTable({
    title: v.string(), // "Take Vitamin D", "Refill Creatine", "Leg Day"
    description: v.optional(v.string()),
    category: reminderCategoryValidator,
    customCategoryName: v.optional(v.string()), // User-defined category name when category is "custom"

    // Schedule
    frequency: reminderFrequencyValidator,
    time: v.string(), // "08:00" (24-hour format)
    repeatDays: v.optional(v.array(v.string())), // ["mon", "wed", "fri"] for weekly
    dayOfMonth: v.optional(v.number()), // 1-31 for monthly

    // Date range
    startDate: v.string(), // "YYYY-MM-DD"
    endDate: v.optional(v.string()),

    // Inventory tracking (for medicine/supplements)
    trackInventory: v.optional(v.boolean()),
    quantityRemaining: v.optional(v.number()), // Pills/scoops left
    refillThreshold: v.optional(v.number()), // Alert when below this

    // State
    isActive: v.boolean(),
    isPaused: v.optional(v.boolean()),
    lastTriggered: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .index("by_time", ["time"]),

  reminderLogs: defineTable({
    reminderId: v.id("reminders"),
    date: v.string(), // "YYYY-MM-DD"
    scheduledTime: v.string(), // "08:00"
    completedAt: v.optional(v.number()), // Timestamp when marked done
    status: reminderStatusValidator,
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_reminder", ["reminderId"])
    .index("by_status", ["status"]),
});
