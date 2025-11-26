"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignup } from "@/lib/api/mutations";
import { useAuthRole } from "@/stores/authRole";

type AgreeKeys = "age14" | "terms" | "privacy" | "birthUse" | "marketing";
const REQUIRED: AgreeKeys[] = ["age14", "terms", "privacy"];

// useSearchParams를 사용하는 컴포넌트
function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role"); // "user" 또는 "local"
  const signup = useSignup();
  const { setRole } = useAuthRole();

  // 폼 입력 state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    birthYear: "",
  });

  // 동의 state
  const [agree, setAgree] = useState<Record<AgreeKeys, boolean>>({
    age14: false,
    terms: false,
    privacy: false,
    birthUse: false,
    marketing: false,
  });

  const allChecked = useMemo(() => Object.values(agree).every(Boolean), [agree]);
  const requiredChecked = useMemo(() => REQUIRED.every((k) => agree[k]), [agree]);

  const toggleAll = () => {
    const next = !allChecked;
    setAgree({
      age14: next,
      terms: next,
      privacy: next,
      birthUse: next,
      marketing: next,
    });
  };
  const toggleOne = (k: AgreeKeys) => setAgree((s) => ({ ...s, [k]: !s[k] }));

  // 폼 입력 핸들러
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 회원가입 제출
  const handleSubmit = async () => {
    if (!requiredChecked) {
      alert("필수 약관에 동의해주세요.");
      return;
    }

    // 입력 검증
    if (!formData.username.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!formData.email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    if (!formData.birthYear.trim()) {
      alert("출생년도를 입력해주세요.");
      return;
    }
    if (!formData.password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }
    if (formData.password !== formData.password2) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const birthYear = parseInt(formData.birthYear);
    if (isNaN(birthYear) || birthYear < 1900 || birthYear > new Date().getFullYear()) {
      alert("유효한 출생년도를 입력해주세요.");
      return;
    }

    try {
      // roleParam에 따라 백엔드 role 결정
      // roleParam: "user" -> "USER", "local" -> "LOCAL"
      const selectedRole = roleParam === "user" ? "USER" : "LOCAL";
      
      const result = await signup.mutateAsync({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        role: selectedRole,
        display_name: formData.username,
        birth_year: birthYear,
        is_over_14: agree.age14,
        agreed_service_terms: agree.terms,
        agreed_privacy: agree.privacy,
        agreed_marketing: agree.marketing,
      });

      alert(result.message || "회원가입이 완료되었습니다. 이메일을 확인해주세요.");
      // role 저장
      setRole(roleParam === "user" ? "user" : "local");
      router.push("/auth/login");
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || "회원가입에 실패했습니다.";
      alert(errorMsg);
      console.error("회원가입 에러:", error);
    }
  };

  return (
    <main className="min-h-screen w-full flex justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* 제목 */}
        <h1 className="text-[24px] text-center mb-8">
          이메일로 회원가입
        </h1>

        {/* 입력 필드: 필드 간 16px */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <FormInput 
            label="이름(닉네임)*" 
            placeholder="홍길동" 
            value={formData.username}
            onChange={(v) => handleInputChange("username", v)}
          />
          <FormInput 
            label="출생년도 입력*" 
            placeholder="1995" 
            value={formData.birthYear}
            onChange={(v) => handleInputChange("birthYear", v)}
          />
          <FormInput 
            label="이메일주소*" 
            placeholder="ID@dtour.com" 
            value={formData.email}
            onChange={(v) => handleInputChange("email", v)}
          />
          <FormInput
            label="비밀번호*"
            placeholder="영문, 숫자, 특수문자 2가지 조합 8~15자"
            type="password"
            value={formData.password}
            onChange={(v) => handleInputChange("password", v)}
          />
          <FormInput
            label="비밀번호 확인*"
            placeholder="비밀번호를 한 번 더 입력해주세요."
            type="password"
            value={formData.password2}
            onChange={(v) => handleInputChange("password2", v)}
          />
        </form>

        {/* 동의 섹션: 위 24px 간격 */}
        <section className="mt-6 md:mt-8">
          {/* 전체동의: 아래 12px 간격 */}
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={toggleAll}
              className="h-4 w-4"
            />
            <span className="text-[14px] font-medium text-gray-900">
              전체동의하기
            </span>
          </label>

          {/* 유의사항 3줄: 12px, gray-300 확실히 적용 */}
          <p className="text-[12px] !text-gray-300 leading-relaxed mb-3">
            비밀번호를 한 번 더 입력해주세요. <br />
            선택 정보에 대한 동의를 포함합니다. 전체 동의하기를 선택 후 선택
            항목에 대한 동의를 해제하실 수 있습니다.
          </p>

          {/* 개별 동의 박스: 14px, 테두리 박스, 내부 줄 간 8px */}
          <div className="border border-gray-300 rounded-md p-3 space-y-2">
            <AgreeItem
              label="[필수] 만 14세 이상입니다"
              checked={agree.age14}
              onChange={() => toggleOne("age14")}
            />
            <AgreeItem
              label="[필수] 이용약관에 동의합니다"
              checked={agree.terms}
              onChange={() => toggleOne("terms")}
            />
            <AgreeItem
              label="[필수] 개인정보 처리방침에 동의합니다"
              checked={agree.privacy}
              onChange={() => toggleOne("privacy")}
            />
            <AgreeItem
              label="[선택] 출생년도 동의하기"
              checked={agree.birthUse}
              onChange={() => toggleOne("birthUse")}
            />
            <AgreeItem
              label="[선택] 마케팅 수신 동의"
              checked={agree.marketing}
              onChange={() => toggleOne("marketing")}
            />
          </div>
        </section>

        {/* CTA: 위 24px 간격, global .btn-yellow 사용 + disabled 유틸 */}
        <div className="mt-6 md:mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!requiredChecked || signup.isPending}
            className={`btn-yellow disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {signup.isPending ? "처리중..." : "가입완료하기"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩중...</div>}>
      <JoinForm />
    </Suspense>
  );
}

/* 입력 컴포넌트 */
function FormInput({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[14px] text-gray-800">{label}</span>
      <input 
        className="input-field mt-2" 
        type={type} 
        placeholder={placeholder} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

/* 체크박스 한 줄 */
function AgreeItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" className="h-4 w-4" checked={checked} onChange={onChange} />
      <span className="text-[14px] text-gray-800">{label}</span>
    </label>
  );
}
