'use client'; // Provider는 클라이언트 컴포넌트여야 합니다.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useState } from 'react';

// React Query의 옵션을 여기서 전역으로 설정할 수 있습니다.
const queryClientOptions = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
      retry: 1, // 쿼리 실패 시 1번만 재시도
    },
  },
};

export default function Providers({ children }: { children: React.ReactNode }) {
  // QueryClient 인스턴스가 리렌더링 시에도 유지되도록 useState로 관리
  const [queryClient] = useState(() => new QueryClient(queryClientOptions));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경(development)에서만 Devtools가 보이도록 함 */}
      <ReactQueryDevtools initialIsOpen={process.env.NODE_ENV === 'development'} />
    </QueryClientProvider>
  );
}