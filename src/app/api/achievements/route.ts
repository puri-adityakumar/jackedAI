import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    const badges = await convex.query(api.achievements.getBadgeProgress, {});
    return NextResponse.json({ badges });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await convex.mutation(api.achievements.checkAndUnlock, {});
    return NextResponse.json({
      success: true,
      newlyUnlocked: result.newlyUnlocked,
    });
  } catch (error) {
    console.error("Error checking badges:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check badges" },
      { status: 500 }
    );
  }
}
