/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file registers fitness tracking components and tools for JackedAI.
 */

import {
  DailyProgressCard,
  dailyProgressCardSchema,
} from "@/components/tambo/DailyProgressCard";
import {
  ExerciseLogCard,
  exerciseLogCardSchema,
} from "@/components/tambo/ExerciseLogCard";
import { Graph, graphSchema } from "@/components/tambo/graph";
import {
  MealLogCard,
  mealLogCardSchema,
} from "@/components/tambo/MealLogCard";
import {
  ReminderCard,
  reminderCardSchema,
} from "@/components/tambo/ReminderCard";
import {
  WorkoutPlanCard,
  workoutPlanCardSchema,
} from "@/components/tambo/WorkoutPlanCard";
import {
  BodyStatsCard,
  bodyStatsCardSchema,
} from "@/components/tambo/BodyStatsCard";
import { PRCard, prCardSchema } from "@/components/tambo/PRCard";
import {
  WeeklyReportCard,
  weeklyReportCardSchema,
} from "@/components/tambo/WeeklyReportCard";
import {
  AchievementCard,
  achievementCardSchema,
} from "@/components/tambo/AchievementCard";
import {
  getDailyProgress,
  getUserProfile,
  logExercise,
  logMeal,
  searchExercises,
  getExerciseDetails,
  getBodyParts,
  getTargetMuscles,
  getEquipmentList,
  createReminder,
  completeReminder,
  getTodayReminders,
  updateReminderInventory,
  logBodyStats,
  getPersonalRecords,
  getWeeklyReport,
  getAchievements,
  createWorkoutPlan,
  getWorkoutPlans,
  startWorkoutPlan,
} from "@/services/fitness-tools";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/**
 * Tambo Tools for JackedAI
 *
 * These tools allow the AI to:
 * - Log exercises, meals, body stats
 * - Get daily progress and weekly reports
 * - Manage workout plans and reminders
 * - Track personal records and achievements
 * - Search ExerciseDB
 */
