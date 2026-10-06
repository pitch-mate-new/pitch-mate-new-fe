import { useState } from "react";
import { GitCompare } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button, PageError, PageLoading, VideoEmptyView } from "@shared/ui";
import { ROUTES } from "@router/constants";
import { useVideoHistoryQuery } from "@apis/queries";

import { HistoryCard, SearchBar } from "./components";

export default function VideoHistory() {
  const navigate = useNavigate();
  const { allHistoryList, isPendingHistoryList, isErrorHistoryList } =
    useVideoHistoryQuery();

  const [search, setSearch] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCompareVideoIds, setSelectedCompareVideoIds] = useState<
    number[]
  >([]);

  const filteredList = allHistoryList?.filter((history) =>
    history.videoTitle.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const isEmpty = !allHistoryList || allHistoryList.length === 0;

  const handleCompareMode = () => {
    setCompareMode((prev) => {
      const next = !prev;

      if (!next) {
        setSelectedCompareVideoIds([]);
      }

      return next;
    });
  };

  const handleSelectCompareVideo = (videoId: number) => {
    setSelectedCompareVideoIds((prev) => {
      const isSelected = prev.includes(videoId);

      if (isSelected) {
        return prev.filter((id) => id !== videoId);
      }

      if (prev.length >= 2) {
        return prev;
      }

      return [...prev, videoId];
    });
  };

  const handleToCompare = () => {
    navigate(
      ROUTES.HISTORY_COMPARE(
        String(selectedCompareVideoIds[0]),
        String(selectedCompareVideoIds[1]),
      ),
    );
  };

  const handleToVideoDetail = (videoId: number) => {
    navigate(ROUTES.VIDEO_HISTORY_DETAIL(String(videoId)));
  };

  if (isPendingHistoryList) {
    return <PageLoading />;
  }

  if (isErrorHistoryList) {
    return <PageError />;
  }

  return (
    <div className="flex min-h-screen w-full min-w-220 flex-col">
      <SearchBar search={search} handleChangeSearch={setSearch} />
      <div className="flex flex-col gap-10 p-10">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-4xl leading-14 font-medium">히스토리</h1>
            <p className="text-2xl leading-9 text-[#71718A]">
              영상별 피드백을 확인하고 비교하세요.
            </p>
          </div>
          {!isEmpty &&
            (compareMode ? (
              <div className="flex flex-row items-center gap-4">
                {selectedCompareVideoIds.length === 2 && (
                  <Button color="primary" handleClick={handleToCompare}>
                    <div className="flex flex-row items-center gap-2">
                      <GitCompare />
                      <span className="text-xl font-medium">비교하기</span>
                    </div>
                  </Button>
                )}
                <Button color="secondary" handleClick={handleCompareMode}>
                  <div className="flex flex-row items-center gap-2">
                    <GitCompare />
                    <span className="text-xl font-medium">비교 취소</span>
                  </div>
                </Button>
              </div>
            ) : (
              <Button color="primary" handleClick={handleCompareMode}>
                <div className="flex flex-row items-center gap-2">
                  <GitCompare />
                  <span className="text-xl font-medium">영상 비교</span>
                </div>
              </Button>
            ))}
        </div>
        {compareMode && (
          <div className="flex flex-row gap-3 rounded-2xl bg-[rgba(104,104,255,0.05)] p-6 text-[#6868FF]">
            <GitCompare />
            <p className="text-lg">{`비교할 두 회차를 선택해주세요 (${selectedCompareVideoIds.length}/2)`}</p>
          </div>
        )}

        {isEmpty ? (
          <VideoEmptyView />
        ) : (
          <div className="flex flex-col gap-5">
            {filteredList &&
              filteredList.map((history) => {
                const selectedOrder =
                  selectedCompareVideoIds.indexOf(history.videoId) + 1;
                return (
                  <HistoryCard
                    key={history.videoId}
                    videoId={history.videoId}
                    videoTitle={history.videoTitle}
                    videoThumbnailUrl={history.videoThumbnailUrl}
                    createdAt={history.createdAt}
                    durationSeconds={history.durationSeconds}
                    totalScore={history.totalScore}
                    analysisStatus={history.analysisStatus}
                    compareMode={compareMode}
                    handleClick={
                      compareMode && history.analysisStatus !== "FAILED"
                        ? handleSelectCompareVideo
                        : handleToVideoDetail
                    }
                    selectedOrder={selectedOrder === 0 ? null : selectedOrder}
                  />
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
