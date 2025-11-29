"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthRole } from "@/stores/authRole";
import ProposalLocal from "./ProposalLocal";
import ProposalTraveler from "./ProposalTraveler";
import Navbar from "@/components/nav/Navbar";

export default function ProposalPage() {
  const { role } = useAuthRole();
  const mode = role ?? "traveler";
  const queryClient = useQueryClient();

  // 페이지 마운트 시 요청/제안서 데이터 새로 불러오기
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["requests"] });
    queryClient.invalidateQueries({ queryKey: ["roots"] });
  }, [queryClient]);

  return (
    <main className="min-h-screen bg-[#F4F4F4]">
      {mode === "local" ? <ProposalLocal /> : <ProposalTraveler />}
    
      <Navbar />
    </main>
  );
}
