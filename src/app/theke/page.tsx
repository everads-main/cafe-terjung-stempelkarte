import { StaffDesk, StaffLogin } from "@/components/staff-console";
import { AuthShell } from "@/components/auth-shell";
import { locationById } from "@/lib/config";
import { getStaffSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ThekePage() {
  const session = await getStaffSession();

  if (!session) {
    return (
      <AuthShell backHref="/kunden" backLabel="Kundenbereich">
        <StaffLogin />
      </AuthShell>
    );
  }

  const location = locationById(session.locationId);

  return (
    <main className="auth-screen mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6">
      <StaffDesk locationName={location.name} />
    </main>
  );
}
