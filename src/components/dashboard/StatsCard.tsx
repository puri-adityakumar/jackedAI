"use client";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  progress?: number;
  color?: "orange" | "blue" | "green" | "purple" | "cyan" | "amber";
}

export function StatsCard({
  title,
  value,
  subtitle,
  progress,
}: StatsCardProps) {
  return (
    <article className="border-2 border-primary/20 dark:border-primary/30 p-4 bg-primary/5">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p
        className="text-2xl font-bold mt-1 text-primary"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      {progress !== undefined && (
        <div className="mt-3" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-2 bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </article>
  );
}
