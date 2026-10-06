import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock3, UsersRound } from "lucide-react";

import {
  useCompletedRequestedVideosQuery,
  useMentorDashboardQuery,
} from "@apis/queries";
import { PageError, PageLoading } from "@shared/ui";
import { ROUTES } from "@router/constants";

import {
  MentorDashboardHeader,
  SummaryCard,
  VideoListSection,
} from "./components";
import type { MentorDashboardVideo } from "./types";

export default function MentorDashboard() {
  const navigate = useNavigate();
  const {
    mentorDashboardData,
    isPendingMentorDashboard,
    isErrorMentorDashboard,
  } = useMentorDashboardQuery();
  const { completedRequestedVideos } = useCompletedRequestedVideosQuery();

  const summaryItems = [
    {
      id: "pending-feedback",
      title: "대기 중인 피드백",
      value: mentorDashboardData?.pendingFeedbackCount ?? 0,
      description: "멘티가 피드백을 기다리는 영상입니다.",
      icon: Clock3,
    },
    {
      id: "completed-feedback",
      title: "완료한 피드백",
      value: mentorDashboardData?.completedFeedbackCount ?? 0,
      description: "누적 완료한 피드백입니다.",
      icon: CheckCircle2,
    },
    {
      id: "connected-mentees",
      title: "연결된 멘티",
      value: mentorDashboardData?.connectedMenteeCount ?? 0,
      description: "현재 피드백을 주고받는 멘티입니다.",
      icon: UsersRound,
    },
  ];

  const requestedVideos: MentorDashboardVideo[] =
    mentorDashboardData?.requestedVideos.map((video) => ({
      id: video.videoId,
      title: video.title,
      menteeNickname: video.menteeNickname,
      thumbnailUrl: video.thumbnailUrl,
      durationSeconds: video.durationSeconds,
      date: video.createdAt,
      status: "REQUESTED",
    })) ?? [];

  const handleClickRequestedVideo = (video: MentorDashboardVideo) => {
    navigate(ROUTES.MENTOR_REQUESTED_VIDEO_DETAIL(String(video.id)));
  };
  const completedVideos: MentorDashboardVideo[] =
    completedRequestedVideos?.map((video) => ({
      id: video.videoId,
      title: video.title,
      menteeNickname: video.ownerNickname,
      thumbnailUrl: video.thumbnailUrl,
      durationSeconds: video.durationSeconds,
      date: video.createdAt,
      status: "COMPLETED",
    })) ?? [];

  if (isPendingMentorDashboard) {
    return <PageLoading />;
  }

  if (isErrorMentorDashboard) {
    return <PageError />;
  }

  return (
    <div className="flex min-h-screen min-w-300 flex-col gap-10 p-10 pb-30">
      <MentorDashboardHeader />

      <section className="grid grid-cols-3 gap-7">
        {summaryItems.map((summary) => (
          <SummaryCard key={summary.id} summary={summary} />
        ))}
      </section>

      <section className="flex flex-col gap-7">
        <VideoListSection
          title="요청받은 동영상"
          description="멘티가 검토를 요청한 최신 발표 영상입니다."
          videos={requestedVideos}
          emptyMessage="새로운 피드백 요청이 없습니다."
          viewAllPath={ROUTES.MENTOR_REQUESTED_VIDEOS}
          handleClickVideo={handleClickRequestedVideo}
        />
        <VideoListSection
          title="최근 피드백 히스토리"
          description="멘토 피드백을 완료한 최근 영상입니다."
          videos={completedVideos}
          emptyMessage="완료한 피드백이 없습니다."
          viewAllPath={ROUTES.MENTOR_FEEDBACK_HISTORY}
          handleClickVideo={(video) =>
            navigate(ROUTES.MENTOR_FEEDBACK_HISTORY_DETAIL(String(video.id)))
          }
        />
      </section>
    </div>
  );
}
