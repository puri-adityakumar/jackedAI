"use client";

import { cn } from "@/lib/utils";
import { Check, ClipboardList, Dumbbell } from "lucide-react";
import { z } from "zod";

export const workoutPlanCardSchema = z.object({
  name: z.string().describe("Name of the workout plan"),
  exerciseCount: z.number().describe("Number of exercises in the plan"),
  exercises: z
    .array(
      z.object({
        name: z.string(),
        sets: z.number(),
        reps: z.string(),
      })
    )
    .describe("List of exercises with sets and reps"),
  message: z.string().optional().describe("Optional confirmation message"),
});

type WorkoutPlanCardProps = z.infer<typeof workoutPlanCardSchema>;

export function WorkoutPlanCard({
  name,
  exerciseCount,
  exercises,
  message,
}: WorkoutPlanCardProps) {
  return (
    <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 my-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">{name}</h4>
            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" aria-hidden="true" />
            </div>
          </div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
            {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
          </p>

          {/* Exercise list */}
          <div className="mt-3 space-y-1.5">
            {exercises.map((exercise, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-indigo-800 dark:text-indigo-200"
              >
                <Dumbbell className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" aria-hidden="true" />
                <span className="font-medium">{exercise.name}</span>
                <span className="text-indigo-500 dark:text-indigo-400">
                  {exercise.sets} x {exercise.reps}
                </span>
              </div>
            ))}
          </div>

          {message && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-3">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
