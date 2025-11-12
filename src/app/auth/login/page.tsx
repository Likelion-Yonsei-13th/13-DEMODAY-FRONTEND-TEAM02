"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [keep, setKeep] = useState(false);

  const [idErr, setIdErr] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    let ok = true;

    if (!id.trim()) {
      setIdErr("아이디 또는 이메일을 다시 확인하세요");
      ok = false;
    }
    if (!pw.trim()) {
      setPwErr("비밀번호를 다시 확인하세요");
      ok = false;
    }
    if (!ok) return;

    // 🔒 백엔드 연동은 다른 팀원 담당 — 여기서는 UI만
    alert(`UI 데모: 로그인 시도\nID: ${id}\nKeep: ${keep}`);
  };

  return (
    <main className="min-h-screen w-full flex justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* 타이틀 */}
        <h1 className="text-[24px] font-semibold text-center mb-10">로그인</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* 아이디/이메일 */}
          <div>
            <input
              className={`input-field ${idErr ? "!border-red-400" : ""}`}
              placeholder="아이디 또는 이메일"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                if (idErr) setIdErr(null);
              }}
            />
            {idErr && (
              <p className="mt-1 text-[12px] text-red-500">{idErr}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <input
              className={`input-field ${pwErr ? "!border-red-400" : ""}`}
              type="password"
              placeholder="비밀번호"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                if (pwErr) setPwErr(null);
              }}
            />
            {pwErr && (
              <p className="mt-1 text-[12px] text-red-500">{pwErr}</p>
            )}
          </div>

          {/* 옵션/링크 라인 */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-[14px] text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={keep}
                onChange={() => setKeep((v) => !v)}
              />
              로그인유지
            </label>
            <Link
              href="#"
              className="text-[14px] text-gray-500 hover:underline"
            >
              비밀번호찾기
            </Link>
          </div>

          {/* CTA 버튼 */}
          <div className="pt-2 flex justify-center">
            <button type="submit" className="btn-yellow">
              로그인하기
            </button>
          </div>

          {/* 하단 링크 */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <Link href="/auth/join" className="text-[14px] text-gray-500 hover:underline">
              회원가입
            </Link>
            <Link href="#" className="text-[14px] text-gray-500 hover:underline">
              비밀번호찾기
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
