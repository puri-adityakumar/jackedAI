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
    <div className="bg-primary/5 border-2 border-primary/20 dark:border-primary/30 p-4 my-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Trophy className="w-5 h-5 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">
              Personal Records
            </h4>
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary tabular-nums">
              {totalCount} PR{totalCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* PR list */}
          <div className="mt-3 space-y-3">
            {records.map((record, index) => (
              <div
                key={index}
                className="bg-card border border-border p-2.5"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  <span className="font-medium text-sm text-foreground capitalize">
                    {record.exerciseName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  {record.maxWeight && (
                    <div className="flex items-center gap-1 text-foreground">
                      <TrendingUp className="w-3 h-3" aria-hidden="true" />
                      <span className="tabular-nums">
                        {record.maxWeight.value}kg
                        {record.maxWeight.reps ? ` x ${record.maxWeight.reps}` : ""}
                      </span>
                    </div>
                  )}
                  {record.estimated1RM && (
                    <div className="text-muted-foreground tabular-nums">
                      Est. 1RM: {record.estimated1RM.value}kg
                    </div>
                  )}
                  {record.maxVolume && (
                    <div className="text-muted-foreground tabular-nums">
                      Vol: {record.maxVolume.value.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {message && (
            <p className="text-xs text-muted-foreground mt-3">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
