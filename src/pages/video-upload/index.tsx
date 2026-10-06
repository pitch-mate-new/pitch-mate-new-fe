import { useEffect, useRef, useState } from "react";

import {
  ALLOWED_VIDEO_EXTENSIONS,
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_VIDEO_FILE_SIZE,
} from "@shared/constants";
import { useAcceptedMentorsQuery, useVideoUploadMutation } from "@apis/queries";
import useToast from "@hooks/use-toast";
import { PageLoading } from "@shared/ui";

import type { SelectedMentorId } from "./types";
import {
  MentorFeedbackSection,
  UploadFooter,
  UploadTopContent,
  VideoDescSection,
  VideoRecordSection,
  VideoUploadSection,
} from "./components";
import type { Mentor } from "@pages/mentor-list/types";
import type { ConnectionListResponse, PracticeType } from "@apis/types";

const isAllowedVideoFile = (file: File) => {
  const lowerCaseName = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_VIDEO_EXTENSIONS.some((extension) =>
    lowerCaseName.endsWith(extension),
  );

  const hasAllowedMimeType = ALLOWED_VIDEO_MIME_TYPES.some(
    (mimeType) => mimeType === file.type,
  );

  return hasAllowedExtension || hasAllowedMimeType;
};

const toConnectedMentor = (
  connection: ConnectionListResponse[number],
): Mentor => ({
  id: connection.userId,
  connectionId: connection.connectionId,
  nickname: connection.nickname,
  bio: connection.intro ?? "",
  profileImage: connection.profileImage,
  status: "CONNECTED",
});

export default function VideoUpload() {
  const toast = useToast();
  const { uploadVideo, isPendingUploadVideo } = useVideoUploadMutation();
  const {
    acceptedMentorsData,
    isPendingAcceptedMentors,
    isErrorAcceptedMentors,
  } = useAcceptedMentorsQuery();

  const [uploadType, setUploadType] = useState<"UPLOAD" | "RECORD">("UPLOAD");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const [practiceType, setPracticeType] =
    useState<PracticeType>("PRESENTATION");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  // ADDED_UPLOAD_MENTOR_REQUEST: mentor feedback is optional; null means AI feedback only.
  const [selectedMentorId, setSelectedMentorId] =
    useState<SelectedMentorId>(null);

  const objectUrlRef = useRef<string | null>(null);

  const clearPreviewUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setVideoPreviewUrl(null);
  };

  const clearSelectedVideo = () => {
    setVideoFile(null);
    clearPreviewUrl();
  };

  const setSelectedVideo = (file: File) => {
    clearPreviewUrl();

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    setVideoFile(file);
    setVideoPreviewUrl(objectUrl);
  };

  const handleChangeUploadType = (type: "UPLOAD" | "RECORD") => {
    if (type === uploadType) {
      return;
    }

    setUploadType(type);
    clearSelectedVideo();
  };

  const handleSelectUploadFile = (file: File) => {
    if (!isAllowedVideoFile(file)) {
      alert("MP4, MOV, AVI, WEBM 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > MAX_VIDEO_FILE_SIZE) {
      alert("500MB 이하 파일만 업로드할 수 있습니다.");
      return;
    }

    setSelectedVideo(file);
  };

  const handleCompleteRecording = (recordedFile: File) => {
    setSelectedVideo(recordedFile);
  };

  const handleUpload = () => {
    if (!videoFile) {
      toast.error("파일이 정상적으로 업로드되지 않았습니다.");
      return;
    }
    uploadVideo({
      title: videoTitle,
      description: videoDesc,
      videoType: uploadType,
      practiceType,
      file: videoFile,
      requestedMentorId: selectedMentorId,
    });
  };

  const handleReset = () => {
    setVideoTitle("");
    setVideoDesc("");
    setPracticeType("PRESENTATION");
    setSelectedMentorId(null);
    clearSelectedVideo();
  };

  const handleSelectMentor = (mentorId: number) => {
    setSelectedMentorId((prev) => (prev === mentorId ? null : mentorId));
  };

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const disabledToUpload =
    videoTitle.trim() === "" || videoDesc.trim() === "" || videoFile === null;
  const connectedMentors = (acceptedMentorsData ?? []).map(toConnectedMentor);

  if (isPendingUploadVideo) {
    return <PageLoading />;
  }

  return (
    <div className="flex min-w-300 flex-1 justify-center p-9 pb-50">
      <div className="flex max-w-300 min-w-250 flex-1 flex-col gap-9">
        <UploadTopContent
          uploadType={uploadType}
          handleChangeUploadType={handleChangeUploadType}
        />
        {uploadType === "UPLOAD" ? (
          <VideoUploadSection
            previewUrl={videoPreviewUrl}
            handleSelectFile={handleSelectUploadFile}
          />
        ) : (
          <VideoRecordSection
            previewUrl={videoPreviewUrl}
            handleCompleteRecording={handleCompleteRecording}
          />
        )}
        <VideoDescSection
          videoTitle={videoTitle}
          videoDesc={videoDesc}
          handleChangeTitle={setVideoTitle}
          handleChangeDesc={setVideoDesc}
          practiceType={practiceType}
          handleChangePracticeType={setPracticeType}
        />
        <MentorFeedbackSection
          connectedMentors={connectedMentors}
          isPending={isPendingAcceptedMentors}
          isError={isErrorAcceptedMentors}
          selectedMentorId={selectedMentorId}
          handleSelectMentor={handleSelectMentor}
        />
        <UploadFooter
          handleUpload={handleUpload}
          handleReset={handleReset}
          disabledToUpload={disabledToUpload}
        />
      </div>
    </div>
  );
}
