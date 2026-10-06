import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";

import {
  useDeleteVideoMutation,
  useVideoHistoryDetailQuery,
} from "@apis/queries";
import type { VideoHistoryDetailResponse } from "@apis/types";
import { PageError, PageLoading } from "@shared/ui";
import { ROUTES } from "@router/constants";
import { deleteAnalysisApi, requestAnalysisApi } from "@apis/video";
import { HISTORY_QUERY_KEY } from "@apis/query-key";
import useToast from "@hooks/use-toast";
import EvaluationComparison from "./components/evaluation-comparison";

import {
  DeleteVideoConfirmModal,
  FeedbackResultSection,
  FeedbackViewSelector,
  HistoryDetailHeader,
  HistoryDetailVideo,
} from "./components";
import type {
  FeedbackCategoryScore,
  FeedbackResult,
  FeedbackType,
  FeedbackViewType,
  RubricDetailType,
} from "./types";

const EMPTY_CATEGORY_SCORE: FeedbackCategoryScore = {
  speechAvg: 0,
  nonVerbalAvg: 0,
  deliveryAvg: 0,
};

const toFeedback = (
  feedback: NonNullable<VideoHistoryDetailResponse["ai"]>["feedbacks"][number],
): FeedbackType => ({
  id: feedback.feedbackId,
  authorId: feedback.authorId ?? 0,
  authorNickname: feedback.authorNickname,
  startTimeSeconds: feedback.startTimeSeconds,
  endTimeSeconds: feedback.endTimeSeconds,
  content: feedback.content,
  createdAt: feedback.createdAt,
});

const toRubricScores = (
  evaluation: NonNullable<VideoHistoryDetailResponse["ai"]>["evaluation"],
): RubricDetailType[] =>
  evaluation?.scores.map((score) => ({
    rubricId: score.rubricId,
    rubricTitle: score.rubricTitle,
    score: score.score,
  })) ?? [];

const toFeedbackResult = ({
  label,
  feedbacks,
  evaluation,
  categoryScore,
}: {
  label: string;
  feedbacks: NonNullable<VideoHistoryDetailResponse["ai"]>["feedbacks"];
  evaluation: NonNullable<VideoHistoryDetailResponse["ai"]>["evaluation"];
  categoryScore: NonNullable<
    VideoHistoryDetailResponse["ai"]
  >["categoryScores"];
}): FeedbackResult | null => {
  if (!evaluation && feedbacks.length === 0) {
    return null;
  }

  return {
    label,
    overallComment: evaluation?.comment ?? "",
    feedbacks: feedbacks.map(toFeedback),
    totalScore: evaluation?.totalScore ?? 0,
    categoryScore: categoryScore ?? EMPTY_CATEGORY_SCORE,
    rubricScores: toRubricScores(evaluation),
  };
};

const EMPTY_FEEDBACK_MESSAGE: Record<FeedbackViewType, string> = {
  AI: "아직 AI 피드백이 없습니다.",
  MENTOR: "아직 멘토가 피드백하지 않았습니다.",
  ALL: "아직 표시할 피드백이 없습니다.",
};

