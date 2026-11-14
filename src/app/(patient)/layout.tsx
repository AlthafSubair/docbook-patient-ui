"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TopNavbar, BottomNav } from "docbook-ui-package";
import { usePatients } from "@/lib/api/patients";

const PatientLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { data: profiles } = usePatients();
  const hasProfiles = Boolean(profiles && profiles.length > 0);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <TopNavbar
        linkComponent={Link}
        currentPath={pathname}
        showNavItems={hasProfiles}
      />
      <main className="flex flex-1 flex-col pb-20 lg:pb-8">{children}</main>
      <BottomNav
        linkComponent={Link}
        currentPath={pathname}
        visible={hasProfiles}
      />
    </div>
  );
};

export default PatientLayout;
