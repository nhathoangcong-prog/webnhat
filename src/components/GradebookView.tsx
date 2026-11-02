import React, { useState } from 'react';
import {
  TableProperties,
  Save,
  Download,
  Printer,
  Settings2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { db, calculateSubjectAverage } from '../services/db.ts';
import { ExcelService } from '../services/excelService.ts';
import { GradeItem, GradeConfiguration } from '../types/index.ts';

export const GradebookView: React.FC = () => {
  const classes = db.getClasses();
  const [selectedClassId, setSelectedClassId] = useState<string>('c1');
  const [selectedSubject, setSelectedSubject] = useState<'TOAN' | 'VATLY' | 'HOAHOC'>('TOAN');
  const [selectedSemester, setSelectedSemester] = useState<'HK1' | 'HK2'>('HK1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Sổ điểm editing state
  const [editableGrades, setEditableGrades] = useState<GradeItem[]>(() => {
    return db.getGrades(selectedClassId, selectedSubject, selectedSemester);
  });

  // Config modal
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [config, setConfig] = useState<GradeConfiguration>(db.getState().config);

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // Refresh or change filter
  const handleFilterChange = (clsId: string, sub: 'TOAN' | 'VATLY' | 'HOAHOC', sem: 'HK1' | 'HK2') => {
    setSelectedClassId(clsId);
    setSelectedSubject(sub);
    setSelectedSemester(sem);
    const loaded = db.getGrades(clsId, sub, sem);
    setEditableGrades(loaded);
  };

  // Handle cell edit
  const handleScoreChange = (gradeId: string, field: 'txAverage' | 'gk' | 'ck', valueStr: string) => {
    const val = parseFloat(valueStr);
    if (isNaN(val) && valueStr !== '') return;
    if (val < 0 || val > 10) return; // Validation: 0 to 10

    setEditableGrades(prev =>
      prev.map(item => {
        if (item.id === gradeId) {
          const updated = { ...item, [field]: isNaN(val) ? 0 : val };
          // Auto calculate TB according to config
          updated.tb = calculateSubjectAverage(updated.txAverage, updated.gk, updated.ck, config);
          return updated;
        }
        return item;
      })
    );
  };

  // Save all changes to database
  const handleSaveAll = () => {
    db.saveGradeList(editableGrades);
    setSaveSuccessMsg('Đã lưu dữ liệu sổ điểm thành công vào cơ sở dữ liệu!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Export Excel
  const handleExportExcel = () => {
    const combined = db.getCombinedGrades(selectedClassId, selectedSemester);
    ExcelService.exportGradebookToExcel(combined, currentClass.name, selectedSemester === 'HK1' ? 'Học kỳ I' : 'Học kỳ II');
  };

  const filteredGrades = editableGrades.filter(g =>
    !searchQuery.trim() ||
    g.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.studentCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header & Main Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <TableProperties className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Sổ điểm Điện tử – Bộ môn {selectedSubject === 'TOAN' ? 'Toán học' : selectedSubject === 'VATLY' ? 'Vật lý' : 'Hóa học'}
            </h2>
            <p className="text-xs text-slate-500">
              Đánh giá kết quả học tập theo Thông tư 22/2021/TT-BGDĐT • Thầy Hoàng Nhật
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Configure weights button */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Cấu hình hệ số</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 bg-white text-blue-700 border border-blue-400 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In sổ điểm</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 bg-[#0fa958] hover:bg-[#0c8a47] text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu sổ điểm</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Filter Selector Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Lớp */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700">Lớp học:</span>
            <select
              value={selectedClassId}
              onChange={(e) => handleFilterChange(e.target.value, selectedSubject, selectedSemester)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Môn */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700">Môn học:</span>
            <div className="flex rounded-lg border border-slate-300 overflow-hidden bg-slate-100 p-0.5">
              <button
                onClick={() => handleFilterChange(selectedClassId, 'TOAN', selectedSemester)}
                className={`px-3 py-1 font-bold rounded-md transition-colors ${
                  selectedSubject === 'TOAN' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-blue-700'
                }`}
              >
                Toán học
              </button>
              <button
                onClick={() => handleFilterChange(selectedClassId, 'VATLY', selectedSemester)}
                className={`px-3 py-1 font-bold rounded-md transition-colors ${
                  selectedSubject === 'VATLY' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-blue-700'
                }`}
              >
                Vật lý
              </button>
              <button
                onClick={() => handleFilterChange(selectedClassId, 'HOAHOC', selectedSemester)}
                className={`px-3 py-1 font-bold rounded-md transition-colors ${
                  selectedSubject === 'HOAHOC' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-blue-700'
                }`}
              >
                Hóa học
              </button>
            </div>
          </div>

          {/* Học kỳ */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700">Học kỳ:</span>
            <select
              value={selectedSemester}
              onChange={(e) => handleFilterChange(selectedClassId, selectedSubject, e.target.value as 'HK1' | 'HK2')}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="HK1">Học kỳ I</option>
              <option value="HK2">Học kỳ II</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã HS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Grade Table with Live Editing */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-3 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-900 font-semibold">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span>
              Công thức tính ĐTB môn: <strong>(TX × {config.txWeight} + GK × {config.gkWeight} + CK × {config.ckWeight}) ÷ {config.txWeight + config.gkWeight + config.ckWeight}</strong>
            </span>
          </div>
          <span className="text-slate-500 italic">Thầy cô có thể click trực tiếp vào ô để sửa điểm số (0 - 10)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#003875] to-[#005ba8] text-white font-bold">
                <th className="py-2.5 px-3 border border-blue-400/30 w-12">STT</th>
                <th className="py-2.5 px-3 border border-blue-400/30 w-24">Mã HS</th>
                <th className="py-2.5 px-4 border border-blue-400/30 text-left min-w-[160px]">Họ và tên</th>
                <th className="py-2.5 px-3 border border-blue-400/30 w-32 bg-blue-900">
                  Điểm Thường xuyên (TX)
                </th>
                <th className="py-2.5 px-3 border border-blue-400/30 w-32 bg-blue-900">
                  Điểm Giữa kỳ (GK)
                </th>
                <th className="py-2.5 px-3 border border-blue-400/30 w-32 bg-blue-900">
                  Điểm Cuối kỳ (CK)
                </th>
                <th className="py-2.5 px-3 border border-blue-400/30 w-28 bg-[#002f6c] font-extrabold">
                  ĐTB Môn
                </th>
                <th className="py-2.5 px-3 border border-blue-400/30 w-28">Đánh giá</th>
                <th className="py-2.5 px-4 border border-blue-400/30 text-left">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 italic">
                    Chưa có dữ liệu điểm cho lớp và môn học đã chọn.
                  </td>
                </tr>
              ) : (
                filteredGrades.map((g, idx) => {
                  let badgeColor = 'bg-slate-100 text-slate-700';
                  let evalText = 'Đạt';
                  if (g.tb >= 8.0) {
                    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                    evalText = 'Tốt';
                  } else if (g.tb >= 6.5) {
                    badgeColor = 'bg-blue-100 text-blue-800 border-blue-300';
                    evalText = 'Khá';
                  } else if (g.tb >= 5.0) {
                    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
                    evalText = 'Đạt';
                  } else {
                    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
                    evalText = 'Chưa đạt';
                  }

                  return (
                    <tr
                      key={g.id}
                      className={`hover:bg-blue-50/60 transition-colors border-b border-slate-100 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-600 font-medium">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-blue-900">{g.studentCode}</td>
                      <td className="py-2 px-4 text-left font-bold text-slate-900">{g.studentName}</td>

                      {/* TX Edit Input */}
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={g.txAverage}
                          onChange={(e) => handleScoreChange(g.id, 'txAverage', e.target.value)}
                          className="w-20 text-center py-1 font-bold text-slate-800 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>

                      {/* GK Edit Input */}
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={g.gk}
                          onChange={(e) => handleScoreChange(g.id, 'gk', e.target.value)}
                          className="w-20 text-center py-1 font-bold text-slate-800 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>

                      {/* CK Edit Input */}
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={g.ck}
                          onChange={(e) => handleScoreChange(g.id, 'ck', e.target.value)}
                          className="w-20 text-center py-1 font-bold text-slate-800 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>

                      {/* Auto calculated TB */}
                      <td className="py-2 px-3 font-extrabold text-blue-950 bg-blue-100/50 text-sm">
                        {g.tb.toFixed(2).replace('.', ',')}
                      </td>

                      {/* Evaluation */}
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}>
                          {evalText}
                        </span>
                      </td>

                      {/* Note */}
                      <td className="py-2 px-3 text-left">
                        <input
                          type="text"
                          defaultValue={g.note || ''}
                          onBlur={(e) => {
                            setEditableGrades(prev =>
                              prev.map(item => item.id === g.id ? { ...item, note: e.target.value } : item)
                            );
                          }}
                          placeholder="Nhận xét riêng..."
                          className="w-full bg-transparent border-b border-dashed border-slate-300 px-1 py-0.5 text-slate-700 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Config Weights Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full">
            <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-cyan-300" />
                <h3 className="font-bold text-base">Cấu hình Hệ số Điểm số</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <p className="text-slate-600">
                Theo quy chế của nhà trường hoặc Thông tư 22/BGDĐT, Thầy Hoàng Nhật có thể điều chỉnh trọng số tính điểm trung bình cho phù hợp với từng năm học:
              </p>

              <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Hệ số Điểm Thường xuyên (TX):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={config.txWeight}
                    onChange={(e) => setConfig({ ...config, txWeight: Number(e.target.value) })}
                    className="w-20 p-1.5 border border-slate-300 rounded text-center font-bold"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Hệ số Điểm Giữa kỳ (GK):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={config.gkWeight}
                    onChange={(e) => setConfig({ ...config, gkWeight: Number(e.target.value) })}
                    className="w-20 p-1.5 border border-slate-300 rounded text-center font-bold"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Hệ số Điểm Cuối kỳ (CK):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={config.ckWeight}
                    onChange={(e) => setConfig({ ...config, ckWeight: Number(e.target.value) })}
                    className="w-20 p-1.5 border border-slate-300 rounded text-center font-bold"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-blue-50 text-blue-800 rounded-lg text-[11px]">
                Tổng hệ số chia: <strong>{config.txWeight + config.gkWeight + config.ckWeight}</strong>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    db.getState().config = config;
                    // Recalculate all loaded grades
                    setEditableGrades(prev =>
                      prev.map(item => ({
                        ...item,
                        tb: calculateSubjectAverage(item.txAverage, item.gk, item.ck, config)
                      }))
                    );
                    setShowConfigModal(false);
                    alert('Đã áp dụng cấu hình hệ số mới!');
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Áp dụng công thức
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
