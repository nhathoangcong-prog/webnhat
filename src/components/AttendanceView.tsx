import React, { useState } from 'react';
import {
  CalendarCheck2,
  Calendar,
  Save,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  UserX,
  Search,
  Check
} from 'lucide-react';
import { db } from '../services/db.ts';
import { AttendanceRecord, Student } from '../types/index.ts';

export const AttendanceView: React.FC = () => {
  const classes = db.getClasses();
  const [selectedClassId, setSelectedClassId] = useState<string>('c1');
  const [selectedDate, setSelectedDate] = useState<string>('2025-01-20');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [selectedSubject, setSelectedSubject] = useState<'TOAN' | 'VATLY' | 'HOAHOC'>('TOAN');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedMsg, setSavedMsg] = useState<string>('');

  const students = db.getStudents(selectedClassId);
  const existingAttendance = db.getAttendance(selectedClassId, selectedDate);

  // Local state for attendance records of this session
  const [sessionRecords, setSessionRecords] = useState<Record<string, { status: 'present' | 'excused' | 'unexcused' | 'late'; reason: string }>>(() => {
    const map: Record<string, { status: any; reason: string }> = {};
    students.forEach(st => {
      const match = existingAttendance.find(a => a.studentId === st.id);
      map[st.id] = {
        status: match ? match.status : 'present',
        reason: match?.reason || ''
      };
    });
    return map;
  });

  const handleStatusChange = (studentId: string, status: 'present' | 'excused' | 'unexcused' | 'late') => {
    setSessionRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setSessionRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        reason
      }
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: any; reason: string }> = {};
    students.forEach(st => {
      updated[st.id] = { status: 'present', reason: '' };
    });
    setSessionRecords(updated);
  };

  const handleSaveAttendance = () => {
    const recordsToSave: AttendanceRecord[] = students.map(st => ({
      id: `att_${st.id}_${selectedDate}_${selectedPeriod}`,
      studentId: st.id,
      studentCode: st.studentCode,
      studentName: st.fullName,
      classId: selectedClassId,
      subjectCode: selectedSubject,
      date: selectedDate,
      period: selectedPeriod,
      status: sessionRecords[st.id]?.status || 'present',
      reason: sessionRecords[st.id]?.reason || ''
    }));

    db.saveAttendance(recordsToSave);
    setSavedMsg(`Đã lưu điểm danh ngày ${selectedDate} thành công!`);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const filteredStudents = students.filter(s =>
    !searchQuery.trim() ||
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count attendance stats for current session
  const totalInClass = students.length;
  const presentCount = Object.values(sessionRecords).filter(r => r.status === 'present').length;
  const excusedCount = Object.values(sessionRecords).filter(r => r.status === 'excused').length;
  const unexcusedCount = Object.values(sessionRecords).filter(r => r.status === 'unexcused').length;
  const lateCount = Object.values(sessionRecords).filter(r => r.status === 'late').length;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Điểm danh & Theo dõi chuyên cần
            </h2>
            <p className="text-xs text-slate-500">
              Quản lý sĩ số lớp, điểm danh theo tiết học, thống kê ngày nghỉ và đi trễ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Tất cả có mặt</span>
          </button>

          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu điểm danh</span>
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-bold text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Stats summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <div className="text-xs text-emerald-700 font-semibold">Có mặt</div>
          <div className="text-xl font-extrabold text-emerald-900 mt-0.5">{presentCount} / {totalInClass}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <div className="text-xs text-blue-700 font-semibold">Vắng có phép</div>
          <div className="text-xl font-extrabold text-blue-900 mt-0.5">{excusedCount}</div>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
          <div className="text-xs text-rose-700 font-semibold">Vắng không phép</div>
          <div className="text-xl font-extrabold text-rose-900 mt-0.5">{unexcusedCount}</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <div className="text-xs text-amber-700 font-semibold">Đi trễ</div>
          <div className="text-xl font-extrabold text-amber-900 mt-0.5">{lateCount}</div>
        </div>
      </div>

      {/* Filter and selector */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <span className="font-bold text-slate-700 mr-1.5">Lớp:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="font-bold text-slate-700 mr-1.5">Ngày:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1"
            />
          </div>

          <div>
            <span className="font-bold text-slate-700 mr-1.5">Tiết học:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                <option key={p} value={p}>Tiết {p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên học sinh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1 text-xs"
          />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#003875] to-[#005ba8] text-white">
              <th className="py-2.5 px-3 font-bold text-center w-12">STT</th>
              <th className="py-2.5 px-3 font-bold w-24">Mã HS</th>
              <th className="py-2.5 px-4 font-bold min-w-[160px]">Họ và tên</th>
              <th className="py-2.5 px-4 font-bold text-center w-64">Trạng thái điểm danh</th>
              <th className="py-2.5 px-4 font-bold">Lý do / Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((st, idx) => {
              const currentStatus = sessionRecords[st.id]?.status || 'present';
              const currentReason = sessionRecords[st.id]?.reason || '';

              return (
                <tr
                  key={st.id}
                  className={`hover:bg-blue-50/50 transition-colors border-b border-slate-100 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <td className="py-2 px-3 text-center text-slate-600 font-medium">{idx + 1}</td>
                  <td className="py-2 px-3 font-bold text-blue-900">{st.studentCode}</td>
                  <td className="py-2 px-4 font-bold text-slate-900">{st.fullName}</td>

                  {/* Radio buttons for status */}
                  <td className="py-2 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleStatusChange(st.id, 'present')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Có mặt
                      </button>

                      <button
                        onClick={() => handleStatusChange(st.id, 'late')}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentStatus === 'late'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Trễ
                      </button>

                      <button
                        onClick={() => handleStatusChange(st.id, 'excused')}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentStatus === 'excused'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Có phép
                      </button>

                      <button
                        onClick={() => handleStatusChange(st.id, 'unexcused')}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentStatus === 'unexcused'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Không phép
                      </button>
                    </div>
                  </td>

                  {/* Reason input */}
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      placeholder="Ghi chú lý do nếu vắng hoặc trễ..."
                      value={currentReason}
                      onChange={(e) => handleReasonChange(st.id, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
