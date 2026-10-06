import { CalendarDays, Clock, UserRound } from "lucide-react";

import type { VideoMetadata } from "@apis/types";
import { formatDateTime, formatDuration } from "@utils/formatter";

interface HistoryCardProps {
  item: VideoMetadata;
  totalScore?: number;
  itemAverage?: number;
  handleClick: (videoId: number) => void;
}

export default function HistoryCard({
  item,
  totalScore,
  itemAverage,
  handleClick,
}: HistoryCardProps) {
  const durationSeconds = item.durationSeconds ?? 0;

  return (
    <button
      className="flex min-h-78 flex-col gap-4 rounded-2xl bg-white p-5 text-left shadow-[0_2px_5px_0_rgba(0,0,0,0.10),0_2px_3px_-2px_rgba(0,0,0,0.10)] transition-colors hover:bg-[rgba(104,104,255,0.04)]"
      type="button"
      onClick={() => handleClick(item.videoId)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#F5F5FA]">
        {item.thumbnailUrl ? (
          <img
            className="aspect-video w-full object-cover"
            src={item.thumbnailUrl}
            alt={`${item.title} 썸네일`}
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-[rgba(104,104,255,0.08)] text-xl font-semibold text-[#6868FF]">
            영상 썸네일
          </div>
        )}
        <div className="absolute right-2 bottom-2 rounded-lg bg-[rgba(0,0,0,0.70)] px-2 py-0.5">
          <span className="text-sm text-white">
            {formatDuration(durationSeconds)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-row items-start justify-between gap-3">
          <h2 className="min-w-0 flex-1 truncate text-2xl leading-9 font-semibold text-[#1A1A2E]">
            {item.title}
          </h2>
          <span className="shrink-0 rounded-full bg-[#ECFDF3] px-3 py-1 text-lg font-bold text-[#00A86B]">
            완료
          </span>
        </div>
        <p className="line-clamp-2 text-lg leading-7 text-[#71718A]">
          {item.description || "멘토 피드백이 완료된 영상입니다."}
        </p>
        {(totalScore !== undefined || itemAverage !== undefined) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-xl bg-[#F5F5FA] px-4 py-3 text-base font-semibold text-[#1A1A2E]">
            {totalScore !== undefined && (
              <span>
                총점{" "}
                <strong className="text-[#6868FF]">
                  {totalScore}점 / 100점
                </strong>
              </span>
            )}
            {itemAverage !== undefined && (
              <span>
                항목 평균{" "}
                <strong className="text-[#6868FF]">
                  {itemAverage.toFixed(1)}점 / 10점
                </strong>
              </span>
            )}
          </div>
        )}
        <div className="mt-auto flex flex-row flex-wrap gap-x-5 gap-y-2 text-lg text-[#71718A]">
          <span className="flex flex-row items-center gap-1.5">
            <UserRound size={18} />
            {item.ownerNickname}
          </span>
          <span className="flex flex-row items-center gap-1.5">
            <CalendarDays size={18} />
            {formatDateTime(item.createdAt)}
          </span>
          <span className="flex flex-row items-center gap-1.5">
            <Clock size={18} />
            {formatDuration(durationSeconds)}
          </span>
        </div>
      </div>
    </button>
  );
}
