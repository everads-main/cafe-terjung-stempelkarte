import { cn } from "@/lib/utils";

export function CupIcon({
  filled,
  index = 0,
  className,
}: {
  filled: boolean;
  index?: number;
  className?: string;
}) {
  const tilt = filled ? ((index % 5) - 2) * 4 : 0;

  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-2xl border transition-all duration-300",
        filled
          ? "border-roast/20 bg-[#f3e1cc] stamp-ink"
          : "border-dashed border-roast/25 bg-paper/70",
        className,
      )}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <svg
        viewBox="0 0 64 64"
        className={cn("size-[70%]", filled ? "text-roast" : "text-roast/35")}
        aria-hidden
      >
        <path
          d="M16 22h24.5c5.4 0 8.8 3.4 8.8 7.8 0 3.7-2.4 6.8-6 7.7.2 7.8-5.6 13.5-14.3 13.5S15 45.3 15 37.6c-2.6-1.4-4.3-4.2-4.3-7.4C10.7 25.5 13.4 22 16 22Z"
          fill={filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {!filled ? (
          <path
            d="M24 16c.8-2.6 2.4-4.4 4.8-5M33 15.4c.6-2.3 2.2-4 4.6-4.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ) : (
          <circle cx="47" cy="16" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.55" />
        )}
      </svg>
      {filled ? (
        <span className="absolute right-1 bottom-1 font-display text-[10px] tracking-wide text-caramel">
          {String(index + 1).padStart(2, "0")}
        </span>
      ) : null}
    </div>
  );
}
