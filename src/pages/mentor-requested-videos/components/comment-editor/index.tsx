import { Plus, Trash2 } from "lucide-react";

import { formatDuration } from "@utils/formatter";

import type { SegmentComment, SegmentCommentDraft } from "../../types";

interface CommentEditorProps {
  comments: SegmentComment[];
  draft: SegmentCommentDraft;
  handleChangeDraft: (draft: SegmentCommentDraft) => void;
  handleAddComment: () => void;
  handleRemoveComment: (commentId: number) => void;
  handleNext: () => void;
}

export default function CommentEditor({
  comments,
  draft,
  handleChangeDraft,
  handleAddComment,
  handleRemoveComment,
  handleNext,
}: CommentEditorProps) {
  const disabledToAddComment = draft.endTimeSeconds <= draft.startTimeSeconds;

  return (
    <section className="flex flex-col gap-6 rounded-3xl bg-white p-8 shadow-[0_2px_5px_0_rgba(0,0,0,0.10),0_2px_3px_-2px_rgba(0,0,0,0.10)]">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold">영상 구간별 코멘트</h2>
        <p className="text-lg leading-7 text-[#71718A]">
          구간 선택 토글을 켠 뒤 타임라인에서 시작점과 종료점을 클릭하고,
          멘티에게 전달할 코멘트를 작성하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 items-end gap-4 rounded-2xl bg-[#F7F7FC] p-5 sm:grid-cols-[12rem_12rem_1fr_auto_auto]">
        <div className="flex flex-col gap-2 text-lg font-semibold">
          시작
          <span className="flex h-13 items-center rounded-xl border border-[rgba(0,0,0,0.08)] bg-white px-4 text-lg text-[#6868FF]">
            {formatDuration(draft.startTimeSeconds)}
          </span>
        </div>
        <div className="flex flex-col gap-2 text-lg font-semibold">
          종료
          <span className="flex h-13 items-center rounded-xl border border-[rgba(0,0,0,0.08)] bg-white px-4 text-lg text-[#6868FF]">
            {formatDuration(draft.endTimeSeconds)}
          </span>
        </div>
        <label className="flex flex-col gap-2 text-lg font-semibold">
          코멘트
          <input
            className="h-13 rounded-xl border border-[rgba(0,0,0,0.08)] bg-white px-4 text-lg outline-none focus:border-[#6868FF]"
            placeholder="예: 이 구간에서는 결론을 먼저 말하면 더 설득력 있어요."
            type="text"
            value={draft.content}
            onChange={(event) =>
              handleChangeDraft({ ...draft, content: event.target.value })
            }
          />
        </label>
        <label className="flex flex-col gap-2 text-lg font-semibold">
          평가
          <select
            className="h-13 rounded-xl border border-[rgba(0,0,0,0.08)] bg-white px-3"
            value={draft.rating}
            onChange={(event) =>
              handleChangeDraft({
                ...draft,
                rating: event.target.value as SegmentCommentDraft["rating"],
              })
            }
          >
            <option value="GOOD">좋음</option>
            <option value="NORMAL">개선</option>
            <option value="BAD">심각</option>
          </select>
        </label>
        <button
          className="flex h-13 w-13 items-center justify-center rounded-xl bg-[#6868FF] text-white disabled:bg-[#ADADAD]"
          type="button"
          aria-label="코멘트 추가"
          disabled={disabledToAddComment}
          onClick={handleAddComment}
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {comments.length === 0 ? (
          <div className="flex min-h-32 items-center justify-center rounded-2xl bg-[#F7F7FC] text-xl text-[#71718A]">
            아직 작성한 구간 코멘트가 없습니다.
          </div>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="flex flex-row items-start justify-between gap-5 rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-5"
            >
              <div className="flex flex-col gap-2">
                <span className="w-fit rounded-xl bg-[rgba(104,104,255,0.10)] px-3 py-1 text-lg font-semibold text-[#6868FF]">
                  {formatDuration(comment.startTimeSeconds)} ~{" "}
                  {formatDuration(comment.endTimeSeconds)}
                </span>
                <p className="text-xl leading-8 text-[#1A1A2E]">
                  {comment.content}
                </p>
                <span className="text-sm text-[#71718A]">
                  {
                    { GOOD: "좋음", NORMAL: "개선", BAD: "심각" }[
                      comment.rating ?? "GOOD"
                    ]
                  }
                </span>
              </div>
              <button
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(0,0,0,0.08)] text-[#71718A]"
                type="button"
                aria-label="코멘트 삭제"
                onClick={() => handleRemoveComment(comment.id)}
              >
                <Trash2 size={20} />
              </button>
            </article>
          ))
        )}
      </div>

      <div className="flex justify-end">
        <button
          className="rounded-2xl bg-[#6868FF] px-8 py-4 text-xl font-bold text-white disabled:bg-[#ADADAD]"
          type="button"
          disabled={comments.length === 0}
          onClick={handleNext}
        >
          다음
        </button>
      </div>
    </section>
  );
}
