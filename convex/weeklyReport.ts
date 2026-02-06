import { query } from "./_generated/server";
import { v } from "convex/values";

type Grade = "A" | "B" | "C" | "D" | "F";

function calculateGrade(percentage: number): Grade {
  if (percentage >= 90) return "A";
  if (percentage >= 75) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 40) return "D";
  return "F";
}

function getWeekBoundaries(weekStart?: string): { startDate: string; endDate: string } {
  const now = new Date();

  if (weekStart) {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return {
      startDate: weekStart,
      endDate: end.toISOString().split("T")[0],
    };
  }

  // Get current week (Monday to Sunday)
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startDate: monday.toISOString().split("T")[0],
    endDate: sunday.toISOString().split("T")[0],
  };
}

export const getWeeklyReport = query({
  args: { weekStart: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { startDate, endDate } = getWeekBoundaries(args.weekStart);

    // Fetch all data in parallel
    const [profile, allExerciseLogs, allMealLogs, allReminders, allReminderLogs] =
      await Promise.all([
        ctx.db.query("userProfile").first(),
        ctx.db.query("exerciseLogs").collect(),
        ctx.db.query("mealLogs").collect(),
        ctx.db.query("reminders").collect(),
        ctx.db.query("reminderLogs").collect(),
      ]);

    // Filter by date range
    const exerciseLogs = allExerciseLogs.filter(
      (log) => log.date >= startDate && log.date <= endDate
    );
    const mealLogs = allMealLogs.filter(
      (log) => log.date >= startDate && log.date <= endDate
    );
    const reminderLogs = allReminderLogs.filter(
      (log) => log.date >= startDate && log.date <= endDate
    );

    // ========== WORKOUT METRICS ==========
    const workoutDates = [...new Set(exerciseLogs.map((log) => log.date))];
    const totalDays = workoutDates.length;
    const targetDays = 5; // Default target
    const totalExercises = exerciseLogs.length;

    // Calculate total volume
    const totalVolume = exerciseLogs.reduce((sum, log) => {
      if (log.weight) {
        return sum + log.sets * log.reps * log.weight;
      }
      return sum;
    }, 0);

    // Muscle group breakdown
    const muscleGroupBreakdown: Record<string, number> = {};
    for (const log of exerciseLogs) {
      if (log.muscleGroup) {
        muscleGroupBreakdown[log.muscleGroup] =
          (muscleGroupBreakdown[log.muscleGroup] || 0) + 1;
      }
    }

    const workoutGrade = calculateGrade((totalDays / targetDays) * 100);

    // ========== NUTRITION METRICS ==========
    const mealDates = [...new Set(mealLogs.map((log) => log.date))];
    const totalDaysLogged = mealDates.length;

    // Daily aggregates
    const dailyNutrition: Record<
      string,
      { calories: number; protein: number; carbs: number; fat: number }
    > = {};
    for (const log of mealLogs) {
      if (!dailyNutrition[log.date]) {
        dailyNutrition[log.date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      dailyNutrition[log.date].calories += log.calories;
      dailyNutrition[log.date].protein += log.protein;
      dailyNutrition[log.date].carbs += log.carbs;
      dailyNutrition[log.date].fat += log.fat;
    }

    const days = Object.values(dailyNutrition);
    const averageCalories =
      days.length > 0
        ? Math.round(days.reduce((sum, d) => sum + d.calories, 0) / days.length)
        : 0;
    const averageProtein =
      days.length > 0
        ? Math.round(days.reduce((sum, d) => sum + d.protein, 0) / days.length)
        : 0;
    const averageCarbs =
      days.length > 0
        ? Math.round(days.reduce((sum, d) => sum + d.carbs, 0) / days.length)
        : 0;
    const averageFat =
      days.length > 0
        ? Math.round(days.reduce((sum, d) => sum + d.fat, 0) / days.length)
        : 0;

    const calorieTarget = profile?.dailyCalorieTarget || 2000;
    const proteinTarget = profile?.proteinTarget || 100;
    const calorieAdherence =
      calorieTarget > 0
        ? Math.round((averageCalories / calorieTarget) * 100)
        : 0;
    const proteinAdherence =
      proteinTarget > 0
        ? Math.round((averageProtein / proteinTarget) * 100)
        : 0;

    // Nutrition grade based on calorie adherence (within 10% is ideal)
    const calorieDeviation = Math.abs(100 - calorieAdherence);
    const nutritionScore = Math.max(0, 100 - calorieDeviation);
    const nutritionGrade = calculateGrade(nutritionScore);

    // ========== REMINDER METRICS ==========
    const activeReminders = allReminders.filter((r) => r.isActive);

    // Count expected reminders for the week (simplified: daily reminders * 7)
    let totalScheduled = 0;
    for (const reminder of activeReminders) {
      if (reminder.frequency === "daily") {
        totalScheduled += 7;
      } else if (reminder.frequency === "weekly" && reminder.repeatDays) {
        totalScheduled += reminder.repeatDays.length;
      } else if (reminder.frequency === "once") {
        // Check if the reminder's start date is in this week
        if (reminder.startDate >= startDate && reminder.startDate <= endDate) {
          totalScheduled += 1;
        }
      }
    }

    const completed = reminderLogs.filter((log) => log.status === "completed").length;
    const adherenceRate =
      totalScheduled > 0 ? Math.round((completed / totalScheduled) * 100) : 100;

    // Category breakdown
    const categoryBreakdown: Record<string, { completed: number; total: number }> = {};
    for (const reminder of activeReminders) {
      if (!categoryBreakdown[reminder.category]) {
        categoryBreakdown[reminder.category] = { completed: 0, total: 0 };
      }
      // Simplified count
      if (reminder.frequency === "daily") {
        categoryBreakdown[reminder.category].total += 7;
      }
    }
    for (const log of reminderLogs) {
      const reminder = allReminders.find((r) => r._id === log.reminderId);
      if (reminder && log.status === "completed") {
        if (!categoryBreakdown[reminder.category]) {
          categoryBreakdown[reminder.category] = { completed: 0, total: 0 };
        }
        categoryBreakdown[reminder.category].completed += 1;
      }
    }

    const reminderGrade = calculateGrade(adherenceRate);

    // ========== STREAKS ==========
    // Get all exercise dates sorted
    const allExerciseDates = [...new Set(allExerciseLogs.map((log) => log.date))].sort(
      (a, b) => b.localeCompare(a)
    );
    const allMealDates = [...new Set(allMealLogs.map((log) => log.date))].sort(
      (a, b) => b.localeCompare(a)
    );

    // Calculate current streak (simplified version)
    function calculateStreak(dates: string[]): { current: number; longest: number } {
      if (dates.length === 0) return { current: 0, longest: 0 };

      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      let current = 0;
      let checkDate = dates[0] === today || dates[0] === yesterday ? new Date(dates[0]) : null;

      if (checkDate) {
        for (const dateStr of dates) {
          const expected = checkDate.toISOString().split("T")[0];
          if (dateStr === expected) {
            current++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (dateStr < expected) {
            break;
          }
        }
      }

      let longest = 0;
      let temp = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diff = (prev.getTime() - curr.getTime()) / 86400000;
        if (diff === 1) {
          temp++;
        } else {
          longest = Math.max(longest, temp);
          temp = 1;
        }
      }
      longest = Math.max(longest, temp);

      return { current, longest };
    }

    const exerciseStreak = calculateStreak(allExerciseDates);
    const mealStreak = calculateStreak(allMealDates);

    // ========== OVERALL SCORE ==========
    const overallScore = Math.round(
      (workoutGrade === "A" ? 100 : workoutGrade === "B" ? 80 : workoutGrade === "C" ? 65 : workoutGrade === "D" ? 50 : 30) * 0.4 +
      (nutritionGrade === "A" ? 100 : nutritionGrade === "B" ? 80 : nutritionGrade === "C" ? 65 : nutritionGrade === "D" ? 50 : 30) * 0.4 +
      (reminderGrade === "A" ? 100 : reminderGrade === "B" ? 80 : reminderGrade === "C" ? 65 : reminderGrade === "D" ? 50 : 30) * 0.2
    );
    const overallGrade = calculateGrade(overallScore);

    // ========== INSIGHTS ==========
    const insights: string[] = [];

    if (totalDays >= targetDays) {
      insights.push("Great job hitting your workout target this week!");
    } else if (totalDays >= targetDays - 1) {
      insights.push("Almost hit your workout target - keep pushing!");
    } else {
      insights.push(`Try to add ${targetDays - totalDays} more workout days next week.`);
    }

    if (proteinAdherence >= 90) {
      insights.push("Excellent protein intake - your muscles thank you!");
    } else if (proteinAdherence < 70) {
      insights.push("Consider adding more protein-rich foods to your meals.");
    }

    if (exerciseStreak.current >= 7) {
      insights.push(`Amazing ${exerciseStreak.current}-day workout streak!`);
    }

    if (adherenceRate >= 90) {
      insights.push("Outstanding reminder adherence - consistency is key!");
    }

    return {
      weekStart: startDate,
      weekEnd: endDate,
      workout: {
        totalDays,
        targetDays,
        totalExercises,
        totalVolume: Math.round(totalVolume),
        muscleGroupBreakdown,
        averageExercisesPerDay:
          totalDays > 0 ? Math.round(totalExercises / totalDays) : 0,
        grade: workoutGrade,
      },
      nutrition: {
        totalDaysLogged,
        averageCalories,
        calorieTarget,
        calorieAdherence,
        averageProtein,
        proteinTarget,
        proteinAdherence,
        macroBreakdown: {
          protein: averageProtein,
          carbs: averageCarbs,
          fat: averageFat,
        },
        grade: nutritionGrade,
      },
      reminders: {
        totalScheduled,
        completed,
        adherenceRate,
        categoryBreakdown,
        grade: reminderGrade,
      },
      streaks: {
        exerciseCurrent: exerciseStreak.current,
        exerciseLongest: exerciseStreak.longest,
        mealCurrent: mealStreak.current,
        mealLongest: mealStreak.longest,
      },
      overallGrade,
      overallScore,
      insights,
    };
  },
});
