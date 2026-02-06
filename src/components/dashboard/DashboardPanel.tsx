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
  A: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50",
  B: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50",
  C: "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50",
  D: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50",
  F: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50",
};

function MacroBar({
  label,
  consumed,
  target,
  unit,
  color,
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
      <div className="h-2 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={cn("h-full rounded-full transition-all duration-300", color)}
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
        "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
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
        className="bg-card rounded-xl shadow-xl w-full max-w-sm mx-4 border border-border"
        role="dialog"
        aria-labelledby="log-weight-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
            <h2 id="log-weight-title" className="text-lg font-semibold text-foreground">
              Log Weight
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
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
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
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
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none"
              placeholder="Morning weigh-in..."
              autoComplete="off"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !weight}
              className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
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

  const lineColor = isDark ? "#22d3ee" : "#0891b2";
  const tickColor = isDark ? "hsl(0 0% 63.9%)" : "hsl(0 0% 45.1%)";
  const tooltipBg = isDark ? "hsl(0 0% 14.9%)" : "hsl(0 0% 100%)";
  const tooltipBorder = isDark ? "hsl(0 0% 27%)" : "hsl(0 0% 89.8%)";

  return (
    <>
      <section className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
              <Scale className="w-5 h-5 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-900 dark:text-cyan-100">Weight</h3>
              {latest && (
                <p className="text-xs text-cyan-600 dark:text-cyan-400">
                  Last logged: {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(latest.date))}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Log
          </button>
        </div>

        {/* Current weight + change */}
        <div className="flex items-end gap-4 mb-4">
          {currentWeight != null ? (
            <>
              <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100 tabular-nums">
                {currentWeight}<span className="text-lg font-medium text-cyan-600 dark:text-cyan-400 ml-0.5">kg</span>
              </p>
              {weightChange != null && Math.abs(weightChange) >= 0.01 && (
                <div className={cn(
                  "inline-flex items-center gap-1 text-sm font-medium pb-1",
                  weightChange > 0 ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"
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
                    borderRadius: "8px",
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
            color="orange"
          />
          <StatsCard
            title="Protein"
            value={`${proteinConsumed}g`}
            subtitle={`of ${proteinTarget}g target`}
            progress={proteinTarget > 0 ? Math.min(Math.round((proteinConsumed / proteinTarget) * 100), 100) : undefined}
            color="blue"
          />
          <StatsCard
            title="Exercises"
            value={`${exerciseCount}`}
            subtitle="completed today"
            color="green"
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
            color="purple"
          />
        </div>
      </section>

      {/* Badge Chains */}
      <BadgeChains />

      {/* Macro Tracking */}
      <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 text-pretty">
          Today&apos;s Macros
        </h3>
        <div className="space-y-3">
          <MacroBar label="Protein" consumed={proteinConsumed} target={proteinTarget} unit="g" color="bg-blue-500 dark:bg-blue-400" />
          <MacroBar label="Carbs" consumed={carbsConsumed} target={carbsTarget} unit="g" color="bg-cyan-500 dark:bg-cyan-400" />
          <MacroBar label="Fat" consumed={fatConsumed} target={fatTarget} unit="g" color="bg-amber-500 dark:bg-amber-400" />
        </div>
      </section>

      {/* Weekly Chart */}
      <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
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
        <section className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100">Weekly Report</h3>
                <p className="text-xs text-violet-600 dark:text-violet-400">This week&apos;s summary</p>
              </div>
            </div>
            <div className="text-center">
              <GradeBadge grade={weeklyReport.overallGrade} />
              <p className="text-xs text-violet-500 dark:text-violet-400 mt-0.5 tabular-nums">{weeklyReport.overallScore}/100</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/60 dark:bg-white/5 rounded-lg p-3 text-center border border-violet-100 dark:border-violet-800/50">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Flame className="w-4 h-4 text-violet-500 dark:text-violet-400" aria-hidden="true" />
                <GradeBadge grade={weeklyReport.workout.grade} />
              </div>
              <p className="text-lg font-bold text-violet-900 dark:text-violet-100 tabular-nums">
                {weeklyReport.workout.totalDays}/{weeklyReport.workout.targetDays}
              </p>
              <p className="text-xs text-violet-600 dark:text-violet-400">workout days</p>
            </div>
            <div className="bg-white/60 dark:bg-white/5 rounded-lg p-3 text-center border border-violet-100 dark:border-violet-800/50">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Utensils className="w-4 h-4 text-violet-500 dark:text-violet-400" aria-hidden="true" />
                <GradeBadge grade={weeklyReport.nutrition.grade} />
              </div>
              <p className="text-lg font-bold text-violet-900 dark:text-violet-100 tabular-nums">
                {weeklyReport.nutrition.averageCalories}
              </p>
              <p className="text-xs text-violet-600 dark:text-violet-400">avg cal/day</p>
            </div>
            <div className="bg-white/60 dark:bg-white/5 rounded-lg p-3 text-center border border-violet-100 dark:border-violet-800/50">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Bell className="w-4 h-4 text-violet-500 dark:text-violet-400" aria-hidden="true" />
                <GradeBadge grade={weeklyReport.reminders.grade} />
              </div>
              <p className="text-lg font-bold text-violet-900 dark:text-violet-100 tabular-nums">
                {weeklyReport.reminders.adherenceRate}%
              </p>
              <p className="text-xs text-violet-600 dark:text-violet-400">adherence</p>
            </div>
          </div>

          {weeklyReport.insights.length > 0 && (
            <div className="border-t border-violet-200 dark:border-violet-800 pt-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" aria-hidden="true" />
                <span className="text-xs font-medium text-violet-700 dark:text-violet-300">Insights</span>
              </div>
              <ul className="space-y-1">
                {weeklyReport.insights.map((insight, i) => (
                  <li key={i} className="text-xs text-violet-600 dark:text-violet-400">
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
