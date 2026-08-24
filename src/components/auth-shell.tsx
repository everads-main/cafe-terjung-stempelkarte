import Link from "next/link";

import { TerjungLogo } from "@/components/terjung-logo";

export function AuthShell({
  children,
  backHref,
  backLabel,
}: {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <main className="auth-screen relative mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-8">
      {backHref ? (
        <Link
          href={backHref}
          className="absolute left-4 top-5 text-sm font-medium text-white/90"
        >
          ← {backLabel ?? "Zurück"}
        </Link>
      ) : null}
      <div className="flex w-full flex-col items-center gap-6">
        <TerjungLogo />
        <div className="flex w-full flex-col gap-6">{children}</div>
      </div>
    </main>
  );
}
