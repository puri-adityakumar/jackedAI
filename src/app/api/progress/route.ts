import { ConvexHttpClient } from "convex/browser";
import { format } from "date-fns";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd");

    // Fetch all data in parallel - these queries are independent
    // See: Vercel best practices rule async-parallel (CRITICAL: 2-10× improvement)
    const [profile, exercises, mealSummary] = await Promise.all([
      convex.query(api.userProfile.get),
      convex.query(api.exerciseLogs.getByDate, { date }),
      convex.query(api.mealLogs.getDailySummary, { date }),
    ]);

    const calorieTarget = profile?.dailyCalorieTarget ?? 2000;

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
