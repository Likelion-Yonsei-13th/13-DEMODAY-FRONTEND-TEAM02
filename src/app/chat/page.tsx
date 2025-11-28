"use client";

import React, { useState, TouchEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/** 탭 타입 */
type ChatFilter = "all" | "unread" | "favorite" | "confirmed";

/** 채팅방 요약 정보 (UI용) */
interface ChatSummary {
  id: string;
  localName?: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  isFavorite?: boolean;

  // 여행 확정 관련 (나중에 API 붙이면 채워질 필드)
  isConfirmed?: boolean;
  travelDate?: string | null;
  proposalCategory?: string;
  proposalTitle?: string;
  proposalSummary?: string;
  localNickname?: string;
}

/* ======================== */
/* 탭 컴포넌트              */
/* ======================== */

const TABS: { key: ChatFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "unread", label: "안읽음" },
  { key: "favorite", label: "즐겨찾기" },
  { key: "confirmed", label: "여행확정" },
];

interface ChatTabsProps {
  value: ChatFilter;
  onChange: (value: ChatFilter) => void;
}

const ChatTabs: React.FC<ChatTabsProps> = ({ value, onChange }) => {
  return (
    <div className="flex border-b border-gray-200 text-16px">
      {TABS.map((tab) => {
        const isActive = value === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex-1 py-3 text-center relative transition-colors ${
              isActive ? "text-[#F6BB33] font-bold" : "text-black font-bold"
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute left-1/2 -bottom-px h-[2px] w-10 -translate-x-1/2 bg-[#F6BB33]" />
            )}
          </button>
        );
      })}
    </div>
  );
};

/* ======================== */
/* 채팅 없음(빈 상태)      */
/* ======================== */

interface EmptyChatStateProps {
  onClickRequest?: () => void;
}

const EmptyChatState: React.FC<EmptyChatStateProps> = ({ onClickRequest }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-10">
        <Image src="/icon_check.svg" alt="체크" width={70} height={70} />
        

      <p className="mt-3 mb-6 text-center text-[24px] leading-relaxed text-gray-900">
        메시지가 없습니다
        <br />
        마음에 드는 로컬과 상담해보세요
      </p>

      <button
        type="button"
        className="btn-yellow"
        onClick={onClickRequest}
      >
        상담요청하기
      </button>
    </div>
  );
};

/* ======================== */
/* 여행확정 카드           */
/* ======================== */

type TravelStatus = "upcoming" | "completed";

interface ConfirmedChatItemProps {
  chat: ChatSummary;
  onOpen: (chatId: string) => void;
  onPrimaryAction?: (chatId: string, status: TravelStatus) => void;
}

const ConfirmedChatItem: React.FC<ConfirmedChatItemProps> = ({
  chat,
  onOpen,
  onPrimaryAction,
}) => {
  // 간단한 D-day 계산 (travelDate가 없으면 D-0)
  const computeStatus = (): { status: TravelStatus; label: string } => {
    if (!chat.travelDate) {
      return { status: "upcoming", label: "여행까지 D-0" };
    }

    const today = new Date();
    const travel = new Date(chat.travelDate);

    const today0 = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const travel0 = new Date(
      travel.getFullYear(),
      travel.getMonth(),
      travel.getDate()
    );

    const diffMs = travel0.getTime() - today0.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays >= 0) {
      return { status: "upcoming", label: `여행까지 D-${diffDays}` };
    }
    return {
      status: "completed",
      label: "여행은 어떠셨나요? 후기를 작성해주세요",
    };
  };

  const { status, label } = computeStatus();

  const handleCardClick = () => onOpen(chat.id);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrimaryAction ? onPrimaryAction(chat.id, status) : onOpen(chat.id);
  };

  const category = chat.proposalCategory || "종로구 한국체험";
  const title = chat.proposalTitle || "종로구 A to Z 체험!";
  const summary =
    chat.proposalSummary || "로컬이 적는 제안서 한줄 정리입니다";
  const nickname = chat.localNickname || "로컬이름(닉네임)";

  return (
    <div
      className="mx-4 mt-4 cursor-pointer rounded-2xl bg-white px-4 py-4 shadow-sm"
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300" />
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-[11px] text-gray-500">{category}</span>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500">{summary}</p>
          <p className="mt-3 text-[11px] text-gray-400">{nickname}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          className="btn-yellow"
          onClick={handleButtonClick}
        >
          {label}
        </button>
      </div>
    </div>
  );
};



/* ======================== */
/* 채팅 리스트 아이템      */
/* (스와이프: 삭제 / 즐겨찾기) */
/* ======================== */

