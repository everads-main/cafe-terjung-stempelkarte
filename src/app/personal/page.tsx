import { StaffDesk, StaffLogin } from "@/components/staff-console";
import { locationById } from "@/lib/config";
import { getStaffSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PersonalPage() {
  const session = await getStaffSession();

  if (!session) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8">
        <StaffLogin />
      </main>
    );
  }

  const location = locationById(session.locationId);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6">
      <StaffDesk locationName={location.name} />
    </main>
  );
}
