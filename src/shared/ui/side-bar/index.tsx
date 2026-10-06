import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Upload,
  User,
  Users,
  Video,
} from "lucide-react";

import type { UserRole } from "@apis/types";
import { useLogoutMutation } from "@apis/queries";
import { ROUTES } from "@router/constants";
import { cn } from "@utils/cn";

import Logo from "../logo";

interface SideBarProps {
  pathname: string;
  isOpen: boolean;
  handleChange: () => void;
}

interface MenuItem {
  label: string;
  path?: string;
  logMessage?: string;
  defaultIcon: ReactNode;
  selectedIcon: ReactNode;
  isActive: boolean;
}

const getStoredUserRole = (): UserRole => {
  // ADDED_ROLE_FLOW: sidebar menu is split by the locally selected dummy role.
  return localStorage.getItem("userRole") === "MENTOR" ? "MENTOR" : "MENTEE";
};

const getRoleLabel = (role: UserRole) => (role === "MENTOR" ? "멘토" : "멘티");

export default function SideBar({
  pathname,
  isOpen,
  handleChange,
}: SideBarProps) {
  const navigate = useNavigate();
  const { logout } = useLogoutMutation();
  const userRole = getStoredUserRole();
  const roleLabel = getRoleLabel(userRole);

  const handleToPage = (item: MenuItem) => {
    if (!item.path) {
      // ADDED_ROLE_FLOW: pages that are not implemented yet only log for now.
      console.log(
        item.logMessage ?? `${item.label} 페이지는 아직 준비 중입니다.`,
      );
      return;
    }

    navigate(item.path);
  };

  const handleLogout = () => {
    logout();
  };

  const menteeMenuItems: MenuItem[] = [
    {
      label: "대시보드",
      path: ROUTES.DASHBOARD,
      defaultIcon: <LayoutDashboard size={32} color="#71718A" />,
      selectedIcon: <LayoutDashboard size={32} color="#6868FF" />,
      isActive: pathname === ROUTES.DASHBOARD,
    },
    {
      label: "동영상 업로드",
      path: ROUTES.VIDEO_UPLOAD,
      defaultIcon: <Upload size={32} color="#71718A" />,
      selectedIcon: <Upload size={32} color="#6868FF" />,
      isActive: pathname.startsWith(ROUTES.VIDEO_UPLOAD),
    },
    {
      label: "히스토리",
      path: ROUTES.VIDEO_HISTORY,
      defaultIcon: <History size={32} color="#71718A" />,
      selectedIcon: <History size={32} color="#6868FF" />,
      isActive: pathname.startsWith(ROUTES.VIDEO_HISTORY),
    },
    {
      label: "멘토 목록",
      // ADDED_MENTOR_LIST: mentor list page is now connected for mentees.
      path: ROUTES.MENTOR_LIST,
      defaultIcon: <Users size={32} color="#71718A" />,
      selectedIcon: <Users size={32} color="#6868FF" />,
      isActive: pathname.startsWith(ROUTES.MENTOR_LIST),
    },
    {
      label: "내 정보",
      path: ROUTES.MYPAGE,
      defaultIcon: <User size={32} color="#71718A" />,
      selectedIcon: <User size={32} color="#6868FF" />,
      isActive: pathname.startsWith(ROUTES.MYPAGE),
    },
  ];

  const mentorMenuItems: MenuItem[] = [
    {
      label: "대시보드",
      // ADDED_MENTOR_DASHBOARD: mentor dashboard is now connected.
      path: ROUTES.MENTOR_DASHBOARD,
      defaultIcon: <LayoutDashboard size={32} color="#71718A" />,
      selectedIcon: <LayoutDashboard size={32} color="#6868FF" />,
      isActive: pathname.startsWith(ROUTES.MENTOR_DASHBOARD),
    },
    {
      label: "요청받은 동영상",
      path: ROUTES.MENTOR_REQUESTED_VIDEOS,
      defaultIcon: <Video size={32} color="#71718A" />,
      selectedIcon: <Video size={32} color="#6868FF" />,
      isActive: pathname.startsWith(ROUTES.MENTOR_REQUESTED_VIDEOS),
    },
    {
      label: "피드백 히스토리",
      path: ROUTES.MENTOR_FEEDBACK_HISTORY,
      defaultIcon: <ClipboardList size={32} color="#71718A" />,
      selectedIcon: <ClipboardList size={32} color="#6868FF" />,
      isActive: pathname.startsWith(ROUTES.MENTOR_FEEDBACK_HISTORY),
    },
    {
      label: "멘티 목록",
      // ADDED_MENTEE_LIST: mentor can now manage mentee requests and connections.
      path: ROUTES.MENTEE_LIST,
      defaultIcon: <MessageSquareText size={32} color="#71718A" />,
      selectedIcon: <MessageSquareText size={32} color="#6868FF" />,
      isActive: pathname.startsWith(ROUTES.MENTEE_LIST),
    },
    {
      label: "내 정보",
      path: ROUTES.MYPAGE,
      defaultIcon: <User size={32} color="#71718A" />,
      selectedIcon: <User size={32} color="#6868FF" />,
      isActive: pathname.startsWith(ROUTES.MYPAGE),
    },
  ];

  const menuItems = userRole === "MENTOR" ? mentorMenuItems : menteeMenuItems;

  return (
    <div
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-[rgba(0,0,0,0.08)] bg-[#FAFAFF]",
        isOpen ? "w-16 md:w-95" : "w-16 md:w-23.25",
      )}
    >
      <div
        className={cn(
          "flex h-22 shrink-0 border-b border-[rgba(0,0,0,0.08)]",
          !isOpen && "justify-center",
        )}
      >
        {isOpen ? (
          <div className="flex flex-row gap-5 pl-5">
            <button className="p-2.5" type="button" onClick={handleChange}>
              <ChevronLeft size={32} color="#71718A" />
            </button>
            <div className="flex flex-row items-center gap-3">
              <Logo size="sm" />
              <h2 className="text-3xl font-bold text-[#6868FF]">PitchMate</h2>
            </div>
          </div>
        ) : (
          <button className="p-2.5" type="button" onClick={handleChange}>
            <Menu size={32} color="#71718A" />
          </button>
        )}
      </div>
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col gap-1.5 pt-4.5 pr-3 pl-3">
          {/* ADDED_ROLE_FLOW: sidebar shows the current dummy user role. */}
          <div
            className={cn(
              "mb-3",
              isOpen
                ? "flex justify-center px-2.5 md:justify-start"
                : "flex justify-center",
            )}
          >
            <span className="w-fit rounded-full bg-[rgba(104,104,255,0.10)] px-3 py-1 text-lg font-semibold text-[#6868FF]">
              <span className="hidden md:inline">{roleLabel}</span>
            </span>
          </div>
          {menuItems.map((item) => (
            <button
              key={item.path ?? item.label}
              className={cn(
                "flex h-17 w-full flex-row items-center gap-4.5",
                item.isActive && "rounded-2xl bg-[rgba(104,104,255,0.10)]",
                isOpen ? "pr-4.5 pl-4.5" : "justify-center",
              )}
              type="button"
              onClick={() => handleToPage(item)}
            >
              {item.isActive ? item.selectedIcon : item.defaultIcon}
              {isOpen && (
                <h3
                  className={cn(
                    "hidden text-2xl text-[#71718A] md:block",
                    item.isActive && "font-semibold text-[#6868FF]",
                  )}
                >
                  {item.label}
                </h3>
              )}
            </button>
          ))}
        </div>
        <button
          className={cn(
            "flex h-22 w-full flex-row items-center gap-4.5 border-t border-[rgba(0,0,0,0.08)]",
            isOpen ? "pl-7.5" : "justify-center",
          )}
          type="button"
          onClick={handleLogout}
        >
          <LogOut size={32} color="#71718A" />
          {isOpen && (
            <h3 className="hidden text-2xl text-[#71718A] md:block">
              로그아웃
            </h3>
          )}
        </button>
      </div>
    </div>
  );
}
