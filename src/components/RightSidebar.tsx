import React from 'react';
import {
  Bot,
  FileText,
  FileQuestion,
  HelpCircle,
  BarChart3,
  Lightbulb,
  Bell,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { NotificationItem, ScheduleEvent } from '../types/index.ts';

interface RightSidebarProps {
  notifications: NotificationItem[];
  schedules: ScheduleEvent[];
  onOpenAIQuickAction: (actionKey: string) => void;
  onOpenNotifications: () => void;
  onOpenSchedule: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  notifications,
  schedules,
  onOpenAIQuickAction,
  onOpenNotifications,
  onOpenSchedule,
}) => {
  const aiQuickActions = [
    { key: 'lesson_plan', label: 'Soạn giáo án', icon: <FileText className="w-3.5 h-3.5 text-blue-600" /> },
    { key: 'exam_generator', label: 'Tạo đề kiểm tra', icon: <FileQuestion className="w-3.5 h-3.5 text-blue-600" /> },
    { key: 'solve_problem', label: 'Giải thích bài tập Toán – Lý – Hóa', icon: <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> },
    { key: 'student_analysis', label: 'Phân tích kết quả học tập', icon: <BarChart3 className="w-3.5 h-3.5 text-blue-600" /> },
    { key: 'remedial_suggestions', label: 'Gợi ý phụ đạo, bồi dưỡng', icon: <Lightbulb className="w-3.5 h-3.5 text-blue-600" /> },
  ];

  return (
    <div className="w-full xl:w-80 flex flex-col gap-4 print:hidden">
      {/* 1. Trợ lý AI Giáo viên Card with Cute Robot matching reference */}
      <div className="bg-gradient-to-br from-[#1264c5] to-[#0d47a1] rounded-2xl p-4 text-white shadow-md border border-blue-400/30 overflow-hidden relative">
        {/* Glow behind robot */}
        <div className="absolute top-2 right-2 w-28 h-28 bg-cyan-400/25 rounded-full blur-xl pointer-events-none"></div>

        {/* Card Header with Robot */}
        <div className="flex items-center justify-between mb-3 z-10 relative">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-sm md:text-base tracking-wide text-white drop-shadow">
              Trợ lý AI Giáo viên
            </h3>
          </div>

          {/* Cute Robot Mascot badge */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md p-1 border border-cyan-300/40 shadow-inner flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-300 flex items-center justify-center text-blue-950 shadow">
                <Bot className="w-5 h-5 text-blue-900" />
              </div>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>

        {/* AI Action Buttons matching the reference screenshot */}
        <div className="space-y-1.5 z-10 relative">
          {aiQuickActions.map((act) => (
            <button
              key={act.key}
              onClick={() => onOpenAIQuickAction(act.key)}
              className="w-full bg-white/95 hover:bg-white text-slate-800 text-xs py-2 px-3 rounded-lg flex items-center gap-2.5 shadow-sm transition-all duration-150 hover:shadow hover:translate-x-0.5 cursor-pointer text-left font-medium border border-blue-100"
            >
              <div className="p-1 rounded bg-blue-50 flex-shrink-0">
                {act.icon}
              </div>
              <span className="truncate flex-1">{act.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-auto flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* 2. Thông báo mới Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Bell className="w-4 h-4 text-blue-600" />
            <span>Thông báo mới</span>
          </div>
          <button
            onClick={onOpenNotifications}
            className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center cursor-pointer"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {notifications.slice(0, 3).map((item, idx) => (
            <div
              key={item.id}
              onClick={onOpenNotifications}
              className="flex items-start justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-xs"
            >
              <div className="flex items-start gap-2">
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    idx === 0 ? 'bg-red-500' : 'bg-blue-600'
                  }`}
                />
                <span className="text-slate-800 font-medium line-clamp-1">
                  {item.title}
                </span>
              </div>
              <span className="text-slate-400 text-[11px] flex-shrink-0 font-medium">
                {item.date}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Lịch công việc sắp tới Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Lịch công việc sắp tới</span>
          </div>
          <button
            onClick={onOpenSchedule}
            className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center cursor-pointer"
          >
            <span>Xem chi tiết</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-3">
          {schedules.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors"
            >
              {/* Date Box */}
              <div className="w-14 h-12 rounded-lg bg-blue-100/70 text-blue-900 flex flex-col items-center justify-center flex-shrink-0 border border-blue-200">
                <span className="text-xs font-bold leading-tight">{ev.date}</span>
                <span className="text-[10px] text-blue-700 leading-tight">{ev.dayOfWeek}</span>
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {ev.title}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{ev.timeOrPeriod}</span>
                  <span className="text-slate-300">•</span>
                  <span className="truncate">{ev.classTarget}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
