"use client";

import { useMemo, useState } from "react";

type AgreeKeys = "age14" | "terms" | "privacy" | "birthUse" | "marketing";
const REQUIRED: AgreeKeys[] = ["age14", "terms", "privacy"];

export default function JoinPage() {
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

  return (
    <main className="min-h-screen w-full flex justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* 제목 */}
        <h1 className="text-[24px] text-center mb-8">
          이메일로 회원가입
        </h1>

        {/* 입력 필드: 필드 간 16px */}
        <form className="space-y-4">
          <FormInput label="이름(닉네임)*" placeholder="홍길동" />
          <FormInput label="출생년도 입력*" placeholder="정보를 입력해주세요" />
          <FormInput label="이메일주소*" placeholder="ID@dtour.com" />
          <FormInput
            label="비밀번호*"
            placeholder="영문, 숫자, 특수문자 2가지 조합 8~15자"
            type="password"
          />
          <FormInput
            label="비밀번호 확인*"
            placeholder="비밀번호를 한 번 더 입력해주세요."
            type="password"
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
            disabled={!requiredChecked}
            className={`btn-yellow disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            가입완료하기
          </button>
        </div>
      </div>
    </main>
  );
}

/* 입력 컴포넌트 */
function FormInput({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[14px] text-gray-800">{label}</span>
      <input className="input-field mt-2" type={type} placeholder={placeholder} />
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
