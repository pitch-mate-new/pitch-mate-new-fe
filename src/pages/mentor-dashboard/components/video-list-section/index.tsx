import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { MentorDashboardVideo } from "../../types";
import MentorVideoCard from "../mentor-video-card";

interface VideoListSectionProps {
  title: string;
  description: string;
  videos: MentorDashboardVideo[];
  emptyMessage: string;
  viewAllPath: string;
  compact?: boolean;
  handleClickVideo: (video: MentorDashboardVideo) => void;
}

export default function VideoListSection({
  title,
  description,
  videos,
  emptyMessage,
  viewAllPath,
  compact = false,
  handleClickVideo,
}: VideoListSectionProps) {
  const navigate = useNavigate();
  // ADDED_MENTOR_DASHBOARD: dashboard preview cards are limited to four items in a two-column grid.
  const visibleVideos = videos.slice(0, 4);

  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-white p-7 shadow-[0_2px_5px_0_rgba(0,0,0,0.10),0_2px_3px_-2px_rgba(0,0,0,0.10)]">
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="text-2xl leading-9 font-semibold">{title}</h2>
          <p className="text-lg leading-7 text-[#71718A]">{description}</p>
        </div>
        <button
          className="flex shrink-0 flex-row items-center gap-3"
          type="button"
          aria-label={`${title} 전체 보기`}
          onClick={() => navigate(viewAllPath)}
        >
          <span className="rounded-2x text-lg font-bold text-[#6868FF]">
            전체보기
          </span>
          <ArrowRight color="#6868FF" size={24} />
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="flex min-h-36 items-center justify-center rounded-2xl bg-[#F5F5FA] text-xl text-[#71718A]">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid w-full max-w-7xl grid-cols-2 gap-4">
          {visibleVideos.map((video) => (
            <MentorVideoCard
              key={video.id}
              video={video}
              compact={compact}
              handleClick={handleClickVideo}
            />
          ))}
        </div>
      )}
    </section>
  );
}
