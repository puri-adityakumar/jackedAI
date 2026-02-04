"use client";

import { format, subDays } from "date-fns";
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Exercises Bar Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-3">
          Exercises per Day
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={days}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="exercises" fill="#22C55E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Calories Line Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-3">
          Calories per Day
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={days}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="calories"
              stroke="#F97316"
              strokeWidth={2}
              dot={{ fill: "#F97316", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
