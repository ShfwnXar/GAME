"use client";

import React from "react";
import { RequireAuth } from "../../components/auth/RequireAuth";
import { RegistrationWizard } from "../../components/RegistrationWizard";
import { AppNavbar } from "../../components/layout/AppNavbar";

export default function RegisterPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <AppNavbar logoSlots={5} extraLogos={[]} />
        <div className="py-6">
          <RegistrationWizard />
        </div>
      </div>
    </RequireAuth>
  );
}
