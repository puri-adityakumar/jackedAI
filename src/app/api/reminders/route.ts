import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { NextRequest, NextResponse } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type ReminderCategory = "medicine" | "supplement" | "workout" | "meal" | "water" | "custom";
type ReminderFrequency = "once" | "daily" | "weekly" | "monthly";
type ReminderStatus = "completed" | "missed" | "skipped" | "snoozed";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action") || "today";
  const date = searchParams.get("date");
  const category = searchParams.get("category") as ReminderCategory | null;
  const reminderId = searchParams.get("id");

  try {
    switch (action) {
      case "today": {
        const reminders = await convex.query(api.reminders.getTodayReminders, {
          date: date || undefined,
        });
        return NextResponse.json({ reminders, total: reminders.length });
      }

      case "all": {
        const reminders = await convex.query(api.reminders.getAll);
        return NextResponse.json({ reminders, total: reminders.length });
      }

      case "active": {
        const reminders = await convex.query(api.reminders.getActive);
        return NextResponse.json({ reminders, total: reminders.length });
      }

      case "category": {
        if (!category) {
          return NextResponse.json({ error: "Category required" }, { status: 400 });
        }
        const reminders = await convex.query(api.reminders.getByCategory, { category });
        return NextResponse.json({ reminders, total: reminders.length });
      }

      case "needsRefill": {
        const reminders = await convex.query(api.reminders.getNeedingRefill);
        return NextResponse.json({ reminders, total: reminders.length });
      }

      case "byId": {
        if (!reminderId) {
          return NextResponse.json({ error: "Reminder ID required" }, { status: 400 });
        }
        const reminder = await convex.query(api.reminders.getById, {
          id: reminderId as Id<"reminders">,
        });
        return NextResponse.json({ reminder });
      }

      case "adherence": {
        if (!reminderId) {
          return NextResponse.json({ error: "Reminder ID required" }, { status: 400 });
        }
        const days = searchParams.get("days");
        const adherence = await convex.query(api.reminders.getAdherence, {
          reminderId: reminderId as Id<"reminders">,
          days: days ? parseInt(days) : undefined,
        });
        return NextResponse.json(adherence);
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Reminder GET error:", error);
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      customCategoryName,
      frequency,
      time,
      repeatDays,
      dayOfMonth,
      startDate,
      endDate,
      trackInventory,
      quantityRemaining,
      refillThreshold,
    } = body;

    if (!title || !category || !frequency || !time || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields: title, category, frequency, time, startDate" },
        { status: 400 }
      );
    }

    const reminderId = await convex.mutation(api.reminders.create, {
      title,
      description,
      category: category as ReminderCategory,
      customCategoryName,
      frequency: frequency as ReminderFrequency,
      time,
      repeatDays,
      dayOfMonth,
      startDate,
      endDate,
      trackInventory,
      quantityRemaining,
      refillThreshold,
    });

    return NextResponse.json({
      success: true,
      reminderId,
      message: `Reminder "${title}" created successfully`,
    });
  } catch (error) {
    console.error("Reminder POST error:", error);
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Reminder ID required" }, { status: 400 });
    }

    const reminderId = id as Id<"reminders">;

    switch (action) {
      case "complete":
      case "skip":
      case "snooze": {
        const today = new Date().toISOString().split("T")[0];
        const status: ReminderStatus = action === "complete" ? "completed" : action === "skip" ? "skipped" : "snoozed";
        
        await convex.mutation(api.reminders.logCompletion, {
          reminderId,
          date: data.date || today,
          scheduledTime: data.scheduledTime || "00:00",
          status,
          notes: data.notes,
        });

        return NextResponse.json({
          success: true,
          status,
          message: `Reminder marked as ${status}`,
        });
      }

      case "togglePause": {
        await convex.mutation(api.reminders.togglePause, { id: reminderId });
        return NextResponse.json({ success: true, message: "Reminder pause toggled" });
      }

      case "updateInventory": {
        await convex.mutation(api.reminders.updateInventory, {
          id: reminderId,
          quantity: data.quantity,
        });
        return NextResponse.json({ success: true, message: "Inventory updated" });
      }

      case "update":
      default: {
        await convex.mutation(api.reminders.update, {
          id: reminderId,
          ...data,
        });
        return NextResponse.json({ success: true, message: "Reminder updated" });
      }
    }
  } catch (error) {
    console.error("Reminder PUT error:", error);
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Reminder ID required" }, { status: 400 });
  }

  try {
    await convex.mutation(api.reminders.remove, { id: id as Id<"reminders"> });
    return NextResponse.json({ success: true, message: "Reminder deleted" });
  } catch (error) {
    console.error("Reminder DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete reminder" }, { status: 500 });
  }
}
