import React, { useState } from 'react';
import {
  Lock,
  User,
  GraduationCap,
  ShieldCheck,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Atom,
  FlaskConical,
  Sigma,
  Sparkles,
  School,
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  FileCheck2,
  Users
} from 'lucide-react';
import { authService, initialAccounts } from '../services/authService.ts';
import { db } from '../services/db.ts';
import { UserAccount, UserRole } from '../types/index.ts';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState<string>('thayhoangnhat');
  const [loginPassword, setLoginPassword] = useState<string>('123');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Register form state
  const [regFullName, setRegFullName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('teacher');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regClassId, setRegClassId] = useState<string>('c1');
  const [regStudentId, setRegStudentId] = useState<string>('s1');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [regError, setRegError] = useState<string>('');
  const [regSuccess, setRegSuccess] = useState<string>('');

  const classes = db.getClasses();
  const studentsOfClass = db.getStudents(regClassId);

  // Quick 1-click login handler
  const handleQuickLogin = (username: string, pass: string) => {
    setLoginUsername(username);
    setLoginPassword(pass);
    setLoginError('');

    setIsSubmitting(true);
    setTimeout(() => {
      const res = authService.login(username, pass);
      setIsSubmitting(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setLoginError(res.message);
      }
    }, 250);
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = authService.login(loginUsername, loginPassword);
      setIsSubmitting(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setLoginError(res.message);
      }
    }, 300);
  };

  // Submit Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regFullName.trim()) {
      setRegError('Vui lòng nhập họ và tên!');
      return;
    }
    if (!regUsername.trim()) {
      setRegError('Vui lòng nhập tên đăng nhập!');
      return;
    }
    if (regPassword.length < 3) {
      setRegError('Mật khẩu phải có ít nhất 3 ký tự!');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.');
      return;
    }

    const selectedClass = classes.find(c => c.id === regClassId);

    const res = authService.register({
      username: regUsername,
      password: regPassword,
      fullName: regFullName,
      role: regRole,
      phone: regPhone,
      email: regEmail,
      studentId: regRole !== 'teacher' ? regStudentId : undefined,
      className: selectedClass?.name
    });

    if (res.success && res.user) {
      setRegSuccess(res.message);
      // Auto fill to login form
      setLoginUsername(res.user.username);
      setLoginPassword(res.user.password);
      setTimeout(() => {
        setActiveTab('login');
      }, 1500);
    } else {
      setRegError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001f4d] via-[#003875] to-[#005ba8] flex flex-col justify-between text-slate-800 font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      {/* Background Decorative Tech Grid & Aura */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full px-4 lg:px-8 py-3.5 border-b border-blue-400/20 bg-blue-950/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Circular School Emblem */}
          <div className="relative flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white p-0.5 shadow-lg ring-2 ring-yellow-400 flex items-center justify-center">
            <div className="w-full h-full rounded-full border border-dashed border-red-600 flex flex-col items-center justify-center text-center p-0.5 bg-gradient-to-b from-amber-50 to-white">
              <span className="text-[6.5px] md:text-[7.5px] font-bold text-blue-900 leading-tight">THPT</span>
              <span className="text-[7.5px] md:text-[8.5px] font-extrabold text-red-600 leading-tight">THẠNH LỘC</span>
              <span className="text-[6px] md:text-[7px] font-bold text-yellow-700 leading-none">HCM</span>
            </div>
            <div className="absolute -bottom-1 bg-red-600 text-[5.5px] text-white px-1 py-0.2 rounded-full font-bold uppercase tracking-wider shadow">
              1986
            </div>
          </div>

          <div>
            <div className="text-xs md:text-sm font-bold tracking-wide uppercase text-white drop-shadow">
              TRƯỜNG TRUNG HỌC PHỔ THÔNG THẠNH LỘC
            </div>
            <div className="text-[10px] md:text-xs text-cyan-200">
              Cổng thông tin & Hệ thống quản lý dạy học thông minh
            </div>
          </div>
        </div>

        {/* Science Badges */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-cyan-300">
          <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-400/30 rounded-full flex items-center gap-1">
            <Sigma className="w-3 h-3" /> Toán học
          </span>
          <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-400/30 rounded-full flex items-center gap-1">
            <Atom className="w-3 h-3" /> Vật lý
          </span>
          <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-400/30 rounded-full flex items-center gap-1">
            <FlaskConical className="w-3 h-3" /> Hóa học
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Branding & Value Proposition (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#00285a]/90 to-[#001938]/90 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-blue-400/30 text-white flex flex-col justify-between shadow-2xl">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                Phiên bản GDPT 2018
              </div>

              <h2 className="text-xl md:text-2xl font-black leading-snug tracking-tight text-white">
                SMART EDUCATION
                <span className="block text-cyan-300 text-lg md:text-xl font-bold mt-1">
                  THẦY HOÀNG NHẬT
                </span>
              </h2>

              <p className="text-xs text-blue-200/90 mt-3 leading-relaxed">
                Giải pháp số hóa toàn diện dành cho Giáo viên, Học sinh và Phụ huynh trường THPT Thạnh Lộc: Sổ điểm điện tử, ngân hàng đề kiểm tra, điểm danh và chấm thi tự động.
              </p>

              {/* Feature Checklist */}
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-2.5 text-xs">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Sổ điểm điện tử TT 22/2021</strong>
                    <span className="text-[11px] text-blue-200/70">Tính ĐTB, xếp loại học lực & đánh giá tự động</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs">
                  <div className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-cyan-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Điểm danh & Chuyên cần theo tiết</strong>
                    <span className="text-[11px] text-blue-200/70">Thống kê vắng, trễ và thông báo tức thì</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs">
                  <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Đề thi & Kiểm tra trực tuyến</strong>
                    <span className="text-[11px] text-blue-200/70">Ngân hàng câu hỏi ma trận chuẩn cấu trúc mới</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs">
                  <div className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Trợ lý AI hỗ trợ sư phạm</strong>
                    <span className="text-[11px] text-blue-200/70">Soạn đề thi, phân tích học lực và giải bài tập</span>
                  </div>
                </div>
              </div>
            </div>

            {/* School Motto */}
            <div className="mt-8 pt-4 border-t border-blue-400/20 text-[11px] text-cyan-200/80 italic flex items-center gap-2">
              <School className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>"Kỷ cương – Tình thương – Trách nhiệm – Năng động – Hội nhập"</span>
            </div>
          </div>

          {/* Right Column: Auth Card (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col justify-between">
            <div>
              {/* Tab Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setLoginError('');
                    setRegSuccess('');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-blue-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setRegError('');
                    setRegSuccess('');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-blue-900 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Đăng ký tài khoản</span>
                </button>
              </div>

              {/* TAB 1: LOGIN FORM */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Alert Error */}
                  {loginError && (
                    <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Registered Success Announcement */}
                  {regSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{regSuccess}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tên đăng nhập (Username)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="Nhập tên đăng nhập (vd: thayhoangnhat)"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mật khẩu (Password)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Ghi nhớ đăng nhập</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => alert('Mật khẩu mặc định của các tài khoản mẫu là 123. Thầy/Cô có thể sử dụng các nút Đăng nhập nhanh bên dưới.')}
                      className="text-blue-700 hover:underline font-semibold cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 md:py-3 bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white rounded-xl font-bold text-xs md:text-sm shadow-lg shadow-blue-900/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Đang xác thực...
                      </span>
                    ) : (
                      <>
                        <span>Đăng nhập vào hệ thống</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: REGISTER FORM */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Alert Error */}
                  {regError && (
                    <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Ví dụ: Thầy Trần Quang Huy, Em Lê Bảo Ngọc..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>

                  {/* Username & Role Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tên đăng nhập <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="viết liền không dấu"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Vai trò người dùng <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="teacher">Giáo viên (Teacher)</option>
                        <option value="student">Học sinh (Student)</option>
                        <option value="parent">Phụ huynh (Parent)</option>
                      </select>
                    </div>
                  </div>

                  {/* If student or parent, select Class and Student */}
                  {regRole !== 'teacher' && (
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="block font-bold text-blue-950 mb-1">Lớp học:</label>
                        <select
                          value={regClassId}
                          onChange={(e) => {
                            setRegClassId(e.target.value);
                            const first = db.getStudents(e.target.value)[0];
                            if (first) setRegStudentId(first.id);
                          }}
                          className="w-full p-1.5 bg-white border border-blue-300 rounded-lg"
                        >
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-blue-950 mb-1">
                          {regRole === 'student' ? 'Hồ sơ học sinh:' : 'Con em (Học sinh):'}
                        </label>
                        <select
                          value={regStudentId}
                          onChange={(e) => setRegStudentId(e.target.value)}
                          className="w-full p-1.5 bg-white border border-blue-300 rounded-lg"
                        >
                          {studentsOfClass.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.studentCode} - {s.fullName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Ít nhất 3 ký tự"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Xác nhận mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại</label>
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0903..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email liên hệ</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="vidu@gmail.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-bold text-xs md:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Hoàn tất đăng ký tài khoản</span>
                  </button>
                </form>
              )}
            </div>

            {/* Quick 1-Click Demo Accounts Section */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Tài khoản mẫu để trải nghiệm nhanh:</span>
                <span className="text-blue-600 font-semibold lowercase">Mật khẩu: 123</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Teacher Account */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('thayhoangnhat', '123')}
                  className="p-2.5 bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200 rounded-xl text-left transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                    <span>Giáo viên</span>
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1 font-mono font-medium">thayhoangnhat</div>
                  <div className="text-[9.5px] text-blue-700/80 mt-0.5 truncate">Thầy Hoàng Nhật</div>
                </button>

                {/* Student Account */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('hs001', '123')}
                  className="p-2.5 bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200 rounded-xl text-left transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Học sinh</span>
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1 font-mono font-medium">hs001</div>
                  <div className="text-[9.5px] text-emerald-700/80 mt-0.5 truncate">Nguyễn Văn An (12A1)</div>
                </button>

                {/* Parent Account */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('ph001', '123')}
                  className="p-2.5 bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200 rounded-xl text-left transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    <Users className="w-3.5 h-3.5 text-amber-700" />
                    <span>Phụ huynh</span>
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1 font-mono font-medium">ph001</div>
                  <div className="text-[9.5px] text-amber-700/80 mt-0.5 truncate">Phụ huynh HS001</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-3 text-center text-[11px] text-blue-200/80 border-t border-blue-400/20 bg-blue-950/40 backdrop-blur-md">
        © 2024 – 2025 Trường THPT Thạnh Lộc – Địa chỉ: 142 Hà Huy Giáp, Phường Thạnh Lộc, Quận 12, TP.HCM
      </footer>
    </div>
  );
};
