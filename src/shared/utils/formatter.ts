export const formatDuration = (durationSeconds: number) => {
  const minutes = String(Math.floor(durationSeconds / 60)).padStart(2, "0");
  const seconds = String(durationSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const formatDate = (createdAt: string) => {
  const date = new Date(createdAt);
  return date.toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
  });
};

export const formatDateTime = (createdAt: string) => {
  const date = new Date(createdAt);
  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
