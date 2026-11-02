import React from 'react';
import {
  Home,
  Users,
  TableProperties,
  BookOpen,
  FileCheck2,
  Bot,
  CalendarCheck2,
  TrendingUp,
  FolderArchive,
  BellRing,
  Settings,
  Sparkles,
  BookMarked
} from 'lucide-react';
import { UserRole } from '../types/index.ts';

export type ActiveTab =
  | 'dashboard'
  | 'classes'
  | 'gradebook'
  | 'questions'
  | 'exams'
  | 'ai_assistant'
  | 'attendance'
  | 'analytics'
  | 'resources'
  | 'parent_connect'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  userRole: UserRole;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode; roles: UserRole[] }[] = [
    {
      id: 'dashboard',
      label: 'Trang tổng quan',
      icon: <Home className="w-4 h-4 flex-shrink-0" />,
      roles: ['teacher', 'student', 'parent'],
    },
    {
      id: 'classes',
      label: 'Quản lý lớp học & học sinh',
      icon: <Users className="w-4 h-4 flex-shrink-0" />,
      roles: ['teacher'],
    },
    {
      id: 'gradebook',
      label: 'Sổ điểm điện tử',
      icon: <TableProperties className="w-4 h-4 flex-shrink-0" />,
      roles: ['teacher', 'student', 'parent'],
    },
    {
      id: 'questions',
      label: 'Ngân hàng đề kiểm tra',
      icon: <BookOpen className="w-4 h-4 flex-shrink-0" />,
      roles: ['teacher'],
    },
    {
      id: 'exams',
      label: 'Bài tập & kiểm tra trực tuyến',
      icon: <FileCheck2 className="w-4 h-4 flex-shrink-0" />,
      roles: ['teacher', 'student'],
    },
    {
      id: 'ai_assistant',
      label: 'Trợ lý AI giáo viên',
      icon: <Bot className="w-4 h-4 flex-shrink-0" />,
      roles: ['teacher'],
    },
    {
      id: 'attendance',
      label: 'Điểm danh & chuyên cần',
      icon: <CalendarCheck2 className="w-4 h-4 flex-shrink-0" />,
      roles: ['teacher', 'student', 'parent'],
    },
    {
      id: 'analytics',
      label: 'Phân tích & đánh giá năng lực',
      icon: <TrendingUp className="w-4 h-4 flex-shrink-0" />,
      roles: ['teacher'],
    },
    {
      id: 'resources',
      label: 'Kho học liệu điện tử',
      icon: <FolderArchive className="w-4 h-4 flex-shrink-0" />,
      roles: ['teacher', 'student'],
    },
    {
      id: 'parent_connect',
      label: 'Thông báo & kết nối phụ huynh',
      icon: <BellRing className="w-4 h-4 flex-shrink-0" />,
      roles: ['teacher', 'parent'],
    },
    {
      id: 'settings',
      label: 'Cài đặt hệ thống',
      icon: <Settings className="w-4 h-4 flex-shrink-0" />,
      roles: ['teacher', 'student', 'parent'],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden print:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 md:w-72 bg-[#002f6c] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out print:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } shadow-xl border-r border-blue-900`}
      >
        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
          {/* Brand badge in sidebar */}
          <div className="px-3 py-2.5 mb-2 bg-gradient-to-r from-blue-950/70 to-blue-900/40 rounded-lg border border-blue-500/30">
            <div className="text-[11px] uppercase tracking-wider text-cyan-300 font-bold">
              THẦY HOÀNG NHẬT
            </div>
            <div className="text-[10px] text-blue-200">
              SMART EDUCATION – THPT THẠNH LỘC
            </div>
          </div>

          {menuItems.map((item) => {
            const isAccessible = item.roles.includes(userRole);
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isAccessible) {
                    onTabChange(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }
                }}
                disabled={!isAccessible}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs md:text-sm transition-all duration-150 cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#1b73e8] text-white font-bold shadow-lg shadow-blue-500/30 ring-1 ring-blue-300 translate-x-1'
                    : isAccessible
                    ? 'text-blue-100 hover:bg-white/10 hover:text-white'
                    : 'text-blue-300/40 opacity-50 cursor-not-allowed'
                }`}
              >
                <div
                  className={`p-1 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'text-cyan-300'
                  }`}
                >
                  {item.icon}
                </div>
                <span className="truncate flex-1">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse"></span>
                )}
                {!isAccessible && (
                  <span className="text-[9px] bg-blue-950/60 px-1 py-0.5 rounded text-blue-300/60">
                    Khóa
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom glowing book graphic matching reference screenshot */}
        <div className="p-3.5 pt-0">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#001f4d] to-[#003875] border border-cyan-500/30 p-3 text-center shadow-lg group">
            {/* Ambient neon aura */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>

            <div className="relative z-10 flex flex-col items-center">
              {/* Glowing Open Book 3D effect */}
              <div className="w-16 h-12 relative flex items-center justify-center my-1">
                <div className="absolute w-14 h-14 bg-cyan-400/20 rounded-full blur-md"></div>
                <BookMarked className="w-10 h-10 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse" />
                <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1" />
              </div>

              <div className="text-[11px] font-bold text-white tracking-wide mt-1">
                KẾT NỐI TRI THỨC
              </div>
              <div className="text-[9.5px] text-cyan-200/90 leading-tight">
                Phát triển năng lực – Kiến tạo tương lai
              </div>

              <div className="mt-2 text-[9px] text-blue-300/80 bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-400/20">
                Phiên bản GDPT 2018 v2.5
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
