"use client";

import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { format, subDays, startOfWeek } from "date-fns";
import {
  BarChart3,
  Flame,
  Utensils,
  Bell,
  Lightbulb,
  Scale,
  TrendingDown,
  TrendingUp,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../../../convex/_generated/api";
import { BadgeChains } from "./BadgeChains";
import { StatsCard } from "./StatsCard";
import { WeeklyChart } from "./WeeklyChart";

const GRADE_COLORS: Record<string, string> = {
  A: "text-primary bg-primary/10",
  B: "text-primary/80 bg-primary/10",
  C: "text-muted-foreground bg-muted",
  D: "text-destructive bg-destructive/10",
  F: "text-destructive bg-destructive/10",
};

function MacroBar({
  label,
  consumed,
  target,
  unit,
}: {
  label: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
}) {
  const progress = target > 0 ? Math.min(Math.round((consumed / target) * 100), 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {consumed}{unit} / {target}{unit}
        </span>
      </div>
      <div className="h-2 bg-muted overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 text-sm font-bold",
        GRADE_COLORS[grade] || GRADE_COLORS.F
      )}
    >
      {grade}
    </span>
  );
}

function LogWeightModal({
  onClose,
  onSave,
  isSaving,
}: {
  onClose: () => void;
  onSave: (weight: number, date: string, notes: string) => void;
  isSaving: boolean;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!w || w <= 0) return;
    onSave(w, date, notes);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-card w-full max-w-sm mx-4 border-2 border-border"
        role="dialog"
        aria-labelledby="log-weight-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 id="log-weight-title" className="text-lg font-semibold text-foreground">
              Log Weight
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Close"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-foreground mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background text-foreground tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
              placeholder="e.g. 75.5"
              step={0.1}
              min={20}
              max={300}
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="log-date" className="block text-sm font-medium text-foreground mb-1">
              Date
            </label>
            <input
              type="date"
              id="log-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background text-foreground tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="log-notes" className="block text-sm font-medium text-foreground mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              id="log-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
              placeholder="Morning weigh-in..."
              autoComplete="off"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border bg-card text-foreground hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !weight}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Log Weight"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WeightSection() {
  const [showLogModal, setShowLogModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const latest = useQuery(api.bodyStats.getLatest);
  const trend = useQuery(api.bodyStats.getTrends, { metric: "weight", period: "3months" });
  const createStats = useMutation(api.bodyStats.create);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const chartData = useMemo(() => {
    if (!trend?.data) return [];
    return trend.data.map((d) => ({
      date: d.date,
      weight: d.value,
    }));
  }, [trend]);

  const handleSave = async (weight: number, date: string, notes: string) => {
    setIsSaving(true);
    try {
      await createStats({ date, weight, notes: notes || undefined });
      setShowLogModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  const currentWeight = latest?.weight;
  const weightChange = trend?.stats?.change;

  const lineColor = isDark ? "#34d399" : "#10b981";
  const tickColor = isDark ? "hsl(0 0% 63.9%)" : "hsl(0 0% 45.1%)";
  const tooltipBg = isDark ? "hsl(0 0% 14.9%)" : "hsl(0 0% 100%)";
  const tooltipBorder = isDark ? "hsl(0 0% 27%)" : "hsl(0 0% 89.8%)";

  return (
    <>
      <section className="bg-primary/5 border-2 border-primary/20 dark:border-primary/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Weight</h3>
              {latest && (
                <p className="text-xs text-primary">
                  Last logged: {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(latest.date))}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Log
          </button>
        </div>

        {/* Current weight + change */}
        <div className="flex items-end gap-4 mb-4">
          {currentWeight != null ? (
            <>
              <p className="text-3xl font-bold text-foreground tabular-nums">
                {currentWeight}<span className="text-lg font-medium text-primary ml-0.5">kg</span>
              </p>
              {weightChange != null && Math.abs(weightChange) >= 0.01 && (
                <div className={cn(
                  "inline-flex items-center gap-1 text-sm font-medium pb-1",
                  weightChange > 0 ? "text-destructive" : "text-primary"
                )}>
                  {weightChange > 0 ? (
                    <TrendingUp className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <TrendingDown className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span className="tabular-nums">{weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)}kg</span>
                  <span className="text-xs text-muted-foreground">3mo</span>
                </div>
              )}
              {weightChange != null && Math.abs(weightChange) < 0.01 && (
                <div className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground pb-1">
                  <Minus className="w-4 h-4" aria-hidden="true" />
                  <span>No change</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">No weight logged yet</p>
          )}
        </div>

        {/* Mini chart */}
        {chartData.length >= 2 && (
          <div className="h-[120px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: tickColor, fontSize: 10 }}
                  tickFormatter={(d: string) => {
                    const date = new Date(d);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: tickColor, fontSize: 10 }}
                  width={40}
                  tickFormatter={(v: number) => `${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: "0px",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)} kg`, "Weight"]}
                  labelFormatter={(d: string) =>
                    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d))
                  }
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ fill: lineColor, strokeWidth: 2, stroke: tooltipBg, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {showLogModal && (
        <LogWeightModal
          onClose={() => setShowLogModal(false)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
    </>
  );
}

export function DashboardPanel() {
  const { today, weekAgo, weekStart } = useMemo(() => {
    const now = new Date();
    return {
      today: format(now, "yyyy-MM-dd"),
      weekAgo: format(subDays(now, 6), "yyyy-MM-dd"),
      weekStart: format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
    };
  }, []);

  const profile = useQuery(api.userProfile.get);
  const todayExercises = useQuery(api.exerciseLogs.getByDate, { date: today });
  const todayMeals = useQuery(api.mealLogs.getDailySummary, { date: today });
  const weekExercises = useQuery(api.exerciseLogs.getWeekSummary, {
    startDate: weekAgo,
    endDate: today,
  });
  const weekMeals = useQuery(api.mealLogs.getWeekSummary, {
    startDate: weekAgo,
    endDate: today,
  });
  const weeklyReport = useQuery(api.weeklyReport.getWeeklyReport, {
    weekStart,
  });

  const calorieTarget = profile?.dailyCalorieTarget ?? 2000;
  const proteinTarget = profile?.proteinTarget ?? 150;
  const carbsTarget = profile?.carbsTarget ?? 250;
  const fatTarget = profile?.fatTarget ?? 65;
  const caloriesConsumed = todayMeals?.totalCalories ?? 0;
  const proteinConsumed = todayMeals?.totalProtein ?? 0;
  const carbsConsumed = todayMeals?.totalCarbs ?? 0;
  const fatConsumed = todayMeals?.totalFat ?? 0;
  const exerciseCount = todayExercises?.length ?? 0;

  const calorieProgress = Math.min(
    Math.round((caloriesConsumed / calorieTarget) * 100),
    100
  );

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-foreground tracking-tight text-pretty">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          {profile?.name ? `Welcome back, ${profile.name}!` : "Your daily overview"}
        </p>
      </header>

      {/* Stats Cards */}
      <section aria-label="Today's statistics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Calories"
            value={`${caloriesConsumed.toLocaleString()}`}
            subtitle={`of ${calorieTarget.toLocaleString()} target`}
            progress={calorieProgress}
          />
          <StatsCard
            title="Protein"
            value={`${proteinConsumed}g`}
            subtitle={`of ${proteinTarget}g target`}
            progress={proteinTarget > 0 ? Math.min(Math.round((proteinConsumed / proteinTarget) * 100), 100) : undefined}
          />
          <StatsCard
            title="Exercises"
            value={`${exerciseCount}`}
            subtitle="completed today"
          />
          <StatsCard
            title="Goal"
            value={
              profile?.fitnessGoal === "lose_weight"
                ? "Lose Weight"
                : profile?.fitnessGoal === "build_muscle"
                  ? "Build Muscle"
                  : "Maintain"
            }
            subtitle={profile ? "Keep it up!" : "Set your goal"}
          />
        </div>
      </section>

      {/* Badge Chains */}
      <BadgeChains />

      {/* Macro Tracking */}
      <section className="bg-card border-2 border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 text-pretty">
          Today&apos;s Macros
        </h3>
        <div className="space-y-3">
          <MacroBar label="Protein" consumed={proteinConsumed} target={proteinTarget} unit="g" color="bg-primary" />
          <MacroBar label="Carbs" consumed={carbsConsumed} target={carbsTarget} unit="g" color="bg-primary" />
          <MacroBar label="Fat" consumed={fatConsumed} target={fatTarget} unit="g" color="bg-primary" />
        </div>
      </section>

      {/* Weekly Chart */}
      <section className="bg-card border-2 border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 text-pretty">
          Weekly Progress
        </h3>
        <WeeklyChart
          exerciseData={weekExercises ?? {}}
          mealData={weekMeals ?? {}}
        />
      </section>

      {/* Weight Tracking */}
      <WeightSection />

      {/* Weekly Report Summary */}
      {weeklyReport && (
        <section className="bg-primary/5 border-2 border-primary/20 dark:border-primary/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Weekly Report</h3>
                <p className="text-xs text-primary">This week&apos;s summary</p>
              </div>
            </div>
            <div className="text-center">
              <GradeBadge grade={weeklyReport.overallGrade} />
              <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">{weeklyReport.overallScore}/100</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-card/60 dark:bg-card/30 p-3 text-center border border-border">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Flame className="w-4 h-4 text-primary" aria-hidden="true" />
                <GradeBadge grade={weeklyReport.workout.grade} />
              </div>
              <p className="text-lg font-bold text-foreground tabular-nums">
                {weeklyReport.workout.totalDays}/{weeklyReport.workout.targetDays}
              </p>
              <p className="text-xs text-muted-foreground">workout days</p>
            </div>
            <div className="bg-card/60 dark:bg-card/30 p-3 text-center border border-border">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Utensils className="w-4 h-4 text-primary" aria-hidden="true" />
                <GradeBadge grade={weeklyReport.nutrition.grade} />
              </div>
              <p className="text-lg font-bold text-foreground tabular-nums">
                {weeklyReport.nutrition.averageCalories}
              </p>
              <p className="text-xs text-muted-foreground">avg cal/day</p>
            </div>
            <div className="bg-card/60 dark:bg-card/30 p-3 text-center border border-border">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Bell className="w-4 h-4 text-primary" aria-hidden="true" />
                <GradeBadge grade={weeklyReport.reminders.grade} />
              </div>
              <p className="text-lg font-bold text-foreground tabular-nums">
                {weeklyReport.reminders.adherenceRate}%
              </p>
              <p className="text-xs text-muted-foreground">adherence</p>
            </div>
          </div>

          {weeklyReport.insights.length > 0 && (
            <div className="border-t border-border pt-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span className="text-xs font-medium text-foreground">Insights</span>
              </div>
              <ul className="space-y-1">
                {weeklyReport.insights.map((insight, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
