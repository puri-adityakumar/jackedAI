import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    const profile = await convex.query(api.userProfile.get);

    if (!profile) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json({
      name: profile.name,
      height: profile.height,
      weight: profile.weight,
      age: profile.age,
      fitnessGoal: profile.fitnessGoal,
      dailyCalorieTarget: profile.dailyCalorieTarget ?? 2000,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const id = await convex.mutation(api.userProfile.create, {
      name: body.name,
      height: body.height,
      weight: body.weight,
      age: body.age,
      fitnessGoal: body.fitnessGoal,
      dailyCalorieTarget: body.dailyCalorieTarget,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    await convex.mutation(api.userProfile.update, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
