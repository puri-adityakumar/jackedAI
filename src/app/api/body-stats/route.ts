import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const id = await convex.mutation(api.bodyStats.create, {
      date: body.date,
      weight: body.weight,
      bodyFat: body.bodyFat,
      waist: body.waist,
      chest: body.chest,
      hips: body.hips,
      bicepsLeft: body.bicepsLeft,
      bicepsRight: body.bicepsRight,
      thighLeft: body.thighLeft,
      thighRight: body.thighRight,
      neck: body.neck,
      notes: body.notes,
    });

    // Get change from previous
    const change = await convex.query(api.bodyStats.getChangeFromPrevious, {
      excludeDate: body.date,
    });

    return NextResponse.json({
      success: true,
      id,
      weightChange: change?.weightChange,
      bodyFatChange: change?.bodyFatChange,
    });
  } catch (error) {
    console.error("Error creating body stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create body stats" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const action = searchParams.get("action");

    if (action === "latest") {
      const latest = await convex.query(api.bodyStats.getLatest, {});
      return NextResponse.json(latest);
    }

    if (action === "recent") {
      const limit = parseInt(searchParams.get("limit") || "10");
      const entries = await convex.query(api.bodyStats.getRecent, { limit });
      return NextResponse.json(entries);
    }

    if (action === "trends") {
      const metric = searchParams.get("metric") as
        | "weight"
        | "bodyFat"
        | "waist"
        | "chest";
      const period = searchParams.get("period") as
        | "week"
        | "month"
        | "3months"
        | "year"
        | "all";
      const trends = await convex.query(api.bodyStats.getTrends, {
        metric: metric || "weight",
        period: period || "month",
      });
      return NextResponse.json(trends);
    }

    if (action === "range") {
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");
      if (!startDate || !endDate) {
        return NextResponse.json(
          { error: "startDate and endDate required" },
          { status: 400 }
        );
      }
      const entries = await convex.query(api.bodyStats.getRange, {
        startDate,
        endDate,
      });
      return NextResponse.json(entries);
    }

    if (date) {
      const entry = await convex.query(api.bodyStats.getByDate, { date });
      return NextResponse.json(entry);
    }

    // Default: return all
    const entries = await convex.query(api.bodyStats.getAll, {});
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching body stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch body stats" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    await convex.mutation(api.bodyStats.update, {
      id: body.id,
      date: body.date,
      weight: body.weight,
      bodyFat: body.bodyFat,
      waist: body.waist,
      chest: body.chest,
      hips: body.hips,
      bicepsLeft: body.bicepsLeft,
      bicepsRight: body.bicepsRight,
      thighLeft: body.thighLeft,
      thighRight: body.thighRight,
      neck: body.neck,
      notes: body.notes,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating body stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update body stats" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await convex.mutation(api.bodyStats.remove, { id: id as any });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting body stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete body stats" },
      { status: 500 }
    );
  }
}
