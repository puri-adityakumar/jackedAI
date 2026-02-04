"use client";

import { useQuery } from "convex/react";
import { format } from "date-fns";
import { Plus, Utensils } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { MacrosSummary } from "./MacrosSummary";
import { MealItem } from "./MealItem";

export function DietPanel() {
  const today = format(new Date(), "yyyy-MM-dd");
  const todayMeals = useQuery(api.mealLogs.getByDate, { date: today });
  const todaySummary = useQuery(api.mealLogs.getDailySummary, { date: today });
  const recentMeals = useQuery(api.mealLogs.getRecent, { limit: 20 });

  const profile = useQuery(api.userProfile.get);
  const calorieTarget = profile?.dailyCalorieTarget ?? 2000;

  // Group recent meals by date (excluding today)
  type MealLog = NonNullable<typeof recentMeals>[number];
  const mealsByDate = (recentMeals ?? [])
    .filter((meal) => meal.date !== today)
    .reduce(
      (acc, meal) => {
        if (!acc[meal.date]) acc[meal.date] = [];
        acc[meal.date].push(meal);
        return acc;
      },
      {} as Record<string, MealLog[]>
    );

  // Group today's meals by type
  const mealsByType = {
    breakfast: todayMeals?.filter((m) => m.mealType === "breakfast") ?? [],
    lunch: todayMeals?.filter((m) => m.mealType === "lunch") ?? [],
    dinner: todayMeals?.filter((m) => m.mealType === "dinner") ?? [],
    snack: todayMeals?.filter((m) => m.mealType === "snack") ?? [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Diet Log</h2>
          <p className="text-gray-500 mt-1">Track your nutrition</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Meal
        </button>
      </div>

      {/* Macros Summary */}
      <MacrosSummary
        calories={todaySummary?.totalCalories ?? 0}
        calorieTarget={calorieTarget}
        protein={todaySummary?.totalProtein ?? 0}
        carbs={todaySummary?.totalCarbs ?? 0}
        fat={todaySummary?.totalFat ?? 0}
      />

      {/* Today's Meals */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-600" />
            Today&apos;s Meals
          </h3>
        </div>

        {todayMeals && todayMeals.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map(
              (mealType) =>
                mealsByType[mealType].length > 0 && (
                  <div key={mealType} className="p-4">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                      {mealType}
                    </p>
                    <div className="space-y-2">
                      {mealsByType[mealType].map((meal) => (
                        <MealItem key={meal._id} meal={meal} />
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Utensils className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No meals logged today</p>
            <p className="text-sm mt-1">
              Tell Butler: &quot;I had chicken rice for lunch&quot;
            </p>
          </div>
        )}
      </div>

      {/* Meal History */}
      {Object.keys(mealsByDate).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Recent History</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {Object.entries(mealsByDate)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 3)
              .map(([date, meals]) => (
                <div key={date} className="p-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {format(new Date(date), "EEEE, MMM d")}
                  </p>
                  <div className="space-y-2">
                    {meals?.map((meal) => (
                      <MealItem key={meal._id} meal={meal} compact />
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
