import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  Trophy,
  AlertTriangle,
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  BarChart2,
  Printer,
  ChevronRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import { db } from '../services/db.ts';
import { ExcelService } from '../services/excelService.ts';
import { SchoolClass, StudentCombinedGrade } from '../types/index.ts';

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
  onOpenQuickGradeEntry: () => void;
  onOpenStudentDetail: (studentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenQuickGradeEntry,
  onOpenStudentDetail,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('c1');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<'HK1' | 'HK2'>('HK1');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const stats = db.getOverallStatistics();
  const classes = db.getClasses();
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const combinedGrades = db.getCombinedGrades(selectedClassId, selectedSemester, searchQuery);

  const handleExportExcel = () => {
    ExcelService.exportGradebookToExcel(
      combinedGrades,
      currentClass ? currentClass.name : '12A1',
      selectedSemester === 'HK1' ? 'Học kỳ I' : 'Học kỳ II'
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* ROW 1: 4 Top Stat Cards matching reference screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Stat 1: Tổng số lớp */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100/60 rounded-2xl p-4 border border-blue-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-400/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">Tổng số lớp</div>
            <div className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
              {stats.totalClasses} <span className="text-sm font-semibold text-slate-600">lớp</span>
            </div>
          </div>
        </div>

        {/* Stat 2: Tổng số học sinh */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/60 rounded-2xl p-4 border border-emerald-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-400/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">Tổng số học sinh</div>
            <div className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
              {stats.totalStudents} <span className="text-sm font-semibold text-slate-600">em</span>
            </div>
          </div>
        </div>

        {/* Stat 3: Môn giảng dạy */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100/60 rounded-2xl p-4 border border-purple-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-purple-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-400/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">Môn giảng dạy</div>
            <div className="text-base md:text-lg font-bold text-purple-900 leading-tight">
              Toán – Lý – Hóa
            </div>
          </div>
        </div>

        {/* Stat 4: Điểm TB chung */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 rounded-2xl p-4 border border-amber-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-400/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">Điểm TB chung</div>
            <div className="text-xl md:text-2xl font-extrabold text-amber-700 leading-tight">
              {stats.avgGeneral.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: 3 Analytics Cards matching reference screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Card 1: Kết quả học tập theo môn (Điểm trung bình) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-800">
              Kết quả học tập theo môn <span className="text-xs text-slate-500 font-normal">(Điểm trung bình)</span>
            </h3>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-44 flex items-end justify-between px-4 pb-2 pt-6 relative">
            {/* Grid background lines */}
            <div className="absolute inset-x-4 top-2 flex flex-col justify-between h-36 pointer-events-none opacity-20 text-[9px] text-slate-400">
              <div className="border-b border-slate-300 w-full flex justify-between"><span>10,0</span></div>
              <div className="border-b border-slate-300 w-full flex justify-between"><span>9,0</span></div>
              <div className="border-b border-slate-300 w-full flex justify-between"><span>8,0</span></div>
              <div className="border-b border-slate-300 w-full flex justify-between"><span>7,0</span></div>
              <div className="border-b border-slate-300 w-full flex justify-between"><span>6,0</span></div>
              <div className="border-b border-slate-300 w-full flex justify-between"><span>5,0</span></div>
            </div>

            {/* Toán Bar */}
            <div className="flex flex-col items-center z-10 w-20">
              <span className="text-xs font-extrabold text-blue-700 mb-1">
                {stats.avgToan.toFixed(2).replace('.', ',')}
              </span>
              <div
                className="w-14 rounded-t-md bg-gradient-to-t from-blue-700 to-blue-500 shadow-md transition-all duration-500 hover:brightness-110"
                style={{ height: `${((stats.avgToan - 5) / 5) * 110 + 20}px` }}
              ></div>
              <span className="text-xs font-bold text-slate-700 mt-2">Toán</span>
            </div>

            {/* Vật lý Bar */}
            <div className="flex flex-col items-center z-10 w-20">
              <span className="text-xs font-extrabold text-emerald-700 mb-1">
                {stats.avgVatLy.toFixed(2).replace('.', ',')}
              </span>
              <div
                className="w-14 rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md transition-all duration-500 hover:brightness-110"
                style={{ height: `${((stats.avgVatLy - 5) / 5) * 110 + 20}px` }}
              ></div>
              <span className="text-xs font-bold text-slate-700 mt-2">Vật lý</span>
            </div>

            {/* Hóa học Bar */}
            <div className="flex flex-col items-center z-10 w-20">
              <span className="text-xs font-extrabold text-amber-700 mb-1">
                {stats.avgHoaHoc.toFixed(2).replace('.', ',')}
              </span>
              <div
                className="w-14 rounded-t-md bg-gradient-to-t from-amber-600 to-amber-400 shadow-md transition-all duration-500 hover:brightness-110"
                style={{ height: `${((stats.avgHoaHoc - 5) / 5) * 110 + 20}px` }}
              ></div>
              <span className="text-xs font-bold text-slate-700 mt-2">Hóa học</span>
            </div>
          </div>
        </div>

        {/* Card 2: Xếp loại học lực (Toàn bộ học sinh) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-800">
              Xếp loại học lực <span className="text-xs text-slate-500 font-normal">(Toàn bộ học sinh)</span>
            </h3>
          </div>

          <div className="flex items-center justify-between gap-2 h-44">
            {/* SVG Donut Chart */}
            <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background circle */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                {/* Giỏi (21.7%) - emerald-500 */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeDasharray="19.1 68.9"
                  strokeDashoffset="0"
                />
                {/* Khá (42.9%) - blue-500 */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="6"
                  strokeDasharray="37.7 50.3"
                  strokeDashoffset="-19.1"
                />
                {/* Trung bình (28.8%) - amber-400 */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="6"
                  strokeDasharray="25.3 62.7"
                  strokeDashoffset="-56.8"
                />
                {/* Yếu (6.6%) - rose-500 */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="6"
                  strokeDasharray="5.8 82.2"
                  strokeDashoffset="-82.1"
                />
              </svg>

              {/* Center count text matching reference */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-extrabold text-slate-900 leading-none">240</span>
                <span className="text-[9px] text-slate-500 font-medium">học sinh</span>
              </div>
            </div>

            {/* Legend matching reference screenshot */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                <span className="text-slate-700 font-medium">
                  <strong>Giỏi:</strong> 52 em ({stats.rankStats.gioi.percentage}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                <span className="text-slate-700 font-medium">
                  <strong>Khá:</strong> 103 em ({stats.rankStats.kha.percentage}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                <span className="text-slate-700 font-medium">
                  <strong>Trung bình:</strong> 69 em ({stats.rankStats.trungBinh.percentage}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0"></span>
                <span className="text-slate-700 font-medium">
                  <strong>Yếu:</strong> 16 em ({stats.rankStats.yeu.percentage}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Học sinh cần quan tâm */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-800">Học sinh cần quan tâm</h3>
            </div>

            <div className="space-y-2 mt-2">
              {stats.attentionStudents.map((st, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 flex items-start gap-2 text-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold text-slate-800">{st.name}</span>{' '}
                    <span className="text-slate-600">({st.className})</span>
                    <div className="text-[11px] font-semibold text-red-600 mt-0.5">
                      Điểm TB: {st.score.toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('classes')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center justify-end gap-1 mt-3 cursor-pointer"
          >
            <span>Xem danh sách chi tiết</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ROW 3: Quản lý kết quả học tập (Sổ điểm điện tử thu nhỏ) matching reference */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        {/* Table Header & Title */}
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <BookOpen className="w-4 h-4 text-blue-700" />
          <h2 className="font-bold text-base text-slate-900">Quản lý kết quả học tập</h2>
        </div>

        {/* Filter Controls Bar matching reference screenshot */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Lớp học Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">Lớp học:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Môn học Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">Môn học:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">Tất cả môn</option>
                <option value="TOAN">Toán học</option>
                <option value="VATLY">Vật lý</option>
                <option value="HOAHOC">Hóa học</option>
              </select>
            </div>

            {/* Học kỳ Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">Học kỳ:</span>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value as 'HK1' | 'HK2')}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="HK1">Học kỳ I</option>
                <option value="HK2">Học kỳ II</option>
              </select>
            </div>
          </div>

          {/* Search Input matching reference */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên hoặc mã học sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Data Table matching reference screenshot exactly */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full border-collapse text-xs text-center">
            <thead>
              {/* Main Header row */}
              <tr className="bg-[#0b5cad] text-white">
                <th rowSpan={2} className="border border-blue-400/30 px-2 py-2 font-bold w-12">
                  STT
                </th>
                <th rowSpan={2} className="border border-blue-400/30 px-2.5 py-2 font-bold w-20">
                  Mã HS
                </th>
                <th rowSpan={2} className="border border-blue-400/30 px-3 py-2 font-bold text-left min-w-[140px]">
                  Họ và tên
                </th>
                <th colSpan={4} className="border border-blue-400/30 py-1.5 font-bold bg-[#094d92]">
                  Toán
                </th>
                <th colSpan={4} className="border border-blue-400/30 py-1.5 font-bold bg-[#08427e]">
                  Vật lý
                </th>
                <th colSpan={4} className="border border-blue-400/30 py-1.5 font-bold bg-[#094d92]">
                  Hóa học
                </th>
                <th rowSpan={2} className="border border-blue-400/30 px-2 py-2 font-bold w-16 bg-[#003875]">
                  ĐTB 3 môn
                </th>
                <th rowSpan={2} className="border border-blue-400/30 px-2 py-2 font-bold w-20 bg-[#003875]">
                  Xếp loại
                </th>
              </tr>
              {/* Sub-header row for component scores */}
              <tr className="bg-[#1b73e8] text-white font-semibold text-[11px]">
                {/* Toán */}
                <th className="border border-blue-300/40 px-2 py-1 w-10">TX</th>
                <th className="border border-blue-300/40 px-2 py-1 w-10">GK</th>
                <th className="border border-blue-300/40 px-2 py-1 w-10">CK</th>
                <th className="border border-blue-300/40 px-2 py-1 w-11 bg-blue-800">TB</th>
                {/* Vật lý */}
                <th className="border border-blue-300/40 px-2 py-1 w-10">TX</th>
                <th className="border border-blue-300/40 px-2 py-1 w-10">GK</th>
                <th className="border border-blue-300/40 px-2 py-1 w-10">CK</th>
                <th className="border border-blue-300/40 px-2 py-1 w-11 bg-blue-800">TB</th>
                {/* Hóa học */}
                <th className="border border-blue-300/40 px-2 py-1 w-10">TX</th>
                <th className="border border-blue-300/40 px-2 py-1 w-10">GK</th>
                <th className="border border-blue-300/40 px-2 py-1 w-10">CK</th>
                <th className="border border-blue-300/40 px-2 py-1 w-11 bg-blue-800">TB</th>
              </tr>
            </thead>
            <tbody>
              {combinedGrades.length === 0 ? (
                <tr>
                  <td colSpan={17} className="py-6 text-slate-500 italic bg-white">
                    Không tìm thấy học sinh phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                combinedGrades.map((row, index) => (
                  <tr
                    key={row.studentId}
                    className={`hover:bg-blue-50/70 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                    }`}
                  >
                    <td className="border border-slate-200 px-2 py-1.5 font-medium text-slate-600">
                      {row.stt}
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 font-bold text-blue-900">
                      {row.studentCode}
                    </td>
                    <td
                      onClick={() => onOpenStudentDetail(row.studentId)}
                      className="border border-slate-200 px-3 py-1.5 text-left font-bold text-slate-900 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      {row.studentName}
                    </td>

                    {/* Toán */}
                    <td className="border border-slate-200 px-2 py-1.5 text-slate-700">
                      {row.toan.tx.toFixed(1).replace('.', ',')}
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 text-slate-700">
                      {row.toan.gk.toFixed(1).replace('.', ',')}
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 text-slate-700">
                      {row.toan.ck.toFixed(1).replace('.', ',')}
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 font-bold text-blue-950 bg-blue-50/50">
                      {row.toan.tb.toFixed(2).replace('.', ',')}
                    </td>

                    {/* Vật lý */}
                    <td className="border border-slate-200 px-2 py-1.5 text-slate-700">
                      {row.vatly.tx.toFixed(1).replace('.', ',')}
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 text-slate-700">
                      {row.vatly.gk.toFixed(1).replace('.', ',')}
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 text-slate-700">
                      {row.vatly.ck.toFixed(1).replace('.', ',')}
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 font-bold text-blue-950 bg-blue-50/50">
                      {row.vatly.tb.toFixed(2).replace('.', ',')}
                    </td>

                    {/* Hóa học */}
                    <td className="border border-slate-200 px-2 py-1.5 text-slate-700">
                      {row.hoahoc.tx.toFixed(1).replace('.', ',')}
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 text-slate-700">
                      {row.hoahoc.gk.toFixed(1).replace('.', ',')}
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 text-slate-700">
                      {row.hoahoc.ck.toFixed(1).replace('.', ',')}
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 font-bold text-blue-950 bg-blue-50/50">
                      {row.hoahoc.tb.toFixed(2).replace('.', ',')}
                    </td>

                    {/* ĐTB 3 môn */}
                    <td className="border border-slate-200 px-2 py-1.5 font-extrabold text-blue-900 bg-blue-100/40 text-[12px]">
                      {row.dtb3Mon.toFixed(2).replace('.', ',')}
                    </td>

                    {/* Xếp loại Badge matching reference */}
                    <td className="border border-slate-200 px-2 py-1.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          row.rank === 'Giỏi'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : row.rank === 'Khá'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : row.rank === 'Trung bình'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {row.rank}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Action Buttons Toolbar matching reference screenshot exactly */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          {/* Nhập điểm (Green solid button) */}
          <button
            onClick={onOpenQuickGradeEntry}
            className="flex items-center gap-1.5 bg-[#0fa958] hover:bg-[#0c8a47] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nhập điểm</span>
          </button>

          {/* Nhập từ Excel */}
          <button
            onClick={() => onNavigateTab('classes')}
            className="flex items-center gap-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-400 px-3.5 py-2 rounded-lg font-bold text-xs shadow-sm transition-all duration-150 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Nhập từ Excel</span>
          </button>

          {/* Xuất Excel */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-400 px-3.5 py-2 rounded-lg font-bold text-xs shadow-sm transition-all duration-150 cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Xuất Excel</span>
          </button>

          {/* Xem thống kê */}
          <button
            onClick={() => onNavigateTab('analytics')}
            className="flex items-center gap-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-400 px-3.5 py-2 rounded-lg font-bold text-xs shadow-sm transition-all duration-150 cursor-pointer"
          >
            <BarChart2 className="w-4 h-4 text-purple-600" />
            <span>Xem thống kê</span>
          </button>

          {/* In sổ điểm */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-400 px-3.5 py-2 rounded-lg font-bold text-xs shadow-sm transition-all duration-150 cursor-pointer ml-auto"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>In sổ điểm</span>
          </button>
        </div>
      </div>
    </div>
  );
};
