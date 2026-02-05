/**
 * Fitness tools for Tambo AI
 * These tools allow the AI to log exercises, meals, and get progress data
 */

import { format } from "date-fns";

// Note: These tools will be called by Tambo and need to interact with Convex
// Since tools run in a different context, we'll use fetch to call API routes

const API_BASE = "/api";

interface LogExerciseInput {
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  notes?: string;
  date?: string;
}

interface LogExerciseOutput {
  success: boolean;
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  date: string;
  message: string;
}

export async function logExercise(
  input: LogExerciseInput
): Promise<LogExerciseOutput> {
  const date = input.date ?? format(new Date(), "yyyy-MM-dd");

  try {
    const response = await fetch(`${API_BASE}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        exerciseName: input.exerciseName,
        sets: input.sets,
        reps: input.reps,
        weight: input.weight,
        duration: input.duration,
        notes: input.notes,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to log exercise");
    }

    return {
      success: true,
      exerciseName: input.exerciseName,
      sets: input.sets,
      reps: input.reps,
      weight: input.weight,
      duration: input.duration,
      date,
      message: `Logged ${input.exerciseName}: ${input.sets} sets × ${input.reps} reps${input.weight ? ` @ ${input.weight}kg` : ""}`,
    };
  } catch (error) {
    return {
      success: false,
      exerciseName: input.exerciseName,
      sets: input.sets,
      reps: input.reps,
      date,
      message: "Failed to log exercise. Please try again.",
    };
  }
}

interface LogMealInput {
  foodName: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  quantity?: string;
  date?: string;
}

interface LogMealOutput {
  success: boolean;
  foodName: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  quantity?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  message: string;
}

// Simple nutrition estimation based on common foods
function estimateNutrition(foodName: string, quantity?: string): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  const food = foodName.toLowerCase();

  // Common food estimates (rough approximations)
  const estimates: Record<
    string,
    { calories: number; protein: number; carbs: number; fat: number }
  > = {
    // Proteins
    chicken: { calories: 250, protein: 35, carbs: 0, fat: 10 },
    "chicken breast": { calories: 200, protein: 38, carbs: 0, fat: 4 },
    "grilled chicken": { calories: 230, protein: 36, carbs: 0, fat: 8 },
    beef: { calories: 300, protein: 30, carbs: 0, fat: 20 },
    steak: { calories: 350, protein: 35, carbs: 0, fat: 22 },
    fish: { calories: 200, protein: 30, carbs: 0, fat: 8 },
    salmon: { calories: 280, protein: 32, carbs: 0, fat: 16 },
    eggs: { calories: 150, protein: 12, carbs: 1, fat: 10 },
    tofu: { calories: 150, protein: 15, carbs: 3, fat: 8 },

    // Carbs
    rice: { calories: 200, protein: 4, carbs: 45, fat: 0 },
    "white rice": { calories: 200, protein: 4, carbs: 45, fat: 0 },
    "brown rice": { calories: 220, protein: 5, carbs: 46, fat: 2 },
    pasta: { calories: 250, protein: 8, carbs: 50, fat: 2 },
    bread: { calories: 150, protein: 5, carbs: 28, fat: 2 },
    oatmeal: { calories: 180, protein: 6, carbs: 32, fat: 3 },
    potato: { calories: 160, protein: 4, carbs: 36, fat: 0 },

    // Meals
    "chicken rice": { calories: 550, protein: 40, carbs: 55, fat: 12 },
    "chicken and rice": { calories: 550, protein: 40, carbs: 55, fat: 12 },
    salad: { calories: 150, protein: 5, carbs: 15, fat: 8 },
    "chicken salad": { calories: 350, protein: 30, carbs: 15, fat: 18 },
    sandwich: { calories: 400, protein: 20, carbs: 45, fat: 15 },
    burger: { calories: 550, protein: 28, carbs: 40, fat: 30 },
    pizza: { calories: 300, protein: 12, carbs: 35, fat: 14 },
    sushi: { calories: 350, protein: 15, carbs: 50, fat: 8 },
    ramen: { calories: 500, protein: 20, carbs: 60, fat: 18 },

    // Breakfast
    cereal: { calories: 200, protein: 4, carbs: 40, fat: 2 },
    pancakes: { calories: 350, protein: 8, carbs: 55, fat: 12 },
    toast: { calories: 120, protein: 4, carbs: 22, fat: 2 },

    // Snacks
    apple: { calories: 95, protein: 0, carbs: 25, fat: 0 },
    banana: { calories: 105, protein: 1, carbs: 27, fat: 0 },
    yogurt: { calories: 150, protein: 12, carbs: 15, fat: 4 },
    "greek yogurt": { calories: 130, protein: 17, carbs: 8, fat: 3 },
    "protein shake": { calories: 200, protein: 30, carbs: 10, fat: 3 },
    "protein bar": { calories: 250, protein: 20, carbs: 25, fat: 8 },
    nuts: { calories: 180, protein: 5, carbs: 6, fat: 16 },
    almonds: { calories: 170, protein: 6, carbs: 6, fat: 15 },
  };

  // Find matching food
  for (const [key, value] of Object.entries(estimates)) {
    if (food.includes(key)) {
      return value;
    }
  }

  // Default estimate for unknown foods
  return { calories: 300, protein: 15, carbs: 30, fat: 12 };
}

export async function logMeal(input: LogMealInput): Promise<LogMealOutput> {
  const date = input.date ?? format(new Date(), "yyyy-MM-dd");
  const nutrition = estimateNutrition(input.foodName, input.quantity);

  try {
    const response = await fetch(`${API_BASE}/meals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        mealType: input.mealType,
        foodName: input.foodName,
        quantity: input.quantity,
        ...nutrition,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to log meal");
    }

    return {
      success: true,
      foodName: input.foodName,
      mealType: input.mealType,
      quantity: input.quantity,
      ...nutrition,
      date,
      message: `Logged ${input.foodName} for ${input.mealType}: ~${nutrition.calories} cal`,
    };
  } catch (error) {
    return {
      success: false,
      foodName: input.foodName,
      mealType: input.mealType,
      quantity: input.quantity,
      ...nutrition,
      date,
      message: "Failed to log meal. Please try again.",
    };
  }
}

