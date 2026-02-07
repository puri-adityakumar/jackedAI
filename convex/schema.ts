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

// Muscle group validator (shared)
const muscleGroupValidator = v.union(
  v.literal("chest"),
  v.literal("back"),
  v.literal("shoulders"),
  v.literal("arms"),
  v.literal("legs"),
  v.literal("core"),
  v.literal("cardio"),
  v.literal("full_body")
);

// Active workout status validator
const workoutStatusValidator = v.union(
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("abandoned")
);

// PR type validator
const prTypeValidator = v.union(
  v.literal("max_weight"),
  v.literal("max_volume"),
  v.literal("estimated_1rm")
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
    muscleGroup: v.optional(muscleGroupValidator),
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
        weight: v.optional(v.number()), // target weight in kg
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

  // ========== NEW TABLES FOR FEATURE EXPANSION ==========

  // Active workout sessions (when following a workout plan)
  activeWorkouts: defineTable({
    planId: v.id("workoutPlans"),
    date: v.string(), // "YYYY-MM-DD"
    startedAt: v.number(), // timestamp
    completedAt: v.optional(v.number()),
    exerciseProgress: v.array(
      v.object({
        exerciseIndex: v.number(), // index in plan.exercises array
        completedSets: v.number(),
        loggedWeight: v.optional(v.number()),
        loggedReps: v.optional(v.number()),
        exerciseLogId: v.optional(v.id("exerciseLogs")), // link to logged exercise
      })
    ),
    status: workoutStatusValidator,
  })
    .index("by_date", ["date"])
    .index("by_plan", ["planId"])
    .index("by_status", ["status"]),

  // Body measurements over time (weight, body fat, measurements)
  bodyStats: defineTable({
    date: v.string(), // "YYYY-MM-DD"
    weight: v.number(), // kg
    bodyFat: v.optional(v.number()), // percentage (e.g., 15.5)
    // Optional body measurements (in cm)
    waist: v.optional(v.number()),
    chest: v.optional(v.number()),
    hips: v.optional(v.number()),
    bicepsLeft: v.optional(v.number()),
    bicepsRight: v.optional(v.number()),
    thighLeft: v.optional(v.number()),
    thighRight: v.optional(v.number()),
    neck: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_date", ["date"]),

  // Personal records cache (for fast PR lookups)
  personalRecords: defineTable({
    exerciseName: v.string(), // normalized lowercase
    prType: prTypeValidator,
    value: v.number(), // weight in kg, or volume (sets*reps*weight)
    reps: v.optional(v.number()), // reps at this weight (for max_weight)
    exerciseLogId: v.id("exerciseLogs"), // reference to the log that set this PR
    achievedDate: v.string(), // "YYYY-MM-DD"
    previousValue: v.optional(v.number()), // what it beat
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_exercise", ["exerciseName"])
    .index("by_exercise_type", ["exerciseName", "prType"])
    .index("by_date", ["achievedDate"]),

  // Unlocked achievements / badges
  achievements: defineTable({
    achievementId: v.string(), // references achievement definitions
    unlockedAt: v.number(), // timestamp
    notified: v.boolean(), // has user seen the unlock notification?
    // Optional metadata for context
    metadata: v.optional(
      v.object({
        exerciseName: v.optional(v.string()), // for PR achievements
        weight: v.optional(v.number()),
        streakDays: v.optional(v.number()),
        count: v.optional(v.number()),
      })
    ),
  }).index("by_achievement", ["achievementId"]),
});
