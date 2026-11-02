import React, { useState } from 'react';
import {
  BellRing,
  Plus,
  Send,
  MessageSquare,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  PhoneCall,
  Mail
} from 'lucide-react';
import { db } from '../services/db.ts';
import { NotificationItem, UserRole } from '../types/index.ts';

interface ParentConnectViewProps {
  currentRole: UserRole;
}

export const ParentConnectView: React.FC<ParentConnectViewProps> = ({ currentRole }) => {
  const classes = db.getClasses();
  const [notifications, setNotifications] = useState<NotificationItem[]>(db.getNotifications());
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<any>('general');
  const [newTargetClass, setNewTargetClass] = useState<string>('all');

  // Parent feedback simulated chat
  const [feedbackMessages, setFeedbackMessages] = useState<{ sender: string; role: string; time: string; text: string }[]>([
    {
      sender: 'Bác Nguyễn Văn Bình (Phụ huynh em Nguyễn Văn An - 12A1)',
      role: 'parent',
      time: '19/01 14:30',
      text: 'Chào Thầy Hoàng Nhật, gia đình đã nhận được bảng điểm giữa kỳ của cháu An. Gia đình rất cảm ơn Thầy đã tận tình hướng dẫn cháu môn Toán và Hóa.'
    },
    {
      sender: 'Thầy Hoàng Nhật',
      role: 'teacher',
      time: '19/01 15:10',
      text: 'Chào bác Bình, em An học rất nghiêm túc và có năng khiếu tư duy tốt. Sắp tới trường có kỳ thi thử tốt nghiệp THPT, thầy sẽ tiếp tục bồi dưỡng thêm cho em ạ!'
    }
  ]);
  const [replyInput, setReplyInput] = useState('');

  const refreshList = () => {
    setNotifications(db.getNotifications());
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo!');
      return;
    }

    db.addNotification({
      title: newTitle,
      content: newContent,
      type: newType,
      targetType: newTargetClass === 'all' ? 'all' : 'class',
      targetClassId: newTargetClass === 'all' ? undefined : newTargetClass
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewContent('');
    refreshList();
    alert('Đã gửi thông báo thành công tới lớp và phụ huynh!');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    setFeedbackMessages(prev => [
      ...prev,
      {
        sender: currentRole === 'teacher' ? 'Thầy Hoàng Nhật' : 'Phụ huynh Nguyễn Văn Bình',
        role: currentRole,
        time: 'Vừa xong',
        text: replyInput
      }
    ]);
    setReplyInput('');
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Thông báo & Kết nối Phụ huynh học sinh
            </h2>
            <p className="text-xs text-slate-500">
              Kênh liên lạc điện tử 2 chiều giữa Thầy Hoàng Nhật và Phụ huynh – THPT Thạnh Lộc
            </p>
          </div>
        </div>

        {currentRole === 'teacher' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo thông báo mới</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Notifications List */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-blue-600" />
            <span>Danh sách thông báo nhà trường & Bộ môn</span>
          </h3>

          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-2 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    n.type === 'exam'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : n.type === 'grade'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {n.type === 'exam' ? 'Lịch kiểm tra' : n.type === 'grade' ? 'Công bố điểm' : 'Bài tập về nhà'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{n.date}</span>
                </div>

                <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-serif">{n.content}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Phạm vi: <strong>Toàn bộ lớp giảng dạy</strong></span>
                  <span className="text-blue-700 font-medium">Đã gửi tới phụ huynh</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sổ liên lạc 2 chiều trực tiếp */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between space-y-3 h-[500px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Hộp thư trao đổi với Phụ huynh
                </h3>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Trực tuyến
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mt-2 mb-3">
              Trao đổi riêng giữa Thầy Hoàng Nhật và Phụ huynh học sinh Nguyễn Văn An (Lớp 12A1):
            </p>

            {/* Chat messages */}
            <div className="space-y-2.5 overflow-y-auto max-h-[320px] pr-1">
              {feedbackMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs space-y-1 ${
                    msg.role === 'teacher'
                      ? 'bg-blue-50 border border-blue-200 ml-4'
                      : 'bg-slate-50 border border-slate-200 mr-4'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                    <span>{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div className="text-slate-800 leading-relaxed">{msg.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Send message form */}
          <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              placeholder="Nhập nội dung phản hồi tới phụ huynh..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Modal: Add Notification */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full">
            <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-2xl flex items-center justify-between">
              <h3 className="font-bold text-base">Tạo thông báo mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề thông báo (*):</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  placeholder="VD: Lịch thi học kỳ môn Hóa học 12"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại thông báo:</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="exam">Lịch kiểm tra</option>
                    <option value="homework">Giao bài tập</option>
                    <option value="grade">Công bố điểm</option>
                    <option value="general">Thông báo chung</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gửi tới:</label>
                  <select
                    value={newTargetClass}
                    onChange={(e) => setNewTargetClass(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="all">Tất cả các lớp</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung chi tiết (*):</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  placeholder="Nhập nội dung thông báo gửi tới học sinh và phụ huynh..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Phát hành thông báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
