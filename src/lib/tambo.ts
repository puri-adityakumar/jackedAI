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
} from "@/services/fitness-tools";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/**
 * Tambo Tools for JackedAI
 *
 * These tools allow the AI to:
 * - Log exercises to the database
 * - Log meals with estimated nutrition
 * - Get daily progress summary
 * - Get user profile information
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
];

/**
 * Tambo Components for JackedAI
 *
 * These components are rendered by the AI in the chat:
 * - ExerciseLogCard: Shows confirmation when an exercise is logged
 * - MealLogCard: Shows meal with estimated nutrition
 * - DailyProgressCard: Shows daily summary with stats
 * - Graph: For visualizing progress data
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
];
