export interface MentorRequestedVideo {
  id: number;
  title: string;
  menteeNickname: string;
  thumbnailUrl: string;
  videoUrl: string;
  durationSeconds: number;
  requestedAt: string;
  description: string;
}

export interface SegmentComment {
  id: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
  content: string;
  rating?: "GOOD" | "NORMAL" | "BAD";
}

export interface SegmentCommentDraft {
  startTimeSeconds: number;
  endTimeSeconds: number;
  content: string;
  rating: "GOOD" | "NORMAL" | "BAD";
}

export interface MentorRubricItem {
  id: number;
  title: string;
  description?: string;
  category: "speech" | "nonVerbal" | "delivery";
  maxScore?: number;
}

export interface MentorRubricScore extends MentorRubricItem {
  score: number;
}

export type FeedbackWritingStep = "COMMENT" | "RUBRIC";