export const tools: TamboTool[] = [
  {
    name: "logExercise",
    description:
      "Log an exercise to the user's workout tracker. Use this when the user mentions completing an exercise, workout, or physical activity. Extract the exercise name, sets, reps, and weight if provided.",
    tool: logExercise,
    inputSchema: z.object({
      exerciseName: z.string().describe("Name of the exercise (e.g., 'Bench Press', 'Squats', 'Running')"),
      sets: z.number().describe("Number of sets performed"),
      reps: z.number().describe("Number of reps per set"),
      weight: z.number().optional().describe("Weight used in kg (optional, for strength exercises)"),
      duration: z.number().optional().describe("Duration in minutes (optional, for cardio)"),
      notes: z.string().optional().describe("Any additional notes about the exercise"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format (defaults to today)"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      exerciseName: z.string(),
      sets: z.number(),
      reps: z.number(),
      weight: z.number().optional(),
      duration: z.number().optional(),
      date: z.string(),
      message: z.string(),
    }),
  },
  {
    name: "logMeal",
    description:
      "Log a meal or food item to the user's diet tracker. Use this when the user mentions eating food. The AI will estimate the nutritional content based on the food description.",
    tool: logMeal,
    inputSchema: z.object({
      foodName: z.string().describe("Name or description of the food (e.g., 'chicken rice', 'grilled salmon with vegetables')"),
      mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).describe("Type of meal"),
      quantity: z.string().optional().describe("Quantity description (e.g., '1 bowl', '200g', '2 pieces')"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format (defaults to today)"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      foodName: z.string(),
      mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
      quantity: z.string().optional(),
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
      date: z.string(),
      message: z.string(),
    }),
  },
  {
    name: "getDailyProgress",
    description:
      "Get the user's progress for a specific day including calories consumed, exercises completed, and how they're tracking toward their goals. Use this when the user asks about their progress, how they're doing, or wants a summary.",
    tool: getDailyProgress,
    inputSchema: z.object({
      date: z.string().optional().describe("Date in YYYY-MM-DD format (defaults to today)"),
    }),
    outputSchema: z.object({
      date: z.string(),
      caloriesConsumed: z.number(),
      calorieTarget: z.number(),
      proteinConsumed: z.number(),
      exerciseCount: z.number(),
      message: z.string(),
    }),
  },
  {
    name: "getUserProfile",
    description:
      "Get the user's profile information including their name, body stats, fitness goal, and calorie target. Use this to personalize advice and responses.",
    tool: getUserProfile,
    inputSchema: z.object({}),
    outputSchema: z
      .object({
        name: z.string(),
        height: z.number(),
        weight: z.number(),
        age: z.number().optional(),
        fitnessGoal: z.enum(["lose_weight", "build_muscle", "maintain"]),
        dailyCalorieTarget: z.number(),
      })
      .nullable(),
  },
  {
    name: "searchExercises",
    description:
      "Search the ExerciseDB database for exercises. Can search by name, body part, target muscle, or equipment. Use this when the user asks for exercise recommendations, wants to find exercises for a specific muscle group, or needs workout suggestions.",
    tool: searchExercises,
    inputSchema: z.object({
      query: z.string().optional().describe("Search term to find exercises by name (e.g., 'bench press', 'squat')"),
      bodyPart: z.string().optional().describe("Filter by body part (e.g., 'chest', 'back', 'legs')"),
      target: z.string().optional().describe("Filter by target muscle (e.g., 'biceps', 'triceps', 'glutes')"),
      equipment: z.string().optional().describe("Filter by equipment (e.g., 'dumbbell', 'barbell', 'bodyweight')"),
      limit: z.number().optional().describe("Maximum number of results to return (default 10)"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      exercises: z.array(z.object({
        id: z.string(),
        name: z.string(),
        bodyPart: z.string(),
        target: z.string(),
        equipment: z.string(),
        gifUrl: z.string(),
        secondaryMuscles: z.array(z.string()),
        instructions: z.array(z.string()),
      })),
      total: z.number(),
      message: z.string(),
    }),
  },
  {
    name: "getExerciseDetails",
    description:
      "Get detailed information about a specific exercise including instructions, target muscles, and an animated GIF demonstration. Use this when the user wants to learn how to perform a specific exercise.",
    tool: getExerciseDetails,
    inputSchema: z.object({
      exerciseId: z.string().describe("The unique ID of the exercise to get details for"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      exercise: z.object({
        id: z.string(),
        name: z.string(),
        bodyPart: z.string(),
        target: z.string(),
        equipment: z.string(),
        gifUrl: z.string(),
        secondaryMuscles: z.array(z.string()),
        instructions: z.array(z.string()),
      }).nullable(),
      message: z.string(),
    }),
  },
  {
    name: "getBodyParts",
    description:
      "Get a list of all available body parts that can be used to filter exercises. Use this to show the user what body parts they can search for.",
    tool: getBodyParts,
    inputSchema: z.object({}),
    outputSchema: z.object({
      success: z.boolean(),
      bodyParts: z.array(z.string()),
      message: z.string(),
    }),
  },
  {
    name: "getTargetMuscles",
    description:
      "Get a list of all available target muscles that can be used to filter exercises. Use this to show the user what specific muscles they can target.",
    tool: getTargetMuscles,
    inputSchema: z.object({}),
    outputSchema: z.object({
      success: z.boolean(),
      targets: z.array(z.string()),
      message: z.string(),
    }),
  },
  {
    name: "getEquipmentList",
    description:
      "Get a list of all available equipment types that can be used to filter exercises. Use this when the user has specific equipment available or wants to find bodyweight exercises.",
    tool: getEquipmentList,
    inputSchema: z.object({}),
    outputSchema: z.object({
      success: z.boolean(),
      equipment: z.array(z.string()),
      message: z.string(),
    }),
  },
  // Reminder Tools
  {
    name: "createReminder",
    description:
      "Create a new reminder for medicine, supplements, workouts, meals, water, or anything custom. Use this when the user wants to set up a recurring reminder or one-time alert. Supports inventory tracking for medicine and supplements. When using 'custom' category, include a customCategoryName to label it.",
    tool: createReminder,
    inputSchema: z.object({
      title: z.string().describe("Title of the reminder (e.g., 'Take Vitamin D', 'Drink Water')"),
      description: z.string().optional().describe("Optional description or notes"),
      category: z.enum(["medicine", "supplement", "workout", "meal", "water", "custom"]).describe("Category of the reminder"),
      customCategoryName: z.string().optional().describe("Custom category name when category is 'custom' (e.g., 'Pet Care', 'Self Care', 'Study')"),
      frequency: z.enum(["once", "daily", "weekly", "monthly"]).describe("How often the reminder should repeat"),
      time: z.string().describe("Time in HH:MM 24-hour format (e.g., '08:00', '20:30')"),
      repeatDays: z.array(z.string()).optional().describe("Days of week for weekly reminders: mon, tue, wed, thu, fri, sat, sun"),
      dayOfMonth: z.number().optional().describe("Day of month for monthly reminders (1-31)"),
      startDate: z.string().optional().describe("Start date in YYYY-MM-DD format (defaults to today)"),
      endDate: z.string().optional().describe("Optional end date in YYYY-MM-DD format"),
      trackInventory: z.boolean().optional().describe("Enable inventory tracking (for medicine/supplements)"),
      quantityRemaining: z.number().optional().describe("Initial quantity if tracking inventory"),
      refillThreshold: z.number().optional().describe("Alert when quantity falls to this level"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      title: z.string(),
      category: z.enum(["medicine", "supplement", "workout", "meal", "water", "custom"]),
      customCategoryName: z.string().optional(),
      time: z.string(),
      frequency: z.enum(["once", "daily", "weekly", "monthly"]),
      repeatDays: z.array(z.string()).optional(),
      startDate: z.string(),
      trackInventory: z.boolean().optional(),
      quantityRemaining: z.number().optional(),
      message: z.string(),
      action: z.literal("created"),
    }),
  },
  {
    name: "completeReminder",
    description:
      "Mark a reminder as completed for today. Use this when the user says they took their medicine, drank water, finished a workout, etc. Match the reminder by title.",
    tool: completeReminder,
    inputSchema: z.object({
      title: z.string().describe("Title or partial title of the reminder to mark complete"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format (defaults to today)"),
      notes: z.string().optional().describe("Optional notes about the completion"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      title: z.string(),
      date: z.string(),
      status: z.enum(["completed", "skipped"]),
      message: z.string(),
    }),
  },
  {
    name: "getTodayReminders",
    description:
      "Get all reminders scheduled for today with their completion status. Use this when the user asks about their reminders, what they need to do today, or their medicine/supplement schedule.",
    tool: getTodayReminders,
    inputSchema: z.object({
      date: z.string().optional().describe("Date in YYYY-MM-DD format (defaults to today)"),
      category: z.enum(["medicine", "supplement", "workout", "meal", "water", "custom"]).optional().describe("Filter by category"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      date: z.string(),
      reminders: z.array(z.object({
        id: z.string(),
        title: z.string(),
        category: z.enum(["medicine", "supplement", "workout", "meal", "water", "custom"]),
        time: z.string(),
        status: z.enum(["pending", "completed", "skipped", "missed"]),
        quantityRemaining: z.number().optional(),
      })),
      completedCount: z.number(),
      totalCount: z.number(),
      message: z.string(),
    }),
  },
  {
    name: "updateReminderInventory",
    description:
      "Update the remaining quantity for a medicine or supplement reminder. Use this when the user refills their medicine or supplements, or wants to update the count.",
    tool: updateReminderInventory,
    inputSchema: z.object({
      title: z.string().describe("Title or partial title of the reminder to update"),
      quantity: z.number().describe("New quantity remaining"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      title: z.string(),
      quantity: z.number(),
      needsRefill: z.boolean(),
      message: z.string(),
    }),
  },
  // Body Stats Tools
  {
    name: "logBodyStats",
    description:
      "Log body measurements like weight, body fat percentage, and other measurements. Use this when the user wants to record their weight or body measurements.",
    tool: logBodyStats,
    inputSchema: z.object({
      weight: z.number().describe("Body weight in kg"),
      bodyFat: z.number().optional().describe("Body fat percentage"),
      waist: z.number().optional().describe("Waist measurement in cm"),
      chest: z.number().optional().describe("Chest measurement in cm"),
      notes: z.string().optional().describe("Optional notes"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format (defaults to today)"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      weight: z.number(),
      bodyFat: z.number().optional(),
      weightChange: z.number().optional(),
      bodyFatChange: z.number().optional(),
      date: z.string(),
      message: z.string(),
    }),
  },
  // Personal Records Tools
  {
    name: "getPersonalRecords",
    description:
      "Get the user's personal records (PRs) for exercises. Shows best weight, volume, and estimated 1RM. Use when the user asks about their PRs, bests, or strongest lifts.",
    tool: getPersonalRecords,
    inputSchema: z.object({
      exerciseName: z.string().optional().describe("Filter PRs for a specific exercise"),
      limit: z.number().optional().describe("Maximum number of exercises to return"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      records: z.array(z.object({
        exerciseName: z.string(),
        maxWeight: z.object({
          value: z.number(),
          reps: z.number().optional(),
          date: z.string(),
        }).optional(),
        maxVolume: z.object({
          value: z.number(),
          date: z.string(),
        }).optional(),
        estimated1RM: z.object({
          value: z.number(),
          date: z.string(),
        }).optional(),
      })),
      totalCount: z.number(),
      message: z.string(),
    }),
  },
  // Weekly Report Tools
  {
    name: "getWeeklyReport",
    description:
      "Get a weekly report card showing workout, nutrition, and reminder performance with grades. Use when the user asks for their weekly summary, report, or how they did this week.",
    tool: getWeeklyReport,
    inputSchema: z.object({
      weekStart: z.string().optional().describe("Start date of the week in YYYY-MM-DD format (defaults to current week)"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      weekStart: z.string(),
      weekEnd: z.string(),
      workout: z.object({
        totalDays: z.number(),
        targetDays: z.number(),
        totalExercises: z.number(),
        grade: z.string(),
      }),
      nutrition: z.object({
        totalDaysLogged: z.number(),
        averageCalories: z.number(),
        averageProtein: z.number(),
        grade: z.string(),
      }),
      reminders: z.object({
        completed: z.number(),
        totalScheduled: z.number(),
        adherenceRate: z.number(),
        grade: z.string(),
      }),
      overallGrade: z.string(),
      overallScore: z.number(),
      insights: z.array(z.string()),
      message: z.string(),
    }),
  },
  // Badge Tools
  {
    name: "getAchievements",
    description:
      "Get the user's badge progress across 4 chains: Workout Streak, Exercises, PRs, and Variety. Shows current value, milestones earned, and progress to next milestone. Use when the user asks about their badges, achievements, or progress.",
    tool: getAchievements,
    inputSchema: z.object({}),
    outputSchema: z.object({
      success: z.boolean(),
      badges: z.array(z.object({
        id: z.string(),
        name: z.string(),
        icon: z.string(),
        unit: z.string(),
        milestones: z.array(z.number()),
        currentValue: z.number(),
        earnedMilestones: z.array(z.number()),
        nextMilestone: z.number().nullable(),
        progressPercent: z.number(),
        isComplete: z.boolean(),
      })),
      message: z.string(),
    }),
  },
  // Workout Plan Tools
  {
    name: "createWorkoutPlan",
    description:
      "Create a new workout plan with a list of exercises. Use when the user wants to create, build, or save a workout plan or routine.",
    tool: createWorkoutPlan,
    inputSchema: z.object({
      name: z.string().describe("Name of the workout plan (e.g., 'Push Day', 'Full Body')"),
      description: z.string().optional().describe("Optional description of the plan"),
      exercises: z.array(z.object({
        name: z.string().describe("Exercise name"),
        sets: z.number().describe("Number of sets"),
        reps: z.string().describe("Rep scheme (e.g., '8-12', '5', '10')"),
        weight: z.number().optional().describe("Target weight in kg"),
        notes: z.string().optional().describe("Optional exercise notes"),
      })).describe("List of exercises in the plan"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      name: z.string(),
      exerciseCount: z.number(),
      exercises: z.array(z.object({
        name: z.string(),
        sets: z.number(),
        reps: z.string(),
        weight: z.number().optional(),
      })),
      message: z.string(),
    }),
  },
  {
    name: "getWorkoutPlans",
    description:
      "Get the user's saved workout plans. Use when the user asks to see their plans, routines, or workout templates.",
    tool: getWorkoutPlans,
    inputSchema: z.object({
      limit: z.number().optional().describe("Maximum number of plans to return"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      plans: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        exerciseCount: z.number(),
        usageCount: z.number(),
      })),
      totalCount: z.number(),
      message: z.string(),
    }),
  },
  {
    name: "startWorkoutPlan",
    description:
      "Start an active workout session from a saved plan. Use when the user wants to begin or start a specific workout plan.",
    tool: startWorkoutPlan,
    inputSchema: z.object({
      planName: z.string().describe("Name or partial name of the plan to start"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      planName: z.string(),
      exerciseCount: z.number(),
      exercises: z.array(z.object({
        name: z.string(),
        sets: z.number(),
        reps: z.string(),
      })),
      message: z.string(),
    }),
  },
];

/**
 * Tambo Components for JackedAI
 *
 * These components are rendered by the AI in the chat:
 * - ExerciseLogCard, MealLogCard: Log confirmations
 * - DailyProgressCard, WeeklyReportCard: Progress summaries
 * - WorkoutPlanCard, BodyStatsCard, PRCard, AchievementCard: Feature cards
 * - Graph: For visualizing progress data
 * - ReminderCard: Reminder confirmations
 */
export const components: TamboComponent[] = [
  {
    name: "ExerciseLogCard",
    description:
      "Display a confirmation card when an exercise has been logged. Shows exercise name, sets, reps, weight, and a confirmation message. Use this after successfully logging an exercise.",
    component: ExerciseLogCard,
    propsSchema: exerciseLogCardSchema,
  },
  {
    name: "MealLogCard",
    description:
      "Display a confirmation card when a meal has been logged. Shows food name, meal type, estimated calories, and macro breakdown (protein, carbs, fat). Use this after successfully logging a meal.",
    component: MealLogCard,
    propsSchema: mealLogCardSchema,
  },
  {
    name: "DailyProgressCard",
    description:
      "Display a summary card showing the user's daily progress. Includes calories consumed vs target, protein intake, exercise count, and remaining calories. Use this when showing the user their progress.",
    component: DailyProgressCard,
    propsSchema: dailyProgressCardSchema,
  },
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Use for visualizing progress data over time.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "ReminderCard",
    description:
      "Display a confirmation card when a reminder has been created, completed, or updated. Shows reminder title, category, time, frequency, and optional inventory information. Use this after creating or completing a reminder.",
    component: ReminderCard,
    propsSchema: reminderCardSchema,
  },
  {
    name: "WorkoutPlanCard",
    description:
      "Display a workout plan with its exercises, sets, and reps. Use this after creating a workout plan or when showing plan details.",
    component: WorkoutPlanCard,
    propsSchema: workoutPlanCardSchema,
  },
  {
    name: "BodyStatsCard",
    description:
      "Display logged body measurements with weight, body fat, and change indicators. Use this after logging body stats.",
    component: BodyStatsCard,
    propsSchema: bodyStatsCardSchema,
  },
  {
    name: "PRCard",
    description:
      "Display personal records showing best weight, volume, and estimated 1RM for exercises. Use this when showing the user's PRs.",
    component: PRCard,
    propsSchema: prCardSchema,
  },
  {
    name: "WeeklyReportCard",
    description:
      "Display a weekly report card with grades for workout, nutrition, and reminders, plus insights. Use this when showing the weekly summary.",
    component: WeeklyReportCard,
    propsSchema: weeklyReportCardSchema,
  },
  {
    name: "AchievementCard",
    description:
      "Display achievement badges in a grid with unlock status, progress, and points. Use this when showing the user's achievements.",
    component: AchievementCard,
    propsSchema: achievementCardSchema,
  },
];
