# 🧪 회원가입 & 로그인 테스트 가이드

## ✅ 백엔드 연결 상태
- **백엔드 URL**: `http://44.200.3.215`
- **상태**: ✅ 정상 작동 중
- **프론트엔드 설정**: `.env.local`에 `NEXT_PUBLIC_API_BASE_URL=http://44.200.3.215` 설정됨

---

## 🚀 테스트 준비

### 1. 개발 서버 실행
```bash
npm run dev
```

서버가 실행되면:
```
▲ Next.js 16.0.1
- Local:        http://localhost:3000
✓ Ready in 2.5s
```

### 2. 브라우저 개발자 도구 열기 (중요!)
- **F12** 또는 **우클릭 > 검사**
- **Console 탭**: 에러 및 로그 확인
- **Network 탭**: API 요청/응답 확인

---

## 📝 회원가입 테스트

### Step 1: 회원가입 페이지 접속
```
http://localhost:3000/auth/join
```

### Step 2: 정보 입력

| 필드 | 예시 값 | 설명 |
|------|---------|------|
| **이름(닉네임)** | `테스트유저01` | 중복되지 않는 이름 |
| **출생년도** | `1995` | 숫자만 입력 |
| **이메일주소** | `test01@example.com` | 중복되지 않는 이메일 |
| **비밀번호** | `Test1234!@` | 영문, 숫자, 특수문자 포함 |
| **비밀번호 확인** | `Test1234!@` | 위와 동일 |

### Step 3: 약관 동의
- ✅ **전체동의하기** 체크 (가장 간단)
- 또는 필수 항목만 체크:
  - ✅ [필수] 만 14세 이상입니다
  - ✅ [필수] 이용약관에 동의합니다
  - ✅ [필수] 개인정보 처리방침에 동의합니다

### Step 4: 가입하기
- **"가입완료하기"** 버튼 클릭
- 버튼이 "처리중..."으로 변경됨

### Step 5: 결과 확인

#### ✅ 성공한 경우
1. **Alert 메시지**:
   ```
   회원가입이 완료되었습니다. 이메일을 확인해주세요.
   ```
2. **자동 리다이렉트**: 로그인 페이지(`/auth/login`)로 이동
3. **Network 탭 확인**:
   - Request URL: `http://44.200.3.215/account/signup/`
   - Status: `201 Created`
   - Response:
     ```json
     {
       "message": "회원가입 완료. 이메일을 확인해주세요."
     }
     ```

#### ❌ 실패한 경우

**1) CORS 에러 (Network Error)**
```
Console: Network Error
Network 탭: (failed) net::ERR_FAILED
```
**원인**: 백엔드에 CORS 설정이 안됨  
**해결**: `BACKEND_SETUP.md` 참고하여 백엔드에 CORS 설정 추가

**2) 400 Bad Request - 이메일 중복**
```json
{
  "email": ["이미 존재하는 이메일입니다."]
}
```
**해결**: 다른 이메일 주소 사용 (`test02@example.com` 등)

**3) 400 Bad Request - username 중복**
```json
{
  "username": ["이미 존재하는 username입니다."]
}
```
**해결**: 다른 username 사용 (`테스트유저02` 등)

**4) 400 Bad Request - 비밀번호 불일치**
```
비밀번호가 일치하지 않습니다.
```
**해결**: 비밀번호 확인란에 동일한 비밀번호 입력

---

## 🔐 로그인 테스트

### Step 1: 로그인 페이지 접속
```
http://localhost:3000/auth/login
```

### Step 2: 정보 입력

| 필드 | 값 |
|------|----|
| **아이디 또는 이메일** | 회원가입 시 사용한 이름 (예: `테스트유저01`) |
| **비밀번호** | 회원가입 시 사용한 비밀번호 (예: `Test1234!@`) |

> ⚠️ **중요**: 백엔드는 **username**으로 로그인합니다 (이메일 아님!)

### Step 3: 로그인하기
- **"로그인하기"** 버튼 클릭
- 버튼이 "로그인 중..."으로 변경됨

### Step 4: 결과 확인

#### ✅ 성공한 경우

1. **Console 로그**:
   ```
   로그인 성공: {
     message: "로그인 성공",
     role: "USER",
     next_step: "SELECT_INTERESTS_USER"
   }
   ```

2. **쿠키 저장** (Application 탭 확인):
   - `access_token`: JWT 토큰
   - `refresh_token`: Refresh 토큰

3. **자동 리다이렉트**:
   - `next_step: "DONE"` → 홈 페이지 (`/`)
   - `next_step: "SELECT_INTERESTS_USER"` → 온보딩 페이지 (`/onboarding`)
   - `next_step: "SELECT_INTERESTS_LOCAL"` → 온보딩 페이지 (`/onboarding`)

4. **Network 탭**:
   - Request URL: `http://44.200.3.215/account/login/`
   - Status: `200 OK`

#### ❌ 실패한 경우

**1) 아이디/비밀번호 오류**
```
입력 필드 아래에 빨간 텍스트:
"아이디 또는 비밀번호가 올바르지 않습니다."
```
**해결**: 
- username 확인 (이메일이 아님!)
- 비밀번호 확인

