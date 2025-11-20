"use client";

import Navbar from "@/components/nav/Navbar";
import { useAuthRole } from "@/stores/authRole";
import ProfileLocal from "./ProfileLocal";
import ProfileTraveler from "./ProfileTraveler";

export default function ProfilePage() {
  const { role } = useAuthRole();

  // role 아직 없다면 임시로 local(혹은 traveler) 모드로 보여주도록 처리(미리보기/UI확인용)
  const effectiveRole = role ?? "local";

  return (
    <main className="min-h-screen bg-[#F4F4F4] pb-[calc(80px+env(safe-area-inset-bottom))]">
      {effectiveRole === "local" ? <ProfileLocal /> : <ProfileTraveler />}
      <Navbar />
    </main>
  );
}
