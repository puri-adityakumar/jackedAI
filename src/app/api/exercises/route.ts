import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";
import {
  getAllExercises,
  getExerciseById,
  getExercisesByName,
  getExercisesByBodyPart,
  getExercisesByTarget,
  getExercisesByEquipment,
  getBodyPartList,
  getTargetList,
  getEquipmentList,
} from "@/services/exercisedb";

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
    
    // Check if this is an ExerciseDB API request
    const source = searchParams.get("source");
    
    if (source === "exercisedb") {
      return handleExerciseDBRequest(searchParams);
    }
    
    // Default: fetch exercise logs from Convex
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

/**
 * Handle ExerciseDB API requests
 * Query params:
 * - source=exercisedb (required to use ExerciseDB)
 * - action: "search" | "bodyPart" | "target" | "equipment" | "byId" | "list" | "bodyPartList" | "targetList" | "equipmentList"
 * - query: search term for name search
 * - bodyPart: body part filter
 * - target: target muscle filter
 * - equipment: equipment filter
 * - id: exercise ID
 * - limit: pagination limit (default 20)
 * - offset: pagination offset (default 0)
 */
async function handleExerciseDBRequest(searchParams: URLSearchParams) {
  try {
    const action = searchParams.get("action") || "list";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    switch (action) {
      case "search": {
        const query = searchParams.get("query");
        if (!query) {
          return NextResponse.json(
            { error: "Query parameter is required for search" },
            { status: 400 }
          );
        }
        const exercises = await getExercisesByName(query, { limit, offset });
        return NextResponse.json({ exercises, total: exercises.length });
      }

      case "bodyPart": {
        const bodyPart = searchParams.get("bodyPart");
        if (!bodyPart) {
          return NextResponse.json(
            { error: "bodyPart parameter is required" },
            { status: 400 }
          );
        }
        const exercises = await getExercisesByBodyPart(bodyPart, { limit, offset });
        return NextResponse.json({ exercises, total: exercises.length });
      }

      case "target": {
        const target = searchParams.get("target");
        if (!target) {
          return NextResponse.json(
            { error: "target parameter is required" },
            { status: 400 }
          );
        }
        const exercises = await getExercisesByTarget(target, { limit, offset });
        return NextResponse.json({ exercises, total: exercises.length });
      }

      case "equipment": {
        const equipment = searchParams.get("equipment");
        if (!equipment) {
          return NextResponse.json(
            { error: "equipment parameter is required" },
            { status: 400 }
          );
        }
        const exercises = await getExercisesByEquipment(equipment, { limit, offset });
        return NextResponse.json({ exercises, total: exercises.length });
      }

      case "byId": {
        const id = searchParams.get("id");
        if (!id) {
          return NextResponse.json(
            { error: "id parameter is required" },
            { status: 400 }
          );
        }
        const exercise = await getExerciseById(id);
        return NextResponse.json({ exercise });
      }

      case "bodyPartList": {
        const bodyParts = await getBodyPartList();
        return NextResponse.json({ bodyParts });
      }

      case "targetList": {
        const targets = await getTargetList();
        return NextResponse.json({ targets });
      }

      case "equipmentList": {
        const equipment = await getEquipmentList();
        return NextResponse.json({ equipment });
      }

      case "list":
      default: {
        const exercises = await getAllExercises({ limit, offset });
        return NextResponse.json({ exercises, total: exercises.length });
      }
    }
  } catch (error) {
    console.error("ExerciseDB API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises from ExerciseDB" },
      { status: 500 }
    );
  }
}
