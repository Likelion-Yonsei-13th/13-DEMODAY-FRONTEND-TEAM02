# 백엔드 API 연동 가이드

## 🔗 백엔드 서버
- URL: `http://44.200.3.215`
- 인증 방식: HttpOnly Cookie (JWT)

## 🚀 프론트엔드 개발 서버 실행

```bash
# 의존성 설치 (최초 1회)
npm install

# 개발 서버 시작
npm run dev
```

개발 서버가 실행되면 http://localhost:3000 에서 확인 가능합니다.

---

## 📋 API 사용 예시

### 1. 회원가입

```typescript
import { useSignup } from '@/lib/api/mutations';

function SignupPage() {
  const signup = useSignup();

  const handleSubmit = async () => {
    try {
      const result = await signup.mutateAsync({
        username: "user123",
        email: "user@example.com",
        password: "securePassword123!",
        password2: "securePassword123!",
        role: "USER", // 또는 "LOCAL"
        birth_year: 1995,
        is_over_14: true,
        agreed_service_terms: true,
        agreed_privacy: true,
        agreed_marketing: false,
      });
      console.log(result.message); // "회원가입 완료. 이메일을 확인해주세요."
    } catch (error) {
      console.error("회원가입 실패:", error);
    }
  };

  return <button onClick={handleSubmit}>회원가입</button>;
}
```

### 2. 로그인

```typescript
import { useLogin } from '@/lib/api/mutations';

function LoginPage() {
  const login = useLogin();

  const handleLogin = async () => {
    try {
      const result = await login.mutateAsync({
        username: "user123",
        password: "securePassword123!",
      });
      
      console.log(result);
      // {
      //   message: "로그인 성공",
      //   role: "USER",
      //   next_step: "SELECT_INTERESTS_USER"
      // }
      
      // 쿠키는 자동으로 저장되므로 추가 처리 불필요
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };

  return <button onClick={handleLogin}>로그인</button>;
}
```

### 3. 여행지 목록 조회

```typescript
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/axios-instance';
import { endpoints } from '@/lib/api/endpoints';

function PlacesList() {
  const { data, isLoading } = useQuery({
    queryKey: ['places'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.place.list, {
        params: {
          country: 'South Korea', // 필터 옵션
          search: '서울', // 검색어
        }
      });
      return data;
    }
  });

  if (isLoading) return <div>로딩중...</div>;

  return (
    <div>
      {data?.results?.map((place: any) => (
        <div key={place.id}>
          <h3>{place.name}</h3>
          <p>{place.country} - {place.city}</p>
        </div>
      ))}
    </div>
  );
}
```

### 4. 핫스팟 조회

```typescript
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/axios-instance';
import { endpoints } from '@/lib/api/endpoints';

function HotSpots() {
  const { data } = useQuery({
    queryKey: ['hotspots'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.place.hotspots, {
        params: {
          recent_only: 'true', // 최신 핫스팟만
          limit: 10,
        }
      });
      return data;
    }
  });

  return (
    <div>
      <h2>🔥 요즘 핫한 여행지</h2>
      {data?.results?.map((hotspot: any) => (
        <div key={hotspot.id}>
          <h3>{hotspot.place.name}</h3>
          <p>랭킹: {hotspot.rank}위</p>
          <p>점수: {hotspot.score}</p>
        </div>
      ))}
    </div>
  );
}
```

### 5. 여행지 좋아요

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api/axios-instance';
import { endpoints } from '@/lib/api/endpoints';

function PlaceLikeButton({ placeId }: { placeId: number }) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(endpoints.place.like(placeId));
      return data;
    },
    onSuccess: () => {
      // 좋아요 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['places'] });
    }
  });

  const unlikeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete(endpoints.place.like(placeId));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
    }
  });

  return (
    <div>
      <button onClick={() => likeMutation.mutate()}>❤️ 좋아요</button>
      <button onClick={() => unlikeMutation.mutate()}>💔 취소</button>
    </div>
  );
}
```

### 6. 여행 요청서 작성 (여행자만)

```typescript
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api/axios-instance';
import { endpoints } from '@/lib/api/endpoints';

function CreateRequestForm() {
  const createRequest = useMutation({
    mutationFn: async (requestData: any) => {
      const { data } = await api.post(endpoints.document.requests, requestData);
      return data;
    }
  });

  const handleSubmit = async () => {
    await createRequest.mutateAsync({
      place: 1, // 장소 ID
      date: "2024-12-25",
      experience: "크리스마스 시즌에 서울의 특별한 장소를 방문하고 싶습니다.",
      travel_type: [1, 2], // ThemeTag IDs
    });
  };

  return <button onClick={handleSubmit}>요청서 작성</button>;
}
```

### 7. Root 제안서 작성 (로컬만)

```typescript
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api/axios-instance';
import { endpoints } from '@/lib/api/endpoints';

