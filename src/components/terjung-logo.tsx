export function TerjungLogo({
  className = "h-auto w-full max-w-[280px]",
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-white p-3 shadow-sm ${className}`}>
      <img
        src="/terjung-logo.svg"
        alt="Bäckerei Terjung"
        width={720}
        height={480}
        className="h-auto w-full"
      />
    </div>
  );
}
