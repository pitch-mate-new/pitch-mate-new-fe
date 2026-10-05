import type { VideoHistoryDetailEvaluation } from "@apis/types";
import { compareVideoEvaluations } from "@utils/evaluation-comparison";

interface Props {
  videoId: number;
  ai: VideoHistoryDetailEvaluation | null;
  mentor: VideoHistoryDetailEvaluation | null;
}

export default function EvaluationComparison({ videoId, ai, mentor }: Props) {
  const rows = compareVideoEvaluations(videoId, ai, mentor);
  const reviewCount = rows?.filter((row) => row.needsReview).length ?? 0;
  const hasUnavailableRows = rows?.some((row) => row.difference === null);

  return (
    <section aria-labelledby="evaluation-comparison-title" className="flex min-w-0 flex-col gap-5 rounded-3xl p-6 shadow-[0_1.6px_4.8px_0_rgba(0,0,0,0.10)] sm:p-9">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="evaluation-comparison-title" className="text-2xl font-semibold">동일 영상 AI·멘토 점수 비교</h2>
        {!!reviewCount && <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-800">검토 필요 {reviewCount}개</span>}
      </div>
      <p className="text-lg text-[#71718A]">각 항목은 10점 만점이며, 차이는 멘토 점수 − AI 점수입니다. 차이가 ±3점 이상이면 검토가 필요합니다.</p>
      {!rows?.length ? (
        <p className="rounded-2xl bg-[#F5F5FA] p-5 text-[#71718A]">
          {!ai || !mentor ? "AI와 멘토 평가가 모두 등록되면 점수 차이를 확인할 수 있습니다." : "같은 영상의 비교 가능한 평가 항목을 확인할 수 없습니다."}
        </p>
      ) : (
        <>
          {(hasUnavailableRows || rows.length !== 20) && <p role="status" className="text-amber-800">일부 평가 항목이 누락되었거나 서로 일치하지 않습니다. 양쪽 점수를 확인할 수 있는 항목만 비교합니다.</p>}
          <div className="grid gap-3">
            {rows.map((row) => (
              <div key={row.rubricId} className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${row.needsReview ? "border-amber-300 bg-amber-50" : "border-[#E5E5F0]"}`}>
                <h3 className="font-semibold">{row.rubricTitle}</h3>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm sm:text-base">
                  <span>AI <strong>{row.aiScore ?? "—"}</strong></span>
                  <span>멘토 <strong>{row.mentorScore ?? "—"}</strong></span>
                  <span>차이 <strong>{row.difference === null ? "비교 불가" : `${row.difference > 0 ? "+" : ""}${row.difference}점`}</strong></span>
                  {row.needsReview && <span className="rounded-lg bg-amber-100 px-2 py-1 font-semibold text-amber-900">검토 필요</span>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-[#71718A]">점수 차이는 평가 관점의 차이를 확인하기 위한 정보입니다. 두 회차 사이의 향상도를 의미하지 않습니다.</p>
        </>
      )}
    </section>
  );
}
