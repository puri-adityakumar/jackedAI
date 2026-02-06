/**
 * Fitness tools for Tambo AI
 * These tools allow the AI to log exercises, meals, and get progress data
 */

import { format } from "date-fns";

// Note: These tools will be called by Tambo and need to interact with Convex
// Since tools run in a different context, we'll use fetch to call API routes

const API_BASE = "/api";

type MuscleGroup = "chest" | "back" | "shoulders" | "arms" | "legs" | "core" | "cardio" | "full_body";

interface LogExerciseInput {
  exerciseName: string;
  muscleGroup?: MuscleGroup;
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
  muscleGroup?: MuscleGroup;
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
        muscleGroup: input.muscleGroup,
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
      muscleGroup: input.muscleGroup,
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
      muscleGroup: input.muscleGroup,
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

// ========== Reminder Tools ==========

type ReminderCategory = "medicine" | "supplement" | "workout" | "meal" | "water" | "custom";
type ReminderFrequency = "once" | "daily" | "weekly" | "monthly";

interface CreateReminderInput {
  title: string;
  description?: string;
  category: ReminderCategory;
  customCategoryName?: string;
  frequency: ReminderFrequency;
  time: string;
  repeatDays?: string[];
  dayOfMonth?: number;
  startDate?: string;
  endDate?: string;
  trackInventory?: boolean;
  quantityRemaining?: number;
  refillThreshold?: number;
}

interface CreateReminderOutput {
  success: boolean;
  title: string;
  category: ReminderCategory;
  customCategoryName?: string;
  time: string;
  frequency: ReminderFrequency;
  repeatDays?: string[];
  startDate: string;
  trackInventory?: boolean;
  quantityRemaining?: number;
  message: string;
  action: "created";
}

/**
 * Create a new reminder for medicine, supplements, workouts, or anything
 */
export async function createReminder(
  input: CreateReminderInput
): Promise<CreateReminderOutput> {
  const startDate = input.startDate || format(new Date(), "yyyy-MM-dd");

  try {
    const response = await fetch(`${API_BASE}/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        category: input.category,
        customCategoryName: input.customCategoryName,
        frequency: input.frequency,
        time: input.time,
        repeatDays: input.repeatDays,
        dayOfMonth: input.dayOfMonth,
        startDate,
        endDate: input.endDate,
        trackInventory: input.trackInventory,
        quantityRemaining: input.quantityRemaining,
        refillThreshold: input.refillThreshold,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create reminder");
    }

    const frequencyLabel =
      input.frequency === "once"
        ? "one-time"
        : input.frequency === "daily"
        ? "daily"
        : input.frequency === "weekly"
        ? `weekly (${input.repeatDays?.join(", ") || ""})`
        : "monthly";

    const categoryDisplay = input.category === "custom" && input.customCategoryName
      ? input.customCategoryName
      : input.category;

    return {
      success: true,
      title: input.title,
      category: input.category,
      customCategoryName: input.customCategoryName,
      time: input.time,
      frequency: input.frequency,
      repeatDays: input.repeatDays,
      startDate,
      trackInventory: input.trackInventory,
      quantityRemaining: input.quantityRemaining,
      message: `Created ${frequencyLabel} ${categoryDisplay} reminder "${input.title}" at ${input.time}`,
      action: "created",
    };
  } catch (error) {
    return {
      success: false,
      title: input.title,
      category: input.category,
      customCategoryName: input.customCategoryName,
      time: input.time,
      frequency: input.frequency,
      startDate,
      message: "Failed to create reminder. Please try again.",
      action: "created",
    };
  }
}

interface CompleteReminderInput {
  title: string;
  date?: string;
  notes?: string;
}

interface CompleteReminderOutput {
  success: boolean;
  title: string;
  date: string;
  status: "completed" | "skipped";
  message: string;
}

/**
 * Mark a reminder as completed for today
 */
export async function completeReminder(
  input: CompleteReminderInput
): Promise<CompleteReminderOutput> {
  const date = input.date || format(new Date(), "yyyy-MM-dd");

  try {
    // First, get today's reminders to find the matching one
    const todayResponse = await fetch(`${API_BASE}/reminders?action=today&date=${date}`);
    
    if (!todayResponse.ok) {
      throw new Error("Failed to fetch reminders");
    }

    const { reminders } = await todayResponse.json();
    
    // Find reminder by title (case-insensitive partial match)
    const reminder = reminders.find(
      (r: { title: string; _id: string; time: string }) =>
        r.title.toLowerCase().includes(input.title.toLowerCase())
    );

    if (!reminder) {
      return {
        success: false,
        title: input.title,
        date,
        status: "completed",
        message: `Could not find a reminder matching "${input.title}" for today.`,
      };
    }

    // Mark it as completed
    const response = await fetch(`${API_BASE}/reminders`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "complete",
        id: reminder._id,
        date,
        scheduledTime: reminder.time,
        notes: input.notes,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to complete reminder");
    }

    return {
      success: true,
      title: reminder.title,
      date,
      status: "completed",
      message: `Marked "${reminder.title}" as completed!`,
    };
  } catch (error) {
    return {
      success: false,
      title: input.title,
      date,
      status: "completed",
      message: "Failed to complete reminder. Please try again.",
    };
  }
}

interface GetTodayRemindersInput {
  date?: string;
  category?: ReminderCategory;
}

interface TodayReminder {
  id: string;
  title: string;
  category: ReminderCategory;
  time: string;
  status: "pending" | "completed" | "skipped" | "missed";
  quantityRemaining?: number;
}

interface GetTodayRemindersOutput {
  success: boolean;
  date: string;
  reminders: TodayReminder[];
  completedCount: number;
  totalCount: number;
  message: string;
}

/**
 * Get all reminders scheduled for today
 */
export async function getTodayReminders(
  input: GetTodayRemindersInput
): Promise<GetTodayRemindersOutput> {
  const date = input.date || format(new Date(), "yyyy-MM-dd");

  try {
    const params = new URLSearchParams({
      action: "today",
      date,
    });

    const response = await fetch(`${API_BASE}/reminders?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to get reminders");
    }

    const { reminders } = await response.json();

    // Filter by category if provided
    let filtered = reminders;
    if (input.category) {
      filtered = reminders.filter(
        (r: { category: ReminderCategory }) => r.category === input.category
      );
    }

    const mapped: TodayReminder[] = filtered.map(
      (r: {
        _id: string;
        title: string;
        category: ReminderCategory;
        time: string;
        todayStatus?: string;
        quantityRemaining?: number;
      }) => ({
        id: r._id,
        title: r.title,
        category: r.category,
        time: r.time,
        status: r.todayStatus || "pending",
        quantityRemaining: r.quantityRemaining,
      })
    );

    const completedCount = mapped.filter((r) => r.status === "completed").length;

    let message = "";
    if (mapped.length === 0) {
      message = "No reminders scheduled for today.";
    } else if (completedCount === mapped.length) {
      message = "All reminders completed! Great job!";
    } else {
      message = `${completedCount} of ${mapped.length} reminders completed.`;
    }

    return {
      success: true,
      date,
      reminders: mapped,
      completedCount,
      totalCount: mapped.length,
      message,
    };
  } catch (error) {
    return {
      success: false,
      date,
      reminders: [],
      completedCount: 0,
      totalCount: 0,
      message: "Failed to get reminders. Please try again.",
    };
  }
}

interface UpdateInventoryInput {
  title: string;
  quantity: number;
}

interface UpdateInventoryOutput {
  success: boolean;
  title: string;
  quantity: number;
  needsRefill: boolean;
  message: string;
}

/**
 * Update the remaining quantity for a medicine or supplement reminder
 */
export async function updateReminderInventory(
  input: UpdateInventoryInput
): Promise<UpdateInventoryOutput> {
  try {
    // Get all reminders to find the matching one
    const response = await fetch(`${API_BASE}/reminders?action=all`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch reminders");
    }

    const { reminders } = await response.json();
    
    // Find reminder by title
    const reminder = reminders.find(
      (r: { title: string; trackInventory?: boolean }) =>
        r.title.toLowerCase().includes(input.title.toLowerCase()) && r.trackInventory
    );

    if (!reminder) {
      return {
        success: false,
        title: input.title,
        quantity: input.quantity,
        needsRefill: false,
        message: `Could not find a reminder with inventory tracking matching "${input.title}".`,
      };
    }

    // Update the inventory
    const updateResponse = await fetch(`${API_BASE}/reminders`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateInventory",
        id: reminder._id,
        quantity: input.quantity,
      }),
    });

    if (!updateResponse.ok) {
      throw new Error("Failed to update inventory");
    }

    const needsRefill = reminder.refillThreshold
      ? input.quantity <= reminder.refillThreshold
      : false;

    return {
      success: true,
      title: reminder.title,
      quantity: input.quantity,
      needsRefill,
      message: needsRefill
        ? `Updated "${reminder.title}" to ${input.quantity} remaining. Time to refill soon!`
        : `Updated "${reminder.title}" to ${input.quantity} remaining.`,
    };
  } catch (error) {
    return {
      success: false,
      title: input.title,
      quantity: input.quantity,
      needsRefill: false,
      message: "Failed to update inventory. Please try again.",
    };
  }
}

