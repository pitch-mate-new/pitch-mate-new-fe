import { useQuery } from "@tanstack/react-query";

import { HISTORY_QUERY_KEY } from "@apis/query-key";
import type {
  AllVideoHistoryResponse,
  VideoCompareResponse,
  VideoHistoryDetailResponse,
} from "@apis/types";
import {
  getVideoCompareApi,
  getVideoHistoryApi,
  getVideoHistoryDetailApi,
} from "@apis/video";

export const useVideoHistoryQuery = () => {
  const {
    data: allHistoryList,
    isPending: isPendingHistoryList,
    isError: isErrorHistoryList,
    error: historyError,
  } = useQuery<AllVideoHistoryResponse>({
    queryKey: HISTORY_QUERY_KEY.DEFAULT,
    queryFn: () => getVideoHistoryApi(),
    retry: 2,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
  });

  return {
    allHistoryList,
    isPendingHistoryList,
    isErrorHistoryList,
    historyError,
  };
};

export const useVideoHistoryDetailQuery = (videoId: number | null) => {
  const {
    data: historyDetail,
    isPending: isPendingHistoryDetail,
    isError: isErrorHistoryDetail,
    error: historyDetailError,
  } = useQuery<VideoHistoryDetailResponse>({
    queryKey:
      videoId === null
        ? HISTORY_QUERY_KEY.DETAIL(0)
        : HISTORY_QUERY_KEY.DETAIL(videoId),
    queryFn: () => getVideoHistoryDetailApi(videoId ?? 0),
    refetchInterval: (query) => {
      const status = query.state.data?.ai?.analysis?.status;
      return status === "PENDING" || status === "IN_PROGRESS" ? 10_000 : false;
    },
    refetchIntervalInBackground: true,
    enabled: videoId !== null,
    retry: 2,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
  });

  return {
    historyDetail,
    isPendingHistoryDetail,
    isErrorHistoryDetail,
    historyDetailError,
  };
};

export const useVideoCompareQuery = (
  videoId1: number | null,
  videoId2: number | null,
) => {
  const enabled = videoId1 !== null && videoId2 !== null;

  const {
    data: compareData,
    isPending: isPendingCompare,
    isError: isErrorCompare,
    error: compareError,
  } = useQuery<VideoCompareResponse>({
    queryKey: HISTORY_QUERY_KEY.COMPARE(videoId1 ?? 0, videoId2 ?? 0),
    queryFn: () => getVideoCompareApi(videoId1 ?? 0, videoId2 ?? 0),
    enabled,
    retry: 2,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
  });

  return {
    compareData,
    isPendingCompare,
    isErrorCompare,
    compareError,
  };
};
