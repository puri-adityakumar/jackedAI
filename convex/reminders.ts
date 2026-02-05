import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const categoryValidator = v.union(
  v.literal("medicine"),
  v.literal("supplement"),
  v.literal("workout"),
  v.literal("meal"),
  v.literal("water"),
  v.literal("custom")
);

const frequencyValidator = v.union(
  v.literal("once"),
  v.literal("daily"),
  v.literal("weekly"),
  v.literal("monthly")
);

const statusValidator = v.union(
  v.literal("completed"),
  v.literal("missed"),
  v.literal("skipped"),
  v.literal("snoozed")
);

// Create a new reminder
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: categoryValidator,
    customCategoryName: v.optional(v.string()),
    frequency: frequencyValidator,
    time: v.string(),
    repeatDays: v.optional(v.array(v.string())),
    dayOfMonth: v.optional(v.number()),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    trackInventory: v.optional(v.boolean()),
    quantityRemaining: v.optional(v.number()),
    refillThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const reminderId = await ctx.db.insert("reminders", {
      ...args,
      isActive: true,
      isPaused: false,
      createdAt: Date.now(),
    });
    return reminderId;
  },
});

// Update an existing reminder
export const update = mutation({
  args: {
    id: v.id("reminders"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(categoryValidator),
    customCategoryName: v.optional(v.string()),
    frequency: v.optional(frequencyValidator),
    time: v.optional(v.string()),
    repeatDays: v.optional(v.array(v.string())),
    dayOfMonth: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    trackInventory: v.optional(v.boolean()),
    quantityRemaining: v.optional(v.number()),
    refillThreshold: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    isPaused: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(id, { ...filteredUpdates, updatedAt: Date.now() });
  },
});

// Delete a reminder
export const remove = mutation({
  args: { id: v.id("reminders") },
  handler: async (ctx, args) => {
    // Also delete all associated logs
    const logs = await ctx.db
      .query("reminderLogs")
      .withIndex("by_reminder", (q) => q.eq("reminderId", args.id))
      .collect();
    
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }
    
    await ctx.db.delete(args.id);
  },
});

// Get all reminders
export const getAll = query({
  handler: async (ctx) => {
    const reminders = await ctx.db
      .query("reminders")
      .order("desc")
      .collect();
    return reminders;
  },
});

// Get active reminders
export const getActive = query({
  handler: async (ctx) => {
    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    return reminders.filter((r) => !r.isPaused);
  },
});

// Get reminders by category
export const getByCategory = query({
  args: { category: categoryValidator },
  handler: async (ctx, args) => {
    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
    return reminders;
  },
});

// Get a single reminder by ID
export const getById = query({
  args: { id: v.id("reminders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get today's reminders (scheduled for today based on frequency)
export const getTodayReminders = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const today = args.date || new Date().toISOString().split("T")[0];
    const dayOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][
      new Date(today).getDay()
    ];
    const dayOfMonth = new Date(today).getDate();

    const allReminders = await ctx.db
      .query("reminders")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Filter reminders that should trigger today
    const todayReminders = allReminders.filter((reminder) => {
      if (reminder.isPaused) return false;
      
      // Check date range
      if (reminder.startDate > today) return false;
      if (reminder.endDate && reminder.endDate < today) return false;

      switch (reminder.frequency) {
        case "once":
          return reminder.startDate === today;
        case "daily":
          return true;
        case "weekly":
          return reminder.repeatDays?.includes(dayOfWeek) ?? false;
        case "monthly":
          return reminder.dayOfMonth === dayOfMonth;
        default:
          return false;
      }
    });

    // Get today's logs to check completion status
    const todayLogs = await ctx.db
      .query("reminderLogs")
      .withIndex("by_date", (q) => q.eq("date", today))
      .collect();

    // Enrich reminders with today's status
    return todayReminders.map((reminder) => {
      const log = todayLogs.find((l) => l.reminderId === reminder._id);
      return {
        ...reminder,
        todayStatus: log?.status || "pending",
        todayLogId: log?._id,
      };
    }).sort((a, b) => a.time.localeCompare(b.time));
  },
});

