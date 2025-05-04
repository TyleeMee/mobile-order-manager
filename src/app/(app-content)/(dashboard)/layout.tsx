import { ProtectedRoute } from "@/auth/components/protected-route";
import DashboardLayout from "@/components/dashboard-responsive-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
