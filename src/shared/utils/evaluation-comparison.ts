interface Score {
  rubricId: number;
  rubricTitle: string;
  score: number;
  maxScore?: number;
}

interface Evaluation {
  videoId: number;
  scores: Score[];
}

export const compareVideoEvaluations = (
  videoId: number,
  ai: Evaluation | null,
  mentor: Evaluation | null,
) => {
  if (!ai || !mentor) return null;
  if (ai.videoId !== videoId || mentor.videoId !== videoId) return null;

  const ids = [...new Set([...ai.scores, ...mentor.scores].map((item) => item.rubricId))];
  const validScore = (items: Score[]) => {
    const item = items[0];
    return items.length === 1 && Number.isInteger(item.score) &&
      item.score >= 1 && item.score <= 10 &&
      (item.maxScore === undefined || item.maxScore === 10) ? item.score : null;
  };
  return ids.map((rubricId) => {
    const aiItems = ai.scores.filter((item) => item.rubricId === rubricId);
    const mentorItems = mentor.scores.filter((item) => item.rubricId === rubricId);
    const aiScore = validScore(aiItems);
    const mentorScore = validScore(mentorItems);
    const sameTitle = aiItems[0]?.rubricTitle.replaceAll(/\s/g, "") ===
      mentorItems[0]?.rubricTitle.replaceAll(/\s/g, "");
    const difference = aiScore !== null && mentorScore !== null && sameTitle
      ? mentorScore - aiScore : null;
    return {
      rubricId,
      rubricTitle: aiItems[0]?.rubricTitle ?? mentorItems[0].rubricTitle,
      aiScore,
      mentorScore,
      difference,
      needsReview: difference !== null && Math.abs(difference) >= 3,
    };
  });
};
