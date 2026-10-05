export const RUBRIC_GROUPS = {
  speechAvg: ["발음 명확성", "말 속도 적절성", "음성 변화", "발화 안정성"],
  nonVerbalAvg: ["시선 처리", "제스처 활용", "자세 안정성", "표정 활용"],
  deliveryAvg: [
    "핵심 전달력",
    "논리적 구성",
    "내용 완성도",
    "정보 정확도",
    "설득력",
    "필러워드 사용",
    "시간 활용",
    "발표 흐름",
    "내용 연결성",
    "자신감 표현",
    "집중도 유지",
    "전체 완성도",
  ],
} as const;

interface ScoredRubric {
  rubricId: number;
  rubricTitle: string;
  score: number;
  maxScore?: number;
}

const normalizeTitle = (title: string) => title.replaceAll(/\s/g, "");
const expectedTitles = Object.values(RUBRIC_GROUPS).flat().map(normalizeTitle);

export const getRubricCategory = (title: string) => {
  const normalized = normalizeTitle(title);
  return (Object.keys(RUBRIC_GROUPS) as (keyof typeof RUBRIC_GROUPS)[]).find(
    (key) =>
      RUBRIC_GROUPS[key].some((item) => normalizeTitle(item) === normalized),
  );
};

export const getRubricValidationMessage = (
  scores: readonly ScoredRubric[],
): string | null => {
  if (
    scores.length !== 20 ||
    new Set(scores.map((item) => item.rubricId)).size !== 20
  ) {
    return "서로 다른 루브릭 20개가 필요합니다. 평가 항목을 다시 불러와 주세요.";
  }
  const titles = new Set(
    scores.map((item) => normalizeTitle(item.rubricTitle)),
  );
  if (
    titles.size !== 20 ||
    expectedTitles.some((title) => !titles.has(title))
  ) {
    return "평가 항목이 기준 루브릭 20개와 일치하지 않습니다. 관리자에게 문의해 주세요.";
  }
  if (
    scores.some((item) => item.maxScore !== undefined && item.maxScore !== 10)
  ) {
    return "루브릭의 항목별 만점은 10점이어야 합니다. 관리자에게 문의해 주세요.";
  }
  if (
    scores.some(
      (item) =>
        !Number.isInteger(item.score) || item.score < 1 || item.score > 10,
    )
  ) {
    return "모든 항목에 1~10점 정수를 입력해 주세요.";
  }
  return null;
};

// Incomplete or legacy evaluations must not be presented as a newly calculated score.
export const summarizeRubricScores = (scores: readonly ScoredRubric[]) => {
  if (getRubricValidationMessage(scores)) return null;
  const sum = scores.reduce((total, item) => total + item.score, 0);
  const average = (key: keyof typeof RUBRIC_GROUPS) => {
    const items = scores.filter(
      (item) => getRubricCategory(item.rubricTitle) === key,
    );
    return items.reduce((total, item) => total + item.score, 0) / items.length;
  };
  return {
    totalScore: Math.round(sum / 2),
    itemAverage: sum / 20,
    categoryScores: {
      speechAvg: average("speechAvg"),
      nonVerbalAvg: average("nonVerbalAvg"),
      deliveryAvg: average("deliveryAvg"),
    },
  };
};
