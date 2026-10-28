import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin-dashboard";
import { cookies } from "next/headers";
import { ADMIN_PIN_COOKIE, verifyAdminPinSession } from "@/lib/admin-pin";
import { getAdminRequestContext } from "@/lib/admin-server";

export const metadata = { title: "Admin dashboard | Mobile Gallary" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const pinSession = cookieStore.get(ADMIN_PIN_COOKIE)?.value;
  if (!verifyAdminPinSession(pinSession)) redirect("/admin/login");
  const { client, error } = await getAdminRequestContext();
  if (!client) {
    return (
      <main className="auth-page">
        <div className="auth-card clay-card">
          <h1>Admin setup required</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }
  const { data: initialRows, error: dataError } = await client
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminDashboard
      initialRows={initialRows ?? []}
      initialError={dataError ? `Could not load products: ${dataError.message}` : ""}
    />
  );
}
