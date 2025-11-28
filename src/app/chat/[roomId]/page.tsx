"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Sender = "local" | "user";

interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  time: string; // "13:00"
}

/* =======================
 *  말풍선 컴포넌트
 * ======================= */

interface MessageBubbleProps {
  message: ChatMessage;
  showAvatar?: boolean;
  localName?: string;
}

const MAX_BUBBLE_WIDTH = 260;

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar = false,
  localName = "로컬이름",
}) => {
  const isUser = message.sender === "user";

  // 🔹 로컬(왼쪽) 말풍선
  if (!isUser) {
    return (
      <div className="flex w-full justify-start mb-6">
        {/* 아바타 영역 */}
        <div className="mr-2 flex flex-col items-center">
          {showAvatar ? (
            <>
              <div className="h-10 w-10 rounded-full bg-gray-300" />
              <span className="mt-1 text-[11px] font-semibold text-gray-800">
                {localName}
              </span>
            </>
          ) : (
            <div className="h-10 w-10" />
          )}
        </div>

        {/* 말풍선 + 시간 (같은 줄) */}
        <div className="flex items-end">
          <div className="relative inline-flex max-w-[260px]">
            {/* 말풍선 배경 */}
            <div
              className="absolute inset-0 bg-no-repeat bg-[length:100%_100%]"
              style={{ backgroundImage: "url(/bubble-left.svg)" }}
            />
            {/* 텍스트 */}
            <div className="relative px-4 py-3 text-[13px] leading-[1.4] whitespace-pre-line">
              <span className="inline-block max-w-[260px]">
                {message.text}
              </span>
            </div>
          </div>

          <span className="ml-2 text-[10px] text-gray-400">{message.time}</span>
        </div>
      </div>
    );
  }

  // 🔹 사용자(오른쪽) 말풍선
  return (
    <div className="flex w-full justify-end mb-6">
      <div className="flex flex-col items-end">
        <div className="relative inline-flex max-w-[260px]">
          {/* 말풍선 배경 */}
          <div
            className="absolute inset-0 bg-no-repeat bg-[length:100%_100%]"
            style={{ backgroundImage: "url(/bubble-right.svg)" }}
          />
          {/* 텍스트 */}
          <div className="relative px-4 py-3 text-[13px] leading-[1.4] whitespace-pre-line">
            <span className="inline-block max-w-[260px]">
              {message.text}
            </span>
          </div>
        </div>

        {/* 시간: 말풍선 아래, 왼쪽 정렬 */}
        <span className="mt-1 self-start text-[10px] text-gray-400">
          {message.time}
        </span>
      </div>
    </div>
  );
};

/* =======================
 *  채팅방 페이지
 * ======================= */

const ChatRoomPage: React.FC = () => {
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      sender: "local",
      text: "안녕하세요! 여행 일정 관련해서 안내드립니다.",
      time: "13:00",
    },
    {
      id: "m2",
      sender: "user",
      text: "네, 일정 다시 한 번만 설명해 주세요.",
      time: "13:00",
    },
    {
      id: "m3",
      sender: "user",
      text: "그리고 준비물도 알려주시면 좋을 것 같아요.",
      time: "13:00",
    },
  ]);

  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const now = new Date();
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");

    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      time: `${hh}:${mm}`,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-[420px] flex-col bg-white">
        {/* ===== 상단 헤더 ===== */}
        <header className="px-4 pt-4">
          <div className="flex items-center">
            {/* 뒤로가기 */}
            <button
              type="button"
              onClick={() => router.push("/chat")}
              className="mr-2 flex h-8 w-8 items-center justify-center"
            >
              <Image src="/back.svg" alt="뒤로가기" width={20} height={20} />
            </button>

            {/* 가운데 프로필 + 이름 */}
            <div className="flex flex-1 flex-col items-center">
              <div className="mb-1 h-10 w-10 rounded-full bg-gray-300" />
              <span className="text-[12px] font-semibold text-gray-900">
                로컬이름
              </span>
            </div>

            {/* 오른쪽 균형용 더미 */}
            <div className="h-8 w-8" />
          </div>

          {/* 채팅방 설명 + 하단 보더 */}
          <p className="mt-3 pb-3 text-center text-[13px] text-gray-400 border-b border-gray-200">
            내가 요청했던 제안서 제목(종로구 한국 체험) 받은 제안서 이름
          </p>
        </header>

        {/* ===== 메시지 영역 ===== */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
          {messages.map((m, index) => (
            <MessageBubble
              key={m.id}
              message={m}
              showAvatar={m.sender === "local" && index === 0}
              localName="로컬이름"
            />
          ))}
        </main>

        {/* ===== 하단 입력창 ===== */}
        <footer className="sticky bottom-0 bg-white px-4 pb-4 pt-2">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3">
              {/* 사진 아이콘 (박스 밖) */}
              <button
                type="button"
                className="flex h-[24px] w-[24px] flex-shrink-0 items-center justify-center"
              >
                <Image
                  src="/icon-gallery.svg"
                  alt="사진 첨부"
                  width={24}
                  height={24}
                />
              </button>

              {/* 연회색 박스 안에 input + 보내기 */}
              <div className="flex flex-1 items-center gap-2 rounded-[4px] bg-[#F5F5F5] px-3 py-[10px]">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="메시지를 입력하세요"
                  className="flex-1 border-none bg-transparent text-[13px] text-gray-900 placeholder:text-gray-400 outline-none"
                />

                <button
                  type="submit"
                  className="flex h-[32px] items-center justify-center rounded-[4px] border border-[rgba(0,0,0,0.10)] bg-brand px-4 text-[13px] font-semibold text-white"
                >
                  보내기
                </button>
              </div>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default ChatRoomPage;
