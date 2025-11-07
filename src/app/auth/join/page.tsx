'use client';

import { useState } from 'react';

export default function EmailJoinPage() {
  const [name, setName] = useState('홍길동');
  const [email, setEmail] = useState('ID@dtour.com');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [allAgree, setAllAgree] = useState(false);

  const pwInvalid  = pw.length > 0  && (pw.length < 8 || pw.length > 15);
  const pw2Invalid = pw2.length > 0 && pw2 !== pw;

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">이메일로 회원가입</h1>

        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <label className="label">이름*</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" />
          </div>

          <div>
            <label className="label">이메일주소*</label>
            <input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="ID@dtour.com" />
          </div>

          <div>
            <label className="label">비밀번호*</label>
            <input
              className={`input ${pwInvalid ? 'input-error' : ''}`}
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="영문, 숫자, 특수문자 2가지 조합 8~15자"
            />
            {pwInvalid && <div className="help-error">비밀번호 규칙을 확인해주세요.</div>}
          </div>

          <div>
            <label className="label">비밀번호 확인*</label>
            <input
              className={`input ${pw2Invalid ? 'input-error' : ''}`}
              type="password"
              value={pw2}
              onChange={e => setPw2(e.target.value)}
              placeholder="비밀번호를 한 번 더 입력해주세요"
            />
            {pw2Invalid && <div className="help-error">비밀번호가 일치하지 않습니다.</div>}
          </div>

          <div className="check-row" style={{ marginTop: 4 }}>
            <input id="all" type="checkbox" checked={allAgree} onChange={e => setAllAgree(e.target.checked)} />
            <label htmlFor="all" style={{ fontWeight: 700 }}>전체동의하기</label>
          </div>
          <div className="help">
            비밀번호를 한 번 더 입력해주세요. 전체 동의하기를 선택할 경우 선택적 동의에도 동의한 것으로 처리될 수 있습니다.
          </div>

          <div className="terms-box">
            <label className="check-row"><input type="checkbox" /> [필수] 만 14세 이상입니다</label>
            <label className="check-row"><input type="checkbox" /> [필수] 만 14세 이상입니다</label>
            <label className="check-row"><input type="checkbox" /> [필수] 만 14세 이상입니다</label>
            <label className="check-row"><input type="checkbox" /> [선택] 마케팅 수신 동의</label>
          </div>

          <button className="btn-cta">가입완료하기</button>
        </div>
      </div>
    </main>
  );
}
