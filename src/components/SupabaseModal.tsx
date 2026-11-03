import React, { useState } from 'react';
import {
  X,
  Server,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
  ExternalLink,
  Database,
  Lock,
  Zap
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  isSupabaseConfigured,
  clearSupabaseConfig
} from '../services/supabaseClient.ts';
import { supabaseDataService, SyncStats } from '../services/supabaseDataService.ts';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onStatusChange
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState<string>(currentConfig.url);
  const [anonKey, setAnonKey] = useState<string>(currentConfig.anonKey);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  // Test and Save configuration
  const handleTestAndSave = async () => {
    setIsTesting(true);
    setFeedback(null);
    setSyncStats(null);

    const res = await testSupabaseConnection(url, anonKey);
    setIsTesting(false);

    if (res.success) {
      saveSupabaseConfig(url, anonKey);
      setFeedback({ type: 'success', message: res.message });
      if (onStatusChange) onStatusChange();
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Disconnect
  const handleDisconnect = () => {
    if (window.confirm('Bạn có muốn ngắt kết nối với Supabase hiện tại và trở về chế độ lưu trữ cục bộ?')) {
      clearSupabaseConfig();
      setUrl('');
      setAnonKey('');
      setFeedback({ type: 'info', message: 'Đã ngắt kết nối Supabase. Ứng dụng chuyển sang chế độ dữ liệu cục bộ.' });
      if (onStatusChange) onStatusChange();
    }
  };

  // Sync all local data to Supabase
  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    setFeedback(null);
    const res = await supabaseDataService.syncLocalDataToSupabase();
    setIsSyncing(false);

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      if (res.stats) setSyncStats(res.stats);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Pull data from Supabase to local
  const handlePullFromCloud = async () => {
    setIsPulling(true);
    setFeedback(null);
    const res = await supabaseDataService.pullDataFromSupabase();
    setIsPulling(false);

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Copy SQL script
  const handleCopySql = async () => {
    try {
      const response = await fetch('/supabase_schema.sql');
      const sqlText = await response.text();
      await navigator.clipboard.writeText(sqlText);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    } catch (err) {
      alert('Đã sẵn sàng tệp supabase_schema.sql ở thư mục gốc của dự án!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#002f6c] to-[#005ba8] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base md:text-lg">Kết nối Cơ sở Dữ liệu Supabase</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isConfigured ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                }`}>
                  {isConfigured ? '● Đã kết nối Cloud' : '○ Chế độ Cục bộ'}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Lưu trữ học sinh, tài khoản, điểm số & chuyên cần trên PostgreSQL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {/* Status Alert Banner */}
          {feedback && (
            <div className={`p-3.5 rounded-2xl flex items-start gap-2.5 font-medium border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : feedback.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}>
              {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
              {feedback.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />}
              {feedback.type === 'info' && <Zap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />}
              <span className="leading-relaxed">{feedback.message}</span>
            </div>
          )}

          {/* Sync stats card */}
          {syncStats && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-white rounded-xl shadow-xs">
                <span className="text-slate-500 text-[10px] block">Tài khoản</span>
                <strong className="text-sm font-bold text-blue-900">{syncStats.accounts}</strong>
              </div>
              <div className="p-2 bg-white rounded-xl shadow-xs">
                <span className="text-slate-500 text-[10px] block">Học sinh</span>
                <strong className="text-sm font-bold text-emerald-900">{syncStats.students}</strong>
              </div>
              <div className="p-2 bg-white rounded-xl shadow-xs">
                <span className="text-slate-500 text-[10px] block">Bản ghi điểm</span>
                <strong className="text-sm font-bold text-amber-900">{syncStats.grades}</strong>
              </div>
              <div className="p-2 bg-white rounded-xl shadow-xs">
                <span className="text-slate-500 text-[10px] block">Điểm danh</span>
                <strong className="text-sm font-bold text-purple-900">{syncStats.attendance}</strong>
              </div>
            </div>
          )}

          {/* Section 1: Supabase API Keys */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                Bước 1: Nhập thông tin kết nối Supabase
              </span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Mở Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Project URL (VITE_SUPABASE_URL):
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xxxxxxxxxxxx.supabase.co"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Project Public Anon Key (VITE_SUPABASE_ANON_KEY):
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestAndSave}
                disabled={isTesting}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang kiểm tra kết nối...</span>
                  </>
                ) : (
                  <>
                    <Server className="w-4 h-4" />
                    <span>Kiểm tra & Lưu cấu hình Supabase</span>
                  </>
                )}
              </button>

              {isConfigured && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-all cursor-pointer"
                  title="Ngắt kết nối Supabase"
                >
                  Ngắt kết nối
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Schema Script */}
          <div className="space-y-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-200/60">
            <span className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-700" />
              Bước 2: Khởi tạo bảng dữ liệu trên Supabase SQL Editor
            </span>
            <p className="text-[11px] text-blue-900/80 leading-relaxed">
              Nhấn nút dưới đây để sao chép toàn bộ mã SQL của 19 bảng (Học sinh, Điểm danh, Sổ điểm, Tài khoản đăng nhập...). Sau đó dán vào mục <strong>SQL Editor</strong> trên Supabase và bấm <strong>Run</strong>.
            </p>

            <button
              type="button"
              onClick={handleCopySql}
              className={`w-full py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                copiedSql
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-blue-50 text-blue-800 border-blue-300 shadow-xs'
              }`}
            >
              {copiedSql ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã sao chép file supabase_schema.sql vào bộ nhớ đệm!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-blue-600" />
                  <span>Sao chép mã SQL (supabase_schema.sql) để chạy trên Supabase</span>
                </>
              )}
            </button>
          </div>

          {/* Section 3: Cloud Synchronization */}
          <div className="space-y-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/60">
            <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-emerald-700" />
              Bước 3: Đồng bộ dữ liệu Cloud
            </span>
            <p className="text-[11px] text-emerald-900/80 leading-relaxed">
              Đẩy toàn bộ danh sách lớp học, hồ sơ học sinh, điểm danh và các tài khoản lên cơ sở dữ liệu Supabase để lưu trữ vĩnh viễn trên đám mây.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleSyncToCloud}
                disabled={!isConfigured || isSyncing}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isConfigured && !isSyncing
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang đồng bộ lên Cloud...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Đẩy dữ liệu lên Supabase</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePullFromCloud}
                disabled={!isConfigured || isPulling}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isConfigured && !isPulling
                    ? 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                {isPulling ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang tải từ Cloud...</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-4 h-4" />
                    <span>Tải dữ liệu từ Supabase về</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Hỗ trợ PostgreSQL 15+ trên Supabase với Row-Level Security
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
