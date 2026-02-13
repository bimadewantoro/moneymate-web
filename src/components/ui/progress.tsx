"use client";

import * as React from "react";

/* ─── Progress ───────────────────────────── */

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        className={[
          "relative h-3 w-full overflow-hidden rounded-full bg-slate-100",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        <div
          className={[
            "h-full rounded-full transition-all duration-500 ease-out",
            indicatorClassName || "bg-blue-600",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
