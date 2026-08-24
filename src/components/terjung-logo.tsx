import {
  TERJUNG_LOGO_HEIGHT,
  TERJUNG_LOGO_WIDTH,
} from "@/lib/terjung-logo-data";

export function TerjungLogo({
  className = "h-auto w-full max-w-[280px]",
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-white p-3 shadow-sm ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/api/logo"
        alt="Bäckerei Terjung"
        width={TERJUNG_LOGO_WIDTH}
        height={TERJUNG_LOGO_HEIGHT}
        className="h-auto w-full"
      />
    </div>
  );
}
