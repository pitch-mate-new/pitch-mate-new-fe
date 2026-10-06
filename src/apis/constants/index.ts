export const AUTH_URL = {
  SIGNUP: "/auth/signup",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REISSUE: "/auth/reissue",
  CHECK_EMAIL: "/auth/check-email",
  CHECK_NICKNAME: "/auth/check-nickname",
};

export const DASHBOARD_URL = {
  MENTEE: "/users/mentee/dashboard",
  MENTOR: "/users/mentor/dashboard",
};

export const USER_URL = {
  DEFAULT: "/users/me",
};

export const VIDEO_URL = {
  DEFAULT: "/videos",
  DETAIL: (videoId: number) => `/videos/${videoId}`,
  REQUESTED: "/videos/requested",
  REQUESTED_COMPLETED: "/videos/requested/completed",
};

export const ANALYSIS_URL = {
  BY_VIDEO: (videoId: number) => `/videos/${videoId}/analysis`,
  BY_ID: (analysisId: number) => `/analysis/${analysisId}`,
};

export const RUBRICS_URL = {
  DEFAULT: "/rubrics",
};

export const FEEDBACK_URL = {
  FEEDBACKS: (videoId: number) => `/videos/${videoId}/feedbacks`,
  EVALUATIONS: (videoId: number) => `/videos/${videoId}/evaluations`,
};

export const HISTORY_URL = {
  DEFAULT: "/history",
  DETAIL: (videoId: number) => `/history/video/${videoId}`,
  COMPARE: "/history/compare",
};

export const CONNECTIONS_URL = {
  DEFAULT: "/connections",
  SEARCH: "/connections/mentors/search",
  ACCEPT: (connectionId: number) => `/connections/${connectionId}/accept`,
  REJECT: (connectionId: number) => `/connections/${connectionId}/reject`,
  ACCEPTED_CONNECTIONS: "/connections/mentors/accepted",
};
