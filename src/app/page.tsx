import Image from "next/image";
import Navbar from '../components/nav/Navbar';
import TopHeader from "@/components/TopHeader";

const CATEGORIES = Array.from({ length: 10 }, () => "Text");

const TREND = [
  { id: 1, title: "요즘은 이 공방이 유행!", tag: "서울 공방 TOP 10", img: "/travel.png" },
  { id: 2, title: "지금 이 시간만 가능한 뷰", tag: "가을 단풍 명소", img: "/travel.png" },
];

const PROPOSALS = [
  { id: 1, name: "이름", intro: "소개글", img: "/travel.png" },
  { id: 2, name: "이름", intro: "소개글", img: "/travel.png" },
];


export default function HomePage() {
  return (
    <main className="min-h-screen pb-[88px] bg-[#F4F4F4]">
      {/* ===== 헤더 ===== */}

      <TopHeader />

      {/* ===== 활동 카테고리 ===== */}
      <section className="mx-auto w-full max-w-[420px] px-5">
        <h2 className="text-[16px] font-semibold text-gray-900">활동카테고리</h2>

        <div className="mt-3 rounded-xl bg-[#F7F8FA] p-4">
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((t, i) => (
              <button
                key={i}
                type="button"
                className="px-4 py-2 rounded-[30px] border border-[#93AAC3] bg-white text-[14px] text-gray-700"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Trend ===== */}
      <section className="mx-auto w-full max-w-[420px] px-5 mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[20px] font-bold text-gray-900">Trend</h3>
          <button
            type="button"
            className="h-9 w-9 rounded-full border border-gray-300 bg-white grid place-items-center"
            aria-label="추가"
          >
            +
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <div className="flex gap-3 w-max">
            {TREND.map((item) => (
              <article
                key={item.id}
                className="w-[240px] shrink-0 rounded-[12px] bg-white overflow-hidden"
              >
                <div className="relative h-[240px]">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                  <span className="absolute left-3 top-3 text-[12px] font-semibold text-[#0A2D5E] bg-white/90 rounded-full border border-[#0A2D5E] px-3 py-1">
                    NEW
                  </span>
                </div>

                <div className="px-4 py-3">
                  <p className="text-[12px] text-gray-500">{item.tag}</p>
                  <p className="mt-2 text-[16px] font-semibold text-gray-900">
                    {item.title}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 로컬's 제안서 ===== */}
      <section className="mx-auto w-full max-w-[420px] px-5 mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-[20px] font-bold text-gray-900">로컬&apos;s 제안서</h3>
          <button className="text-[12px] text-gray-500" type="button">
            실시간 제안서 더보기
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <div className="flex gap-3 w-max">
            {PROPOSALS.map((p) => (
              <article
                key={p.id}
                className="w-[240px] shrink-0 rounded-[12px] bg-white overflow-hidden"
              >
                <div className="relative h-[240px]">
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div>
                      <p className="text-[14px] font-medium text-gray-900">
                        {p.name}
                      </p>
                      <p className="text-[12px] text-gray-500">{p.intro}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    <Navbar />
    </main>
  );
}
