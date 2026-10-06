import { ArrowRight, Clock, Loader2, TriangleAlert } from "lucide-react";

import { cn } from "@utils/cn";
import { formatDate, formatDuration } from "@utils/formatter";

interface HistoryCardProps {
  videoId: number;
  videoTitle: string;
  videoThumbnailUrl: string;
  createdAt: string;
  durationSeconds: number;
  totalScore: number;
  analysisStatus: string;
  compareMode: boolean;
  selectedOrder?: number | null;
  handleClick: (videoId: number) => void;
}

export default function HistoryCard({
  videoId,
  videoTitle,
  videoThumbnailUrl,
  createdAt,
  durationSeconds,
  analysisStatus,
  totalScore,
  compareMode,
  selectedOrder,
  handleClick,
}: HistoryCardProps) {
  const notCompleted = analysisStatus !== "COMPLETED";
  const failedColor =
    analysisStatus === "FAILED" && "text-[#FB2C36] border-[#FB2C36]";
  const statusText =
    analysisStatus === "PENDING"
      ? "분석 대기중"
      : analysisStatus === "IN_PROGRESS" || analysisStatus === "PROCESSING"
        ? "분석 중"
        : analysisStatus === "FAILED"
          ? "분석 실패"
          : "오류";
  const statusIcon =
    analysisStatus === "FAILED" ? (
      <TriangleAlert size={20} />
    ) : (
      <Loader2 className="animate-spin" size={20} />
    );

  return (
    <button
      className={cn(
        "flex h-45 min-w-200 flex-row items-center justify-between rounded-2xl pr-6 pl-6 shadow-[0_2px_5px_0_rgba(0,0,0,0.10),0_2px_3px_-2px_rgba(0,0,0,0.10)]",
        compareMode && !notCompleted && "cursor-pointer",
      )}
      type="button"
      disabled={notCompleted && analysisStatus !== "FAILED"}
      onClick={() => handleClick(videoId)}
    >
      <div className="flex flex-row items-center gap-5">
        <div className="relative">
          <img
            className="aspect-video w-50 rounded-2xl"
            src={videoThumbnailUrl}
            alt="영상 썸네일"
          />
          <div className="absolute right-2 bottom-2 rounded-lg bg-[rgba(0,0,0,0.70)] px-2 py-0.5">
            <span className="text-sm text-white">
              {formatDuration(durationSeconds)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-4">
            <p className="text-xl font-semibold">{videoTitle}</p>
            {notCompleted && (
              <div
                className={cn(
                  "flex flex-row items-center gap-2 rounded-xl border border-[#FEE685] px-2 py-1 text-[#FE9A00]",
                  failedColor,
                )}
              >
                {statusIcon}
                <span>{statusText}</span>
              </div>
            )}
          </div>

          <div className="flex flex-row items-center gap-1.5 text-[#71718A]">
            <Clock size={20} />
            <span className="text-xl">{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>

      {!notCompleted && (
        <div className="flex flex-row items-center gap-6">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(104,104,255,0.10)] text-xl font-bold text-[#6868FF]">
            {totalScore}
          </span>
          {compareMode ? (
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border-2",
                selectedOrder
                  ? "border-[#6868FF] bg-[#6868FF] text-white"
                  : "border-[rgba(113,113,138,0.40)] bg-white",
              )}
            >
              {selectedOrder ? (
                <span className="text-base font-bold">{selectedOrder}</span>
              ) : null}
            </div>
          ) : (
            <ArrowRight color="#1A1A2E" size={30} />
          )}
        </div>
      )}
    </button>
  );
}
