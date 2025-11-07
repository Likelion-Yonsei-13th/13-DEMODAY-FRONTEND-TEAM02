'use client';

export default function HomePage() {
  return (
    <main className="space-y-8">
      <section className="container grid gap-4 md:grid-cols-2 items-center">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">DemoDay Front</h1>
          <p className="text-muted">디자인 토큰 기반 Tailwind v4 세팅. 시안 확정 시 토큰만 교체.</p>
          <div className="flex gap-2">
            <button className="btn btn-primary">Get Started</button>
            <button className="btn btn-ghost">Learn more</button>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <pre className="text-xs text-muted">{`{ "ok": true, "message": "healthy!" }`}</pre>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="section">
          <h2>Features</h2>
          <p className="text-muted">핵심 섹션 3열 카드</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {['Fast setup', 'Type-safe', 'API-ready'].map((t) => (
            <div key={t} className="card">
              <div className="card-body">
                <h3 className="font-semibold">{t}</h3>
                <p className="text-sm text-muted mt-1">설명 텍스트 자리.</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
