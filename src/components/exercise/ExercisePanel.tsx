"use client";

import { useQuery } from "convex/react";
import { format } from "date-fns";
import { Dumbbell, Plus } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { ExerciseItem } from "./ExerciseItem";

export function ExercisePanel() {
  const today = format(new Date(), "yyyy-MM-dd");
  const todayExercises = useQuery(api.exerciseLogs.getByDate, { date: today });
  const recentExercises = useQuery(api.exerciseLogs.getRecent, { limit: 10 });

  // Group recent exercises by date (excluding today)
  type ExerciseLog = NonNullable<typeof recentExercises>[number];
  const exercisesByDate = (recentExercises ?? [])
    .filter((ex) => ex.date !== today)
    .reduce(
      (acc, ex) => {
        if (!acc[ex.date]) acc[ex.date] = [];
        acc[ex.date].push(ex);
        return acc;
      },
      {} as Record<string, ExerciseLog[]>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exercise Log</h2>
          <p className="text-gray-500 mt-1">Track your workouts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Exercise
        </button>
      </div>

      {/* Today's Exercises */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-green-600" />
            Today&apos;s Workout
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {todayExercises && todayExercises.length > 0 ? (
            todayExercises.map((exercise) => (
              <ExerciseItem key={exercise._id} exercise={exercise} />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No exercises logged today</p>
              <p className="text-sm mt-1">
                Tell Butler: &quot;I did 3 sets of bench press at 60kg&quot;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Exercise History */}
      {Object.keys(exercisesByDate).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Recent History</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {Object.entries(exercisesByDate)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 5)
              .map(([date, exercises]) => (
                <div key={date} className="p-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {format(new Date(date), "EEEE, MMM d")}
                  </p>
                  <div className="space-y-2">
                    {exercises?.map((exercise) => (
                      <ExerciseItem
                        key={exercise._id}
                        exercise={exercise}
                        compact
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
