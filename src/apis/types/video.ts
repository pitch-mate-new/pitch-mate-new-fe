export type VideoType = "UPLOAD" | "RECORD";
export type PracticeType = "PRESENTATION" | "INTERVIEW" | "SPEECH";
export type EvaluationType = "AI" | "MENTOR" | string;
export type AnalysisStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | string;

export interface BaseVideo {
  videoId: number;
  title: string;
  createdAt: string;
}

export interface VideoMetadata extends BaseVideo {
  ownerId: number;
  ownerNickname: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  type: VideoType;
  practiceType: PracticeType | string | null;
  requestedMentorId: number | null;
  durationSeconds: number | null;
}

export interface HistoryVideoSummary {
  videoId: number;
  videoTitle: string;
  videoThumbnailUrl: string;
  durationSeconds: number;
  totalScore: number;
  analysisStatus: AnalysisStatus;
  createdAt: string;
}

export interface CategoryScore {
  speechAvg: number;
  nonVerbalAvg: number;
  deliveryAvg: number;
}

export interface RubricScore {
  rubricId: number;
  rubricTitle: string;
  score: number;
  maxScore?: number;
  comment: string;
}

export interface VideoUploadRequest {
  title: string;
  description: string;
  videoType: VideoType;
  practiceType?: PracticeType;
  requestedMentorId?: number | null;
  file: File;
}

export type VideoUploadResponse = VideoMetadata;

export type DeleteVideoResponse = string;

export type RequestedVideosResponse = VideoMetadata[];

export type CompletedRequestedVideosResponse = VideoMetadata[];

export type AllVideoHistoryResponse = HistoryVideoSummary[];

export type VideoHistoryDetailVideo = VideoMetadata;

export interface VideoHistoryDetailFeedback {
  feedbackId: number;
  authorId: number | null;
  authorNickname: string;
  rubricId: number | null;
  rubricTitle: string | null;
  rating: string | null;
  startTimeSeconds: number;
  endTimeSeconds: number;
  content: string;
  type: EvaluationType;
  createdAt: string;
}

export interface VideoHistoryDetailEvaluation {
  evaluationId: number;
  videoId: number;
  evaluatorId: number | null;
  evaluatorNickname: string;
  type: EvaluationType;
  totalScore: number;
  maxTotalScore: number;
  comment: string;
  scores: RubricScore[];
  createdAt: string;
}

export interface VideoHistoryDetailAnalysis {
  analysisId: number;
  videoId: number;
  status: AnalysisStatus;
  speechRateWpm: number | null;
  silenceRatio: number;
  fillerWordCount: number;
  fillerWords: string[] | string;
  speakingDurationSeconds: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MentorFeedbackStatus = "NOT_REQUESTED" | "PENDING" | "COMPLETED";

export interface VideoHistoryDetailAiResult {
  analysis: VideoHistoryDetailAnalysis | null;
  feedbacks: VideoHistoryDetailFeedback[];
  evaluation: VideoHistoryDetailEvaluation | null;
  categoryScores: CategoryScore | null;
}

export interface VideoHistoryDetailMentorResult {
  feedbacks: VideoHistoryDetailFeedback[];
  evaluation: VideoHistoryDetailEvaluation | null;
  categoryScores: CategoryScore | null;
}

export interface VideoHistoryDetailResponse {
  video: VideoHistoryDetailVideo;
  mentorFeedbackStatus: MentorFeedbackStatus;
  ai: VideoHistoryDetailAiResult | null;
  mentor: VideoHistoryDetailMentorResult | null;
}

export interface VideoCompareSession {
  videoId: number;
  videoTitle: string;
  totalScore: number;
  durationSeconds: number;
  createdAt: string;
  mentorFeedbackStatus: MentorFeedbackStatus;
}

export interface VideoCompareRubricComparison {
  rubricId: number;
  rubricTitle: string;
  session1Score: number;
  session2Score: number;
}

export interface VideoCompareResponse {
  session1: VideoCompareSession;
  session2: VideoCompareSession;
  evaluationScores: {
    session1TotalScore: number;
    session2TotalScore: number;
    rubricComparisons: VideoCompareRubricComparison[];
  };
  categoryData: {
    session1: CategoryScore;
    session2: CategoryScore;
  };
  session1OverallComment: string;
  session2OverallComment: string;
  session1MentorEvaluation?: VideoHistoryDetailEvaluation | null;
  session2MentorEvaluation?: VideoHistoryDetailEvaluation | null;
  mentorCategoryData?: {
    session1: CategoryScore;
    session2: CategoryScore;
  };
}
