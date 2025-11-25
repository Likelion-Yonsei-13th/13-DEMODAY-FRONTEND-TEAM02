"use client";

import { useAuthRole } from "@/stores/authRole";
import ProposalLocal from "./ProposalLocal";
import ProposalTraveler from "./ProposalTraveler";

export default function ProposalPage() {
  const { role } = useAuthRole();
  const mode = role ?? "traveler";

  return (
    <main className="min-h-screen bg-[#F4F4F4]">
      {mode === "local" ? <ProposalLocal /> : <ProposalTraveler />}
    </main>
  );
}
