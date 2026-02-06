import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (action === "active") {
      const active = await convex.query(api.activeWorkouts.getActive, {});
      return NextResponse.json(active);
    }

    if (action === "byId" && id) {
      const plan = await convex.query(api.workoutPlans.getById, { id: id as any });
      return NextResponse.json(plan);
    }

    if (action === "history" && id) {
      const history = await convex.query(api.activeWorkouts.getHistoryByPlan, {
        planId: id as any,
      });
      return NextResponse.json({ history });
    }

    if (action === "usageCount" && id) {
      const count = await convex.query(api.activeWorkouts.getPlanUsageCount, {
        planId: id as any,
      });
      return NextResponse.json({ count });
    }

    // Default: get all plans
    const plans = await convex.query(api.workoutPlans.getAll, {});

    // Get usage counts for each plan
    const plansWithUsage = await Promise.all(
      plans.map(async (plan) => {
        const count = await convex.query(api.activeWorkouts.getPlanUsageCount, {
          planId: plan._id,
        });
        return { ...plan, usageCount: count };
      })
    );

    return NextResponse.json({ plans: plansWithUsage });
  } catch (error) {
    console.error("Error fetching workout plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === "create") {
      const planId = await convex.mutation(api.workoutPlans.create, {
        name: body.name,
        description: body.description,
        exercises: body.exercises,
      });
      return NextResponse.json({ success: true, planId });
    }

    if (action === "start") {
      const result = await convex.mutation(api.activeWorkouts.start, {
        planId: body.planId,
      });
      return NextResponse.json({
        success: true,
        workoutId: result.workoutId,
        plan: result.plan,
      });
    }

    if (action === "logSet") {
      const result = await convex.mutation(api.activeWorkouts.logSet, {
        workoutId: body.workoutId,
        exerciseIndex: body.exerciseIndex,
        weight: body.weight,
        reps: body.reps,
      });
      return NextResponse.json({ success: true, ...result });
    }

    if (action === "logExercise") {
      const result = await convex.mutation(api.activeWorkouts.logExerciseFromPlan, {
        workoutId: body.workoutId,
        exerciseIndex: body.exerciseIndex,
        sets: body.sets,
        reps: body.reps,
        weight: body.weight,
        notes: body.notes,
      });
      return NextResponse.json({ success: true, ...result });
    }

    if (action === "complete") {
      const result = await convex.mutation(api.activeWorkouts.complete, {
        workoutId: body.workoutId,
      });
      return NextResponse.json({ success: true, ...result });
    }

    if (action === "abandon") {
      const result = await convex.mutation(api.activeWorkouts.abandon, {
        workoutId: body.workoutId,
      });
      return NextResponse.json({ success: true, ...result });
    }

    if (action === "duplicate") {
      const newPlanId = await convex.mutation(api.workoutPlans.duplicate, {
        id: body.id,
      });
      return NextResponse.json({ success: true, planId: newPlanId });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing workout plan:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    await convex.mutation(api.workoutPlans.update, {
      id: body.id,
      name: body.name,
      description: body.description,
      exercises: body.exercises,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating workout plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update workout plan" },
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

    await convex.mutation(api.workoutPlans.remove, { id: id as any });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete workout plan" },
      { status: 500 }
    );
  }
}
