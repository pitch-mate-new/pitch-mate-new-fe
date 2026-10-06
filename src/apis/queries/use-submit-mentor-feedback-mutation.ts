import { useMutation, useQueryClient } from "@tanstack/react-query";

import { submitMentorFeedbackApi } from "@apis/feedback";
import {
  DASHBOARD_QUERY_KEY,
  HISTORY_QUERY_KEY,
  VIDEO_QUERY_KEY,
} from "@apis/query-key";
import type {
  SubmitMentorFeedbackRequest,
  SubmitMentorFeedbackResponse,
} from "@apis/types";
import useToast from "@hooks/use-toast";
import type { ApiError } from "@shared/apis";

export const useSubmitMentorFeedbackMutation = () => {
  const toast = useToast();
  const qc = useQueryClient();

  const {
    mutate: submitMentorFeedback,
    mutateAsync: submitMentorFeedbackAsync,
    isPending: isPendingSubmitMentorFeedback,
  } = useMutation<
    SubmitMentorFeedbackResponse,
    ApiError,
    SubmitMentorFeedbackRequest
  >({
    mutationFn: submitMentorFeedbackApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VIDEO_QUERY_KEY.REQUESTED });
      qc.invalidateQueries({ queryKey: VIDEO_QUERY_KEY.REQUESTED_COMPLETED });
      qc.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY.MENTOR });
      qc.invalidateQueries({ queryKey: HISTORY_QUERY_KEY.DEFAULT });
      toast.info("멘토 피드백이 완료되었습니다.");
    },
    onError: (error) => {
      if (error.code === 4026) {
        const payload = error.payload as
          | {
              result?: {
                moderationReason?: string;
                blockedTerms?: string[];
                guideMessage?: string;
              };
            }
          | undefined;
        const result = payload?.result;
        const reason = result?.moderationReason
          ? `차단 사유: ${result.moderationReason}`
          : "부적절한 표현이 포함되어 저장되지 않았습니다.";
        const terms = result?.blockedTerms?.length
          ? `확인된 표현: ${result.blockedTerms.join(", ")}`
          : "";
        toast.error(
          [reason, terms, result?.guideMessage].filter(Boolean).join(" · "),
        );
        return;
      }
      if (error.code === 4025) {
        toast.error("이미 이 영상에 멘토 평가를 제출했습니다.");
        return;
      }
      toast.error(`멘토 피드백 작성 실패: ${error.message}`);
    },
    retry: 0,
  });

  return {
    submitMentorFeedback,
    submitMentorFeedbackAsync,
    isPendingSubmitMentorFeedback,
  };
};