interface DailyProgressInput {
  date?: string;
}

interface DailyProgressOutput {
  date: string;
  caloriesConsumed: number;
  calorieTarget: number;
  proteinConsumed: number;
  exerciseCount: number;
  message: string;
}

export async function getDailyProgress(
  input: DailyProgressInput
): Promise<DailyProgressOutput> {
  const date = input.date ?? format(new Date(), "yyyy-MM-dd");

  try {
    const response = await fetch(`${API_BASE}/progress?date=${date}`);

    if (!response.ok) {
      throw new Error("Failed to get progress");
    }

    const data = await response.json();

    const remaining = data.calorieTarget - data.caloriesConsumed;
    let message = "";

    if (data.exerciseCount === 0 && data.caloriesConsumed === 0) {
      message = "No activity logged yet today. Let's get started!";
    } else if (remaining > 500) {
      message = `You have ${remaining} calories left. Time for a good meal!`;
    } else if (remaining > 0) {
      message = "Great progress! You're on track with your goals.";
    } else {
      message = "You've exceeded your calorie target. Consider a lighter dinner or some extra exercise.";
    }

    return {
      date,
      ...data,
      message,
    };
  } catch (error) {
    return {
      date,
      caloriesConsumed: 0,
      calorieTarget: 2000,
      proteinConsumed: 0,
      exerciseCount: 0,
      message: "Could not fetch progress data.",
    };
  }
}

interface UserProfileOutput {
  name: string;
  height: number;
  weight: number;
  age?: number;
  fitnessGoal: "lose_weight" | "build_muscle" | "maintain";
  dailyCalorieTarget: number;
}

