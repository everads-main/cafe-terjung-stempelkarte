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
        src="/terjung-logo.jpg"
        alt="Bäckerei Terjung"
        width={800}
        height={533}
        className="h-auto w-full"
      />
    </div>
  );
}
