import { redirect } from "next/navigation";
import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/guest-auth-form";
import { getGuestCard } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const card = await getGuestCard();
  if (card) redirect("/karte");

  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/karte";

  return (
    <AuthShell backHref="/kunden" backLabel="Kundenbereich">
      <RegisterForm nextPath={nextPath} />
      <p className="text-center text-xs leading-5 text-white/85">
        Danach die Karte wie gewohnt zum Home-Bildschirm hinzufügen.
      </p>
    </AuthShell>
  );
}