export async function getUserProfile(): Promise<UserProfileOutput | null> {
  try {
    const response = await fetch(`${API_BASE}/profile`);

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

// ========== ExerciseDB API Tools ==========

interface ExerciseDBExercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  secondaryMuscles: string[];
  instructions: string[];
}

interface SearchExercisesInput {
  query?: string;
  bodyPart?: string;
  target?: string;
  equipment?: string;
  limit?: number;
}

interface SearchExercisesOutput {
  success: boolean;
  exercises: ExerciseDBExercise[];
  total: number;
  message: string;
}

/**
 * Search for exercises from the ExerciseDB database
 * Can search by name, body part, target muscle, or equipment
 */
export async function searchExercises(
  input: SearchExercisesInput
): Promise<SearchExercisesOutput> {
  try {
    const params = new URLSearchParams({
      source: "exercisedb",
      limit: String(input.limit || 10),
    });

    if (input.query) {
      params.set("action", "search");
      params.set("query", input.query);
    } else if (input.bodyPart) {
      params.set("action", "bodyPart");
      params.set("bodyPart", input.bodyPart);
    } else if (input.target) {
      params.set("action", "target");
      params.set("target", input.target);
    } else if (input.equipment) {
      params.set("action", "equipment");
      params.set("equipment", input.equipment);
    } else {
      params.set("action", "list");
    }

    const response = await fetch(`${API_BASE}/exercises?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to search exercises");
    }

    const data = await response.json();

    return {
      success: true,
      exercises: data.exercises || [],
      total: data.total || 0,
      message: `Found ${data.total || 0} exercises`,
    };
  } catch (error) {
    return {
      success: false,
      exercises: [],
      total: 0,
      message: "Failed to search exercises. Please try again.",
    };
  }
}

interface GetExerciseDetailsInput {
  exerciseId: string;
}

interface GetExerciseDetailsOutput {
  success: boolean;
  exercise: ExerciseDBExercise | null;
  message: string;
}

/**
 * Get detailed information about a specific exercise
 */
export async function getExerciseDetails(
  input: GetExerciseDetailsInput
): Promise<GetExerciseDetailsOutput> {
  try {
    const params = new URLSearchParams({
      source: "exercisedb",
      action: "byId",
      id: input.exerciseId,
    });

    const response = await fetch(`${API_BASE}/exercises?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to get exercise details");
    }

    const data = await response.json();

    return {
      success: true,
      exercise: data.exercise || null,
      message: data.exercise
        ? `Found exercise: ${data.exercise.name}`
        : "Exercise not found",
    };
  } catch (error) {
    return {
      success: false,
      exercise: null,
      message: "Failed to get exercise details. Please try again.",
    };
  }
}

interface GetBodyPartsOutput {
  success: boolean;
  bodyParts: string[];
  message: string;
}

/**
 * Get list of all available body parts for filtering exercises
 */
export async function getBodyParts(): Promise<GetBodyPartsOutput> {
  try {
    const params = new URLSearchParams({
      source: "exercisedb",
      action: "bodyPartList",
    });

    const response = await fetch(`${API_BASE}/exercises?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to get body parts");
    }

    const data = await response.json();

    return {
      success: true,
      bodyParts: data.bodyParts || [],
      message: `Available body parts: ${(data.bodyParts || []).join(", ")}`,
    };
  } catch (error) {
    return {
      success: false,
      bodyParts: [],
      message: "Failed to get body parts. Please try again.",
    };
  }
}

interface GetTargetMusclesOutput {
  success: boolean;
  targets: string[];
  message: string;
}

/**
 * Get list of all available target muscles for filtering exercises
 */
export async function getTargetMuscles(): Promise<GetTargetMusclesOutput> {
  try {
    const params = new URLSearchParams({
      source: "exercisedb",
      action: "targetList",
    });

    const response = await fetch(`${API_BASE}/exercises?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to get target muscles");
    }

    const data = await response.json();

    return {
      success: true,
      targets: data.targets || [],
      message: `Available target muscles: ${(data.targets || []).join(", ")}`,
    };
  } catch (error) {
    return {
      success: false,
      targets: [],
      message: "Failed to get target muscles. Please try again.",
    };
  }
}

interface GetEquipmentListOutput {
  success: boolean;
  equipment: string[];
  message: string;
}

/**
 * Get list of all available equipment types for filtering exercises
 */
export async function getEquipmentList(): Promise<GetEquipmentListOutput> {
  try {
    const params = new URLSearchParams({
      source: "exercisedb",
      action: "equipmentList",
    });

    const response = await fetch(`${API_BASE}/exercises?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to get equipment list");
    }

    const data = await response.json();

    return {
      success: true,
      equipment: data.equipment || [],
      message: `Available equipment: ${(data.equipment || []).join(", ")}`,
    };
  } catch (error) {
    return {
      success: false,
      equipment: [],
      message: "Failed to get equipment list. Please try again.",
    };
  }
}