// ========== Body Stats Tools ==========

interface LogBodyStatsInput {
  weight: number;
  bodyFat?: number;
  waist?: number;
  chest?: number;
  notes?: string;
  date?: string;
}

interface LogBodyStatsOutput {
  success: boolean;
  weight: number;
  bodyFat?: number;
  weightChange?: number;
  bodyFatChange?: number;
  date: string;
  message: string;
}

export async function logBodyStats(
  input: LogBodyStatsInput
): Promise<LogBodyStatsOutput> {
  const date = input.date ?? format(new Date(), "yyyy-MM-dd");

  try {
    const response = await fetch(`${API_BASE}/body-stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        weight: input.weight,
        bodyFat: input.bodyFat,
        waist: input.waist,
        chest: input.chest,
        notes: input.notes,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to log body stats");
    }

    const data = await response.json();

    let message = `Logged weight: ${input.weight}kg`;
    if (data.weightChange !== null && data.weightChange !== undefined) {
      const direction = data.weightChange > 0 ? "up" : "down";
      message += ` (${direction} ${Math.abs(data.weightChange).toFixed(1)}kg)`;
    }
    if (input.bodyFat) {
      message += `, body fat: ${input.bodyFat}%`;
    }

    return {
      success: true,
      weight: input.weight,
      bodyFat: input.bodyFat,
      weightChange: data.weightChange,
      bodyFatChange: data.bodyFatChange,
      date,
      message,
    };
  } catch (error) {
    return {
      success: false,
      weight: input.weight,
      bodyFat: input.bodyFat,
      date,
      message: "Failed to log body stats. Please try again.",
    };
  }
}

// ========== Personal Records Tools ==========

interface GetPersonalRecordsInput {
  exerciseName?: string;
  limit?: number;
}

interface PRRecord {
  exerciseName: string;
  maxWeight?: { value: number; reps?: number; date: string };
  maxVolume?: { value: number; date: string };
  estimated1RM?: { value: number; date: string };
}

interface GetPersonalRecordsOutput {
  success: boolean;
  records: PRRecord[];
  totalCount: number;
  message: string;
}

export async function getPersonalRecords(
  input: GetPersonalRecordsInput
): Promise<GetPersonalRecordsOutput> {
  try {
    let url = `${API_BASE}/personal-records?action=all`;
    if (input.exerciseName) {
      url = `${API_BASE}/personal-records?action=exercise&exerciseName=${encodeURIComponent(input.exerciseName)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to get personal records");
    }

    const data = await response.json();
    const records: PRRecord[] = input.exerciseName
      ? [{ exerciseName: input.exerciseName, ...data.prs }]
      : data.prs || [];

    const count = records.length;
    const message =
      count === 0
        ? "No personal records yet. Keep lifting!"
        : input.exerciseName
        ? `Found PRs for ${input.exerciseName}`
        : `You have ${count} exercise${count === 1 ? "" : "s"} with personal records`;

    return {
      success: true,
      records: input.limit ? records.slice(0, input.limit) : records,
      totalCount: count,
      message,
    };
  } catch (error) {
    return {
      success: false,
      records: [],
      totalCount: 0,
      message: "Failed to get personal records. Please try again.",
    };
  }
}

// ========== Weekly Report Tools ==========

interface GetWeeklyReportInput {
  weekStart?: string;
}

interface WeeklyReportOutput {
  success: boolean;
  weekStart: string;
  weekEnd: string;
  workout: {
    totalDays: number;
    targetDays: number;
    totalExercises: number;
    grade: string;
  };
  nutrition: {
    totalDaysLogged: number;
    averageCalories: number;
    averageProtein: number;
    grade: string;
  };
  reminders: {
    completed: number;
    totalScheduled: number;
    adherenceRate: number;
    grade: string;
  };
  overallGrade: string;
  overallScore: number;
  insights: string[];
  message: string;
}

export async function getWeeklyReport(
  input: GetWeeklyReportInput
): Promise<WeeklyReportOutput> {
  try {
    const url = input.weekStart
      ? `${API_BASE}/weekly-report?weekStart=${input.weekStart}`
      : `${API_BASE}/weekly-report`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to get weekly report");
    }

    const data = await response.json();

    return {
      success: true,
      weekStart: data.weekStart,
      weekEnd: data.weekEnd,
      workout: {
        totalDays: data.workout.totalDays,
        targetDays: data.workout.targetDays,
        totalExercises: data.workout.totalExercises,
        grade: data.workout.grade,
      },
      nutrition: {
        totalDaysLogged: data.nutrition.totalDaysLogged,
        averageCalories: data.nutrition.averageCalories,
        averageProtein: data.nutrition.averageProtein,
        grade: data.nutrition.grade,
      },
      reminders: {
        completed: data.reminders.completed,
        totalScheduled: data.reminders.totalScheduled,
        adherenceRate: data.reminders.adherenceRate,
        grade: data.reminders.grade,
      },
      overallGrade: data.overallGrade,
      overallScore: data.overallScore,
      insights: data.insights,
      message: `Weekly Report: Overall grade ${data.overallGrade} (${data.overallScore}/100)`,
    };
  } catch (error) {
    return {
      success: false,
      weekStart: "",
      weekEnd: "",
      workout: { totalDays: 0, targetDays: 5, totalExercises: 0, grade: "F" },
      nutrition: { totalDaysLogged: 0, averageCalories: 0, averageProtein: 0, grade: "F" },
      reminders: { completed: 0, totalScheduled: 0, adherenceRate: 0, grade: "F" },
      overallGrade: "F",
      overallScore: 0,
      insights: [],
      message: "Failed to get weekly report. Please try again.",
    };
  }
}

