"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";
import { useLogin, useSwitchRole } from "@/lib/api/mutations";
import { useAuthRole } from "@/stores/authRole";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role"); // "user" 또는 "local"
  
  const login = useLogin();
  const switchRole = useSwitchRole();
  const { setRole } = useAuthRole();

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [keep, setKeep] = useState(false);

  const [idErr, setIdErr] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let ok = true;

    // 입력 검증
    if (!id.trim()) {
      setIdErr("아이디 또는 이메일을 다시 확인하세요");
      ok = false;
    }
    if (!pw.trim()) {
      setPwErr("비밀번호를 다시 확인하세요");
      ok = false;
    }
    if (!ok) return;

    try {
      const result = await login.mutateAsync({
        username: id,
        password: pw,
      });

      console.log("로그인 성공:", result);
      console.log("[로그인 직후] document.cookie:", document.cookie);

      // Role 처리
      // 사를: onboarding에서 선택한 role로 전환
      // 계정 알기: 기존 role재욕
      if (roleParam) {
        // roleParam: "user" or "local" -> 백엔드: "USER" or "LOCAL"
        const targetRole = roleParam === "user" ? "USER" : "LOCAL";
        
        // 로그인 중 role과 다르면 전환
        if (result.role !== targetRole) {
          try {
            // 로그인 성공 후단이라 같은 요청에는 인원이 있음
            await switchRole.mutateAsync({ role: targetRole });
            console.log("[LoginPage] Role 전환 성공:", targetRole);
          } catch (error) {
            console.error("[LoginPage] Role 전환 실패:", error);
            // Role 전환 실패해도 계속 진행
          }
        }
        // 프론트엔드 store에 role 저장
        setRole(roleParam as "user" | "local");
      } else {
        // roleParam이 없으면 백엔드 role을 그대로 사용
        setRole(result.role === "USER" ? "user" : "local");
      }

      // TODO: 관심사 선택 페이지 구현 후 주석 해제
      // 임시로 무조건 메인으로 이동
      router.push("/");
      
      // // 정상 로직 (관심사 선택 페이지 구현 후 사용)
      // if (result.next_step === "SELECT_INTERESTS_USER") {
      //   router.push("/interests"); // 관심사 선택 페이지
      // } else if (result.next_step === "SELECT_INTERESTS_LOCAL") {
      //   router.push("/interests");
      // } else if (result.next_step === "DONE") {
      //   router.push("/");
      // } else {
      //   router.push("/");
      // }
    } catch (error: any) {
      console.error("로그인 에러:", error);
      const errorMsg = error?.response?.data?.detail || error?.message || "로그인에 실패했습니다.";
      
      // 에러 메시지에 따라 분기
      if (errorMsg.includes("아이디") || errorMsg.includes("비밀번호")) {
        setIdErr("아이디 또는 비밀번호가 올바르지 않습니다.");
        setPwErr("아이디 또는 비밀번호가 올바르지 않습니다.");
      } else if (errorMsg.includes("이메일 인증")) {
        alert("이메일 인증이 필요합니다. 이메일을 확인해주세요.");
      } else {
        alert(errorMsg);
      }
    }
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
            <button 
              type="submit" 
              className="btn-yellow disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={login.isPending}
            >
              {login.isPending ? "로그인 중..." : "로그인하기"}
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
