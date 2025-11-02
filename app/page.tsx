'use client'; // React Hook(useQuery, useUserStore)을 사용하므로 클라이언트 컴포넌트여야 함

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient'; // 3단계에서 만든 Axios 인스턴스
import { useUserStore } from '@/store/useUserStore'; // 5단계에서 만든 Zustand 스토어

// API 응답 데이터의 타입을 정의합니다.
interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

/**
 * React Query의 queryFn으로 사용될 API 호출 함수입니다.
 * 3단계에서 만든 apiClient를 사용합니다.
 */
const fetchPosts = async (): Promise<Post[]> => {
  // .env.local에 설정한 baseURL (jsonplaceholder)에서 /posts 를 가져옵니다.
  // apiClient의 응답 인터셉터 덕분에 response.data가 바로 반환됩니다.
  const data = await apiClient.get('/posts?_limit=5');
  return data;
};

export default function Home() {
  // 1. Zustand (클라이언트 상태) 훅을 사용합니다.
  const { isLoggedIn, username, login, logout } = useUserStore();

  // 2. React Query (서버 상태) 훅을 사용합니다.
  const {
    data: posts, // API 응답 데이터
    isLoading, // 로딩 중 상태
    isError, // 에러 발생 상태
    error, // 에러 객체
  } = useQuery<Post[], Error>({
    queryKey: ['posts'], // 이 쿼리를 식별하는 고유 키
    queryFn: fetchPosts, // 데이터를 가져올 함수
  });

  // 3. Tailwind CSS로 스타일링합니다.
  return (
    <main className="flex min-h-screen flex-col items-center p-12 md:p-24 bg-gray-100 font-sans">
      <h1 className="text-4xl font-extrabold text-indigo-700 mb-10 drop-shadow-md">
        🚀 데모데이 프로젝트 세팅 완료!
      </h1>

      {/* Zustand 예제 섹션 */}
      <section className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl border border-gray-200 mb-8">
        <h2 className="text-2xl font-bold mb-5 text-gray-800 border-b pb-2">
          Zustand (클라이언트 상태 관리)
        </h2>
        {isLoggedIn ? (
          <div className="flex items-center justify-between">
            <p className="text-lg">
              환영합니다, <span className="font-semibold text-indigo-600">{username}</span>님!
            </p>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-lg text-gray-600">로그인이 필요합니다.</p>
            <button
              onClick={() => login('데모데이User')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 shadow"
            >
              로그인 (클릭)
            </button>
          </div>
        )}
      </section>

      {/* React Query + Axios 예제 섹션 */}
      <section className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-5 text-gray-800 border-b pb-2">
          React Query + Axios (서버 상태 관리)
        </h2>
        <div>
          {/* 로딩 중 UI */}
          {isLoading && <p className="text-center text-blue-500">포스트 목록을 불러오는 중...</p>}
          
          {/* 에러 발생 UI */}
          {isError && (
            <p className="text-center text-red-500">
              에러 발생: {error ? error.message : '알 수 없는 에러'}
            </p>
          )}

          {/* 성공 시 데이터 표시 UI */}
          {posts && (
            <ul className="space-y-4">
              {posts.map((post) => (
                <li key={post.id} className="p-4 bg-gray-50 rounded-md border border-gray-200 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg text-gray-900">{post.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{post.body.substring(0, 60)}...</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}