"use client";

import { cn } from "@/lib/utils";
import {
  Flame,
  Dumbbell,
  Trophy,
  Target,
  CheckCircle2,
  Award,
} from "lucide-react";
import { z } from "zod";

const badgeChainSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  unit: z.string(),
  milestones: z.array(z.number()),
  currentValue: z.number(),
  earnedMilestones: z.array(z.number()),
  nextMilestone: z.number().nullable(),
  progressPercent: z.number(),
  isComplete: z.boolean(),
});

export const achievementCardSchema = z.object({
  badges: z.array(badgeChainSchema).describe("Badge chain progress data"),
  message: z.string().optional().describe("Optional message"),
});

type AchievementCardProps = z.infer<typeof achievementCardSchema>;

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  dumbbell: Dumbbell,
  trophy: Trophy,
  target: Target,
};

const CHAIN_COLORS: Record<string, { text: string; fill: string; dot: string }> = {
  workout_streak: {
    text: "text-orange-600 dark:text-orange-400",
    fill: "bg-orange-500",
    dot: "bg-orange-500 dark:bg-orange-400",
  },
  exercise_count: {
    text: "text-emerald-600 dark:text-emerald-400",
    fill: "bg-emerald-500",
    dot: "bg-emerald-500 dark:bg-emerald-400",
  },
  pr_count: {
    text: "text-yellow-600 dark:text-yellow-400",
    fill: "bg-yellow-500",
    dot: "bg-yellow-500 dark:bg-yellow-400",
  },
  variety: {
    text: "text-blue-600 dark:text-blue-400",
    fill: "bg-blue-500",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
};

function formatMilestone(milestone: number, unit: string): string {
  if (unit === "days") return `${milestone}d`;
  return `${milestone}`;
}

export function AchievementCard({ badges, message }: AchievementCardProps) {
  const completedCount = badges.filter((b) => b.isComplete).length;

  return (
    <div className="bg-fuchsia-50 dark:bg-fuchsia-950/30 border border-fuchsia-200 dark:border-fuchsia-800 rounded-lg p-4 my-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/50 flex items-center justify-center">
          <Award className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" aria-hidden="true" />
        </div>
        <div>
          <h4 className="font-semibold text-fuchsia-900 dark:text-fuchsia-100">
            Badges
          </h4>
          <p className="text-xs text-fuchsia-600 dark:text-fuchsia-400">
            {completedCount}/{badges.length} chains complete
          </p>
        </div>
      </div>

      {/* Chain Progress */}
      <div className="space-y-3">
        {badges.map((chain) => {
          const Icon = ICON_MAP[chain.icon] || Target;
          const colors = CHAIN_COLORS[chain.id] || CHAIN_COLORS.variety;

          return (
            <div key={chain.id} className="flex items-center gap-3">
              <Icon className={cn("w-4 h-4 shrink-0", colors.text)} aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-foreground">{chain.name}</span>
                  <span className={cn("text-xs font-bold tabular-nums", colors.text)}>
                    {chain.currentValue}{chain.unit === "days" ? "d" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {chain.milestones.map((m) => (
                    <div
                      key={m}
                      className={cn(
                        "w-2 h-2 rounded-full",
                        chain.currentValue >= m ? colors.dot : "bg-gray-300 dark:bg-gray-600"
                      )}
                    />
                  ))}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div
                    className={cn("h-1 rounded-full", colors.fill)}
                    style={{ width: `${chain.progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {chain.isComplete ? (
                    <span className={cn("flex items-center gap-0.5", colors.text)}>
                      <CheckCircle2 className="w-2.5 h-2.5" /> Complete!
                    </span>
                  ) : (
                    `Next: ${formatMilestone(chain.nextMilestone!, chain.unit)}`
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {message && (
        <p className="text-xs text-fuchsia-600 dark:text-fuchsia-400 mt-3">{message}</p>
      )}
    </div>
  );
}
