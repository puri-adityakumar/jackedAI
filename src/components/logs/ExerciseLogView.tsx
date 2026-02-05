"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { LogCalendar } from "./LogCalendar";
import { StreakBadge } from "./StreakBadge";
import { Pencil, Trash2, Plus, X, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "cardio"
  | "full_body";

const MUSCLE_GROUPS: { value: MuscleGroup; label: string }[] = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "legs", label: "Legs" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" },
  { value: "full_body", label: "Full Body" },
];

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: "Chest Day",
  back: "Back Day",
  shoulders: "Shoulders Day",
  arms: "Arms Day",
  legs: "Leg Day",
  core: "Core Day",
  cardio: "Cardio Day",
  full_body: "Full Body",
};

interface ExerciseLog {
  _id: Id<"exerciseLogs">;
  date: string;
  muscleGroup?: MuscleGroup;
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  notes?: string;
}

interface EditModalProps {
  exercise: ExerciseLog | null;
  isNew: boolean;
  date: string;
  onClose: () => void;
  onSave: (data: Partial<ExerciseLog>) => void;
}

function EditExerciseModal({
  exercise,
  isNew,
  date,
  onClose,
  onSave,
}: EditModalProps) {
  const [formData, setFormData] = useState({
    exerciseName: exercise?.exerciseName || "",
    muscleGroup: exercise?.muscleGroup || ("" as MuscleGroup | ""),
    sets: exercise?.sets || 3,
    reps: exercise?.reps || 10,
    weight: exercise?.weight || 0,
    duration: exercise?.duration || 0,
    notes: exercise?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      muscleGroup: formData.muscleGroup || undefined,
      weight: formData.weight || undefined,
      duration: formData.duration || undefined,
      notes: formData.notes || undefined,
      date,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        role="dialog"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 id="modal-title" className="text-lg font-semibold">
            {isNew ? "Add Exercise" : "Edit Exercise"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label
              htmlFor="exerciseName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Exercise Name
            </label>
            <input
              type="text"
              id="exerciseName"
              name="exerciseName"
              value={formData.exerciseName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, exerciseName: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              placeholder="e.g., Bench Press…"
              required
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="muscleGroup"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Muscle Group
            </label>
            <select
              id="muscleGroup"
              name="muscleGroup"
              value={formData.muscleGroup}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  muscleGroup: e.target.value as MuscleGroup,
                }))
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="">Select muscle group…</option>
              {MUSCLE_GROUPS.map((mg) => (
                <option key={mg.value} value={mg.value}>
                  {mg.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="sets"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sets
              </label>
              <input
                type="number"
                id="sets"
                name="sets"
                value={formData.sets}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sets: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none tabular-nums"
                min={1}
                required
              />
            </div>
            <div>
              <label
                htmlFor="reps"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reps
              </label>
              <input
                type="number"
                id="reps"
                name="reps"
                value={formData.reps}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reps: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none tabular-nums"
                min={1}
                required
              />
            </div>
            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Weight (kg)
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    weight: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none tabular-nums"
                min={0}
                step={0.5}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes
            </label>
            <input
              type="text"
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              placeholder="Optional notes…"
              autoComplete="off"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
              {isNew ? "Add Exercise" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  exerciseName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({
  exerciseName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6"
        role="alertdialog"
        aria-labelledby="delete-title"
        aria-describedby="delete-desc"
      >
        <h2 id="delete-title" className="text-lg font-semibold mb-2">
          Delete Exercise?
        </h2>
        <p id="delete-desc" className="text-gray-600 mb-4">
          Are you sure you want to delete &ldquo;{exerciseName}&rdquo;? This
          action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function ExerciseLogView() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [editingExercise, setEditingExercise] = useState<ExerciseLog | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deletingExercise, setDeletingExercise] = useState<ExerciseLog | null>(null);

  const currentDate = new Date();
  const monthSummary = useQuery(api.exerciseLogs.getMonthSummary, {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  });
  const streak = useQuery(api.exerciseLogs.getStreak);
  const dayLogs = useQuery(api.exerciseLogs.getByDate, { date: selectedDate });

  const createExercise = useMutation(api.exerciseLogs.create);
  const updateExercise = useMutation(api.exerciseLogs.update);
  const deleteExercise = useMutation(api.exerciseLogs.remove);

  const calendarData = useMemo(() => {
    if (!monthSummary?.byDate) return {};
    const data: Record<string, { count: number; color: string }> = {};
    for (const [date, info] of Object.entries(monthSummary.byDate)) {
      data[date] = { count: info.count, color: "bg-green-500" };
    }
    return data;
  }, [monthSummary]);

  const dayLabel = useMemo(() => {
    if (!dayLogs || dayLogs.length === 0) return null;
    const muscleGroups = [...new Set(dayLogs.map((l) => l.muscleGroup).filter(Boolean))];
    if (muscleGroups.length === 1 && muscleGroups[0]) {
      return MUSCLE_GROUP_LABELS[muscleGroups[0]] || muscleGroups[0];
    }
    if (muscleGroups.length > 1) return "Mixed Training";
    return null;
  }, [dayLogs]);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(selectedDate));

  const handleSave = async (data: Partial<ExerciseLog>) => {
    if (isAddingNew) {
      await createExercise({
        date: selectedDate,
        exerciseName: data.exerciseName!,
        sets: data.sets!,
        reps: data.reps!,
        muscleGroup: data.muscleGroup,
        weight: data.weight,
        duration: data.duration,
        notes: data.notes,
      });
    } else if (editingExercise) {
      await updateExercise({
        id: editingExercise._id,
        exerciseName: data.exerciseName,
        sets: data.sets,
        reps: data.reps,
        muscleGroup: data.muscleGroup,
        weight: data.weight,
        duration: data.duration,
        notes: data.notes,
      });
    }
    setEditingExercise(null);
    setIsAddingNew(false);
  };

  const handleDelete = async () => {
    if (deletingExercise) {
      await deleteExercise({ id: deletingExercise._id });
      setDeletingExercise(null);
    }
  };

  const totalSets = dayLogs?.reduce((sum, log) => sum + log.sets, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-green-600" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold" style={{ textWrap: "balance" }}>
            Exercise Log
          </h2>
        </div>
        {streak && <StreakBadge currentStreak={streak.currentStreak} longestStreak={streak.longestStreak} />}
      </div>

      {/* Stats */}
      {monthSummary && (
        <div className="text-sm text-gray-600">
          <span className="tabular-nums">{monthSummary.totalWorkouts}</span> workouts
          this month &middot;{" "}
          <span className="tabular-nums">{monthSummary.totalExercises}</span> total
          exercises
        </div>
      )}

      {/* Calendar */}
      <LogCalendar
        datesWithLogs={calendarData}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      {/* Day view */}
      <div className="bg-white rounded-lg border">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-medium">{formattedDate}</h3>
            {dayLabel && (
              <p className="text-sm text-green-600 font-medium">{dayLabel}</p>
            )}
          </div>
          <button
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none"
            aria-label="Add new exercise"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add
          </button>
        </div>

        {/* Table */}
        {dayLogs && dayLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">#</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Exercise</th>
                  <th className="px-4 py-3 font-medium text-gray-600 tabular-nums">Sets</th>
                  <th className="px-4 py-3 font-medium text-gray-600 tabular-nums">Reps</th>
                  <th className="px-4 py-3 font-medium text-gray-600 tabular-nums">Weight</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Notes</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dayLogs.map((log, idx) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 tabular-nums">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{log.exerciseName}</td>
                    <td className="px-4 py-3 tabular-nums">{log.sets}</td>
                    <td className="px-4 py-3 tabular-nums">{log.reps}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {log.weight ? `${log.weight}kg` : "BW"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[150px]">
                      {log.notes || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingExercise(log)}
                          className="p-1.5 rounded hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                          aria-label={`Edit ${log.exerciseName}`}
                        >
                          <Pencil className="w-4 h-4 text-gray-500" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => setDeletingExercise(log)}
                          className="p-1.5 rounded hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                          aria-label={`Delete ${log.exerciseName}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Dumbbell className="w-8 h-8 mx-auto mb-2 text-gray-300" aria-hidden="true" />
            <p>No exercises logged for this day</p>
            <button
              onClick={() => setIsAddingNew(true)}
              className="mt-2 text-green-600 hover:text-green-700 font-medium focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none rounded"
            >
              Add your first exercise
            </button>
          </div>
        )}

        {/* Summary */}
        {dayLogs && dayLogs.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-600">
            <span className="tabular-nums">{dayLogs.length}</span> exercises &middot;{" "}
            <span className="tabular-nums">{totalSets}</span> total sets
          </div>
        )}
      </div>

      {/* Modals */}
      {(editingExercise || isAddingNew) && (
        <EditExerciseModal
          exercise={editingExercise}
          isNew={isAddingNew}
          date={selectedDate}
          onClose={() => {
            setEditingExercise(null);
            setIsAddingNew(false);
          }}
          onSave={handleSave}
        />
      )}

      {deletingExercise && (
        <DeleteConfirmModal
          exerciseName={deletingExercise.exerciseName}
          onConfirm={handleDelete}
          onCancel={() => setDeletingExercise(null)}
        />
      )}
    </div>
  );
}
