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

function formatMilestone(milestone: number, unit: string): string {
  if (unit === "days") return `${milestone}d`;
  return `${milestone}`;
}

export function AchievementCard({ badges, message }: AchievementCardProps) {
  const completedCount = badges.filter((b) => b.isComplete).length;

  return (
    <div className="bg-primary/5 border-2 border-primary/20 dark:border-primary/30 p-4 my-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
          <Award className="w-5 h-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">
            Badges
          </h4>
          <p className="text-xs text-primary">
            {completedCount}/{badges.length} chains complete
          </p>
        </div>
      </div>

      {/* Chain Progress */}
      <div className="space-y-3">
        {badges.map((chain) => {
          const Icon = ICON_MAP[chain.icon] || Target;

          return (
            <div key={chain.id} className="flex items-center gap-3">
              <Icon className="w-4 h-4 shrink-0 text-primary" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-foreground">{chain.name}</span>
                  <span className="text-xs font-bold tabular-nums text-primary">
                    {chain.currentValue}{chain.unit === "days" ? "d" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {chain.milestones.map((m) => (
                    <div
                      key={m}
                      className={cn(
                        "w-2 h-2 rounded-full",
                        chain.currentValue >= m ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
                <div className="w-full bg-muted h-1">
                  <div
                    className="h-1 bg-primary"
                    style={{ width: `${chain.progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {chain.isComplete ? (
                    <span className="flex items-center gap-0.5 text-primary">
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
        <p className="text-xs text-muted-foreground mt-3">{message}</p>
      )}
    </div>
  );
}