interface ChatListItemProps {
  chat: ChatSummary;
  onOpen: (chatId: string) => void;
  onToggleFavorite?: (chatId: string, next: boolean) => void;
  onDelete?: (chatId: string) => void;
}

// Figma 기준 삭제 58px + 즐겨찾기 58px ≈ 116px
const ACTION_WIDTH = 116;

const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  onOpen,
  onToggleFavorite,
  onDelete,
}) => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [reveal, setReveal] = useState(0); // 0 = 닫힘, 1 = 완전 열림

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartX;

    // 왼쪽으로 밀 때만 열리게
    if (deltaX < 0) {
      const ratio = Math.min(1, Math.max(0, -deltaX / ACTION_WIDTH));
      setReveal(ratio);
    } else {
      // 오른쪽으로 밀면 닫는 방향
      setReveal(0);
    }
  };

  const handleTouchEnd = () => {
    // 절반 이상 열렸으면 완전히 열기, 아니면 닫기
    setReveal((prev) => (prev >= 0.5 ? 1 : 0));
    setTouchStartX(null);
  };

  const handleRowClick = () => {
    // 열려 있으면 먼저 닫기만
    if (reveal > 0) {
      setReveal(0);
      return;
    }
    onOpen(chat.id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReveal(0);
    onToggleFavorite?.(chat.id, !chat.isFavorite);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReveal(0);
    onDelete?.(chat.id);
  };

  const hasUnread = (chat.unreadCount ?? 0) > 0;

  return (
    <div className="relative w-full overflow-hidden bg-white">
      {/* 오른쪽 액션 박스 (셀 위에 떠 있는 레이어, 기본은 완전 숨김) */}
      <div
        className="absolute inset-y-0 right-0 z-10 flex w-[116px]"
        style={{
          transform: `translateX(${(1 - reveal) * 100}%)`,
          transition: touchStartX ? "none" : "transform 0.15s ease-out",
        }}
      >
        {/* 왼쪽: 흰 배경 + trash 아이콘 */}
        <button
          type="button"
          onClick={handleDelete}
          className="flex h-full w-[58px] items-center justify-center bg-white"
        >
          <Image
            src="/yellow-trash.svg"
            alt="삭제"
            width={18}
            height={18}
          />
        </button>

        {/* 오른쪽: 노랑 배경 + star 아이콘 */}
        <button
          type="button"
          onClick={handleFavorite}
          className="flex h-full w-[58px] items-center justify-center bg-[#F6BB33]"
        >
          <Image src="/star.svg" alt="즐겨찾기" width={18} height={18} />
        </button>
      </div>

      {/* 실제 채팅 셀 (이건 그대로, 슬라이드 안 됨) */}
      <div
        className="relative z-0 flex w-full cursor-pointer items-stretch bg-white px-4 py-3"
        onClick={handleRowClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 프로필 동그라미 */}
        <div className="mr-3 mt-[2px] h-10 w-10 flex-shrink-0 rounded-full bg-gray-300" />

        {/* 텍스트 영역 */}
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          {/* 1줄째: 로컬이름 + 시간 */}
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-gray-900">
              {chat.localName || "로컬이름"}
            </span>
            
            {hasUnread && (
                <span className="ml-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-[5px] text-[10px] font-semibold text-white">
                    {chat.unreadCount}
                </span>
            )}
          </div>

          {/* 2줄째: 요청서 제목 (회색) */}
          <p className="mt-[2px] truncate text-[11px] text-gray-400">
            {chat.proposalTitle ||
              "내가 요청했던 제안서 제목(종로구 한국 체험) 받은"}
          </p>

          {/* 3줄째: 최근 메세지 (검정) */}
          <div className="mt-[1px] flex items-center gap-2">
            <p className="flex-1 truncate text-[12px] text-gray-900">
              {chat.lastMessagePreview ||
                "안녕하세요 무엇이 궁금하신가요?"}
            </p>

            <span className="ml-2 whitespace-nowrap text-[10px] text-gray-400">
                {chat.lastMessageAt || "TT:TT.YY.MM.DD"}
            </span>
          </div>
        </div>
      </div>

      {/* 리스트 하단 구분선 */}
      <div className="h-px w-full bg-gray-100" />
    </div>
  );
};

/* ======================== */
/* 채팅 리스트 전체         */
/* ======================== */

