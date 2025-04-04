import { ProtectedRoute } from "@/components/auth/protected-route";
import DashboardLayout from "@/components/dashboard-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-screen-lg mx-auto px-4">{children}</div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
