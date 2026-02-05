import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Constants
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 60 * 1000; // 5 hours

// Simple hash function using Web Crypto API compatible approach
// In a real production app, you'd use bcrypt or similar
async function hashPin(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Get PIN status (is enabled, is locked, remaining time, attempts left)
export const getPinStatus = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("userProfile").collect();
    const profile = profiles[0];

    if (!profile) {
      return {
        enabled: false,
        isLocked: false,
        lockoutRemainingMs: 0,
        attemptsRemaining: MAX_ATTEMPTS,
      };
    }

    const now = Date.now();
    const isLocked =
      profile.pinLockedUntil !== undefined && profile.pinLockedUntil > now;
    const lockoutRemainingMs = isLocked
      ? (profile.pinLockedUntil as number) - now
      : 0;
    const attemptsRemaining =
      MAX_ATTEMPTS - (profile.pinFailedAttempts ?? 0);

    return {
      enabled: profile.pinEnabled ?? false,
      isLocked,
      lockoutRemainingMs,
      attemptsRemaining: Math.max(0, attemptsRemaining),
    };
  },
});

// Set up a new PIN (or change existing)
export const setPin = mutation({
  args: {
    pin: v.string(),
    currentPin: v.optional(v.string()), // Required if PIN already exists
  },
  handler: async (ctx, args) => {
    // Validate PIN format (6 digits)
    if (!/^\d{6}$/.test(args.pin)) {
      throw new Error("PIN must be exactly 6 digits");
    }

    const profiles = await ctx.db.query("userProfile").collect();
    const profile = profiles[0];

    if (!profile) {
      throw new Error("No profile found");
    }

    // If PIN already exists, verify current PIN first
    if (profile.pinEnabled && profile.pinHash && profile.pinSalt) {
      if (!args.currentPin) {
        throw new Error("Current PIN required to change PIN");
      }

      const currentHash = await hashPin(args.currentPin, profile.pinSalt);
      if (currentHash !== profile.pinHash) {
        throw new Error("Current PIN is incorrect");
      }
    }

    // Generate new salt and hash
    const salt = generateSalt();
    const hash = await hashPin(args.pin, salt);

    await ctx.db.patch(profile._id, {
      pinHash: hash,
      pinSalt: salt,
      pinEnabled: true,
      pinFailedAttempts: 0,
      pinLockedUntil: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Remove PIN protection
export const removePin = mutation({
  args: {
    currentPin: v.string(),
  },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("userProfile").collect();
    const profile = profiles[0];

    if (!profile) {
      throw new Error("No profile found");
    }

    if (!profile.pinEnabled || !profile.pinHash || !profile.pinSalt) {
      throw new Error("PIN is not enabled");
    }

    // Check if locked
    const now = Date.now();
    if (profile.pinLockedUntil && profile.pinLockedUntil > now) {
      const remainingMs = profile.pinLockedUntil - now;
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      throw new Error(
        `Account locked. Try again in ${remainingMinutes} minutes.`
      );
    }

    // Verify current PIN
    const hash = await hashPin(args.currentPin, profile.pinSalt);
    if (hash !== profile.pinHash) {
      // Increment failed attempts
      const newAttempts = (profile.pinFailedAttempts ?? 0) + 1;

      if (newAttempts >= MAX_ATTEMPTS) {
        await ctx.db.patch(profile._id, {
          pinFailedAttempts: newAttempts,
          pinLockedUntil: now + LOCKOUT_DURATION_MS,
          updatedAt: now,
        });
        throw new Error("Too many failed attempts. Account locked for 5 hours.");
      }

      await ctx.db.patch(profile._id, {
        pinFailedAttempts: newAttempts,
        updatedAt: now,
      });

      throw new Error(
        `Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`
      );
    }

    // PIN correct - remove it
    await ctx.db.patch(profile._id, {
      pinHash: undefined,
      pinSalt: undefined,
      pinEnabled: false,
      pinFailedAttempts: 0,
      pinLockedUntil: undefined,
      updatedAt: now,
    });

    return { success: true };
  },
});

// Verify PIN on app startup
export const verifyPin = mutation({
  args: {
    pin: v.string(),
  },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("userProfile").collect();
    const profile = profiles[0];

    if (!profile) {
      throw new Error("No profile found");
    }

    if (!profile.pinEnabled || !profile.pinHash || !profile.pinSalt) {
      return { success: true, message: "PIN not enabled" };
    }

    const now = Date.now();

    // Check if locked
    if (profile.pinLockedUntil && profile.pinLockedUntil > now) {
      const remainingMs = profile.pinLockedUntil - now;
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      throw new Error(
        `Account locked. Try again in ${remainingMinutes} minutes.`
      );
    }

    // Verify PIN
    const hash = await hashPin(args.pin, profile.pinSalt);

    if (hash !== profile.pinHash) {
      // Increment failed attempts
      const newAttempts = (profile.pinFailedAttempts ?? 0) + 1;

      if (newAttempts >= MAX_ATTEMPTS) {
        await ctx.db.patch(profile._id, {
          pinFailedAttempts: newAttempts,
          pinLockedUntil: now + LOCKOUT_DURATION_MS,
          updatedAt: now,
        });
        throw new Error("Too many failed attempts. Account locked for 5 hours.");
      }

      await ctx.db.patch(profile._id, {
        pinFailedAttempts: newAttempts,
        updatedAt: now,
      });

      throw new Error(
        `Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`
      );
    }

    // PIN correct - reset failed attempts
    await ctx.db.patch(profile._id, {
      pinFailedAttempts: 0,
      pinLockedUntil: undefined,
      updatedAt: now,
    });

    return { success: true };
  },
});

// Clear lockout (admin/manual use via Convex dashboard)
export const clearLock = mutation({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("userProfile").collect();
    const profile = profiles[0];

    if (!profile) {
      throw new Error("No profile found");
    }

    await ctx.db.patch(profile._id, {
      pinFailedAttempts: 0,
      pinLockedUntil: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
