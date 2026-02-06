"use client";

import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, Dumbbell } from "lucide-react";
import { z } from "zod";

const prRecordSchema = z.object({
  exerciseName: z.string(),
  maxWeight: z
    .object({
      value: z.number(),
      reps: z.number().optional(),
      date: z.string(),
    })
    .optional(),
  maxVolume: z
    .object({
      value: z.number(),
      date: z.string(),
    })
    .optional(),
  estimated1RM: z
    .object({
      value: z.number(),
      date: z.string(),
    })
    .optional(),
});

export const prCardSchema = z.object({
  records: z.array(prRecordSchema).describe("List of personal records"),
  totalCount: z.number().describe("Total number of exercises with PRs"),
  message: z.string().optional().describe("Optional message"),
});

type PRCardProps = z.infer<typeof prCardSchema>;

export function PRCard({ records, totalCount, message }: PRCardProps) {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 my-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
          <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100">
              Personal Records
            </h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 tabular-nums">
              {totalCount} PR{totalCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* PR list */}
          <div className="mt-3 space-y-3">
            {records.map((record, index) => (
              <div
                key={index}
                className="bg-white/60 dark:bg-white/5 rounded-md p-2.5 border border-amber-100 dark:border-amber-800/50"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <span className="font-medium text-sm text-amber-900 dark:text-amber-100 capitalize">
                    {record.exerciseName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  {record.maxWeight && (
                    <div className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
                      <TrendingUp className="w-3 h-3" aria-hidden="true" />
                      <span className="tabular-nums">
                        {record.maxWeight.value}kg
                        {record.maxWeight.reps ? ` x ${record.maxWeight.reps}` : ""}
                      </span>
                    </div>
                  )}
                  {record.estimated1RM && (
                    <div className="text-amber-600 dark:text-amber-400 tabular-nums">
                      Est. 1RM: {record.estimated1RM.value}kg
                    </div>
                  )}
                  {record.maxVolume && (
                    <div className="text-amber-600 dark:text-amber-400 tabular-nums">
                      Vol: {record.maxVolume.value.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {message && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
