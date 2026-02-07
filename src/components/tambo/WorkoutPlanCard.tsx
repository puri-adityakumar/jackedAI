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
        weight: z.number().optional(),
      })
    )
    .describe("List of exercises with sets, reps, and optional weight"),
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
    <div className="bg-primary/5 border-2 border-primary/20 dark:border-primary/30 p-4 my-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-5 h-5 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">{name}</h4>
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" aria-hidden="true" />
            </div>
          </div>
          <p className="text-xs text-primary mt-0.5">
            {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
          </p>

          {/* Exercise list */}
          <div className="mt-3 space-y-1.5">
            {exercises?.map((exercise, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <Dumbbell className="w-3.5 h-3.5 text-primary flex-shrink-0" aria-hidden="true" />
                <span className="font-medium">{exercise.name}</span>
                <span className="text-muted-foreground">
                  {exercise.sets} x {exercise.reps}
                  {exercise.weight ? ` @ ${exercise.weight}kg` : ""}
                </span>
              </div>
            ))}
          </div>

          {message && (
            <p className="text-xs text-muted-foreground mt-3">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
