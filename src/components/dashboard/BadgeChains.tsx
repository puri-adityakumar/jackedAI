"use client";

import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Flame, Dumbbell, Trophy, Target, CheckCircle2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  dumbbell: Dumbbell,
  trophy: Trophy,
  target: Target,
};

const CHAIN_COLORS: Record<string, { bg: string; fill: string; text: string; dot: string; border: string }> = {
  workout_streak: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    fill: "bg-orange-500 dark:bg-orange-400",
    text: "text-orange-600 dark:text-orange-400",
    dot: "bg-orange-500 dark:bg-orange-400",
    border: "border-orange-200 dark:border-orange-800",
  },
  exercise_count: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    fill: "bg-emerald-500 dark:bg-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500 dark:bg-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  pr_count: {
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    fill: "bg-yellow-500 dark:bg-yellow-400",
    text: "text-yellow-600 dark:text-yellow-400",
    dot: "bg-yellow-500 dark:bg-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  variety: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    fill: "bg-blue-500 dark:bg-blue-400",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500 dark:bg-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
};

function formatValue(value: number, unit: string): string {
  if (unit === "days") return `${value}d`;
  if (unit === "groups") return `${value}`;
  return `${value}`;
}

function formatMilestone(milestone: number, unit: string): string {
  if (unit === "days") return `${milestone}d`;
  return `${milestone}`;
}

interface ChainData {
  id: string;
  name: string;
  icon: string;
  unit: string;
  milestones: number[];
  currentValue: number;
  earnedMilestones: number[];
  nextMilestone: number | null;
  progressPercent: number;
  isComplete: boolean;
}

function BadgeChainCard({ chain }: { chain: ChainData }) {
  const Icon = ICON_MAP[chain.icon] || Target;
  const colors = CHAIN_COLORS[chain.id] || CHAIN_COLORS.variety;

  return (
    <div className={cn("rounded-xl border p-4 shadow-sm", colors.bg, colors.border)}>
      {/* Header: icon + name + current value */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", colors.text)} aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">{chain.name}</span>
        </div>
        <span className={cn("text-sm font-bold tabular-nums", colors.text)}>
          {formatValue(chain.currentValue, chain.unit)}
        </span>
      </div>

      {/* Milestone dots */}
      <div className="flex items-center gap-1.5 mb-3">
        {chain.milestones.map((milestone) => {
          const earned = chain.currentValue >= milestone;
          return (
            <div key={milestone} className="flex flex-col items-center gap-0.5">
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  earned ? colors.dot : "bg-gray-300 dark:bg-gray-600"
                )}
              />
              <span className="text-[9px] tabular-nums text-muted-foreground leading-none">
                {formatMilestone(milestone, chain.unit)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
        <div
          className={cn("h-1.5 rounded-full transition-all", colors.fill)}
          style={{ width: `${chain.progressPercent}%` }}
        />
      </div>

      {/* Next target */}
      {chain.isComplete ? (
        <div className="flex items-center gap-1">
          <CheckCircle2 className={cn("w-3 h-3", colors.text)} aria-hidden="true" />
          <span className={cn("text-xs font-medium", colors.text)}>Complete!</span>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Next: {formatMilestone(chain.nextMilestone!, chain.unit)}
          {chain.unit === "days" ? "" : chain.unit ? ` ${chain.unit}` : ""}
        </p>
      )}
    </div>
  );
}

export function BadgeChains() {
  const badges = useQuery(api.achievements.getBadgeProgress);

  if (!badges) {
    return (
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Badges</h3>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4 shadow-sm animate-pulse h-28"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Badges</h3>
      <div className="grid grid-cols-2 gap-3">
        {badges.map((chain) => (
          <BadgeChainCard key={chain.id} chain={chain} />
        ))}
      </div>
    </section>
  );
}
