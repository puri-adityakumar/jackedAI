"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  Plus,
  X,
  Dumbbell,
  Play,
  Pencil,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Minus,
  Check,
  Loader2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlanExercise {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
}

interface Plan {
  _id: Id<"workoutPlans">;
  _creationTime: number;
  name: string;
  description?: string;
  exercises: PlanExercise[];
  createdAt: number;
}

interface ExerciseProgress {
  exerciseIndex: number;
  completedSets: number;
  loggedWeight?: number;
  loggedReps?: number;
  exerciseLogId?: Id<"exerciseLogs">;
}

interface ActiveWorkout {
  _id: Id<"activeWorkouts">;
  planId: Id<"workoutPlans">;
  date: string;
  startedAt: number;
  completedAt?: number;
  exerciseProgress: ExerciseProgress[];
  status: "in_progress" | "completed" | "abandoned";
}

interface ExerciseFormRow {
  name: string;
  sets: number;
  reps: string;
  notes: string;
}

interface PlanFormData {
  name: string;
  description: string;
  exercises: ExerciseFormRow[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyExerciseRow(): ExerciseFormRow {
  return { name: "", sets: 3, reps: "8-12", notes: "" };
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

// ---------------------------------------------------------------------------
// Delete Confirmation Modal
// ---------------------------------------------------------------------------

function DeleteConfirmModal({
  planName,
  onConfirm,
  onCancel,
}: {
  planName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-card rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 border border-border"
        role="alertdialog"
        aria-labelledby="delete-plan-title"
        aria-describedby="delete-plan-desc"
      >
        <h2
          id="delete-plan-title"
          className="text-lg font-semibold text-foreground mb-2"
        >
          Delete Plan?
        </h2>
        <p id="delete-plan-desc" className="text-muted-foreground mb-4">
          Are you sure you want to delete &ldquo;{planName}&rdquo;? This action
          cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create / Edit Plan Modal
// ---------------------------------------------------------------------------

function PlanFormModal({
  plan,
  isNew,
  onClose,
  onSave,
}: {
  plan: Plan | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (data: PlanFormData) => void;
}) {
  const [formData, setFormData] = useState<PlanFormData>({
    name: plan?.name ?? "",
    description: plan?.description ?? "",
    exercises:
      plan && plan.exercises.length > 0
        ? plan.exercises.map((e) => ({
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            notes: e.notes ?? "",
          }))
        : [emptyExerciseRow()],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty exercises
    const cleanedData: PlanFormData = {
      ...formData,
      exercises: formData.exercises.filter((ex) => ex.name.trim() !== ""),
    };
    if (cleanedData.exercises.length === 0) return;
    onSave(cleanedData);
  };

  const addExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, emptyExerciseRow()],
    }));
  };

  const removeExercise = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const updateExercise = (
    index: number,
    field: keyof ExerciseFormRow,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === index ? { ...ex, [field]: value } : ex
      ),
    }));
  };

  const validExerciseCount = formData.exercises.filter(
    (e) => e.name.trim() !== ""
  ).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-card rounded-xl shadow-xl w-full max-w-lg mx-4 border border-border max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="plan-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <ClipboardList
                className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                aria-hidden="true"
              />
            </div>
            <h2
              id="plan-modal-title"
              className="text-lg font-semibold text-foreground"
            >
              {isNew ? "New Workout Plan" : "Edit Plan"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Plan Name */}
          <div>
            <label
              htmlFor="plan-name"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Plan Name
            </label>
            <input
              type="text"
              id="plan-name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
              placeholder="e.g., Push Day, Upper Body, PPL Day A..."
              required
              autoComplete="off"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="plan-description"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Description (optional)
            </label>
            <textarea
              id="plan-description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none resize-none"
              placeholder="Describe this workout plan..."
              rows={2}
              autoComplete="off"
            />
          </div>

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">
                Exercises
              </label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {validExerciseCount} exercise
                {validExerciseCount !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-3">
              {formData.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted/50 rounded-lg border border-border space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground tabular-nums w-5 text-center">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) =>
                        updateExercise(index, "name", e.target.value)
                      }
                      className="flex-1 px-3 py-1.5 border border-input rounded-lg bg-background text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                      placeholder="Exercise name"
                      autoComplete="off"
                      aria-label={`Exercise ${index + 1} name`}
                    />
                    {formData.exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        aria-label={`Remove exercise ${index + 1}`}
                      >
                        <Minus className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-7">
                    <div className="flex-1">
                      <label
                        className="sr-only"
                        htmlFor={`exercise-sets-${index}`}
                      >
                        Sets
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id={`exercise-sets-${index}`}
                          value={exercise.sets}
                          onChange={(e) =>
                            updateExercise(
                              index,
                              "sets",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full px-3 py-1.5 border border-input rounded-lg bg-background text-foreground text-sm tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                          min={1}
                          max={20}
                          aria-label={`Exercise ${index + 1} sets`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                          sets
                        </span>
                      </div>
                    </div>
                    <span className="text-muted-foreground text-sm">x</span>
                    <div className="flex-1">
                      <label
                        className="sr-only"
                        htmlFor={`exercise-reps-${index}`}
                      >
                        Reps
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id={`exercise-reps-${index}`}
                          value={exercise.reps}
                          onChange={(e) =>
                            updateExercise(index, "reps", e.target.value)
                          }
                          className="w-full px-3 py-1.5 border border-input rounded-lg bg-background text-foreground text-sm tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                          placeholder="8-12"
                          aria-label={`Exercise ${index + 1} reps`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                          reps
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes (collapsible) */}
                  <div className="ml-7">
                    <input
                      type="text"
                      value={exercise.notes}
                      onChange={(e) =>
                        updateExercise(index, "notes", e.target.value)
                      }
                      className="w-full px-3 py-1.5 border border-input rounded-lg bg-background text-foreground text-xs placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                      placeholder="Notes (optional)"
                      autoComplete="off"
                      aria-label={`Exercise ${index + 1} notes`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addExercise}
              className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-accent/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add Exercise
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={validExerciseCount === 0}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                validExerciseCount > 0
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {isNew ? "Create Plan" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Plan Card
// ---------------------------------------------------------------------------

function PlanCard({
  plan,
  onEdit,
  onDelete,
  onDuplicate,
  onStart,
  isStarting,
}: {
  plan: Plan;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onStart: () => void;
  isStarting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const exerciseCount = plan.exercises.length;

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Card header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
          <ClipboardList
            className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {plan.name}
          </h3>
          {plan.description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {plan.description}
            </p>
          )}
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
            {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Exercise preview / expand toggle */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-3 w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-lg px-2 py-1 -mx-2"
        aria-expanded={expanded}
        aria-label={expanded ? "Hide exercises" : "Show exercises"}
      >
        <span className="flex items-center gap-1.5">
          <Dumbbell className="w-3.5 h-3.5" aria-hidden="true" />
          {expanded ? "Hide exercises" : "View exercises"}
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4" aria-hidden="true" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1.5 pl-2">
          {plan.exercises.map((exercise, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <Dumbbell
                className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="font-medium truncate">{exercise.name}</span>
              <span className="text-muted-foreground tabular-nums whitespace-nowrap">
                {exercise.sets} x {exercise.reps}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onStart}
          disabled={isStarting}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            isStarting
              ? "bg-indigo-400 dark:bg-indigo-700 text-white cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          )}
          aria-label={`Start workout from ${plan.name}`}
        >
          {isStarting ? (
            <Loader2
              className="w-4 h-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Play className="w-4 h-4" aria-hidden="true" />
          )}
          {isStarting ? "Starting..." : "Start Workout"}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={`Edit ${plan.name}`}
        >
          <Pencil className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={`Duplicate ${plan.name}`}
        >
          <Copy className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={`Delete ${plan.name}`}
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Active Workout Exercise Row
// ---------------------------------------------------------------------------

function ActiveExerciseRow({
  exercise,
  progress,
  onLogSet,
  isLogging,
}: {
  exercise: PlanExercise;
  progress: ExerciseProgress;
  onLogSet: (weight?: number, reps?: number) => void;
  isLogging: boolean;
}) {
  const [weight, setWeight] = useState<string>(
    progress.loggedWeight?.toString() ?? ""
  );
  const [reps, setReps] = useState<string>(
    progress.loggedReps?.toString() ?? ""
  );

  const isDone = progress.completedSets >= exercise.sets;

  const handleLogSet = () => {
    const w = weight.trim() ? parseFloat(weight) : undefined;
    const r = reps.trim() ? parseInt(reps, 10) : undefined;
    onLogSet(w, r);
  };

  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-all",
        isDone
          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
          : "bg-card border-border"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
            isDone
              ? "bg-green-100 dark:bg-green-900/50"
              : "bg-indigo-100 dark:bg-indigo-900/50"
          )}
        >
          {isDone ? (
            <Check
              className="w-4 h-4 text-green-600 dark:text-green-400"
              aria-hidden="true"
            />
          ) : (
            <Dumbbell
              className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                "font-semibold truncate",
                isDone
                  ? "text-green-700 dark:text-green-400"
                  : "text-foreground"
              )}
            >
              {exercise.name}
            </h4>
            {isDone && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 font-medium">
                Done
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-0.5 tabular-nums">
            Target: {exercise.sets} sets x {exercise.reps} reps
          </p>

          {exercise.notes && (
            <p className="text-xs text-muted-foreground mt-1 italic">
              {exercise.notes}
            </p>
          )}

          {/* Set progress bar */}
          <div className="flex items-center gap-1.5 mt-2">
            {Array.from({ length: exercise.sets }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 flex-1 rounded-full transition-colors",
                  i < progress.completedSets
                    ? "bg-green-500 dark:bg-green-400"
                    : "bg-muted"
                )}
                aria-hidden="true"
              />
            ))}
            <span className="text-xs text-muted-foreground tabular-nums ml-1">
              {progress.completedSets}/{exercise.sets}
            </span>
          </div>

          {/* Log set controls */}
          {!isDone && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1">
                <label
                  className="sr-only"
                  htmlFor={`weight-${exercise.name}`}
                >
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id={`weight-${exercise.name}`}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-input rounded-lg bg-background text-foreground text-sm tabular-nums placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                  placeholder="kg"
                  min={0}
                  step={0.5}
                  aria-label={`Weight for ${exercise.name}`}
                />
              </div>
              <div className="flex-1">
                <label className="sr-only" htmlFor={`reps-${exercise.name}`}>
                  Reps
                </label>
                <input
                  type="number"
                  id={`reps-${exercise.name}`}
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-input rounded-lg bg-background text-foreground text-sm tabular-nums placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
                  placeholder="reps"
                  min={1}
                  aria-label={`Reps for ${exercise.name}`}
                />
              </div>
              <button
                type="button"
                onClick={handleLogSet}
                disabled={isLogging}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  isLogging
                    ? "bg-indigo-400 dark:bg-indigo-700 text-white cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                )}
                aria-label={`Log set for ${exercise.name}`}
              >
                {isLogging ? (
                  <Loader2
                    className="w-3.5 h-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                Set
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Active Workout View
// ---------------------------------------------------------------------------

function ActiveWorkoutView({
  workout,
  plan,
  onComplete,
  onAbandon,
}: {
  workout: ActiveWorkout;
  plan: Plan;
  onComplete: () => void;
  onAbandon: () => void;
}) {
  const logSet = useMutation(api.activeWorkouts.logSet);
  const [loggingIndex, setLoggingIndex] = useState<number | null>(null);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

  const completedExercises = workout.exerciseProgress.filter(
    (p) => p.completedSets >= plan.exercises[p.exerciseIndex]?.sets
  ).length;
  const totalExercises = plan.exercises.length;
  const overallProgress =
    totalExercises > 0
      ? Math.round((completedExercises / totalExercises) * 100)
      : 0;

  const elapsed = Date.now() - workout.startedAt;

  const handleLogSet = async (
    exerciseIndex: number,
    weight?: number,
    reps?: number
  ) => {
    setLoggingIndex(exerciseIndex);
    try {
      await logSet({
        workoutId: workout._id,
        exerciseIndex,
        weight,
        reps,
      });
    } catch (err) {
      console.error("Failed to log set:", err);
    } finally {
      setLoggingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active workout header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
            <Play
              className="w-5 h-5 text-green-600 dark:text-green-400"
              aria-hidden="true"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Active Workout
            </h2>
            <p className="text-sm text-muted-foreground">{plan.name}</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground tabular-nums">
          {formatDuration(elapsed)} elapsed
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm text-muted-foreground tabular-nums">
            {completedExercises} of {totalExercises} exercises
          </span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
            role="progressbar"
            aria-valuenow={overallProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Workout progress: ${overallProgress}%`}
          />
        </div>
      </div>

      {/* Exercise list */}
      <section className="space-y-3" aria-label="Exercises">
        {plan.exercises.map((exercise, index) => {
          const progress = workout.exerciseProgress.find(
            (p) => p.exerciseIndex === index
          ) ?? {
            exerciseIndex: index,
            completedSets: 0,
          };

          return (
            <ActiveExerciseRow
              key={index}
              exercise={exercise}
              progress={progress}
              onLogSet={(weight, reps) => handleLogSet(index, weight, reps)}
              isLogging={loggingIndex === index}
            />
          );
        })}
      </section>

      {/* Complete / Abandon buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onComplete}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Complete workout"
        >
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          Complete Workout
        </button>
        <button
          type="button"
          onClick={() => setShowAbandonConfirm(true)}
          className="px-4 py-3 border border-border rounded-xl bg-card text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Abandon workout"
        >
          <XCircle className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Abandon confirmation */}
      {showAbandonConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="bg-card rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 border border-border"
            role="alertdialog"
            aria-labelledby="abandon-title"
            aria-describedby="abandon-desc"
          >
            <h2
              id="abandon-title"
              className="text-lg font-semibold text-foreground mb-2"
            >
              Abandon Workout?
            </h2>
            <p id="abandon-desc" className="text-muted-foreground mb-4">
              Are you sure you want to abandon this workout? Your logged sets
              will not be saved to your exercise history.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAbandonConfirm(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Keep Going
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAbandonConfirm(false);
                  onAbandon();
                }}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Abandon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main PlansPanel
// ---------------------------------------------------------------------------

export function PlansPanel() {
  const plans = useQuery(api.workoutPlans.getAll);
  const activeWorkoutData = useQuery(api.activeWorkouts.getActive);

  const createPlan = useMutation(api.workoutPlans.create);
  const updatePlan = useMutation(api.workoutPlans.update);
  const removePlan = useMutation(api.workoutPlans.remove);
  const duplicatePlan = useMutation(api.workoutPlans.duplicate);
  const startWorkout = useMutation(api.activeWorkouts.start);
  const completeWorkout = useMutation(api.activeWorkouts.complete);
  const abandonWorkout = useMutation(api.activeWorkouts.abandon);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [startingPlanId, setStartingPlanId] = useState<Id<"workoutPlans"> | null>(null);

  // Loading state
  const isLoading = plans === undefined;

  // Handle save (create or update)
  const handleSave = async (data: PlanFormData) => {
    const exercises = data.exercises
      .filter((e) => e.name.trim() !== "")
      .map((e) => ({
        name: e.name.trim(),
        sets: e.sets,
        reps: e.reps.trim() || "1",
        notes: e.notes.trim() || undefined,
      }));

    if (isAddingNew) {
      await createPlan({
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        exercises,
      });
    } else if (editingPlan) {
      await updatePlan({
        id: editingPlan._id,
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        exercises,
      });
    }

    setIsAddingNew(false);
    setEditingPlan(null);
  };

  // Handle delete
  const handleDelete = async () => {
    if (deletingPlan) {
      await removePlan({ id: deletingPlan._id });
      setDeletingPlan(null);
    }
  };

  // Handle duplicate
  const handleDuplicate = async (plan: Plan) => {
    await duplicatePlan({ id: plan._id });
  };

  // Handle start workout
  const handleStartWorkout = async (planId: Id<"workoutPlans">) => {
    setStartingPlanId(planId);
    try {
      await startWorkout({ planId });
    } catch (err) {
      console.error("Failed to start workout:", err);
    } finally {
      setStartingPlanId(null);
    }
  };

  // Handle complete workout
  const handleCompleteWorkout = async () => {
    if (!activeWorkoutData?.workout) return;
    try {
      await completeWorkout({ workoutId: activeWorkoutData.workout._id });
    } catch (err) {
      console.error("Failed to complete workout:", err);
    }
  };

  // Handle abandon workout
  const handleAbandonWorkout = async () => {
    if (!activeWorkoutData?.workout) return;
    try {
      await abandonWorkout({ workoutId: activeWorkoutData.workout._id });
    } catch (err) {
      console.error("Failed to abandon workout:", err);
    }
  };

  // If there is an active workout, show the active workout view
  if (activeWorkoutData && activeWorkoutData.workout && activeWorkoutData.plan) {
    return (
      <ActiveWorkoutView
        workout={activeWorkoutData.workout as ActiveWorkout}
        plan={activeWorkoutData.plan as Plan}
        onComplete={handleCompleteWorkout}
        onAbandon={handleAbandonWorkout}
      />
    );
  }

  const planCount = plans?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <ClipboardList
              className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
              aria-hidden="true"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Workout Plans
            </h2>
            {!isLoading && (
              <p className="text-sm text-muted-foreground tabular-nums">
                {planCount} plan{planCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsAddingNew(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          New Plan
        </button>
      </header>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2
            className="w-6 h-6 text-muted-foreground animate-spin"
            aria-hidden="true"
          />
          <span className="sr-only">Loading workout plans...</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && planCount === 0 && (
        <div className="p-12 text-center bg-card rounded-xl border border-border">
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mx-auto mb-4">
            <ClipboardList
              className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No workout plans yet
          </h3>
          <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
            Create your first workout plan to organize your exercises and track
            your progress during sessions.
          </p>
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Create Your First Plan
          </button>
        </div>
      )}

      {/* Plan grid */}
      {!isLoading && planCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(plans as Plan[]).map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              onEdit={() => setEditingPlan(plan)}
              onDelete={() => setDeletingPlan(plan)}
              onDuplicate={() => handleDuplicate(plan)}
              onStart={() => handleStartWorkout(plan._id)}
              isStarting={startingPlanId === plan._id}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {(isAddingNew || editingPlan) && (
        <PlanFormModal
          plan={editingPlan}
          isNew={isAddingNew}
          onClose={() => {
            setIsAddingNew(false);
            setEditingPlan(null);
          }}
          onSave={handleSave}
        />
      )}

      {deletingPlan && (
        <DeleteConfirmModal
          planName={deletingPlan.name}
          onConfirm={handleDelete}
          onCancel={() => setDeletingPlan(null)}
        />
      )}
    </div>
  );
}
