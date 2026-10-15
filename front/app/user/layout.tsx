"use client";

import Sidebar from "@/components/Sidebar";
import { userNavItems } from "../variables/usernavbar";
import { useState } from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Sidebar
      navItems={userNavItems}
      mobileOpen={mobileOpen}
      onClose={() => setMobileOpen(false)}
    />
  );
}
