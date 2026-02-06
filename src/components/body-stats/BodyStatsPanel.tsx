"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Plus,
  X,
  Minus,
  Pencil,
  Trash2,
  Calendar,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TrendPeriod = "week" | "month" | "3months" | "year" | "all";

interface BodyStatsEntry {
  _id: Id<"bodyStats">;
  date: string;
  weight: number;
  bodyFat?: number;
  waist?: number;
  chest?: number;
  hips?: number;
  bicepsLeft?: number;
  bicepsRight?: number;
  thighLeft?: number;
  thighRight?: number;
  neck?: number;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

interface StatsFormData {
  date: string;
  weight: string;
  bodyFat: string;
  waist: string;
  chest: string;
  hips: string;
  bicepsLeft: string;
  bicepsRight: string;
  thighLeft: string;
  thighRight: string;
  neck: string;
  notes: string;
}

const PERIOD_OPTIONS: { value: TrendPeriod; label: string }[] = [
  { value: "month", label: "1M" },
  { value: "3months", label: "3M" },
  { value: "year", label: "1Y" },
  { value: "all", label: "All" },
];

const emptyFormData = (date?: string): StatsFormData => ({
  date: date ?? new Date().toISOString().split("T")[0],
  weight: "",
  bodyFat: "",
  waist: "",
  chest: "",
  hips: "",
  bicepsLeft: "",
  bicepsRight: "",
  thighLeft: "",
  thighRight: "",
  neck: "",
  notes: "",
});

function formDataFromEntry(entry: BodyStatsEntry): StatsFormData {
  return {
    date: entry.date,
    weight: String(entry.weight),
    bodyFat: entry.bodyFat != null ? String(entry.bodyFat) : "",
    waist: entry.waist != null ? String(entry.waist) : "",
    chest: entry.chest != null ? String(entry.chest) : "",
    hips: entry.hips != null ? String(entry.hips) : "",
    bicepsLeft: entry.bicepsLeft != null ? String(entry.bicepsLeft) : "",
    bicepsRight: entry.bicepsRight != null ? String(entry.bicepsRight) : "",
    thighLeft: entry.thighLeft != null ? String(entry.thighLeft) : "",
    thighRight: entry.thighRight != null ? String(entry.thighRight) : "",
    neck: entry.neck != null ? String(entry.neck) : "",
    notes: entry.notes ?? "",
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
}

function optionalNum(val: string): number | undefined {
  const n = parseFloat(val);
  return isNaN(n) ? undefined : n;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ChangeIndicator({
  value,
  unit,
}: {
  value: number;
  unit: string;
}) {
  const isPositive = value > 0;
  const isZero = Math.abs(value) < 0.01;
  const Icon = isZero ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center gap-1 text-sm">
      <Icon
        className={cn(
          "w-3.5 h-3.5",
          isZero
            ? "text-muted-foreground"
            : isPositive
            ? "text-primary/70"
            : "text-primary"
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          "tabular-nums",
          isZero
            ? "text-muted-foreground"
            : isPositive
            ? "text-primary/70"
            : "text-primary"
        )}
      >
        {isPositive ? "+" : ""}
        {value.toFixed(1)}
        {unit}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats Form Modal
// ---------------------------------------------------------------------------

function StatsFormModal({
  title,
  initialData,
  onClose,
  onSave,
  isSaving,
}: {
  title: string;
  initialData: StatsFormData;
  onClose: () => void;
  onSave: (data: StatsFormData) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<StatsFormData>(initialData);

  const handleChange = (field: keyof StatsFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const inputClass =
    "w-full px-3 py-2 border border-input  bg-background text-foreground placeholder:text-muted-foreground tabular-nums focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-card w-full max-w-lg mx-4 border-2 border-border max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="stats-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
              <Scale className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <h2
              id="stats-modal-title"
              className="text-lg font-semibold text-foreground"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Date */}
          <div>
            <label
              htmlFor="stats-date"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Date
            </label>
            <input
              type="date"
              id="stats-date"
              name="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className={inputClass}
              required
            />
          </div>

          {/* Weight (required) */}
          <div>
            <label
              htmlFor="stats-weight"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Weight (kg) <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              id="stats-weight"
              name="weight"
              value={form.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
              className={inputClass}
              placeholder="e.g., 75.5"
              step="0.1"
              min="0"
              required
              inputMode="decimal"
            />
          </div>

          {/* Body Fat & Waist */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="stats-bodyFat"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Body Fat (%)
              </label>
              <input
                type="number"
                id="stats-bodyFat"
                name="bodyFat"
                value={form.bodyFat}
                onChange={(e) => handleChange("bodyFat", e.target.value)}
                className={inputClass}
                placeholder="e.g., 15.5"
                step="0.1"
                min="0"
                max="100"
                inputMode="decimal"
              />
            </div>
            <div>
              <label
                htmlFor="stats-waist"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Waist (cm)
              </label>
              <input
                type="number"
                id="stats-waist"
                name="waist"
                value={form.waist}
                onChange={(e) => handleChange("waist", e.target.value)}
                className={inputClass}
                placeholder="e.g., 80"
                step="0.1"
                min="0"
                inputMode="decimal"
              />
            </div>
          </div>

          {/* Chest & Hips */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="stats-chest"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Chest (cm)
              </label>
              <input
                type="number"
                id="stats-chest"
                name="chest"
                value={form.chest}
                onChange={(e) => handleChange("chest", e.target.value)}
                className={inputClass}
                placeholder="e.g., 100"
                step="0.1"
                min="0"
                inputMode="decimal"
              />
            </div>
            <div>
              <label
                htmlFor="stats-hips"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Hips (cm)
              </label>
              <input
                type="number"
                id="stats-hips"
                name="hips"
                value={form.hips}
                onChange={(e) => handleChange("hips", e.target.value)}
                className={inputClass}
                placeholder="e.g., 95"
                step="0.1"
                min="0"
                inputMode="decimal"
              />
            </div>
          </div>

          {/* Biceps */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="stats-bicepsLeft"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Biceps L (cm)
              </label>
              <input
                type="number"
                id="stats-bicepsLeft"
                name="bicepsLeft"
                value={form.bicepsLeft}
                onChange={(e) => handleChange("bicepsLeft", e.target.value)}
                className={inputClass}
                placeholder="e.g., 35"
                step="0.1"
                min="0"
                inputMode="decimal"
              />
            </div>
            <div>
              <label
                htmlFor="stats-bicepsRight"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Biceps R (cm)
              </label>
              <input
                type="number"
                id="stats-bicepsRight"
                name="bicepsRight"
                value={form.bicepsRight}
                onChange={(e) => handleChange("bicepsRight", e.target.value)}
                className={inputClass}
                placeholder="e.g., 35"
                step="0.1"
                min="0"
                inputMode="decimal"
              />
            </div>
          </div>

          {/* Thighs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="stats-thighLeft"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Thigh L (cm)
              </label>
              <input
                type="number"
                id="stats-thighLeft"
                name="thighLeft"
                value={form.thighLeft}
                onChange={(e) => handleChange("thighLeft", e.target.value)}
                className={inputClass}
                placeholder="e.g., 55"
                step="0.1"
                min="0"
                inputMode="decimal"
              />
            </div>
            <div>
              <label
                htmlFor="stats-thighRight"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Thigh R (cm)
              </label>
              <input
                type="number"
                id="stats-thighRight"
                name="thighRight"
                value={form.thighRight}
                onChange={(e) => handleChange("thighRight", e.target.value)}
                className={inputClass}
                placeholder="e.g., 55"
                step="0.1"
                min="0"
                inputMode="decimal"
              />
            </div>
          </div>

          {/* Neck */}
          <div>
            <label
              htmlFor="stats-neck"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Neck (cm)
            </label>
            <input
              type="number"
              id="stats-neck"
              name="neck"
              value={form.neck}
              onChange={(e) => handleChange("neck", e.target.value)}
              className={inputClass}
              placeholder="e.g., 38"
              step="0.1"
              min="0"
              inputMode="decimal"
            />
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="stats-notes"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Notes
            </label>
            <textarea
              id="stats-notes"
              name="notes"
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className={cn(inputClass, "resize-none h-20")}
              placeholder="How are you feeling? Any observations..."
            />
          </div>

          {/* Actions */}
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
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirm Modal
// ---------------------------------------------------------------------------

function DeleteConfirmModal({
  date,
  onConfirm,
  onCancel,
}: {
  date: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-card w-full max-w-sm mx-4 p-6 border-2 border-border"
        role="alertdialog"
        aria-labelledby="delete-stats-title"
        aria-describedby="delete-stats-desc"
      >
        <h2
          id="delete-stats-title"
          className="text-lg font-semibold text-foreground mb-2"
        >
          Delete Entry?
        </h2>
        <p id="delete-stats-desc" className="text-muted-foreground mb-4">
          Are you sure you want to delete the body stats entry from{" "}
          <strong>{formatDate(date)}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-border bg-card text-foreground hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trend Chart
// ---------------------------------------------------------------------------

function TrendChart({
  period,
}: {
  period: TrendPeriod;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const weightTrend = useQuery(api.bodyStats.getTrends, {
    metric: "weight",
    period,
  });

  const bodyFatTrend = useQuery(api.bodyStats.getTrends, {
    metric: "bodyFat",
    period,
  });

  // Merge weight and bodyFat data by date for the chart
  // Must be called unconditionally (React hooks rules) before any early return
  const mergedData = useMemo(() => {
    if (!weightTrend || !bodyFatTrend) return [];

    const dateMap = new Map<string, { date: string; weight?: number; bodyFat?: number }>();

    for (const point of weightTrend.data) {
      dateMap.set(point.date, { date: point.date, weight: point.value });
    }
    for (const point of bodyFatTrend.data) {
      const existing = dateMap.get(point.date);
      if (existing) {
        existing.bodyFat = point.value;
      } else {
        dateMap.set(point.date, { date: point.date, bodyFat: point.value });
      }
    }

    return Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [weightTrend, bodyFatTrend]);

  if (weightTrend === undefined || bodyFatTrend === undefined) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (mergedData.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
        No data for this period
      </div>
    );
  }

  const tickColor = isDark ? "hsl(0 0% 63.9%)" : "hsl(0 0% 45.1%)";
  const tooltipBg = isDark ? "hsl(0 0% 14.9%)" : "hsl(0 0% 100%)";
  const tooltipBorder = isDark ? "hsl(0 0% 27%)" : "hsl(0 0% 89.8%)";
  const gridColor = isDark ? "hsl(0 0% 20%)" : "hsl(0 0% 90%)";
  const weightColor = isDark ? "#22d3ee" : "#0891b2"; // cyan-400 / cyan-600
  const bodyFatColor = isDark ? "#a78bfa" : "#7c3aed"; // violet-400 / violet-600

  const hasBodyFat = mergedData.some((d) => d.bodyFat != null);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={mergedData}
        role="img"
        aria-label="Line chart showing weight and body fat trends"
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fill: tickColor, fontSize: 11 }}
          tickFormatter={formatDateShort}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="weight"
          axisLine={false}
          tickLine={false}
          tick={{ fill: tickColor, fontSize: 11 }}
          domain={["auto", "auto"]}
          unit=" kg"
          width={60}
        />
        {hasBodyFat && (
          <YAxis
            yAxisId="bodyFat"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: tickColor, fontSize: 11 }}
            domain={["auto", "auto"]}
            unit="%"
            width={45}
          />
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: "0px",
            color: isDark ? "hsl(0 0% 98%)" : "hsl(0 0% 3.9%)",
            fontSize: 13,
          }}
          labelFormatter={formatDate}
          formatter={(value: number, name: string) => {
            if (name === "weight") return [`${value.toFixed(1)} kg`, "Weight"];
            if (name === "bodyFat") return [`${value.toFixed(1)}%`, "Body Fat"];
            return [value, name];
          }}
        />
        <Legend
          verticalAlign="top"
          height={30}
          formatter={(value: string) => {
            if (value === "weight") return "Weight (kg)";
            if (value === "bodyFat") return "Body Fat (%)";
            return value;
          }}
        />
        <Line
          yAxisId="weight"
          type="monotone"
          dataKey="weight"
          stroke={weightColor}
          strokeWidth={2}
          dot={{ fill: weightColor, strokeWidth: 0, r: 3 }}
          activeDot={{ fill: weightColor, strokeWidth: 2, stroke: tooltipBg, r: 5 }}
          connectNulls
        />
        {hasBodyFat && (
          <Line
            yAxisId="bodyFat"
            type="monotone"
            dataKey="bodyFat"
            stroke={bodyFatColor}
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={{ fill: bodyFatColor, strokeWidth: 0, r: 3 }}
            activeDot={{ fill: bodyFatColor, strokeWidth: 2, stroke: tooltipBg, r: 5 }}
            connectNulls
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Main Panel
// ---------------------------------------------------------------------------

export function BodyStatsPanel() {
  const [period, setPeriod] = useState<TrendPeriod>("3months");
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BodyStatsEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<BodyStatsEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Queries
  const latest = useQuery(api.bodyStats.getLatest);
  const recent = useQuery(api.bodyStats.getRecent, { limit: 20 });
  const changeData = useQuery(api.bodyStats.getChangeFromPrevious, {});

  // Mutations
  const createStats = useMutation(api.bodyStats.create);
  const updateStats = useMutation(api.bodyStats.update);
  const removeStats = useMutation(api.bodyStats.remove);

  // Derived values
  const weightChange = changeData?.weightChange ?? null;
  const bodyFatChange = changeData?.bodyFatChange ?? null;
  const isLoading = latest === undefined;

  const lastUpdatedLabel = useMemo(() => {
    if (!latest) return null;
    return formatDate(latest.date);
  }, [latest]);

  // Handlers
  const handleSaveNew = async (data: StatsFormData) => {
    const weight = parseFloat(data.weight);
    if (isNaN(weight)) return;

    setIsSaving(true);
    try {
      await createStats({
        date: data.date,
        weight,
        bodyFat: optionalNum(data.bodyFat),
        waist: optionalNum(data.waist),
        chest: optionalNum(data.chest),
        hips: optionalNum(data.hips),
        bicepsLeft: optionalNum(data.bicepsLeft),
        bicepsRight: optionalNum(data.bicepsRight),
        thighLeft: optionalNum(data.thighLeft),
        thighRight: optionalNum(data.thighRight),
        neck: optionalNum(data.neck),
        notes: data.notes || undefined,
      });
      setShowLogModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async (data: StatsFormData) => {
    if (!editingEntry) return;
    const weight = parseFloat(data.weight);
    if (isNaN(weight)) return;

    setIsSaving(true);
    try {
      await updateStats({
        id: editingEntry._id,
        date: data.date,
        weight,
        bodyFat: optionalNum(data.bodyFat),
        waist: optionalNum(data.waist),
        chest: optionalNum(data.chest),
        hips: optionalNum(data.hips),
        bicepsLeft: optionalNum(data.bicepsLeft),
        bicepsRight: optionalNum(data.bicepsRight),
        thighLeft: optionalNum(data.thighLeft),
        thighRight: optionalNum(data.thighRight),
        neck: optionalNum(data.neck),
        notes: data.notes || undefined,
      });
      setEditingEntry(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEntry) return;
    await removeStats({ id: deletingEntry._id });
    setDeletingEntry(null);
  };

  // -------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Body Stats
            </h2>
          </div>
        </header>
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------

  if (latest === null) {
    return (
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Body Stats
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Log Stats
          </button>
        </header>

        <div className="p-12 text-center bg-card border-2 border-border">
          <Scale className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No body stats yet
          </h3>
          <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
            Start tracking your weight, body fat, and measurements to see your
            progress over time.
          </p>
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Log Your First Entry
          </button>
        </div>

        {showLogModal && (
          <StatsFormModal
            title="Log Body Stats"
            initialData={emptyFormData()}
            onClose={() => setShowLogModal(false)}
            onSave={handleSaveNew}
            isSaving={isSaving}
          />
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Main view
  // -------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Body Stats
            </h2>
            {lastUpdatedLabel && (
              <p className="text-sm text-muted-foreground">
                Last updated {lastUpdatedLabel}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowLogModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Log Stats
        </button>
      </header>

      {/* Current Stats Summary Cards */}
      <section aria-label="Current body stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weight */}
        <article className="p-4 border-2 border-primary/20 bg-primary/5">
          <p className="text-sm font-medium text-muted-foreground">Weight</p>
          <p className="text-2xl font-bold mt-1 text-primary tabular-nums">
            {latest.weight}
            <span className="text-sm font-normal text-muted-foreground ml-0.5">
              kg
            </span>
          </p>
        </article>

        {/* Weight Change */}
        <article className="p-4 border-2 border-border bg-card">
          <p className="text-sm font-medium text-muted-foreground">Change</p>
          {weightChange !== null ? (
            <div className="mt-1">
              <ChangeIndicator value={weightChange} unit=" kg" />
              <p className="text-xs text-muted-foreground mt-1">
                vs previous
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              No previous data
            </p>
          )}
        </article>

        {/* Body Fat */}
        <article className="p-4 border-2 border-primary/20 bg-primary/5">
          <p className="text-sm font-medium text-muted-foreground">Body Fat</p>
          {latest.bodyFat != null ? (
            <>
              <p className="text-2xl font-bold mt-1 text-primary tabular-nums">
                {latest.bodyFat}
                <span className="text-sm font-normal text-muted-foreground ml-0.5">
                  %
                </span>
              </p>
              {bodyFatChange !== null && (
                <ChangeIndicator value={bodyFatChange} unit="%" />
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">Not tracked</p>
          )}
        </article>

        {/* Last Updated */}
        <article className="p-4 border-2 border-border bg-card">
          <p className="text-sm font-medium text-muted-foreground">Logged</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Calendar className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">
              {formatDate(latest.date)}
            </p>
          </div>
          {recent && (
            <p className="text-xs text-muted-foreground mt-1 tabular-nums">
              {recent.length} total entries
            </p>
          )}
        </article>
      </section>

      {/* Measurements summary (if any exist on latest) */}
      {(latest.waist || latest.chest || latest.hips || latest.neck) && (
        <section className="bg-card border-2 border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-foreground">
              Latest Measurements
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {latest.waist != null && (
              <div>
                <p className="text-xs text-muted-foreground">Waist</p>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {latest.waist} cm
                </p>
              </div>
            )}
            {latest.chest != null && (
              <div>
                <p className="text-xs text-muted-foreground">Chest</p>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {latest.chest} cm
                </p>
              </div>
            )}
            {latest.hips != null && (
              <div>
                <p className="text-xs text-muted-foreground">Hips</p>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {latest.hips} cm
                </p>
              </div>
            )}
            {latest.neck != null && (
              <div>
                <p className="text-xs text-muted-foreground">Neck</p>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {latest.neck} cm
                </p>
              </div>
            )}
            {latest.bicepsLeft != null && (
              <div>
                <p className="text-xs text-muted-foreground">Biceps L</p>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {latest.bicepsLeft} cm
                </p>
              </div>
            )}
            {latest.bicepsRight != null && (
              <div>
                <p className="text-xs text-muted-foreground">Biceps R</p>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {latest.bicepsRight} cm
                </p>
              </div>
            )}
            {latest.thighLeft != null && (
              <div>
                <p className="text-xs text-muted-foreground">Thigh L</p>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {latest.thighLeft} cm
                </p>
              </div>
            )}
            {latest.thighRight != null && (
              <div>
                <p className="text-xs text-muted-foreground">Thigh R</p>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {latest.thighRight} cm
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Trend Chart */}
      <section className="bg-card border-2 border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Trends
          </h3>
          {/* Period Filter */}
          <div className="flex gap-1 bg-muted p-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPeriod(opt.value)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  period === opt.value
                    ? "bg-background text-foreground "
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <TrendChart period={period} />
      </section>

      {/* History Table */}
      <section className="bg-card border-2 border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">History</h3>
        </div>

        {recent && recent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Weight
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Body Fat
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                    Waist
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                    Notes
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent.map((entry, index) => {
                  const prevEntry = recent[index + 1] ?? null;
                  const wChange = prevEntry
                    ? entry.weight - prevEntry.weight
                    : null;

                  return (
                    <tr
                      key={entry._id}
                      className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className="font-medium text-foreground">
                          {entry.weight} kg
                        </span>
                        {wChange !== null && (
                          <div className="mt-0.5">
                            <span
                              className={cn(
                                "text-xs tabular-nums",
                                Math.abs(wChange) < 0.01
                                  ? "text-muted-foreground"
                                  : wChange > 0
                                  ? "text-primary/70"
                                  : "text-primary"
                              )}
                            >
                              {wChange > 0 ? "+" : ""}
                              {wChange.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        {entry.bodyFat != null ? `${entry.bodyFat}%` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground hidden sm:table-cell">
                        {entry.waist != null ? `${entry.waist} cm` : "-"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                        {entry.notes || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingEntry(entry as BodyStatsEntry)
                            }
                            className="p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            aria-label={`Edit entry from ${formatDate(entry.date)}`}
                          >
                            <Pencil className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeletingEntry(entry as BodyStatsEntry)
                            }
                            className="p-1.5 hover:bg-destructive/10 text-destructive transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            aria-label={`Delete entry from ${formatDate(entry.date)}`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No history entries yet
          </div>
        )}
      </section>

      {/* Modals */}
      {showLogModal && (
        <StatsFormModal
          title="Log Body Stats"
          initialData={emptyFormData()}
          onClose={() => setShowLogModal(false)}
          onSave={handleSaveNew}
          isSaving={isSaving}
        />
      )}

      {editingEntry && (
        <StatsFormModal
          title="Edit Body Stats"
          initialData={formDataFromEntry(editingEntry)}
          onClose={() => setEditingEntry(null)}
          onSave={handleSaveEdit}
          isSaving={isSaving}
        />
      )}

      {deletingEntry && (
        <DeleteConfirmModal
          date={deletingEntry.date}
          onConfirm={handleDelete}
          onCancel={() => setDeletingEntry(null)}
        />
      )}
    </div>
  );
}