interface ChatListProps {
  chats: ChatSummary[];
  filter: ChatFilter;
  onOpenChat: (chatId: string) => void;
  onToggleFavorite?: (chatId: string, next: boolean) => void;
  onDelete?: (chatId: string) => void;
  onClickRequest?: () => void;
  onClickConfirmedPrimary?: (
    chatId: string,
    status: "upcoming" | "completed"
  ) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  filter,
  onOpenChat,
  onToggleFavorite,
  onDelete,
  onClickRequest,
  onClickConfirmedPrimary,
}) => {
  const confirmedChats = chats.filter((c) => c.isConfirmed);

  // 여행확정 탭
  if (filter === "confirmed") {
    if (confirmedChats.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center py-10 text-xs text-gray-400">
          여행이 확정된 채팅이 아직 없습니다.
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto pb-4">
        {confirmedChats.map((chat) => (
          <ConfirmedChatItem
            key={chat.id}
            chat={chat}
            onOpen={onOpenChat}
            onPrimaryAction={onClickConfirmedPrimary}
          />
        ))}
      </div>
    );
  }

  const filtered = chats.filter((chat) => {
    if (filter === "unread") return (chat.unreadCount ?? 0) > 0;
    if (filter === "favorite") return !!chat.isFavorite;
    return true;
  });

  // 전체 탭 & 전체 채팅 0개 → 빈 상태
  if (filter === "all" && chats.length === 0) {
    return <EmptyChatState onClickRequest={onClickRequest} />;
  }

  // 특정 탭 안에 데이터가 없을 때
  if (filtered.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-10 text-xs text-gray-400">
        이 탭에 표시할 채팅이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {filtered.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          onOpen={onOpenChat}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};


/* ======================== */
/* 최상위 페이지 컴포넌트   */
/* ======================== */

const ChatPage: React.FC = () => {
  const [filter, setFilter] = useState<ChatFilter>("all");
  const router = useRouter();

  // 🔹 지금은 API 연동 전이라 빈 배열.
  // 나중에 axios/swr/react-query로 채워 넣으면 됨.
  // const chats: ChatSummary[] = [];


  // UI 확인용 더미데이터  
  const chats: ChatSummary[] = [
  {
    id: "1",
    localName: "로컬이름",
    lastMessagePreview:
      "내가 요청했던 제안서 제목(종로구 한국 체험) 받은 안녕하세요 무엇이 궁금하신가요?",
    lastMessageAt: "24.11.27",
    unreadCount: 3,
    isFavorite: true,
  },
  {
    id: "2",
    localName: "로컬이름",
    lastMessagePreview: "안녕하세요! 여행 일정 관련해서 안내드립니다.",
    lastMessageAt: "24.11.20",
    unreadCount: 0,
    isFavorite: false,
    isConfirmed: true,
    travelDate: "2025-12-20",
    proposalCategory: "종로구 한국체험",
    proposalTitle: "종로구 A to Z 체험!",
    proposalSummary: "로컬이 적는 제안서 한줄 정리입니다",
    localNickname: "로컬이름(닉네임)",
  },
];


  const handleOpenChat = (chatId: string) => {
    // 나중에 /chat/[roomId] 라우트 만들면 여기로 이동
    router.push(`/chat/${chatId}`);
  };

  const handleToggleFavorite = (chatId: string, next: boolean) => {
    // TODO: 즐겨찾기 API 연동
    console.log("toggle favorite", chatId, next);
  };

  const handleDelete = (chatId: string) => {
    // TODO: 삭제 API 연동
    console.log("delete chat", chatId);
  };

  const handleRequest = () => {
    // TODO: 상담요청 페이지로 이동
    router.push("/request"); // 실제 경로에 맞게 수정
  };

  const handleConfirmedAction = (
    chatId: string,
    status: "upcoming" | "completed"
  ) => {
    if (status === "upcoming") {
      router.push(`/chat/${chatId}`);
    } else {
      router.push(`/review?chatId=${chatId}`); // 후기 작성 페이지 경로 맞게 수정
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-[420px] flex-col px-4 pt-6 pb-4">
        {/* 상단 타이틀 (상단 공통 헤더가 따로 있으면 제거해도 됨) */}
        <header className="mb-3">
          <h1 className="text-[20px] font-bold text-black">채팅</h1>
        </header>

        {/* 흰 카드 영역 */}
        <section className="flex flex-1 flex-col bg-white">
          <ChatTabs value={filter} onChange={setFilter} />

          <ChatList
            chats={chats}
            filter={filter}
            onOpenChat={handleOpenChat}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDelete}
            onClickRequest={handleRequest}
            onClickConfirmedPrimary={handleConfirmedAction}
          />
        </section>
      </div>
    </div>
  );
};

export default ChatPage;
