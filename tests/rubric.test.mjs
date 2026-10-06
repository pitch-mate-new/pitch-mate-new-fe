import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(
  new URL("../src/shared/utils/rubric.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2023,
  },
});
const { RUBRIC_GROUPS, summarizeRubricScores, getRubricValidationMessage } =
  await import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
const comparisonSource = readFileSync(
  new URL("../src/shared/utils/evaluation-comparison.ts", import.meta.url),
  "utf8",
);
const comparisonJs = ts.transpileModule(comparisonSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2023,
  },
}).outputText;
const { compareVideoEvaluations } = await import(
  `data:text/javascript;base64,${Buffer.from(comparisonJs).toString("base64")}`
);

const fixture = (score = 7) =>
  Object.values(RUBRIC_GROUPS)
    .flat()
    .map((rubricTitle, index) => ({
      rubricId: index + 101,
      rubricTitle,
      score,
      maxScore: 10,
    }));

test("합계 142는 71점, 143은 반올림하여 72점이며 항목 평균은 별개", () => {
  const scores = fixture();
  scores[0].score = 9;
  assert.equal(summarizeRubricScores(scores).totalScore, 71);
  scores[0].score = 10;
  assert.equal(summarizeRubricScores(scores).totalScore, 72);
  assert.equal(summarizeRubricScores(scores).itemAverage, 7.15);
});

test("1점/10점 경계의 총점은 각각 10/100", () => {
  assert.equal(summarizeRubricScores(fixture(1)).totalScore, 10);
  assert.equal(summarizeRubricScores(fixture(10)).totalScore, 100);
});

test("항목 순서와 ID가 바뀌어도 스피치 4·비언어 4·전달력 12개로 분류", () => {
  const scores = fixture()
    .map((item, i) => ({ ...item, score: i < 4 ? 2 : i < 8 ? 6 : 9 }))
    .reverse();
  assert.deepEqual(summarizeRubricScores(scores).categoryScores, {
    speechAvg: 2,
    nonVerbalAvg: 6,
    deliveryAvg: 9,
  });
});

test("말 속도 띄어쓰기 차이는 수용", () => {
  const scores = fixture();
  scores[1].rubricTitle = "말속도 적절성";
  assert.equal(getRubricValidationMessage(scores), null);
});

test("빈 평가, 누락, 중복 ID, 중복 항목은 계산 불가", () => {
  const duplicateId = fixture();
  duplicateId[1].rubricId = duplicateId[0].rubricId;
  const duplicateTitle = fixture();
  duplicateTitle[1].rubricTitle = duplicateTitle[0].rubricTitle;
  for (const scores of [[], fixture().slice(1), duplicateId, duplicateTitle]) {
    assert.equal(summarizeRubricScores(scores), null);
    assert.ok(getRubricValidationMessage(scores));
  }
});

test("0, 11, 소수, NaN 점수는 제출할 수 없음", () => {
  for (const score of [0, 11, 7.5, NaN]) {
    const scores = fixture();
    scores[0].score = score;
    assert.equal(summarizeRubricScores(scores), null);
  }
});

test("옛 통합 항목을 새 항목으로 추정하지 않음", () => {
  const scores = fixture();
  scores[6].rubricTitle = "자세 및 표정";
  assert.equal(summarizeRubricScores(scores), null);
});

test("서버 항목 만점이 10이 아니면 차단", () => {
  const scores = fixture();
  scores[0].maxScore = 5;
  assert.equal(summarizeRubricScores(scores), null);
});

test("동일 영상 비교는 멘토-AI 차이를 계산하고 절댓값 3부터 강조", () => {
  const ai = {
    videoId: 4,
    scores: [{ rubricId: 1, rubricTitle: "발음 명확성", score: 5 }],
  };
  const mentor = {
    videoId: 4,
    scores: [{ rubricId: 1, rubricTitle: "발음 명확성", score: 8 }],
  };
  assert.deepEqual(compareVideoEvaluations(4, ai, mentor)[0], {
    rubricId: 1,
    rubricTitle: "발음 명확성",
    aiScore: 5,
    mentorScore: 8,
    difference: 3,
    needsReview: true,
  });
  mentor.scores[0].score = 2;
  assert.equal(compareVideoEvaluations(4, ai, mentor)[0].difference, -3);
  mentor.scores[0].score = 7;
  assert.equal(compareVideoEvaluations(4, ai, mentor)[0].needsReview, false);
});

test("다른 영상·중복 ID·범위 밖 점수·항목명 불일치는 비교하지 않음", () => {
  const ai = {
    videoId: 4,
    scores: [{ rubricId: 1, rubricTitle: "발음 명확성", score: 5 }],
  };
  const mentor = {
    videoId: 4,
    scores: [{ rubricId: 1, rubricTitle: "발음 명확성", score: 8 }],
  };
  assert.equal(compareVideoEvaluations(5, ai, mentor), null);
  mentor.scores[0].score = 11;
  assert.equal(compareVideoEvaluations(4, ai, mentor)[0].difference, null);
  mentor.scores[0].score = 8;
  mentor.scores[0].rubricTitle = "말 속도 적절성";
  assert.equal(compareVideoEvaluations(4, ai, mentor)[0].difference, null);
});
