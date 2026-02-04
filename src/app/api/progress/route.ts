import { ConvexHttpClient } from "convex/browser";
import { format } from "date-fns";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd");

    // Get profile for calorie target
    const profile = await convex.query(api.userProfile.get);
    const calorieTarget = profile?.dailyCalorieTarget ?? 2000;

    // Get today's exercises
    const exercises = await convex.query(api.exerciseLogs.getByDate, { date });

    // Get today's meal summary
    const mealSummary = await convex.query(api.mealLogs.getDailySummary, {
      date,
    });

    return NextResponse.json({
      caloriesConsumed: mealSummary.totalCalories,
      calorieTarget,
      proteinConsumed: mealSummary.totalProtein,
      exerciseCount: exercises.length,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
