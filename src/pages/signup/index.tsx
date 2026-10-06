import { useState, type SubmitEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { Button, InputBar, RoleSelect } from "@shared/ui";
import { ROUTES } from "@router/constants";
import { EMAIL_REGEX } from "@shared/constants";
import { useSignupMutation } from "@apis/queries";
import type { UserRole } from "@shared/types";
import { checkSignupValueApi } from "@apis/auth";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");
  // ADDED_ROLE_FLOW: signup now stores the selected mentor/mentee role.
  const [role, setRole] = useState<UserRole>("MENTEE");

  const [errorMessage, setErrorMessage] = useState("");
  const [emailCheck, setEmailCheck] = useState<{
    value: string;
    duplicate: boolean;
  } | null>(null);
  const [nicknameCheck, setNicknameCheck] = useState<{
    value: string;
    duplicate: boolean;
  } | null>(null);
  const emailMutation = useMutation({
    mutationFn: (value: string) => checkSignupValueApi("email", value),
  });
  const nicknameMutation = useMutation({
    mutationFn: (value: string) => checkSignupValueApi("nickname", value),
  });

  const { signup, isPendingSignup } = useSignupMutation();

  const handleSignup = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    signup(
      {
        email: email.trim(),
        nickname: nickname.trim(),
        password: password.trim(),
        role,
      },
      {
        onError: (error) => {
          setErrorMessage(error.message);
        },
      },
    );
  };

  const trimmedEmail = email.trim();
  const isEmailInvalid = trimmedEmail !== "" && !EMAIL_REGEX.test(trimmedEmail);

  const disabled =
    trimmedEmail === "" ||
    isEmailInvalid ||
    nickname.trim() === "" ||
    password.trim() === "" ||
    password !== checkPassword ||
    isPendingSignup;
  const duplicateChecked =
    emailCheck?.value === trimmedEmail &&
    !emailCheck.duplicate &&
    nicknameCheck?.value === nickname.trim() &&
    !nicknameCheck.duplicate;

  const handleCheck = async (field: "email" | "nickname") => {
    const value = field === "email" ? trimmedEmail : nickname.trim();
    if (!value || (field === "email" && isEmailInvalid)) return;
    try {
      const duplicate = await (field === "email"
        ? emailMutation.mutateAsync(value)
        : nicknameMutation.mutateAsync(value));
      (field === "email" ? setEmailCheck : setNicknameCheck)({
        value,
        duplicate,
      });
    } catch {
      (field === "email" ? setEmailCheck : setNicknameCheck)(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-2.5">
        <h4 className="text-2xl leading-6 font-medium">회원가입</h4>
        <p className="text-2xl leading-9 text-[#71718A]">
          무료로 시작하고 실력을 키워보세요
        </p>
      </div>
      <form className="flex w-full flex-col gap-6" onSubmit={handleSignup}>
        <div className="flex items-end gap-3">
          <InputBar
            label="이메일"
            text={email}
            handleChangeText={(value) => {
              setEmail(value);
              setEmailCheck(null);
            }}
            placeholder="email@example.com"
            isError={
              isEmailInvalid ||
              (emailCheck?.value === trimmedEmail && emailCheck.duplicate)
            }
            error={
              isEmailInvalid
                ? "이메일 형식이 올바르지 않습니다."
                : "이미 사용 중인 이메일입니다."
            }
          />
          <Button
            type="button"
            color="secondary"
            disabled={
              !trimmedEmail || isEmailInvalid || emailMutation.isPending
            }
            handleClick={() => void handleCheck("email")}
          >
            {emailMutation.isPending ? "확인 중" : "중복 확인"}
          </Button>
        </div>
        {emailCheck?.value === trimmedEmail && !emailCheck.duplicate && (
          <p role="status" className="-mt-5 text-sm text-emerald-700">
            사용할 수 있는 이메일입니다.
          </p>
        )}
        {emailMutation.isError && (
          <p role="alert" className="-mt-5 text-sm text-red-600">
            이메일 중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.
          </p>
        )}
        <div className="flex items-end gap-3">
          <InputBar
            label="닉네임"
            text={nickname}
            handleChangeText={(value) => {
              setNickname(value);
              setNicknameCheck(null);
            }}
            placeholder="닉네임 입력"
            isError={
              nicknameCheck?.value === nickname.trim() &&
              nicknameCheck.duplicate
            }
            error="이미 사용 중인 닉네임입니다."
          />
          <Button
            type="button"
            color="secondary"
            disabled={!nickname.trim() || nicknameMutation.isPending}
            handleClick={() => void handleCheck("nickname")}
          >
            {nicknameMutation.isPending ? "확인 중" : "중복 확인"}
          </Button>
        </div>
        {nicknameCheck?.value === nickname.trim() &&
          !nicknameCheck.duplicate && (
            <p role="status" className="-mt-5 text-sm text-emerald-700">
              사용할 수 있는 닉네임입니다.
            </p>
          )}
        {nicknameMutation.isError && (
          <p role="alert" className="-mt-5 text-sm text-red-600">
            닉네임 중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.
          </p>
        )}
        <InputBar
          label="비밀번호"
          type="password"
          text={password}
          handleChangeText={setPassword}
          placeholder="비밀번호 입력"
        />
        <InputBar
          label="비밀번호 확인"
          type="password"
          text={checkPassword}
          handleChangeText={setCheckPassword}
          placeholder="비밀번호 재입력"
          isError={password !== checkPassword && checkPassword.trim() !== ""}
          error="비밀번호와 일치하지 않습니다."
        />
        <RoleSelect selectedRole={role} handleChangeRole={setRole} />
        <div className="relative">
          <Button
            size="full"
            color="primary"
            type="submit"
            disabled={disabled || !duplicateChecked}
          >
            {isPendingSignup ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : (
              "가입하기"
            )}
          </Button>
          {errorMessage && (
            <span className="absolute right-0 -bottom-7.5 font-medium text-[#FF9496]">
              {errorMessage}
            </span>
          )}
        </div>
      </form>
      <span className="text-xl leading-8 text-[#71718A]">
        이미 계정이 있으신가요?{" "}
        <Link className="font-medium text-[#6868FF]" to={ROUTES.LOGIN}>
          로그인
        </Link>
      </span>
    </div>
  );
}
