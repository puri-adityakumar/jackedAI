import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const exerciseName = searchParams.get("exerciseName");

    if (action === "all" || !action) {
      const prs = await convex.query(api.personalRecords.getAllPRs, {});
      return NextResponse.json({ prs });
    }

    if (action === "exercise" && exerciseName) {
      const prs = await convex.query(api.personalRecords.getPRsForExercise, {
        exerciseName,
      });
      return NextResponse.json({ prs });
    }

    if (action === "recent") {
      const limit = parseInt(searchParams.get("limit") || "10");
      const prs = await convex.query(api.personalRecords.getRecentPRs, { limit });
      return NextResponse.json({ prs });
    }

    if (action === "count") {
      const count = await convex.query(api.personalRecords.getPRCount, {});
      return NextResponse.json(count);
    }

    if (action === "timeline" && exerciseName) {
      const timeline = await convex.query(api.personalRecords.getPRTimeline, {
        exerciseName,
      });
      return NextResponse.json({ timeline });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching personal records:", error);
    return NextResponse.json(
      { error: "Failed to fetch personal records" },
      { status: 500 }
    );
  }
}

// Check for new PRs (called after logging exercise)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await convex.mutation(api.personalRecords.checkAndUpdatePR, {
      exerciseName: body.exerciseName,
      sets: body.sets,
      reps: body.reps,
      weight: body.weight,
      exerciseLogId: body.exerciseLogId,
      date: body.date,
    });

    return NextResponse.json({
      success: true,
      newPRs: result.newPRs,
    });
  } catch (error) {
    console.error("Error checking PRs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check PRs" },
      { status: 500 }
    );
  }
}
