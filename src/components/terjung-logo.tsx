import Image from "next/image";

export function TerjungLogo({
  className = "h-auto w-full max-w-[280px]",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/terjung-logo.svg"
      alt="Bäckerei Terjung"
      width={320}
      height={120}
      priority={priority}
      className={className}
    />
  );
}
