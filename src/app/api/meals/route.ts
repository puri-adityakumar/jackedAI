import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const id = await convex.mutation(api.mealLogs.create, {
      date: body.date,
      mealType: body.mealType,
      foodName: body.foodName,
      quantity: body.quantity,
      calories: body.calories,
      protein: body.protein,
      carbs: body.carbs,
      fat: body.fat,
      fiber: body.fiber,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating meal log:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create meal log" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (date) {
      const logs = await convex.query(api.mealLogs.getByDate, { date });
      return NextResponse.json(logs);
    }

    const logs = await convex.query(api.mealLogs.getRecent, { limit: 20 });
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching meal logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal logs" },
      { status: 500 }
    );
  }
}
