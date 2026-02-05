"use client";

import { format, subDays } from "date-fns";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface WeeklyChartProps {
  exerciseData: Record<string, number>;
  mealData: Record<string, { calories: number; protein: number }>;
}

export function WeeklyChart({ exerciseData, mealData }: WeeklyChartProps) {
  // Track dark mode for chart colors
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Generate last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayLabel = format(date, "EEE");

    return {
      date: dateStr,
      day: dayLabel,
      exercises: exerciseData[dateStr] ?? 0,
      calories: mealData[dateStr]?.calories ?? 0,
    };
  });

  // Theme-aware colors
  const tickColor = isDark ? "hsl(0 0% 63.9%)" : "hsl(0 0% 45.1%)";
  const tooltipBg = isDark ? "hsl(0 0% 14.9%)" : "hsl(0 0% 100%)";
  const tooltipBorder = isDark ? "hsl(0 0% 27%)" : "hsl(0 0% 89.8%)";
  const exerciseColor = isDark ? "#4ade80" : "#22C55E";
  const calorieColor = isDark ? "#fb923c" : "#F97316";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Exercises Bar Chart */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          Exercises per Day
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={days} role="img" aria-label="Bar chart showing exercises per day">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: "8px",
                color: isDark ? "hsl(0 0% 98%)" : "hsl(0 0% 3.9%)",
              }}
            />
            <Bar dataKey="exercises" fill={exerciseColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Calories Line Chart */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          Calories per Day
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={days} role="img" aria-label="Line chart showing calories per day">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: "8px",
                color: isDark ? "hsl(0 0% 98%)" : "hsl(0 0% 3.9%)",
              }}
            />
            <Line
              type="monotone"
              dataKey="calories"
              stroke={calorieColor}
              strokeWidth={2}
              dot={{ fill: calorieColor, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
