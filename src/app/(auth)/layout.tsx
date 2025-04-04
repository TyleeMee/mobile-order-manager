import React from "react";

import { AuthRoute } from "@/components/auth/auth-route";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthRoute>
      <div className="max-w-screen-sm mx-auto p-5">{children}</div>
    </AuthRoute>
  );
}
