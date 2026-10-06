import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";

import { useCompletedRequestedVideosQuery } from "@apis/queries";
import { HISTORY_QUERY_KEY } from "@apis/query-key";
import { getVideoHistoryDetailApi } from "@apis/video";
import { summarizeRubricScores } from "@utils/rubric";
import { ROUTES } from "@router/constants";
import { PageError, PageLoading } from "@shared/ui";

import { HistoryCard, PageHeader } from "./components";

export default function MentorFeedbackHistory() {
  const navigate = useNavigate();
  const {
    completedRequestedVideos,
    isPendingCompletedRequestedVideos,
    isErrorCompletedRequestedVideos,
  } = useCompletedRequestedVideosQuery();
  const scoreQueries = useQueries({
    queries: (completedRequestedVideos ?? []).map((item) => ({
      queryKey: HISTORY_QUERY_KEY.DETAIL(item.videoId),
      queryFn: () => getVideoHistoryDetailApi(item.videoId),
      retry: 2,
      staleTime: 1000 * 60 * 10,
      gcTime: 1000 * 60 * 15,
    })),
  });

  if (isPendingCompletedRequestedVideos) {
    return <PageLoading />;
  }

  if (isErrorCompletedRequestedVideos) {
    return <PageError />;
  }

  return (
    <div className="flex min-h-screen min-w-300 flex-col gap-9 p-10 pb-30">
      <PageHeader
        title="피드백 히스토리"
        description="멘토가 완료한 피드백 기록을 확인하세요."
      />

      {!completedRequestedVideos?.length ? (
        <div className="flex min-h-80 items-center justify-center rounded-3xl bg-[#F5F5FA] text-2xl font-medium text-[#71718A]">
          완료한 피드백 영상이 없습니다.
        </div>
      ) : (
        <section className="grid grid-cols-2 gap-6">
          {completedRequestedVideos.map((item, index) => {
            const evaluation = scoreQueries[index]?.data?.mentor?.evaluation;
            const scoreSummary = evaluation
              ? summarizeRubricScores(evaluation.scores)
              : null;
            return (
              <HistoryCard
                key={item.videoId}
                item={item}
                totalScore={scoreSummary?.totalScore ?? evaluation?.totalScore}
                itemAverage={scoreSummary?.itemAverage}
                handleClick={(videoId) =>
                  navigate(
                    ROUTES.MENTOR_FEEDBACK_HISTORY_DETAIL(String(videoId)),
                  )
                }
              />
            );
          })}
        </section>
      )}
    </div>
  );
}
