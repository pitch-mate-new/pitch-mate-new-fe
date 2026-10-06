import { useQuery } from "@tanstack/react-query";

import { getMenteeDashboardApi, getMentorDashboardApi } from "@apis/dashboard";
import { DASHBOARD_QUERY_KEY } from "@apis/query-key";
import { useUserInfoQuery } from "@apis/queries";

import { EditProfileSection } from "./components";

export default function MyPage() {
  const { userInfoData, isPendingUserInfo, isErrorUserInfo } =
    useUserInfoQuery();
  const menteeSummary = useQuery({
    queryKey: DASHBOARD_QUERY_KEY.MENTEE,
    queryFn: getMenteeDashboardApi,
    enabled: userInfoData?.role === "MENTEE",
  });
  const mentorSummary = useQuery({
    queryKey: DASHBOARD_QUERY_KEY.MENTOR,
    queryFn: getMentorDashboardApi,
    enabled: userInfoData?.role === "MENTOR",
  });

  const roleLabel = userInfoData?.role === "MENTOR" ? "멘토" : "멘티";
  const summaryItems =
    userInfoData?.role === "MENTOR"
      ? [
          {
            label: "요청 대기",
            value: mentorSummary.data?.pendingFeedbackCount ?? 0,
            suffix: "건",
          },
          {
            label: "피드백 완료",
            value: mentorSummary.data?.completedFeedbackCount ?? 0,
            suffix: "건",
          },
          {
            label: "연결된 멘티",
            value: mentorSummary.data?.connectedMenteeCount ?? 0,
            suffix: "명",
          },
        ]
      : [
          {
            label: "총 영상",
            value: menteeSummary.data?.totalVideos ?? 0,
            suffix: "개",
          },
          {
            label: "완료 분석",
            value: menteeSummary.data?.analyzedVideos ?? 0,
            suffix: "개",
          },
          {
            label: "평균 점수",
            value: menteeSummary.data?.averageScore?.toFixed(1) ?? "—",
            suffix: "점",
          },
        ];

  if (isPendingUserInfo) {
    return (
      <div className="flex min-h-screen min-w-300 items-center justify-center p-10">
        <span className="text-2xl text-[#71718A]">
          사용자 정보를 불러오는 중입니다.
        </span>
      </div>
    );
  }

  if (isErrorUserInfo || !userInfoData) {
    return (
      <div className="flex min-h-screen min-w-300 items-center justify-center p-10">
        <span className="text-2xl text-[#71718A]">
          사용자 정보를 불러오지 못했습니다.
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-w-300 flex-col gap-10 p-10">
      <div className="flex flex-row items-center gap-4">
        <h1 className="text-4xl leading-14 font-medium">내 정보</h1>
        <span className="rounded-full bg-[rgba(104,104,255,0.10)] px-4 py-2 text-xl font-semibold text-[#6868FF]">
          {roleLabel}
        </span>
      </div>
      <section
        aria-label="활동 요약"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {summaryItems.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl bg-white p-6 shadow-[0_2px_5px_0_rgba(0,0,0,0.10)]"
          >
            <h2 className="text-lg text-[#71718A]">{item.label}</h2>
            <p className="mt-2 text-3xl font-bold text-[#1A1A2E]">
              {item.value}
              <span className="ml-1 text-base font-medium">{item.suffix}</span>
            </p>
          </article>
        ))}
      </section>
      <EditProfileSection
        key={userInfoData.userId}
        userInfoData={userInfoData}
      />
    </div>
  );
}
