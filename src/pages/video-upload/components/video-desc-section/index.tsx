import { InputBar } from "@shared/ui";
import type { PracticeType } from "@apis/types";

interface VideoDescSectionProps {
  videoTitle: string;
  videoDesc: string;
  handleChangeTitle: (text: string) => void;
  handleChangeDesc: (text: string) => void;
  practiceType: PracticeType;
  handleChangePracticeType: (value: PracticeType) => void;
}

export default function VideoDescSection({
  videoTitle,
  videoDesc,
  handleChangeTitle,
  handleChangeDesc,
  practiceType,
  handleChangePracticeType,
}: VideoDescSectionProps) {
  return (
    <section className="flex flex-col gap-9 rounded-2xl p-9 shadow-[0_2px_5px_0_rgba(0,0,0,0.10),0_2px_3px_-2px_rgba(0,0,0,0.10)]">
      <div className="flex flex-col gap-3">
        <h3 className="text-2xl leading-6 font-semibold">영상 정보</h3>
        <p className="text-2xl leading-6 text-[#71718A]">
          영상에 대한 기본 정보를 입력해주세요.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <label className="flex flex-col gap-3 text-xl font-medium">
          연습 유형
          <select
            className="h-14 rounded-xl bg-[#F5F5FA] px-5"
            value={practiceType}
            onChange={(event) =>
              handleChangePracticeType(event.target.value as PracticeType)
            }
          >
            <option value="PRESENTATION">발표</option>
            <option value="INTERVIEW">면접</option>
            <option value="SPEECH">스피치</option>
          </select>
        </label>
        <InputBar
          label={<span className="text-2xl font-medium">제목</span>}
          text={videoTitle}
          placeholder="ex) 프로젝트 최종 발표 연습 1회차"
          handleChangeText={handleChangeTitle}
          maxLength={30}
        />
        <InputBar
          label={<span className="text-2xl font-medium">설명</span>}
          text={videoDesc}
          placeholder="영상에 대한 설명을 입력해주세요."
          handleChangeText={handleChangeDesc}
          maxLength={50}
        />
      </div>
    </section>
  );
}
