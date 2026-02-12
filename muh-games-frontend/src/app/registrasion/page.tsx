"use client";

import React from "react";
import { RequireAuth } from "../../components/RequireAuth";
import { RegistrationWizard } from "../../components/RegistrationWizard";

export default function RegistrationPage() {
  return (
    <RequireAuth>
      <RegistrationWizard />
    </RequireAuth>
  );
}
