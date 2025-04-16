import React from "react";

import { AuthRoute } from "@/components/auth/auth-route";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthRoute>
      <div className="flex items-center justify-center h-[calc(100vh-96px)] px-4">
        <div className="max-w-screen-sm w-full">{children}</div>
      </div>
    </AuthRoute>
  );
}
