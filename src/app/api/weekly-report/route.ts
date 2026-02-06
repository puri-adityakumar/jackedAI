import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get("weekStart") || undefined;

    const report = await convex.query(api.weeklyReport.getWeeklyReport, {
      weekStart,
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching weekly report:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly report" },
      { status: 500 }
    );
  }
}