function CreateRootForm() {
  const createRoot = useMutation({
    mutationFn: async (rootData: any) => {
      const { data } = await api.post(endpoints.document.roots, rootData);
      return data;
    }
  });

  const handleSubmit = async () => {
    await createRoot.mutateAsync({
      place: 1, // 장소 ID
      experience: "제가 추천하는 서울의 숨은 명소입니다.",
      travel_type: [1, 2], // ThemeTag IDs
    });
  };

  return <button onClick={handleSubmit}>제안서 작성</button>;
}
```

### 8. 위시리스트 관리

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api/axios-instance';
import { endpoints } from '@/lib/api/endpoints';

function Wishlist() {
  // 위시리스트 목록 조회
  const { data: wishlists } = useQuery({
    queryKey: ['wishlists'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.wishlist.list);
      return data;
    }
  });

  // 위시리스트 생성
  const createWishlist = useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post(endpoints.wishlist.list, { name });
      return data;
    }
  });

  // 위시리스트 아이템 추가
  const addItem = useMutation({
    mutationFn: async ({ wishlistId, placeId }: any) => {
      const { data } = await api.post(
        endpoints.wishlist.items(wishlistId),
        { place: placeId }
      );
      return data;
    }
  });

  return (
    <div>
      <button onClick={() => createWishlist.mutate("내 여행 버킷리스트")}>
        새 위시리스트
      </button>
    </div>
  );
}
```

### 9. 스토리 작성 및 조회

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api/axios-instance';
import { endpoints } from '@/lib/api/endpoints';

function Stories() {
  // 스토리 목록
  const { data: stories } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.story.list);
      return data;
    }
  });

  // 스토리 작성
  const createStory = useMutation({
    mutationFn: async (storyData: any) => {
      const { data } = await api.post(endpoints.story.list, storyData);
      return data;
    }
  });

  // 스토리 좋아요
  const likeStory = useMutation({
    mutationFn: async (storyId: number) => {
      const { data } = await api.post(endpoints.story.like(storyId));
      return data;
    }
  });

  return <div>스토리 목록</div>;
}
```

---

## 🔒 인증 상태 확인

```typescript
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/axios-instance';
import { endpoints } from '@/lib/api/endpoints';

function useOnboardingStatus() {
  return useQuery({
    queryKey: ['onboarding-status'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.onboarding.next);
      return data;
    },
    retry: false,
  });
}

// 사용 예시
function Dashboard() {
  const { data, isLoading, error } = useOnboardingStatus();

  if (error) {
    // 로그인 안됨
    return <div>로그인이 필요합니다.</div>;
  }

  if (data?.next_step === 'SELECT_INTERESTS_USER') {
    return <div>관심사를 선택해주세요.</div>;
  }

  return <div>대시보드</div>;
}
```

---

## 🧪 테스트 방법

### 1. 백엔드 API 직접 테스트 (curl)

```bash
# 회원가입
curl -X POST http://44.200.3.215/account/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234!@",
    "password2": "Test1234!@",
    "role": "USER",
    "birth_year": 1995,
    "is_over_14": true,
    "agreed_service_terms": true,
    "agreed_privacy": true
  }'

# 로그인
curl -X POST http://44.200.3.215/account/login/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "testuser",
    "password": "Test1234!@"
  }'

# 인증이 필요한 API 호출
curl -X GET http://44.200.3.215/account/onboarding/next/ \
  -b cookies.txt
```

### 2. 브라우저 개발자 도구 테스트

1. http://localhost:3000 접속
2. F12로 개발자 도구 열기
3. Console 탭에서 테스트:

```javascript
// API 인스턴스 가져오기 (콘솔에서)
const api = (await import('/src/lib/api/axios-instance.ts')).default;
const endpoints = (await import('/src/lib/api/endpoints.ts')).endpoints;

// 장소 목록 조회
const places = await api.get(endpoints.place.list);
console.log(places.data);

// 핫스팟 조회
const hotspots = await api.get(endpoints.place.hotspots);
console.log(hotspots.data);
```

---

## 📌 주의사항

1. **CORS 설정**: 백엔드에서 프론트엔드 도메인(`http://localhost:3000`)을 허용해야 함
2. **쿠키 설정**: `withCredentials: true`로 설정되어 있어 쿠키 기반 인증 사용
3. **Role 값**: 백엔드는 `"USER"`와 `"LOCAL"` (대문자) 사용
4. **인증 필요 API**: 대부분의 POST/PATCH/DELETE는 로그인 필요
5. **페이지네이션**: 기본 20개씩 반환 (`PAGE_SIZE: 20`)

---

## 🎯 다음 단계

1. ✅ 환경 변수 설정 완료 (`.env.local`)
2. ✅ API endpoints 업데이트 완료
3. ✅ Axios 인스턴스 쿠키 인증 설정 완료
4. ✅ 로그인/회원가입 mutations 업데이트 완료
5. 🔲 실제 페이지에 API 연동
6. 🔲 에러 처리 및 로딩 상태 UI 추가
7. 🔲 인증 상태 관리 (Zustand)
