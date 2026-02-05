"use client";

import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { Check, Trash2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface ExerciseItemProps {
  exercise: {
    _id: Id<"exerciseLogs">;
    exerciseName: string;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
    notes?: string;
  };
  compact?: boolean;
}

export function ExerciseItem({ exercise, compact = false }: ExerciseItemProps) {
  const removeExercise = useMutation(api.exerciseLogs.remove);

  const handleDelete = () => {
    if (confirm("Remove this exercise?")) {
      removeExercise({ id: exercise._id });
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between group exercise-item",
        compact ? "py-1" : "p-4"
      )}
    >
      <div className="flex items-center gap-3">
        {!compact && (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
        )}
        <div>
          <p
            className={cn(
              "font-medium text-gray-900",
              compact ? "text-sm" : ""
            )}
          >
            {exercise.exerciseName}
          </p>
          <p className="text-sm text-gray-500">
            {exercise.sets} sets × {exercise.reps} reps
            {exercise.weight !== undefined && exercise.weight > 0 ? ` @ ${exercise.weight}kg` : null}
            {exercise.duration !== undefined && exercise.duration > 0 ? ` • ${exercise.duration} min` : null}
          </p>
        </div>
      </div>
      {!compact && (
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
          title="Remove exercise"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
