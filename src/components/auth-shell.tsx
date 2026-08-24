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
    <main className="auth-screen mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10">
      {backHref ? (
        <Link href={backHref} className="text-sm font-medium text-white/90">
          ← {backLabel ?? "Zurück"}
        </Link>
      ) : null}
      <div className="flex justify-center pt-2">
        <TerjungLogo priority />
      </div>
      {children}
    </main>
  );
}
