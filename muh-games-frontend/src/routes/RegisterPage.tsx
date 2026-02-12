import React from "react";
import { RequireAuth } from "../components/auth/RequireAuth";
import { AppNavbar } from "../components/layout/AppNavbar";
import { RegistrationWizard } from "../components/RegistrationWizard";

export default function RegisterPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <AppNavbar />
        <div className="py-6">
          <RegistrationWizard />
        </div>
      </div>
    </RequireAuth>
  );
}
