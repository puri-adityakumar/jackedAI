"use client";

import { ExerciseLogView } from "@/components/logs";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import {
  Dumbbell,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

type View = "log" | "prs";

function PRWall() {
  const allPRs = useQuery(api.personalRecords.getAllPRs);
  const prCount = useQuery(api.personalRecords.getPRCount);
  const recentPRs = useQuery(api.personalRecords.getRecentPRs, { limit: 5 });

  if (allPRs === undefined) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading personal records...
      </div>
    );
  }

  if (allPRs.length === 0) {
    return (
      <div className="p-8 text-center bg-card rounded-xl border border-border">
        <Trophy className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" aria-hidden="true" />
        <p className="text-muted-foreground">No personal records yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Log exercises with weights to start tracking PRs
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PR Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Total PRs</p>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 tabular-nums">{prCount?.totalPRs ?? 0}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Exercises</p>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 tabular-nums">{allPRs.length}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Recent PRs</p>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 tabular-nums">{recentPRs?.length ?? 0}</p>
          <p className="text-xs text-amber-500 dark:text-amber-400">last 30 days</p>
        </div>
      </div>

      {/* PR Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allPRs.map((pr) => (
          <div
            key={pr.exerciseName}
            className="bg-card rounded-xl border border-border p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <h4 className="font-semibold text-foreground capitalize">{pr.exerciseName}</h4>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {pr.maxWeight && (
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2 text-center">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mx-auto mb-1" aria-hidden="true" />
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-100 tabular-nums">
                    {pr.maxWeight.value}kg
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {pr.maxWeight.reps ? `${pr.maxWeight.reps} reps` : "max"}
                  </p>
                </div>
              )}
              {pr.estimated1RM && (
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2 text-center">
                  <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mx-auto mb-1" aria-hidden="true" />
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-100 tabular-nums">
                    {pr.estimated1RM.value}kg
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">est. 1RM</p>
                </div>
              )}
              {pr.maxVolume && (
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2 text-center">
                  <Dumbbell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mx-auto mb-1" aria-hidden="true" />
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-100 tabular-nums">
                    {pr.maxVolume.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">volume</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExercisePanel() {
  const [view, setView] = useState<View>("log");

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setView("log")}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            view === "log"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          )}
        >
          <Dumbbell className="w-4 h-4" aria-hidden="true" />
          Exercise Log
        </button>
        <button
          type="button"
          onClick={() => setView("prs")}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            view === "prs"
              ? "bg-amber-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-accent"
          )}
        >
          <Trophy className="w-4 h-4" aria-hidden="true" />
          Personal Records
        </button>
      </div>

      {view === "log" ? <ExerciseLogView /> : <PRWall />}
    </div>
  );
}
