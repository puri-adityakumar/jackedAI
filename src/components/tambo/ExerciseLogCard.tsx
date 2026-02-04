"use client";

import { cn } from "@/lib/utils";
import { Check, Dumbbell } from "lucide-react";
import { z } from "zod";

export const exerciseLogCardSchema = z.object({
  exerciseName: z.string().describe("Name of the exercise"),
  sets: z.number().describe("Number of sets"),
  reps: z.number().describe("Number of reps per set"),
  weight: z.number().optional().describe("Weight in kg (optional)"),
  duration: z.number().optional().describe("Duration in minutes for cardio (optional)"),
  message: z.string().optional().describe("Optional confirmation message"),
});

type ExerciseLogCardProps = z.infer<typeof exerciseLogCardSchema>;

export function ExerciseLogCard({
  exerciseName,
  sets,
  reps,
  weight,
  duration,
  message,
}: ExerciseLogCardProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <Dumbbell className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-green-900">{exerciseName}</h4>
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {sets} sets × {reps} reps
            {weight && ` @ ${weight}kg`}
            {duration && ` • ${duration} min`}
          </p>
          {message && (
            <p className="text-xs text-green-600 mt-2">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
