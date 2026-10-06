import { useMemo, useState } from "react";
import { toast } from "react-toastify";

import type { Rubric, SubmitMentorFeedbackRequest } from "@apis/types";

import type {
  FeedbackWritingStep,
  SegmentComment,
  SegmentCommentDraft,
} from "../types";
import { toMentorRubricScores } from "../utils";

const INITIAL_COMMENT_DRAFT: SegmentCommentDraft = {
  startTimeSeconds: 0,
  endTimeSeconds: 0,
  content: "",
  rating: "GOOD",
};

interface UseMentorFeedbackFormParams {
  rubrics?: Rubric[];
  videoId?: number;
  handleSubmitFeedback: (data: SubmitMentorFeedbackRequest) => Promise<unknown>;
  handleCompleteFeedback: () => void;
}

export const useMentorFeedbackForm = ({
  rubrics,
  videoId,
  handleSubmitFeedback,
  handleCompleteFeedback,
}: UseMentorFeedbackFormParams) => {
  const [selectedStep, setSelectedStep] =
    useState<FeedbackWritingStep>("COMMENT");
  const [comments, setComments] = useState<SegmentComment[]>([]);
  const [commentDraft, setCommentDraft] = useState<SegmentCommentDraft>(
    INITIAL_COMMENT_DRAFT,
  );
  const [rubricScoreOverrides, setRubricScoreOverrides] = useState<
    Record<number, number>
  >({});
  const [overallComment, setOverallComment] = useState("");

  const rubricScores = useMemo(
    () => toMentorRubricScores(rubrics ?? [], rubricScoreOverrides),
    [rubricScoreOverrides, rubrics],
  );
  const handleAddComment = () => {
    if (commentDraft.endTimeSeconds <= commentDraft.startTimeSeconds) {
      toast.error("타임라인에서 시작 시간과 종료 시간을 선택해주세요.");
      return;
    }

    if (!commentDraft.content.trim()) {
      toast.error("구간 코멘트를 입력해주세요.");
      return;
    }

    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        startTimeSeconds: commentDraft.startTimeSeconds,
        endTimeSeconds: commentDraft.endTimeSeconds,
        content: commentDraft.content.trim(),
        rating: commentDraft.rating,
      },
    ]);
    setCommentDraft({
      ...INITIAL_COMMENT_DRAFT,
      startTimeSeconds: commentDraft.endTimeSeconds,
      endTimeSeconds: commentDraft.endTimeSeconds,
    });
  };

  const handleRemoveComment = (commentId: number) => {
    setComments((prev) => prev.filter((item) => item.id !== commentId));
  };

  const handleNext = () => {
    if (comments.length === 0) {
      toast.error("루브릭 작성 전에 구간 코멘트를 1개 이상 남겨주세요.");
      return;
    }

    setSelectedStep("RUBRIC");
  };

  const handleChangeScore = (rubricId: number, score: number) => {
    setRubricScoreOverrides((prev) => ({
      ...prev,
      [rubricId]: score,
    }));
  };

  const handleComplete = async () => {
    if (videoId === undefined) {
      toast.error("피드백을 작성할 영상을 찾을 수 없습니다.");
      return;
    }

    if (comments.length === 0) {
      toast.error("구간 코멘트를 1개 이상 남겨주세요.");
      return;
    }

    if (!overallComment.trim()) {
      toast.error("멘토 피드백 총평을 입력해주세요.");
      return;
    }

    try {
      await handleSubmitFeedback({
        videoId,
        feedbacks: comments.map((comment) => ({
          rating: comment.rating ?? "GOOD",
          startTimeSeconds: comment.startTimeSeconds,
          endTimeSeconds: comment.endTimeSeconds,
          content: comment.content,
        })),
        evaluation: {
          scores: rubricScores.map((rubric) => ({
            rubricId: rubric.id,
            score: rubric.score,
          })),
          comment: overallComment.trim(),
        },
      });
      handleCompleteFeedback();
    } catch {
      // The mutation reports the API error; moderation details are read by the page.
    }
  };

  return {
    selectedStep,
    comments,
    commentDraft,
    rubricScores,
    overallComment,
    setSelectedStep,
    setCommentDraft,
    setOverallComment,
    handleAddComment,
    handleRemoveComment,
    handleNext,
    handleChangeScore,
    handleComplete,
  };
};
