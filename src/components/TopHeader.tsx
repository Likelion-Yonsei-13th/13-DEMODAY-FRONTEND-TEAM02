// src/components/TopHeader.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAuthRole } from "@/stores/authRole";
import { useLogout, useSwitchRole } from "@/lib/api/mutations";

interface TopHeaderProps {
  currentState?: string;
}

export default function TopHeader({ currentState }: TopHeaderProps = {}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  // profile dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const role = useAuthRole((s) => s.role);
  const setRole = useAuthRole((s) => s.setRole);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { mutate: switchRole, isPending: isSwitching } = useSwitchRole();

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keyword.trim() !== "") {
      const stateParam = currentState ? `&state=${encodeURIComponent(currentState)}` : "";
      router.push(`/search?q=${encodeURIComponent(keyword)}${stateParam}`);
    }
  };

  const handleSwitchRole = () => {
    const backendRole = role === "user" ? "LOCAL" : "USER";
    switchRole(
      { role: backendRole as any },
      {
        onSuccess: (data: any) => {
          setRole((data.role || backendRole).toLowerCase() as "user" | "local");
          setDropdownOpen(false);
          router.refresh();
        },
      }
    );
  };

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        setRole(null);
        setDropdownOpen(false);
        router.push("/auth/login");
      },
    });
  };

  const switchLabel = role === "user" ? "로컬로 시작하기" : "여행자로 시작하기";

  return (
    <header className="w-full max-w-[420px] mx-auto px-5 pt-4 bg-white">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[18px] font-bold">D-tour</h1>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            aria-label="profile menu"
            onClick={() => setDropdownOpen((v) => !v)}
            className="rounded-full p-1 hover:bg-gray-100 focus:outline-none"
          >
            <Image src="/profile.svg" alt="profile" width={24} height={24} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-md border border-gray-200 bg-white shadow-lg z-50">
              <button
                type="button"
                onClick={handleSwitchRole}
                disabled={isSwitching}
                className="w-full px-3 py-2 text-left text-[13px] hover:bg-gray-50 disabled:opacity-50"
              >
                {switchLabel}
              </button>
              <div className="h-px bg-gray-200" />
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full px-3 py-2 text-left text-[13px] text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 검색창 */}
      <div className="flex items-center border-b border-gray-300 pb-2">
        <input
          placeholder="검색어를 입력해주세요"
          className="w-full bg-transparent outline-none text-[14px]"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <button
          onClick={() => {
            if (!keyword.trim()) return;
            const stateParam = currentState ? `&state=${encodeURIComponent(currentState)}` : "";
            router.push(`/search?q=${encodeURIComponent(keyword)}${stateParam}`);
          }}
          className="cursor-pointer"
        >
          <Image src="/search.svg" alt="search" width={18} height={18} />
        </button>
      </div>
    </header>
  );
}
