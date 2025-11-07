'use client';

export default function AuthLandingPage() {
  return (
    <main className="auth-page">
      <div className="sign-landing">
        {/* 상단 스켈레톤 */}
        <div className="mock">
          <div className="row"><div className="tile"/><div className="tile"/></div>
          <div className="row"><div className="tile"/><div className="tile"/></div>
          <div className="row"><div className="tile"/><div className="tile"/></div>
        </div>

        {/* 하단 패널 (배경 그라디언트는 ::before, 실제 내용은 panel-content) */}
        <div className="panel">
          <div className="panel-content">
            <p className="title">
              로컬들처럼 하는<br/>나만의 여행, 같이 해볼까요?
            </p>
            <div className="stack">
              <button className="btn-cta">가입하기</button>
              <button className="btn-outline">인스타 계정으로 가입하기</button>
              <button className="btn-outline">인스타 계정으로 가입하기</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
