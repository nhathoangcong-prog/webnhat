import React, { useState } from 'react';
import {
  Settings,
  Database,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  Key,
  Server,
  FileCode,
  CheckCircle,
  AlertTriangle,
  History,
  Lock,
  Copy,
  Check,
  UploadCloud,
  DownloadCloud
} from 'lucide-react';
import { db } from '../services/db.ts';
import { UserRole } from '../types/index.ts';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  isSupabaseConfigured,
  clearSupabaseConfig
} from '../services/supabaseClient.ts';
import { supabaseDataService, SyncStats } from '../services/supabaseDataService.ts';

interface SystemSettingsViewProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({
  currentRole,
  onRoleChange,
}) => {
  const currentCfg = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState<string>(currentCfg.url);
  const [supabaseKey, setSupabaseKey] = useState<string>(currentCfg.anonKey);
  const [testConnStatus, setTestConnStatus] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [passwordForm, setPasswordForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [logs, setLogs] = useState(db.getState().auditLogs);

  const handleExportBackup = () => {
    const jsonStr = db.exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_THPT_Thanh_Loc_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const ok = db.importDatabaseJson(content);
        if (ok) {
          alert('Phục hồi dữ liệu từ file sao lưu thành công!');
          window.location.reload();
        } else {
          alert('File sao lưu không hợp lệ hoặc thiếu bảng dữ liệu!');
        }
      } catch (err) {
        alert('Lỗi đọc file sao lưu JSON!');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (window.confirm('Khôi phục cơ sở dữ liệu về trạng thái Demo chuẩn ban đầu của trường THPT Thạnh Lộc?')) {
      db.resetToDefaultDemo();
      alert('Đã khôi phục dữ liệu Demo thành công!');
      window.location.reload();
    }
  };

  const handleTestSupabase = async () => {
    setIsTesting(true);
    setTestConnStatus('Đang kiểm tra kết nối với Supabase Cloud PostgreSQL...');
    
    const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setIsTesting(false);

    if (res.success) {
      saveSupabaseConfig(supabaseUrl, supabaseKey);
      setTestConnStatus(`✅ ${res.message}`);
      db.logAction('Kết nối Supabase Cloud thành công');
    } else {
      setTestConnStatus(`❌ ${res.message}`);
    }
  };

  const handleSyncToCloud = async () => {
    if (!isSupabaseConfigured()) {
      alert('Vui lòng kiểm tra và lưu cấu hình Supabase hợp lệ trước khi đồng bộ!');
      return;
    }
    setIsSyncing(true);
    const res = await supabaseDataService.syncLocalDataToSupabase();
    setIsSyncing(false);
    if (res.success) {
      alert(res.message);
      db.logAction('Đồng bộ dữ liệu cục bộ lên Supabase Cloud');
    } else {
      alert(res.message);
    }
  };

  const handlePullFromCloud = async () => {
    if (!isSupabaseConfigured()) {
      alert('Vui lòng kiểm tra và lưu cấu hình Supabase hợp lệ trước!');
      return;
    }
    if (window.confirm('Tải toàn bộ dữ liệu mới nhất từ Supabase về hệ thống? Dữ liệu cục bộ sẽ được cập nhật.')) {
      const res = await supabaseDataService.pullDataFromSupabase();
      alert(res.message);
      if (res.success) {
        window.location.reload();
      }
    }
  };

  const handleCopySql = async () => {
    try {
      const response = await fetch('/supabase_schema.sql');
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    } catch (err) {
      alert('Tệp supabase_schema.sql có sẵn trong thư mục gốc của hệ thống.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.newPass || passwordForm.newPass !== passwordForm.confirmPass) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    db.logAction('Đổi mật khẩu tài khoản thành công');
    setPassSuccessMsg('Đã cập nhật mật khẩu an toàn thành công!');
    setPasswordForm({ oldPass: '', newPass: '', confirmPass: '' });
    setTimeout(() => setPassSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Cài đặt Hệ thống & Quản trị Cơ sở Dữ liệu
            </h2>
            <p className="text-xs text-slate-500">
              Cấu hình phân quyền RLS, kết nối Supabase, sao lưu dữ liệu và kiểm tra nhật ký
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sao lưu dữ liệu (JSON)</span>
          </button>

          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Khôi phục Demo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Role Switcher & Security */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Phân quyền người dùng (Role-Based Access Control)</span>
          </div>

          <p className="text-xs text-slate-600">
            Hệ thống hỗ trợ 3 vai trò với quyền truy cập dữ liệu được phân chia độc lập và bảo vệ bằng RLS:
          </p>

          <div className="space-y-2 text-xs">
            <label className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
              currentRole === 'teacher' ? 'bg-blue-50 border-blue-400 font-bold text-blue-900 ring-1 ring-blue-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <div>1. Giáo viên (Thầy Hoàng Nhật)</div>
                <div className="text-[10px] text-slate-500 font-normal">Toàn quyền xem, nhập, sửa điểm, tạo đề thi và gọi AI</div>
              </div>
              <input
                type="radio"
                name="user_role"
                checked={currentRole === 'teacher'}
                onChange={() => onRoleChange('teacher')}
                className="cursor-pointer"
              />
            </label>

            <label className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
              currentRole === 'student' ? 'bg-blue-50 border-blue-400 font-bold text-blue-900 ring-1 ring-blue-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <div>2. Học sinh (Nguyễn Văn An - HS001)</div>
                <div className="text-[10px] text-slate-500 font-normal">Chỉ được xem điểm cá nhân, làm bài trực tuyến, xem học liệu</div>
              </div>
              <input
                type="radio"
                name="user_role"
                checked={currentRole === 'student'}
                onChange={() => onRoleChange('student')}
                className="cursor-pointer"
              />
            </label>

            <label className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
              currentRole === 'parent' ? 'bg-blue-50 border-blue-400 font-bold text-blue-900 ring-1 ring-blue-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <div>3. Phụ huynh (Nguyễn Văn Bình)</div>
                <div className="text-[10px] text-slate-500 font-normal">Chỉ xem thông tin con mình (HS001), chuyên cần và nhận xét</div>
              </div>
              <input
                type="radio"
                name="user_role"
                checked={currentRole === 'parent'}
                onChange={() => onRoleChange('parent')}
                className="cursor-pointer"
              />
            </label>
          </div>

          {/* Change Password Form */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Đổi mật khẩu tài khoản</span>
            </h4>

            {passSuccessMsg && (
              <div className="mb-2 p-2 bg-emerald-50 text-emerald-800 rounded text-[11px] font-bold">
                {passSuccessMsg}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="password"
                  placeholder="Mật khẩu mới..."
                  value={passwordForm.newPass}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                  className="p-1.5 border border-slate-300 rounded"
                />
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu..."
                  value={passwordForm.confirmPass}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })}
                  className="p-1.5 border border-slate-300 rounded"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs cursor-pointer"
              >
                Cập nhật mật khẩu
              </button>
            </form>
          </div>
        </div>

        {/* Card 2: Supabase Connection & Schema */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold text-sm">
            <Server className="w-4 h-4 text-emerald-600" />
            <span>Kết nối Cơ sở dữ liệu Supabase PostgreSQL</span>
          </div>

          <p className="text-xs text-slate-600">
            Hệ thống đã thiết kế sẵn toàn bộ 18 bảng dữ liệu chuẩn và chính sách bảo mật RLS tại file <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-900 font-mono font-bold">/supabase_schema.sql</code>.
          </p>

          <div className="space-y-2 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Supabase Project URL:</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Supabase Anon Key:</label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={isTesting}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
                <span>{isTesting ? 'Đang kiểm tra...' : 'Kiểm tra & Lưu'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Đã sao chép SQL!' : 'Sao chép file SQL'}</span>
              </button>
            </div>

            {testConnStatus && (
              <div className="p-2.5 rounded-xl border text-xs font-medium leading-relaxed bg-slate-50 border-slate-200">
                {testConnStatus}
              </div>
            )}

            {/* Cloud Sync Tools */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2 mt-2">
              <div className="font-bold text-emerald-950 text-xs flex items-center justify-between">
                <span>Đồng bộ dữ liệu với Supabase Cloud</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isSupabaseConfigured() ? 'bg-emerald-200 text-emerald-900 font-bold' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isSupabaseConfigured() ? 'Cloud Ready' : 'Chưa lưu cấu hình'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSyncToCloud}
                  disabled={isSyncing}
                  className="py-1.5 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer text-[11px]"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isSyncing ? 'Đang đẩy...' : 'Đẩy dữ liệu lên Cloud'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePullFromCloud}
                  className="py-1.5 px-2.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold rounded-lg text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer text-[11px]"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>Tải dữ liệu từ Cloud</span>
                </button>
              </div>
            </div>
          </div>

          {/* Backup upload */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="font-bold text-xs text-slate-800 mb-1 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Phục hồi cơ sở dữ liệu từ file JSON</span>
            </h4>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold text-sm">
          <History className="w-4 h-4 text-blue-600" />
          <span>Nhật ký thao tác hệ thống (Audit Logs)</span>
        </div>

        <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 sticky top-0">
              <tr>
                <th className="p-2">Thời gian</th>
                <th className="p-2">Người thực hiện</th>
                <th className="p-2">Hành động ghi nhận</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-2 text-slate-500 font-mono text-[11px]">{log.timestamp}</td>
                  <td className="p-2 font-bold text-blue-900">{log.user}</td>
                  <td className="p-2 text-slate-800">{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