// ========== Badge Tools ==========

interface BadgeChainProgress {
  id: string;
  name: string;
  icon: string;
  unit: string;
  milestones: number[];
  currentValue: number;
  earnedMilestones: number[];
  nextMilestone: number | null;
  progressPercent: number;
  isComplete: boolean;
}

interface GetBadgesOutput {
  success: boolean;
  badges: BadgeChainProgress[];
  message: string;
}

export async function getAchievements(): Promise<GetBadgesOutput> {
  try {
    const response = await fetch(`${API_BASE}/achievements`);

    if (!response.ok) {
      throw new Error("Failed to get badges");
    }

    const data = await response.json();
    const badges: BadgeChainProgress[] = data.badges || [];

    const completedChains = badges.filter((b) => b.isComplete).length;
    const message =
      completedChains === badges.length
        ? "All badge chains completed!"
        : `${completedChains} of ${badges.length} badge chains completed`;

    return {
      success: true,
      badges,
      message,
    };
  } catch (error) {
    return {
      success: false,
      badges: [],
      message: "Failed to get badges. Please try again.",
    };
  }
}

// ========== Workout Plans Tools ==========

interface CreateWorkoutPlanInput {
  name: string;
  description?: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    notes?: string;
  }>;
}

interface CreateWorkoutPlanOutput {
  success: boolean;
  name: string;
  exerciseCount: number;
  exercises: Array<{ name: string; sets: number; reps: string }>;
  message: string;
}

