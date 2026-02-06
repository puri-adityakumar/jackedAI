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
    bg: "bg-primary/5",
    fill: "bg-primary",
    text: "text-primary",
    dot: "bg-primary",
    border: "border-primary/20 dark:border-primary/30",
  },
  exercise_count: {
    bg: "bg-primary/5",
    fill: "bg-primary",
    text: "text-primary",
    dot: "bg-primary",
    border: "border-primary/20 dark:border-primary/30",
  },
  pr_count: {
    bg: "bg-primary/5",
    fill: "bg-primary",
    text: "text-primary",
    dot: "bg-primary",
    border: "border-primary/20 dark:border-primary/30",
  },
  variety: {
    bg: "bg-primary/5",
    fill: "bg-primary",
    text: "text-primary",
    dot: "bg-primary",
    border: "border-primary/20 dark:border-primary/30",
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
    <div className={cn("border-2 p-4", colors.bg, colors.border)}>
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
                  earned ? colors.dot : "bg-muted-foreground/30"
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
      <div className="w-full bg-muted h-1.5 mb-2">
        <div
          className={cn("h-1.5 transition-all", colors.fill)}
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
              className="border-2 border-border bg-card p-4 animate-pulse h-28"
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
