'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const presetError = useMemo(() => params?.get('error') === '1', [params]);

  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [keep, setKeep] = useState(false);

  const idError = presetError || (id.length > 0 && id.length < 3);
  const pwError = presetError || (pw.length > 0 && pw.length < 4);

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">로그인</h1>

        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <input
              className={`input ${idError ? 'input-error' : ''}`}
              placeholder="아이디 또는 이메일"
              value={id}
              onChange={e => setId(e.target.value)}
            />
            {idError && <div className="help-error">아이디 또는 이메일을 다시 확인하세요</div>}
          </div>

          <div>
            <input
              className={`input ${pwError ? 'input-error' : ''}`}
              type="password"
              placeholder="비밀번호"
              value={pw}
              onChange={e => setPw(e.target.value)}
            />
            {pwError && <div className="help-error">비밀번호를 다시 확인하세요</div>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'rgb(var(--text-muted2))' }}>
            <label className="check-row" style={{ fontSize: 12 }}>
              <input type="checkbox" checked={keep} onChange={e => setKeep(e.target.checked)} />
              <span>로그인유지</span>
            </label>
            <Link href="#" className="help">비밀번호찾기</Link>
          </div>

          <button className="btn-cta">로그인하기</button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'rgb(var(--text-muted2))' }}>
            <Link href="/auth/join">회원가입</Link>
            <Link href="#">비밀번호찾기</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
