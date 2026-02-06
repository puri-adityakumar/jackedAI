"use client";

import { Check, Dumbbell } from "lucide-react";
import { z } from "zod";

export const exerciseLogCardSchema = z.object({
  exerciseName: z.string().describe("Name of the exercise"),
  muscleGroup: z
    .enum(["chest", "back", "shoulders", "arms", "legs", "core", "cardio", "full_body"])
    .optional()
    .describe("Target muscle group (chest, back, shoulders, arms, legs, core, cardio, full_body)"),
  sets: z.number().describe("Number of sets"),
  reps: z.number().describe("Number of reps per set"),
  weight: z.number().optional().describe("Weight in kg (optional)"),
  duration: z.number().optional().describe("Duration in minutes for cardio (optional)"),
  message: z.string().optional().describe("Optional confirmation message"),
});

type ExerciseLogCardProps = z.infer<typeof exerciseLogCardSchema>;

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  arms: "Arms",
  legs: "Legs",
  core: "Core",
  cardio: "Cardio",
  full_body: "Full Body",
};

export function ExerciseLogCard({
  exerciseName,
  muscleGroup,
  sets,
  reps,
  weight,
  duration,
  message,
}: ExerciseLogCardProps) {
  return (
    <div className="bg-primary/5 border-2 border-primary/20 dark:border-primary/30 p-4 my-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Dumbbell className="w-5 h-5 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">{exerciseName}</h4>
            <div className="w-5 h-5 bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" aria-hidden="true" />
            </div>
          </div>
          {muscleGroup && (
            <p className="text-xs text-primary mt-0.5">
              {MUSCLE_GROUP_LABELS[muscleGroup] || muscleGroup}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {sets} sets × {reps} reps
            {weight !== undefined && weight > 0 ? ` @ ${weight}kg` : null}
            {duration !== undefined && duration > 0 ? ` • ${duration} min` : null}
          </p>
          {message && (
            <p className="text-xs text-muted-foreground mt-2">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