// Toggle reminder pause state
export const togglePause = mutation({
  args: { id: v.id("reminders") },
  handler: async (ctx, args) => {
    const reminder = await ctx.db.get(args.id);
    if (!reminder) throw new Error("Reminder not found");
    
    await ctx.db.patch(args.id, {
      isPaused: !reminder.isPaused,
      updatedAt: Date.now(),
    });
  },
});

// Update inventory quantity
export const updateInventory = mutation({
  args: {
    id: v.id("reminders"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      quantityRemaining: args.quantity,
      updatedAt: Date.now(),
    });
  },
});

// Decrement inventory (when completing a reminder)
export const decrementInventory = mutation({
  args: { id: v.id("reminders") },
  handler: async (ctx, args) => {
    const reminder = await ctx.db.get(args.id);
    if (!reminder || !reminder.trackInventory) return;
    
    const newQuantity = Math.max(0, (reminder.quantityRemaining || 0) - 1);
    await ctx.db.patch(args.id, {
      quantityRemaining: newQuantity,
      updatedAt: Date.now(),
    });
    
    return {
      newQuantity,
      needsRefill: reminder.refillThreshold
        ? newQuantity <= reminder.refillThreshold
        : false,
    };
  },
});

// Get reminders that need refill
export const getNeedingRefill = query({
  handler: async (ctx) => {
    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return reminders.filter((r) => {
      if (!r.trackInventory || !r.refillThreshold) return false;
      return (r.quantityRemaining || 0) <= r.refillThreshold;
    });
  },
});

// Log a reminder completion/skip/snooze
export const logCompletion = mutation({
  args: {
    reminderId: v.id("reminders"),
    date: v.string(),
    scheduledTime: v.string(),
    status: statusValidator,
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if log already exists for this reminder/date
    const existingLogs = await ctx.db
      .query("reminderLogs")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    const existingLog = existingLogs.find(
      (l) => l.reminderId === args.reminderId
    );

    if (existingLog) {
      // Update existing log
      await ctx.db.patch(existingLog._id, {
        status: args.status,
        completedAt: args.status === "completed" ? Date.now() : undefined,
        notes: args.notes,
      });
      return existingLog._id;
    }

    // Create new log
    const logId = await ctx.db.insert("reminderLogs", {
      reminderId: args.reminderId,
      date: args.date,
      scheduledTime: args.scheduledTime,
      status: args.status,
      completedAt: args.status === "completed" ? Date.now() : undefined,
      notes: args.notes,
      createdAt: Date.now(),
    });

    // Update last triggered timestamp
    await ctx.db.patch(args.reminderId, {
      lastTriggered: Date.now(),
    });

    // Decrement inventory if completed and tracking
    if (args.status === "completed") {
      const reminder = await ctx.db.get(args.reminderId);
      if (reminder?.trackInventory && reminder.quantityRemaining !== undefined) {
        await ctx.db.patch(args.reminderId, {
          quantityRemaining: Math.max(0, reminder.quantityRemaining - 1),
        });
      }
    }

    return logId;
  },
});

// Get logs for a specific reminder
export const getLogsByReminder = query({
  args: {
    reminderId: v.id("reminders"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 30;
    const logs = await ctx.db
      .query("reminderLogs")
      .withIndex("by_reminder", (q) => q.eq("reminderId", args.reminderId))
      .order("desc")
      .take(limit);
    return logs;
  },
});

// Get logs for a specific date
export const getLogsByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("reminderLogs")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
    return logs;
  },
});

// Get adherence stats for a reminder
export const getAdherence = query({
  args: {
    reminderId: v.id("reminders"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days ?? 30;
    const logs = await ctx.db
      .query("reminderLogs")
      .withIndex("by_reminder", (q) => q.eq("reminderId", args.reminderId))
      .order("desc")
      .take(days);

    const completed = logs.filter((l) => l.status === "completed").length;
    const missed = logs.filter((l) => l.status === "missed").length;
    const skipped = logs.filter((l) => l.status === "skipped").length;
    const total = logs.length;

    return {
      completed,
      missed,
      skipped,
      total,
      adherenceRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },
});
