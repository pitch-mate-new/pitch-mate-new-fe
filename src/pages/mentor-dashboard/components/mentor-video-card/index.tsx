import { CalendarDays, UserRound } from "lucide-react";

import { cn } from "@utils/cn";
import { formatDateTime, formatDuration } from "@utils/formatter";

import type { MentorDashboardVideo } from "../../types";

interface MentorVideoCardProps {
  video: MentorDashboardVideo;
  compact?: boolean;
  handleClick: (video: MentorDashboardVideo) => void;
}

export default function MentorVideoCard({
  video,
  compact = false,
  handleClick,
}: MentorVideoCardProps) {
  return (
    <button
      className={cn(
        "flex min-h-66 w-full flex-col gap-4 rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-4 text-left transition-colors hover:bg-[rgba(104,104,255,0.04)]",
        compact && "min-h-62",
      )}
      type="button"
      onClick={() => handleClick(video)}
    >
      <div className="relative w-full overflow-hidden rounded-2xl bg-[#F5F5FA]">
        <img
          className="aspect-video w-full object-cover"
          src={video.thumbnailUrl ?? "https://placehold.co/640x360/png"}
          alt={`${video.title} 썸네일`}
        />
        <div className="absolute right-2 bottom-2 rounded-lg bg-[rgba(0,0,0,0.70)] px-2 py-0.5">
          <span className="text-sm text-white">
            {formatDuration(video.durationSeconds ?? 0)}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-row items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 truncate text-xl leading-8 font-semibold text-[#1A1A2E]">
            {video.title}
          </h3>
        </div>

        <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 text-lg text-[#71718A]">
          <span className="flex flex-row items-center gap-1.5">
            <UserRound size={18} />
            {video.menteeNickname}
          </span>
          <span className="flex flex-row items-center gap-1.5">
            <CalendarDays size={18} />
            {formatDateTime(video.date)}
          </span>
        </div>
      </div>
    </button>
  );
}
