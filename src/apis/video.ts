import apiInstance from "@shared/apis";

import type {
  AllVideoHistoryResponse,
  CompletedRequestedVideosResponse,
  DeleteVideoResponse,
  RequestedVideosResponse,
  VideoCompareResponse,
  VideoHistoryDetailResponse,
  VideoHistoryDetailAnalysis,
  VideoUploadRequest,
  VideoUploadResponse,
} from "./types";
import { ANALYSIS_URL, HISTORY_URL, VIDEO_URL } from "./constants";

export const videoUploadApi = async ({
  title,
  description,
  videoType,
  practiceType,
  requestedMentorId,
  file,
}: VideoUploadRequest) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiInstance.post<VideoUploadResponse, FormData>(
    VIDEO_URL.DEFAULT,
    formData,
    {
      contentType: "form-data",
      params: {
        title,
        description,
        videoType,
        ...(practiceType && { practiceType }),
        ...(requestedMentorId !== null &&
          requestedMentorId !== undefined && { requestedMentorId }),
      },
    },
  );

  return response.result;
};

export const getRequestedVideosApi = async () => {
  const response = await apiInstance.get<RequestedVideosResponse>(
    VIDEO_URL.REQUESTED,
  );

  return response.result;
};

export const getCompletedRequestedVideosApi = async () => {
  const response = await apiInstance.get<CompletedRequestedVideosResponse>(
    VIDEO_URL.REQUESTED_COMPLETED,
  );

  return response.result;
};

export const getVideoHistoryApi = async () => {
  const response = await apiInstance.get<AllVideoHistoryResponse>(
    HISTORY_URL.DEFAULT,
  );

  return response.result;
};

export const getVideoHistoryDetailApi = async (videoId: number) => {
  const response = await apiInstance.get<VideoHistoryDetailResponse>(
    HISTORY_URL.DETAIL(videoId),
  );

  return response.result;
};

export const getVideoCompareApi = async (
  videoId1: number,
  videoId2: number,
) => {
  const response = await apiInstance.get<VideoCompareResponse>(
    HISTORY_URL.COMPARE,
    {
      params: {
        videoId1,
        videoId2,
      },
    },
  );

  return response.result;
};

export const deleteVideoApi = async (videoId: number) => {
  const response = await apiInstance.delete<DeleteVideoResponse>(
    VIDEO_URL.DETAIL(videoId),
  );

  return response.result;
};

export const requestAnalysisApi = async (videoId: number) => {
  const response = await apiInstance.post<VideoHistoryDetailAnalysis>(
    ANALYSIS_URL.BY_VIDEO(videoId),
  );
  return response.result;
};

export const deleteAnalysisApi = async (analysisId: number) => {
  await apiInstance.delete(ANALYSIS_URL.BY_ID(analysisId));
};
