import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const id = await convex.mutation(api.exerciseLogs.create, {
      date: body.date,
      exerciseName: body.exerciseName,
      sets: body.sets,
      reps: body.reps,
      weight: body.weight,
      duration: body.duration,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating exercise log:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create exercise log" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (date) {
      const logs = await convex.query(api.exerciseLogs.getByDate, { date });
      return NextResponse.json(logs);
    }

    const logs = await convex.query(api.exerciseLogs.getRecent, { limit: 20 });
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching exercise logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercise logs" },
      { status: 500 }
    );
  }
}
