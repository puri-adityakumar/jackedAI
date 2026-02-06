/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as achievements from "../achievements.js";
import type * as activeWorkouts from "../activeWorkouts.js";
import type * as bodyStats from "../bodyStats.js";
import type * as exerciseLogs from "../exerciseLogs.js";
import type * as mealLogs from "../mealLogs.js";
import type * as personalRecords from "../personalRecords.js";
import type * as pinProtection from "../pinProtection.js";
import type * as reminders from "../reminders.js";
import type * as userProfile from "../userProfile.js";
import type * as weeklyReport from "../weeklyReport.js";
import type * as workoutPlans from "../workoutPlans.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  activeWorkouts: typeof activeWorkouts;
  bodyStats: typeof bodyStats;
  exerciseLogs: typeof exerciseLogs;
  mealLogs: typeof mealLogs;
  personalRecords: typeof personalRecords;
  pinProtection: typeof pinProtection;
  reminders: typeof reminders;
  userProfile: typeof userProfile;
  weeklyReport: typeof weeklyReport;
  workoutPlans: typeof workoutPlans;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
