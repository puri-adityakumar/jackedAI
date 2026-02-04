"use client";

import { useQuery } from "convex/react";
import { format, subDays } from "date-fns";
import { api } from "../../../convex/_generated/api";
import { StatsCard } from "./StatsCard";
import { WeeklyChart } from "./WeeklyChart";

export function DashboardPanel() {
  const today = format(new Date(), "yyyy-MM-dd");
  const weekAgo = format(subDays(new Date(), 6), "yyyy-MM-dd");

  const profile = useQuery(api.userProfile.get);
  const todayExercises = useQuery(api.exerciseLogs.getByDate, { date: today });
  const todayMeals = useQuery(api.mealLogs.getDailySummary, { date: today });
  const weekExercises = useQuery(api.exerciseLogs.getWeekSummary, {
    startDate: weekAgo,
    endDate: today,
  });
  const weekMeals = useQuery(api.mealLogs.getWeekSummary, {
    startDate: weekAgo,
    endDate: today,
  });

  const calorieTarget = profile?.dailyCalorieTarget ?? 2000;
  const caloriesConsumed = todayMeals?.totalCalories ?? 0;
  const proteinConsumed = todayMeals?.totalProtein ?? 0;
  const exerciseCount = todayExercises?.length ?? 0;

  const calorieProgress = Math.min(
    Math.round((caloriesConsumed / calorieTarget) * 100),
    100
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          {profile?.name ? `Welcome back, ${profile.name}!` : "Your daily overview"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Calories"
          value={`${caloriesConsumed}`}
          subtitle={`of ${calorieTarget} target`}
          progress={calorieProgress}
          color="orange"
        />
        <StatsCard
          title="Protein"
          value={`${proteinConsumed}g`}
          subtitle="consumed today"
          color="blue"
        />
        <StatsCard
          title="Exercises"
          value={`${exerciseCount}`}
          subtitle="completed today"
          color="green"
        />
        <StatsCard
          title="Goal"
          value={
            profile?.fitnessGoal === "lose_weight"
              ? "Lose Weight"
              : profile?.fitnessGoal === "build_muscle"
                ? "Build Muscle"
                : "Maintain"
          }
          subtitle={profile ? "Keep it up!" : "Set your goal"}
          color="purple"
        />
      </div>

      {/* Weekly Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Weekly Progress
        </h3>
        <WeeklyChart
          exerciseData={weekExercises ?? {}}
          mealData={weekMeals ?? {}}
        />
      </div>
    </div>
  );
}
