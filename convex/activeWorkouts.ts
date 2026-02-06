import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const workoutStatusValidator = v.union(
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("abandoned")
);

const exerciseProgressValidator = v.object({
  exerciseIndex: v.number(),
  completedSets: v.number(),
  loggedWeight: v.optional(v.number()),
  loggedReps: v.optional(v.number()),
  exerciseLogId: v.optional(v.id("exerciseLogs")),
});

// Start a new workout from a plan
export const start = mutation({
  args: { planId: v.id("workoutPlans") },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    if (!plan) throw new Error("Plan not found");

    // Check for existing active workout
    const existingActive = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_status", (q) => q.eq("status", "in_progress"))
      .first();

    if (existingActive) {
      throw new Error("You already have an active workout. Complete or abandon it first.");
    }

    const today = new Date().toISOString().split("T")[0];

    // Initialize exercise progress (all sets at 0)
    const exerciseProgress = plan.exercises.map((_, index) => ({
      exerciseIndex: index,
      completedSets: 0,
    }));

    const workoutId = await ctx.db.insert("activeWorkouts", {
      planId: args.planId,
      date: today,
      startedAt: Date.now(),
      exerciseProgress,
      status: "in_progress",
    });

    return { workoutId, plan };
  },
});

// Get currently active workout (if any)
export const getActive = query({
  handler: async (ctx) => {
    const active = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_status", (q) => q.eq("status", "in_progress"))
      .first();

    if (!active) return null;

    // Fetch the associated plan
    const plan = await ctx.db.get(active.planId);
    return { workout: active, plan };
  },
});

// Update progress on an exercise (log a set)
export const logSet = mutation({
  args: {
    workoutId: v.id("activeWorkouts"),
    exerciseIndex: v.number(),
    weight: v.optional(v.number()),
    reps: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const workout = await ctx.db.get(args.workoutId);
    if (!workout) throw new Error("Workout not found");
    if (workout.status !== "in_progress") throw new Error("Workout is not active");

    const plan = await ctx.db.get(workout.planId);
    if (!plan) throw new Error("Plan not found");

    const exercise = plan.exercises[args.exerciseIndex];
    if (!exercise) throw new Error("Exercise not found in plan");

    // Update the exercise progress
    const updatedProgress = [...workout.exerciseProgress];
    const progressEntry = updatedProgress.find(
      (p) => p.exerciseIndex === args.exerciseIndex
    );

    if (progressEntry) {
      progressEntry.completedSets += 1;
      if (args.weight !== undefined) progressEntry.loggedWeight = args.weight;
      if (args.reps !== undefined) progressEntry.loggedReps = args.reps;
    }

    await ctx.db.patch(args.workoutId, {
      exerciseProgress: updatedProgress,
    });

    return {
      exerciseName: exercise.name,
      completedSets: progressEntry?.completedSets ?? 0,
      targetSets: exercise.sets,
    };
  },
});

// Log an exercise from the plan to exerciseLogs
export const logExerciseFromPlan = mutation({
  args: {
    workoutId: v.id("activeWorkouts"),
    exerciseIndex: v.number(),
    sets: v.number(),
    reps: v.number(),
    weight: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workout = await ctx.db.get(args.workoutId);
    if (!workout) throw new Error("Workout not found");

    const plan = await ctx.db.get(workout.planId);
    if (!plan) throw new Error("Plan not found");

    const exercise = plan.exercises[args.exerciseIndex];
    if (!exercise) throw new Error("Exercise not found in plan");

    // Create the exercise log
    const logId = await ctx.db.insert("exerciseLogs", {
      date: workout.date,
      exerciseName: exercise.name,
      sets: args.sets,
      reps: args.reps,
      weight: args.weight,
      notes: args.notes,
      createdAt: Date.now(),
    });

    // Update the workout progress to link the log
    const updatedProgress = workout.exerciseProgress.map((p) => {
      if (p.exerciseIndex === args.exerciseIndex) {
        return {
          ...p,
          completedSets: args.sets,
          loggedWeight: args.weight,
          loggedReps: args.reps,
          exerciseLogId: logId,
        };
      }
      return p;
    });

    await ctx.db.patch(args.workoutId, {
      exerciseProgress: updatedProgress,
    });

    return { logId, exerciseName: exercise.name };
  },
});

// Complete the workout
export const complete = mutation({
  args: { workoutId: v.id("activeWorkouts") },
  handler: async (ctx, args) => {
    const workout = await ctx.db.get(args.workoutId);
    if (!workout) throw new Error("Workout not found");
    if (workout.status !== "in_progress") throw new Error("Workout is not active");

    await ctx.db.patch(args.workoutId, {
      status: "completed",
      completedAt: Date.now(),
    });

    // Calculate summary
    const completedExercises = workout.exerciseProgress.filter(
      (p) => p.exerciseLogId !== undefined
    ).length;
    const totalExercises = workout.exerciseProgress.length;

    return {
      completedExercises,
      totalExercises,
      duration: Date.now() - workout.startedAt,
    };
  },
});

// Abandon the workout
export const abandon = mutation({
  args: { workoutId: v.id("activeWorkouts") },
  handler: async (ctx, args) => {
    const workout = await ctx.db.get(args.workoutId);
    if (!workout) throw new Error("Workout not found");
    if (workout.status !== "in_progress") throw new Error("Workout is not active");

    await ctx.db.patch(args.workoutId, {
      status: "abandoned",
      completedAt: Date.now(),
    });

    return { abandoned: true };
  },
});

// Get workout history for a specific plan
export const getHistoryByPlan = query({
  args: { planId: v.id("workoutPlans") },
  handler: async (ctx, args) => {
    const workouts = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_plan", (q) => q.eq("planId", args.planId))
      .collect();

    return workouts
      .filter((w) => w.status === "completed")
      .sort((a, b) => b.startedAt - a.startedAt);
  },
});

// Get all workouts for a date
export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const workouts = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    // Fetch plan details for each workout
    const withPlans = await Promise.all(
      workouts.map(async (workout) => {
        const plan = await ctx.db.get(workout.planId);
        return { workout, plan };
      })
    );

    return withPlans;
  },
});

// Get usage count for a plan
export const getPlanUsageCount = query({
  args: { planId: v.id("workoutPlans") },
  handler: async (ctx, args) => {
    const workouts = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_plan", (q) => q.eq("planId", args.planId))
      .collect();

    return workouts.filter((w) => w.status === "completed").length;
  },
});
