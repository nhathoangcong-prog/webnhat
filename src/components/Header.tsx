import React, { useState } from 'react';
import {
  Bell,
  LogOut,
  User,
  GraduationCap,
  Calendar,
  Atom,
  FlaskConical,
  Sigma,
  ChevronDown,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { UserRole, Profile } from '../types/index.ts';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  profile: Profile;
  notificationCount: number;
  onNotificationClick: () => void;
  onLogoutClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  profile,
  notificationCount,
  onNotificationClick,
  onLogoutClick,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Format current date in Vietnamese
  const today = new Date();
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[today.getDay()];
  const formattedDate = `${dayName}, ${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  return (
    <header className="w-full flex flex-col shadow-md select-none print:hidden">
      {/* Top Banner with Rich Tech-Blue Gradient matching reference screenshot */}
      <div className="relative bg-gradient-to-r from-[#003875] via-[#005da8] to-[#007cdb] text-white px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between overflow-hidden border-b border-blue-400/30">
        {/* Subtle geometric glowing background elements */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* Left: School Crest Logo & Titles */}
        <div className="flex items-center gap-3.5 z-10">
          {/* Circular School Emblem matching THPT THẠNH LỘC HCM */}
          <div className="relative flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white p-1 shadow-lg ring-2 ring-yellow-400 flex items-center justify-center">
            <div className="w-full h-full rounded-full border-2 border-dashed border-red-600 flex flex-col items-center justify-center text-center p-0.5 bg-gradient-to-b from-amber-50 to-white">
              <span className="text-[7.5px] md:text-[8.5px] font-bold text-blue-900 leading-tight tracking-tighter">
                THPT
              </span>
              <span className="text-[8.5px] md:text-[9.5px] font-extrabold text-red-600 leading-tight">
                THẠNH LỘC
              </span>
              <span className="text-[7px] md:text-[8px] font-bold text-yellow-700 leading-none">
                HCM
              </span>
            </div>
            {/* Laurel badge effect */}
            <div className="absolute -bottom-1 bg-red-600 text-[6px] text-white px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider shadow">
              1986
            </div>
          </div>

          {/* School Name & System Header */}
          <div className="flex flex-col">
            <h1 className="text-sm md:text-lg lg:text-xl font-bold tracking-wide uppercase text-white drop-shadow-md leading-tight">
              TRƯỜNG TRUNG HỌC PHỔ THÔNG THẠNH LỘC
            </h1>
            <div className="text-xs md:text-sm font-semibold text-blue-100 tracking-wide drop-shadow">
              HỆ THỐNG QUẢN LÝ VÀ HỖ TRỢ GIẢNG DẠY THÔNG MINH
            </div>
            <div className="flex items-center gap-2 text-[11px] md:text-xs font-bold text-cyan-300 tracking-wider">
              <span>TOÁN HỌC</span>
              <span>–</span>
              <span>VẬT LÝ</span>
              <span>–</span>
              <span>HÓA HỌC</span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.2 text-[9px] bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 rounded">
                GDPT 2018
              </span>
            </div>
          </div>
        </div>

        {/* Right: Scientific Icons & Teacher Profile Card */}
        <div className="flex items-center gap-4 lg:gap-6 mt-2 sm:mt-0 z-10">
          {/* Science symbols with neon blue glow matching reference */}
          <div className="hidden xl:flex items-center gap-4 text-cyan-200/90 pr-2 border-r border-blue-400/40">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-cyan-300/30 shadow-inner">
              <Sigma className="w-4 h-4 text-cyan-300" />
              <span className="text-xs italic font-serif font-bold">∫ x² dx</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-cyan-300/30 shadow-inner">
              <Atom className="w-4 h-4 text-cyan-300 animate-[spin_10s_linear_infinite]" />
              <span className="text-xs font-medium">Physics</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-cyan-300/30 shadow-inner">
              <FlaskConical className="w-4 h-4 text-cyan-300" />
              <span className="text-xs font-medium">Chemistry</span>
            </div>
          </div>

          {/* Teacher Profile Pill matching reference screenshot */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 bg-blue-900/60 hover:bg-blue-900/80 border border-blue-300/40 px-3 py-1.5 rounded-full shadow-md transition-all cursor-pointer text-left"
              title="Đổi vai trò hoặc xem thông tin tài khoản"
            >
              {/* Profile Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-blue-950 font-bold flex items-center justify-center text-xs shadow ring-1 ring-white/60">
                {currentRole === 'teacher' ? 'HN' : currentRole === 'student' ? 'HS' : 'PH'}
              </div>
              <div className="flex flex-col">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>
                    {currentRole === 'teacher'
                      ? 'GV: HOÀNG NHẬT'
                      : currentRole === 'student'
                      ? 'HS: NGUYỄN VĂN AN (12A1)'
                      : 'PH: NGUYỄN VĂN BÌNH'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
                </div>
                <span className="text-[10px] text-blue-200 font-normal">
                  {currentRole === 'teacher'
                    ? 'Giáo viên: Toán – Vật lý – Hóa học'
                    : currentRole === 'student'
                    ? 'Học sinh: Khối 12 THPT Thạnh Lộc'
                    : 'Phụ huynh học sinh HS001'}
                </span>
              </div>
            </button>

            {/* Role switch dropdown */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                  <p className="font-bold text-slate-900">Chuyển đổi vai trò trải nghiệm</p>
                  <p className="text-[10px] text-slate-500">Phân quyền theo chuẩn bảo mật RLS</p>
                </div>

                <button
                  onClick={() => {
                    onRoleChange('teacher');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-blue-50 transition-colors ${
                    currentRole === 'teacher' ? 'bg-blue-50 text-blue-700 font-bold' : ''
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium">1. Giáo viên (Thầy Hoàng Nhật)</div>
                    <div className="text-[10px] text-slate-500">Toàn quyền quản lý học sinh, điểm, đề thi, AI</div>
                  </div>
                  {currentRole === 'teacher' && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-blue-600" />}
                </button>

                <button
                  onClick={() => {
                    onRoleChange('student');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-blue-50 transition-colors ${
                    currentRole === 'student' ? 'bg-blue-50 text-blue-700 font-bold' : ''
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-medium">2. Học sinh (Nguyễn Văn An)</div>
                    <div className="text-[10px] text-slate-500">Xem điểm, làm kiểm tra trực tuyến, xem học liệu</div>
                  </div>
                  {currentRole === 'student' && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-600" />}
                </button>

                <button
                  onClick={() => {
                    onRoleChange('parent');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-blue-50 transition-colors ${
                    currentRole === 'parent' ? 'bg-blue-50 text-blue-700 font-bold' : ''
                  }`}
                >
                  <User className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-medium">3. Phụ huynh (Nguyễn Văn Bình)</div>
                    <div className="text-[10px] text-slate-500">Theo dõi điểm, chuyên cần và nhận xét con mình</div>
                  </div>
                  {currentRole === 'parent' && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-amber-600" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar matching reference screenshot */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm text-slate-700">
        {/* Welcome message */}
        <div className="flex items-center gap-2 font-medium">
          <GraduationCap className="w-4 h-4 text-blue-700" />
          <span>
            Chào mừng {currentRole === 'teacher' ? 'thầy ' : currentRole === 'student' ? 'em ' : 'quý phụ huynh '}
            <strong className="text-blue-900 font-bold">
              {currentRole === 'teacher' ? 'HOÀNG NHẬT' : currentRole === 'student' ? 'NGUYỄN VĂN AN' : 'NGUYỄN VĂN BÌNH'}
            </strong>{' '}
            đến với hệ thống!
          </span>
        </div>

        {/* Date, Academic Year, and Utility Buttons */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-600 text-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{formattedDate}</span>
            <span className="mx-1 text-slate-300">|</span>
            <span className="font-medium text-blue-900">Năm học: 2024 – 2025</span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={onNotificationClick}
            className="relative p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
            title="Thông báo mới"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Logout / Switch User */}
          <button
            onClick={onLogoutClick}
            className="flex items-center gap-1 p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer text-xs font-medium"
            title="Đăng xuất hoặc chuyển tài khoản"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
};
