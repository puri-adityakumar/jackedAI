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
  getDailyProgress,
  getUserProfile,
  logExercise,
  logMeal,
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
];