export default function VideoHistoryDetail() {
  const { videoId } = useParams();
  const parsedVideoId = videoId === undefined ? null : Number(videoId);
  const isInvalidVideoId =
    parsedVideoId === null || Number.isNaN(parsedVideoId);
  const historyVideoId = isInvalidVideoId ? null : parsedVideoId;

  const { historyDetail, isPendingHistoryDetail, isErrorHistoryDetail } =
    useVideoHistoryDetailQuery(historyVideoId);
  const { deleteVideo, isPendingDeleteVideo } = useDeleteVideoMutation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const reanalyze = useMutation({
    mutationFn: async () => {
      const analysis = historyDetail?.ai?.analysis;
      if (!analysis) throw new Error("분석 정보를 찾을 수 없습니다.");
      await deleteAnalysisApi(analysis.analysisId);
      return requestAnalysisApi(historyVideoId ?? 0);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: HISTORY_QUERY_KEY.DETAIL(historyVideoId ?? 0),
      });
      await queryClient.invalidateQueries({
        queryKey: HISTORY_QUERY_KEY.DEFAULT,
      });
      toast.info("분석을 다시 요청했습니다.");
    },
    onError: (error) => toast.error(`재분석 요청 실패: ${error.message}`),
  });
  const [selectedView, setSelectedView] = useState<FeedbackViewType>("AI");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (isInvalidVideoId || historyVideoId === null) {
    return <Navigate to={ROUTES.VIDEO_HISTORY} replace />;
  }

  if (isPendingHistoryDetail) {
    return <PageLoading />;
  }

  if (isErrorHistoryDetail || !historyDetail) {
    return <PageError />;
  }

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false);
  };
  const handleConfirmDelete = () => {
    deleteVideo(historyVideoId);
    setIsDeleteModalOpen(false);
  };

  const shouldShowFeedbackSelector =
    historyDetail.mentorFeedbackStatus !== "NOT_REQUESTED";

  const aiFeedbackResult = toFeedbackResult({
    label: "AI 피드백",
    feedbacks: historyDetail.ai?.feedbacks ?? [],
    evaluation: historyDetail.ai?.evaluation ?? null,
    categoryScore: historyDetail.ai?.categoryScores ?? null,
  });
  const mentorFeedbackResult = toFeedbackResult({
    label: "멘토 피드백",
    feedbacks: historyDetail.mentor?.feedbacks ?? [],
    evaluation: historyDetail.mentor?.evaluation ?? null,
    categoryScore: historyDetail.mentor?.categoryScores ?? null,
  });

  const visibleFeedbackView = shouldShowFeedbackSelector ? selectedView : "AI";

  const feedbackResults =
    visibleFeedbackView === "AI"
      ? [aiFeedbackResult].filter((result) => result !== null)
      : visibleFeedbackView === "MENTOR"
        ? [mentorFeedbackResult].filter((result) => result !== null)
        : [aiFeedbackResult, mentorFeedbackResult].filter(
            (result) => result !== null,
          );

  return (
    <div className="flex flex-col gap-10 p-10">
      <HistoryDetailHeader
        title={historyDetail.video.title}
        createdAt={historyDetail.video.createdAt}
        isDeleting={isPendingDeleteVideo}
        onClickDelete={() => setIsDeleteModalOpen(true)}
      />
      <HistoryDetailVideo videoUrl={historyDetail.video.videoUrl} />
      {historyDetail.ai?.analysis?.status === "FAILED" && (
        <section
          role="alert"
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <div>
            <h2 className="font-semibold text-red-800">
              AI 분석에 실패했습니다.
            </h2>
            <p className="mt-1 text-red-700">
              {historyDetail.ai.analysis.errorMessage ||
                "실패 원인이 제공되지 않았습니다."}
            </p>
          </div>
          <button
            type="button"
            disabled={reanalyze.isPending}
            onClick={() => reanalyze.mutate()}
            className="rounded-xl bg-[#6868FF] px-5 py-3 font-semibold text-white disabled:opacity-60"
          >
            {reanalyze.isPending ? "재요청 중..." : "다시 분석 요청"}
          </button>
        </section>
      )}
      {shouldShowFeedbackSelector && (
        <FeedbackViewSelector
          selectedView={selectedView}
          handleChangeView={setSelectedView}
        />
      )}
      {visibleFeedbackView === "ALL" && (
        <EvaluationComparison
          videoId={historyVideoId}
          ai={historyDetail.ai?.evaluation ?? null}
          mentor={historyDetail.mentor?.evaluation ?? null}
        />
      )}
      {feedbackResults.length === 0 ? (
        <div className="flex min-h-50 items-center justify-center rounded-3xl bg-[#F5F5FA] text-2xl font-medium text-[#71718A]">
          {EMPTY_FEEDBACK_MESSAGE[visibleFeedbackView]}
        </div>
      ) : (
        feedbackResults.map((result) => (
          <FeedbackResultSection key={result.label} result={result} />
        ))
      )}
      {isDeleteModalOpen && (
        <DeleteVideoConfirmModal
          isPending={isPendingDeleteVideo}
          onCancel={handleCloseModal}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
