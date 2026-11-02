import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart2,
  PieChart,
  Download,
  Printer,
  AlertTriangle,
  Award,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { db } from '../services/db.ts';

export const AnalyticsView: React.FC = () => {
  const stats = db.getOverallStatistics();
  const classes = db.getClasses();

  // Class comparison data
  const classComparison = [
    { className: '12A1', avg: 8.12, gioiRate: 35, khaRate: 45, passRate: 98 },
    { className: '12A2', avg: 7.85, gioiRate: 25, khaRate: 50, passRate: 95 },
    { className: '11A1', avg: 7.94, gioiRate: 28, khaRate: 48, passRate: 96 },
    { className: '11A2', avg: 7.62, gioiRate: 18, khaRate: 42, passRate: 92 },
    { className: '10A1', avg: 7.70, gioiRate: 20, khaRate: 44, passRate: 93 },
    { className: '10A2', avg: 7.55, gioiRate: 15, khaRate: 40, passRate: 90 },
  ];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Phân tích & Đánh giá Năng lực Học sinh
            </h2>
            <p className="text-xs text-slate-500">
              Báo cáo chất lượng giáo dục toàn diện 3 môn Toán, Vật lý, Hóa học – THPT Thạnh Lộc
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* 3 Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Điểm TB toàn trường</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +0.24 so với HKI năm ngoái
            </span>
          </div>
          <div className="text-3xl font-extrabold text-blue-900">
            {stats.avgGeneral.toFixed(2).replace('.', ',')}
          </div>
          <div className="text-xs text-slate-500">
            Tổng cộng 240 học sinh / 6 lớp khối 10, 11, 12
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Tỷ lệ Học sinh Khá - Giỏi</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            {(stats.rankStats.gioi.percentage + stats.rankStats.kha.percentage).toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500">
            155 / 240 học sinh đạt danh hiệu Khá - Giỏi
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Học sinh cần phụ đạo</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600">
            {stats.rankStats.yeu.count} <span className="text-sm font-semibold text-slate-600">em ({stats.rankStats.yeu.percentage}%)</span>
          </div>
          <div className="text-xs text-slate-500">
            Cần kèm cặp môn Toán giải tích và Hóa học este
          </div>
        </div>
      </div>

      {/* Class Comparison Table */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-blue-600" />
          <span>Bảng so sánh chất lượng học tập giữa các lớp giảng dạy</span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-[#0b5cad] text-white">
                <th className="p-2.5 font-bold">Lớp</th>
                <th className="p-2.5 font-bold">Điểm TB 3 môn</th>
                <th className="p-2.5 font-bold">Tỷ lệ Giỏi</th>
                <th className="p-2.5 font-bold">Tỷ lệ Khá</th>
                <th className="p-2.5 font-bold">Tỷ lệ Đạt (≥ 5.0)</th>
                <th className="p-2.5 font-bold">Xếp hạng thi đua</th>
              </tr>
            </thead>
            <tbody>
              {classComparison.map((item, idx) => (
                <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-2 font-bold text-blue-900 bg-blue-50/30">{item.className}</td>
                  <td className="p-2 font-bold text-slate-800">{item.avg.toFixed(2).replace('.', ',')}</td>
                  <td className="p-2 text-emerald-700 font-bold">{item.gioiRate}%</td>
                  <td className="p-2 text-blue-700 font-semibold">{item.khaRate}%</td>
                  <td className="p-2 font-bold text-slate-900">{item.passRate}%</td>
                  <td className="p-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Hạng {idx + 1}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Students Needing Remedial Attention */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Danh sách học sinh có kết quả học tập cần lưu ý & Kế hoạch phụ đạo</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {stats.attentionStudents.map((st, i) => (
            <div key={i} className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>{st.name}</span>
                <span className="text-rose-700 font-extrabold">{st.score.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="text-slate-600">Lớp: <strong>{st.className}</strong></div>
              <div className="text-[11px] text-rose-800 font-medium">Nguyên nhân: {st.reason}</div>
              <div className="text-[11px] text-blue-800 bg-white p-2 rounded border border-blue-200 mt-2">
                <strong>Đề xuất của Thầy Hoàng Nhật:</strong> Bố trí phụ đạo vào sáng Thứ 7, giao bài tập cơ bản có hướng dẫn qua nhóm Zalo phụ huynh.
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