**2) 이메일 인증 미완료**
```
Alert: 이메일 인증이 필요합니다. 이메일을 확인해주세요.
```
**원인**: 회원가입 후 이메일 인증을 하지 않음  
**해결**: 
- 백엔드에서 이메일 인증 토큰 확인
- 또는 Django Admin에서 수동으로 `is_active=True` 설정

**3) CORS 에러**
회원가입과 동일한 CORS 에러

---

## 🔍 디버깅 방법

### 1. Network 탭에서 요청 확인

#### 요청 확인 (Request)
```
Method: POST
URL: http://44.200.3.215/account/signup/
Headers:
  Content-Type: application/json
Payload:
  {
    "username": "테스트유저01",
    "email": "test01@example.com",
    "password": "Test1234!@",
    "password2": "Test1234!@",
    "role": "USER",
    "birth_year": 1995,
    ...
  }
```

#### 응답 확인 (Response)
- **Status 200/201**: 성공
- **Status 400**: 입력 오류 (Response 내용 확인)
- **Status 500**: 서버 에러 (백엔드 로그 확인)
- **(failed)**: CORS 또는 네트워크 에러

### 2. Console 로그 확인
```javascript
// 성공 시
로그인 성공: { message: "로그인 성공", role: "USER", next_step: "DONE" }

// 실패 시
로그인 에러: AxiosError { ... }
```

### 3. Application 탭에서 쿠키 확인
**경로**: Application > Storage > Cookies > `http://localhost:3000`

로그인 성공 시 쿠키가 생성되어야 합니다:
- `access_token`: HttpOnly ✅
- `refresh_token`: HttpOnly ✅

> ⚠️ **중요**: 백엔드가 `http://44.200.3.215`에서 쿠키를 설정하지만, 
> 프론트엔드는 `localhost:3000`이므로 **쿠키가 저장되지 않을 수 있습니다**!
> 이 경우 백엔드의 쿠키 설정을 확인해야 합니다.

---

## 🧪 빠른 테스트 스크립트

브라우저 Console에서 직접 API 테스트:

### 회원가입 테스트
```javascript
const api = (await import('/src/lib/api/axios-instance.ts')).default;
const endpoints = (await import('/src/lib/api/endpoints.ts')).endpoints;

// 회원가입
try {
  const result = await api.post(endpoints.auth.signup, {
    username: "console_user",
    email: "console@example.com",
    password: "Test1234!@",
    password2: "Test1234!@",
    role: "USER",
    birth_year: 1995,
    is_over_14: true,
    agreed_service_terms: true,
    agreed_privacy: true,
  });
  console.log("성공:", result.data);
} catch (error) {
  console.error("실패:", error.response?.data || error.message);
}
```

### 로그인 테스트
```javascript
// 로그인
try {
  const result = await api.post(endpoints.auth.login, {
    username: "console_user",
    password: "Test1234!@",
  });
  console.log("로그인 성공:", result.data);
} catch (error) {
  console.error("로그인 실패:", error.response?.data || error.message);
}
```

---

## 📌 자주 묻는 질문 (FAQ)

### Q1: 이메일로 로그인이 안돼요!
**A**: 백엔드는 **username**으로 로그인합니다. 회원가입 시 입력한 "이름(닉네임)"을 사용하세요.

### Q2: CORS 에러가 계속 나요!
**A**: 백엔드에 CORS 설정이 필요합니다. `BACKEND_SETUP.md` 참고

### Q3: 쿠키가 저장되지 않아요!
**A**: 
- 크롬/엣지: F12 > Application > Cookies에서 확인
- `localhost`와 `44.200.3.215`는 다른 도메인이라 쿠키 저장이 안될 수 있습니다
- 해결: 백엔드도 로컬에서 실행하거나, 프론트엔드를 배포하여 같은 도메인 사용

### Q4: 회원가입은 성공했는데 로그인이 안돼요!
**A**: 이메일 인증이 필요할 수 있습니다. Django Admin에서 해당 유저의 `is_active`를 `True`로 변경하세요.

---

## ✅ 테스트 체크리스트

### 회원가입
- [ ] 회원가입 페이지 접속 성공
- [ ] 모든 필드 입력 및 약관 동의
- [ ] "가입완료하기" 버튼 클릭
- [ ] Alert 메시지 확인
- [ ] 로그인 페이지로 리다이렉트 확인
- [ ] Network 탭에서 201 Created 확인

### 로그인
- [ ] 로그인 페이지 접속 성공
- [ ] username과 비밀번호 입력
- [ ] "로그인하기" 버튼 클릭
- [ ] Console에서 "로그인 성공" 로그 확인
- [ ] 쿠키 저장 확인 (Application 탭)
- [ ] 홈 페이지로 리다이렉트 확인
- [ ] Network 탭에서 200 OK 확인

---

## 🎯 다음 단계

로그인/회원가입이 정상 작동하면:

1. **온보딩 페이지** 구현 (관심사 선택 등)
2. **인증 상태 관리** (Zustand)
3. **로그아웃 기능** 추가
4. **Protected Routes** 구현 (로그인 필요한 페이지)
5. **사용자 프로필 페이지** 구현

---

**테스트 중 문제가 발생하면 이 가이드를 참고하세요!** 🚀
