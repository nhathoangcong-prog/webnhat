import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { Sidebar, ActiveTab } from './components/Sidebar.tsx';
import { RightSidebar } from './components/RightSidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ClassStudentView } from './components/ClassStudentView.tsx';
import { GradebookView } from './components/GradebookView.tsx';
import { QuestionBankView } from './components/QuestionBankView.tsx';
import { OnlineExamView } from './components/OnlineExamView.tsx';
import { AIAssistantView } from './components/AIAssistantView.tsx';
import { AttendanceView } from './components/AttendanceView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { ResourcesView } from './components/ResourcesView.tsx';
import { ParentConnectView } from './components/ParentConnectView.tsx';
import { SystemSettingsView } from './components/SystemSettingsView.tsx';
import { AuthScreen } from './components/AuthScreen.tsx';
import { SupabaseModal } from './components/SupabaseModal.tsx';
import { db } from './services/db.ts';
import { authService } from './services/authService.ts';
import { UserRole, UserAccount } from './types/index.ts';
import { Menu, X, CheckCircle, Bell } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => authService.getCurrentUser());
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const user = authService.getCurrentUser();
    return user ? user.role : 'teacher';
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [aiQuickActionKey, setAiQuickActionKey] = useState<string>('');

  const state = db.getState();
  const profile = state.profile;
  const notifications = db.getNotifications();
  const schedules = state.schedules;

  // Handle login success
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setActiveTab('dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Bạn có muốn đăng xuất khỏi phiên làm việc hiện tại?')) {
      authService.logout();
      setCurrentUser(null);
      setCurrentRole('teacher');
      setActiveTab('dashboard');
    }
  };

  // Handle role switch
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'student' && !['dashboard', 'gradebook', 'exams', 'attendance', 'resources', 'settings'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
    if (role === 'parent' && !['dashboard', 'gradebook', 'attendance', 'parent_connect', 'settings'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  };

  // Quick action from right sidebar to AI assistant
  const handleOpenAIQuickAction = (key: string) => {
    setAiQuickActionKey(key);
    setActiveTab('ai_assistant');
  };

  // If not logged in, render AuthScreen
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-serif select-text text-slate-800">
      {/* 1. Header matching the reference screenshot */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        profile={profile}
        currentUser={currentUser}
        notificationCount={notifications.length}
        onNotificationClick={() => setShowNotificationsModal(true)}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
        onLogoutClick={handleLogout}
      />

      {/* Mobile Top Bar with Menu Hamburger Toggle */}
      <div className="lg:hidden bg-blue-900 text-white px-4 py-2 flex items-center justify-between shadow-md print:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg border border-white/20"
        >
          <Menu className="w-4 h-4" />
          <span>Danh mục chức năng</span>
        </button>

        <span className="text-xs font-bold text-cyan-300">
          THẦY HOÀNG NHẬT
        </span>
      </div>

      {/* Main Body Layout: Sidebar + Center Content + Right Sidebar */}
      <div className="flex-1 flex overflow-hidden max-w-[1920px] w-full mx-auto">
        {/* 2. Left Sidebar (11 modules + glowing book) */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          userRole={currentRole}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* 3. Center Area + Right Sidebar Container */}
        <main className="flex-1 overflow-y-auto p-3.5 md:p-5 flex flex-col xl:flex-row gap-4">
          {/* Central Active View */}
          <div className="flex-1 min-w-0">
            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenQuickGradeEntry={() => setActiveTab('gradebook')}
                onOpenStudentDetail={(sId) => setActiveTab('classes')}
              />
            )}

            {activeTab === 'classes' && <ClassStudentView />}

            {activeTab === 'gradebook' && <GradebookView />}

            {activeTab === 'questions' && <QuestionBankView />}

            {activeTab === 'exams' && <OnlineExamView currentRole={currentRole} />}

            {activeTab === 'ai_assistant' && <AIAssistantView initialAction={aiQuickActionKey} />}

            {activeTab === 'attendance' && <AttendanceView />}

            {activeTab === 'analytics' && <AnalyticsView />}

            {activeTab === 'resources' && <ResourcesView />}

            {activeTab === 'parent_connect' && <ParentConnectView currentRole={currentRole} />}

            {activeTab === 'settings' && (
              <SystemSettingsView
                currentRole={currentRole}
                onRoleChange={handleRoleChange}
              />
            )}
          </div>

          {/* 4. Right Sidebar (Only on dashboard or desktop width) */}
          {activeTab === 'dashboard' && (
            <RightSidebar
              notifications={notifications}
              schedules={schedules}
              onOpenAIQuickAction={handleOpenAIQuickAction}
              onOpenNotifications={() => setShowNotificationsModal(true)}
              onOpenSchedule={() => {
                alert('Chi tiết lịch công việc:\n- 21/01: Kiểm tra 15p Toán 11A1\n- 23/01: Kiểm tra 1 tiết Hóa 10A2\n- 25/01: Họp phụ huynh lớp 12A1');
              }}
            />
          )}
        </main>
      </div>

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Hộp thư Thông báo Hệ thống</h3>
              </div>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-900">{n.title}</span>
                    <span className="text-slate-400 text-[11px] font-medium">{n.date}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-serif">{n.content}</p>
                </div>
              ))}

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg cursor-pointer text-xs"
                >
                  Đã đọc tất cả
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Cloud Connection & Sync Modal */}
      <SupabaseModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />
    </div>
  );
}
