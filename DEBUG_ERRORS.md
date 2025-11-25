# 🔍 에러 디버깅 가이드

## 400 Bad Request 에러 확인 방법

### 1. 브라우저 개발자 도구 열기
**F12** 누르기

### 2. Network 탭 선택
1. **Network** 탭 클릭
2. 회원가입 버튼 다시 클릭
3. `signup` 요청 찾기 (빨간색으로 표시됨)

### 3. Response 확인
`signup` 요청 클릭 → **Response** 탭 확인

에러 메시지 예시:
```json
{
  "username": ["이미 존재하는 username입니다."],
  "email": ["이미 존재하는 이메일입니다."],
  "password": ["비밀번호가 너무 짧습니다."]
}
```

---

## 자주 발생하는 400 에러

### 1. Username 중복
```json
{
  "username": ["A user with that username already exists."]
}
```
**해결**: 다른 이름 사용 (예: `테스트유저02`)

### 2. 이메일 중복
```json
{
  "email": ["이미 존재하는 이메일입니다."]
}
```
**해결**: 다른 이메일 사용 (예: `test02@example.com`)

### 3. 비밀번호 유효성 검사 실패
```json
{
  "password": ["This password is too short. It must contain at least 8 characters."]
}
```
**해결**: 8자 이상, 영문/숫자/특수문자 포함

### 4. display_name 오류
```json
{
  "display_name": ["This field may not be blank."]
}
```
**해결**: 프론트엔드 코드 수정 필요

---

## 빠른 테스트용 새 계정 정보

매번 다른 정보로 테스트하세요:

| 시도 | Username | Email |
|------|----------|-------|
| 1차 | `test_user_001` | `test001@example.com` |
| 2차 | `test_user_002` | `test002@example.com` |
| 3차 | `test_user_003` | `test003@example.com` |

비밀번호는 모두 동일: `Test1234!@`

---

## Console에서 직접 API 테스트

```javascript
const api = (await import('/src/lib/api/axios-instance.ts')).default;
const endpoints = (await import('/src/lib/api/endpoints.ts')).endpoints;

// 테스트 회원가입
try {
  const result = await api.post(endpoints.auth.signup, {
    username: "debug_user_" + Date.now(), // 고유한 이름
    email: `debug${Date.now()}@example.com`, // 고유한 이메일
    password: "Test1234!@",
    password2: "Test1234!@",
    role: "USER",
    display_name: "디버그유저",
    birth_year: 1995,
    is_over_14: true,
    agreed_service_terms: true,
    agreed_privacy: true,
    agreed_marketing: false,
  });
  console.log("✅ 성공:", result.data);
} catch (error) {
  console.error("❌ 실패:", error.response?.data);
}
```

---

## 현재 문제 확인

지금 바로 확인해주세요:

1. **F12** > **Network** 탭
2. 회원가입 버튼 클릭
3. `signup` 요청 클릭
4. **Response** 탭에서 에러 메시지 확인

에러 메시지를 복사해서 보내주시면 정확한 해결 방법을 알려드릴 수 있습니다!
