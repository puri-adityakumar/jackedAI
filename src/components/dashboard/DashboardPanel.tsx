"use client";

import { useQuery } from "convex/react";
import { format, subDays } from "date-fns";
import { useMemo } from "react";
import { api } from "../../../convex/_generated/api";
import { StatsCard } from "./StatsCard";
import { WeeklyChart } from "./WeeklyChart";

export function DashboardPanel() {
  // Memoize date calculations to avoid recreating Date objects on every render
  // See: Vercel best practices rule rerender-lazy-state-init
  const { today, weekAgo } = useMemo(() => {
    const now = new Date();
    return {
      today: format(now, "yyyy-MM-dd"),
      weekAgo: format(subDays(now, 6), "yyyy-MM-dd"),
    };
  }, []);

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
      <header>
        <h2 className="text-2xl font-bold text-foreground tracking-tight text-pretty">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          {profile?.name ? `Welcome back, ${profile.name}!` : "Your daily overview"}
        </p>
      </header>

      {/* Stats Cards */}
      <section aria-label="Today's statistics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Calories"
            value={`${caloriesConsumed.toLocaleString()}`}
            subtitle={`of ${calorieTarget.toLocaleString()} target`}
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
      </section>

      {/* Weekly Chart */}
      <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 text-pretty">
          Weekly Progress
        </h3>
        <WeeklyChart
          exerciseData={weekExercises ?? {}}
          mealData={weekMeals ?? {}}
        />
      </section>
    </div>
  );
}