export async function createWorkoutPlan(
  input: CreateWorkoutPlanInput
): Promise<CreateWorkoutPlanOutput> {
  try {
    const response = await fetch(`${API_BASE}/workout-plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        name: input.name,
        description: input.description,
        exercises: input.exercises,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create workout plan");
    }

    return {
      success: true,
      name: input.name,
      exerciseCount: input.exercises.length,
      exercises: input.exercises.map((e) => ({
        name: e.name,
        sets: e.sets,
        reps: e.reps,
      })),
      message: `Created "${input.name}" with ${input.exercises.length} exercises`,
    };
  } catch (error) {
    return {
      success: false,
      name: input.name,
      exerciseCount: 0,
      exercises: [],
      message: "Failed to create workout plan. Please try again.",
    };
  }
}

interface GetWorkoutPlansInput {
  limit?: number;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  exerciseCount: number;
  usageCount: number;
}

interface GetWorkoutPlansOutput {
  success: boolean;
  plans: WorkoutPlan[];
  totalCount: number;
  message: string;
}

export async function getWorkoutPlans(
  input: GetWorkoutPlansInput
): Promise<GetWorkoutPlansOutput> {
  try {
    const response = await fetch(`${API_BASE}/workout-plans`);

    if (!response.ok) {
      throw new Error("Failed to get workout plans");
    }

    const data = await response.json();
    const plans: WorkoutPlan[] = (data.plans || []).map((p: any) => ({
      id: p._id,
      name: p.name,
      description: p.description,
      exerciseCount: p.exercises?.length || 0,
      usageCount: p.usageCount || 0,
    }));

    const limited = input.limit ? plans.slice(0, input.limit) : plans;

    return {
      success: true,
      plans: limited,
      totalCount: plans.length,
      message:
        plans.length === 0
          ? "No workout plans yet. Create one to get started!"
          : `Found ${plans.length} workout plan${plans.length === 1 ? "" : "s"}`,
    };
  } catch (error) {
    return {
      success: false,
      plans: [],
      totalCount: 0,
      message: "Failed to get workout plans. Please try again.",
    };
  }
}

interface StartWorkoutPlanInput {
  planName: string;
}

interface StartWorkoutPlanOutput {
  success: boolean;
  planName: string;
  exerciseCount: number;
  exercises: Array<{ name: string; sets: number; reps: string }>;
  message: string;
}

export async function startWorkoutPlan(
  input: StartWorkoutPlanInput
): Promise<StartWorkoutPlanOutput> {
  try {
    // First, find the plan by name
    const plansResponse = await fetch(`${API_BASE}/workout-plans`);
    if (!plansResponse.ok) {
      throw new Error("Failed to get workout plans");
    }

    const plansData = await plansResponse.json();
    const plan = plansData.plans?.find(
      (p: any) => p.name.toLowerCase().includes(input.planName.toLowerCase())
    );

    if (!plan) {
      return {
        success: false,
        planName: input.planName,
        exerciseCount: 0,
        exercises: [],
        message: `Could not find a workout plan matching "${input.planName}"`,
      };
    }

    // Start the workout
    const startResponse = await fetch(`${API_BASE}/workout-plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "start",
        planId: plan._id,
      }),
    });

    if (!startResponse.ok) {
      const errorData = await startResponse.json();
      throw new Error(errorData.error || "Failed to start workout");
    }

    return {
      success: true,
      planName: plan.name,
      exerciseCount: plan.exercises?.length || 0,
      exercises: (plan.exercises || []).map((e: any) => ({
        name: e.name,
        sets: e.sets,
        reps: e.reps,
      })),
      message: `Started "${plan.name}"! ${plan.exercises?.length || 0} exercises to complete.`,
    };
  } catch (error) {
    return {
      success: false,
      planName: input.planName,
      exerciseCount: 0,
      exercises: [],
      message: String(error).includes("already have an active")
        ? "You already have an active workout. Complete or abandon it first."
        : "Failed to start workout. Please try again.",
    };
  }
}
