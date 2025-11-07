"use client";
import Link from "next/link";

export default function MainNav() {
  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <nav className="container flex h-14 items-center gap-4">
        <Link href="/" className="font-bold">Team02</Link>
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black">Dashboard</Link>
        <Link href="/items" className="text-sm text-gray-600 hover:text-black">Items</Link>
      </nav>
    </header>
  );
}
