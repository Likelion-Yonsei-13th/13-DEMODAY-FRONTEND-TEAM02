"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/",     icon: "/home.svg",     label: "홈" },
  { href: "/proposal", icon: "/proposal.svg", label: "제안서" },
  { href: "/wish",     icon: "/wish.svg",     label: "위시" },
  { href: "/chat", icon: "/chatting.svg", label: "채팅" },
  { href: "/profile",  icon: "/profile.svg",  label: "프로필" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="하단 내비게이션"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
    >
      {/* 배경은 전폭, 안쪽 줄만 컨테이너 폭 */}
      <div className="mx-auto w-full px-5">
        <ul className="grid grid-cols-5 w-full list-none m-0 p-0">
          {TABS.map((t) => {
            const active = pathname === t.href || pathname?.startsWith(t.href + "/");
            return (
              <li key={t.href} className="relative">
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`group no-underline flex flex-col items-center justify-center gap-1 py-2 select-none text-gray-600`}
                >
                  {active && (
                    <span className="absolute -top-1 h-1 w-6 rounded-full bg-brand" />
                  )}
                  <Image src={t.icon} alt={t.label} width={22} height={22} className="object-contain" />
                  <span className="text-[11px]">{t.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
