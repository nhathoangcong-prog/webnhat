import React, { useState } from 'react';
import {
  FolderArchive,
  Upload,
  Download,
  Search,
  Filter,
  FileText,
  FileCode,
  Video,
  Presentation,
  BookOpen,
  Atom,
  FlaskConical,
  Eye,
  Trash2,
  X,
  Sparkles
} from 'lucide-react';
import { db } from '../services/db.ts';
import { LearningResource } from '../types/index.ts';

export const ResourcesView: React.FC = () => {
  const [resources, setResources] = useState<LearningResource[]>(db.getResources());
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showPeriodicTableModal, setShowPeriodicTableModal] = useState<boolean>(false);
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  // New resource form
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState<'TOAN' | 'VATLY' | 'HOAHOC'>('TOAN');
  const [newGrade, setNewGrade] = useState<10 | 11 | 12>(12);
  const [newCategory, setNewCategory] = useState<any>('document');
  const [newFileType, setNewFileType] = useState<any>('pdf');
  const [newDesc, setNewDesc] = useState('');

  const refreshList = () => {
    setResources(db.getResources());
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Vui lòng nhập tên tài liệu!');
      return;
    }

    db.addResource({
      title: newTitle,
      subjectCode: newSubject,
      grade: newGrade,
      category: newCategory,
      fileType: newFileType,
      fileSize: '3.5 MB',
      author: 'Thầy Hoàng Nhật',
      description: newDesc
    });

    setShowUploadModal(false);
    setNewTitle('');
    setNewDesc('');
    refreshList();
    alert('Đã thêm tài liệu vào Kho học liệu điện tử!');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa tài liệu này?')) {
      db.deleteResource(id);
      refreshList();
    }
  };

  const handleDownload = (res: LearningResource) => {
    // Generate text content download
    const blob = new Blob([
      `TRƯỜNG THPT THẠNH LỘC - HCM\nTài liệu giảng dạy môn ${res.subjectCode}\nTác giả: ${res.author}\nTiêu đề: ${res.title}\nMô tả: ${res.description || 'Tài liệu số'}\n\nNội dung đang được đồng bộ tại cổng THPT Thạnh Lộc.`
    ], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${res.title.replace(/[\/\\?%*:|"<>]/g, '_')}.${res.fileType === 'interactive' ? 'html' : res.fileType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filtered = resources.filter(r => {
    const matchSub = selectedSubject === 'all' || r.subjectCode === selectedSubject;
    const matchCat = selectedCategory === 'all' || r.category === selectedCategory;
    const matchSearch = !searchQuery.trim() ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSub && matchCat && matchSearch;
  });

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'docx': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'pptx': return <Presentation className="w-5 h-5 text-amber-600" />;
      case 'mp4': return <Video className="w-5 h-5 text-purple-600" />;
      case 'interactive': return <Sparkles className="w-5 h-5 text-cyan-600" />;
      default: return <FileCode className="w-5 h-5 text-red-600" />;
    }
  };

  // Sample chemical elements for Periodic Table modal
  const sampleElements = [
    { num: 1, sym: 'H', name: 'Hiđro', mass: '1.008', group: 'Phi kim' },
    { num: 2, sym: 'He', name: 'Heli', mass: '4.002', group: 'Khí hiếm' },
    { num: 3, sym: 'Li', name: 'Liti', mass: '6.94', group: 'Kim loại kiềm' },
    { num: 4, sym: 'Be', name: 'Beri', mass: '9.012', group: 'Kim loại kiềm thổ' },
    { num: 5, sym: 'B', name: 'Bo', mass: '10.81', group: 'Á kim' },
    { num: 6, sym: 'C', name: 'Cacbon', mass: '12.01', group: 'Phi kim' },
    { num: 7, sym: 'N', name: 'Nitơ', mass: '14.00', group: 'Phi kim' },
    { num: 8, sym: 'O', name: 'Oxi', mass: '15.99', group: 'Phi kim' },
    { num: 9, sym: 'F', name: 'Flo', mass: '18.99', group: 'Halogen' },
    { num: 10, sym: 'Ne', name: 'Neon', mass: '20.18', group: 'Khí hiếm' },
    { num: 11, sym: 'Na', name: 'Natri', mass: '22.99', group: 'Kim loại kiềm' },
    { num: 12, sym: 'Mg', name: 'Magie', mass: '24.30', group: 'Kim loại kiềm thổ' },
    { num: 13, sym: 'Al', name: 'Nhôm', mass: '26.98', group: 'Kim loại yếu' },
    { num: 14, sym: 'Si', name: 'Silic', mass: '28.08', group: 'Á kim' },
    { num: 15, sym: 'P', name: 'Photpho', mass: '30.97', group: 'Phi kim' },
    { num: 16, sym: 'S', name: 'Lưu huỳnh', mass: '32.06', group: 'Phi kim' },
    { num: 17, sym: 'Cl', name: 'Clo', mass: '35.45', group: 'Halogen' },
    { num: 18, sym: 'Ar', name: 'Agon', mass: '39.95', group: 'Khí hiếm' },
    { num: 19, sym: 'K', name: 'Kali', mass: '39.09', group: 'Kim loại kiềm' },
    { num: 20, sym: 'Ca', name: 'Canxi', mass: '40.08', group: 'Kim loại kiềm thổ' },
    { num: 26, sym: 'Fe', name: 'Sắt', mass: '55.84', group: 'Kim loại chuyển tiếp' },
    { num: 29, sym: 'Cu', name: 'Đồng', mass: '63.54', group: 'Kim loại chuyển tiếp' },
    { num: 30, sym: 'Zn', name: 'Kẽm', mass: '65.38', group: 'Kim loại chuyển tiếp' },
    { num: 47, sym: 'Ag', name: 'Bạc', mass: '107.8', group: 'Kim loại chuyển tiếp' },
    { num: 79, sym: 'Au', name: 'Vàng', mass: '196.9', group: 'Kim loại chuyển tiếp' }
  ];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Kho Học liệu & Giáo án Điện tử
            </h2>
            <p className="text-xs text-slate-500">
              Thư viện giáo án CV 5512, slide PowerPoint, video thí nghiệm, cẩm nang công thức Toán – Lý – Hóa
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick tools buttons */}
          <button
            onClick={() => setShowPeriodicTableModal(true)}
            className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
            <span>Bảng tuần hoàn số</span>
          </button>

          <button
            onClick={() => setShowFormulaModal(true)}
            className="flex items-center gap-1.5 bg-cyan-50 text-cyan-800 border border-cyan-300 hover:bg-cyan-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Atom className="w-3.5 h-3.5 text-cyan-600" />
            <span>Sổ tay công thức</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải lên tài liệu</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <span className="font-bold text-slate-700 mr-1.5">Môn:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1"
            >
              <option value="all">Tất cả môn</option>
              <option value="TOAN">Toán học</option>
              <option value="VATLY">Vật lý</option>
              <option value="HOAHOC">Hóa học</option>
            </select>
          </div>

          <div>
            <span className="font-bold text-slate-700 mr-1.5">Phân loại:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1"
            >
              <option value="all">Tất cả loại</option>
              <option value="lesson_plan">Giáo án CV 5512</option>
              <option value="document">Tài liệu PDF</option>
              <option value="slide">Bài giảng PowerPoint</option>
              <option value="formula">Cẩm nang công thức</option>
              <option value="periodic_table">Bảng tuần hoàn</option>
            </select>
          </div>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tài liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1 text-xs"
          />
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                {getFileIcon(res.fileType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {res.subjectCode} • Khối {res.grade}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {res.fileSize || 'PDF'}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                  {res.title}
                </h3>
                {res.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {res.description}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Đăng bởi: <strong className="text-slate-700">{res.author}</strong> ({res.uploadedAt})</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDownload(res)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải về</span>
                </button>
                <button
                  onClick={() => handleDelete(res.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                  title="Xóa tài liệu"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Interactive Periodic Table */}
      {showPeriodicTableModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                <h3 className="font-bold text-base">Bảng tuần hoàn các nguyên tố hóa học – THPT Thạnh Lộc</h3>
              </div>
              <button onClick={() => setShowPeriodicTableModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-600">
                Tra cứu nhanh số hiệu nguyên tử, ký hiệu hóa học, nguyên tử khối và nhóm nguyên tố phục vụ giảng dạy môn Hóa học 10, 11, 12:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {sampleElements.map((el) => (
                  <div
                    key={el.num}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-amber-50 hover:border-amber-300 transition-all text-center group cursor-pointer"
                  >
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{el.num}</span>
                      <span>{el.mass}</span>
                    </div>
                    <div className="text-xl font-extrabold text-blue-900 group-hover:text-amber-700 my-1">
                      {el.sym}
                    </div>
                    <div className="text-xs font-bold text-slate-800">{el.name}</div>
                    <div className="text-[9.5px] text-slate-500 mt-0.5">{el.group}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <button
                  onClick={() => setShowPeriodicTableModal(false)}
                  className="px-5 py-2 bg-amber-600 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Đóng bảng tuần hoàn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Formulas Handbook */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Atom className="w-5 h-5 text-cyan-300" />
                <h3 className="font-bold text-base">Cẩm nang Công thức Trọng tâm Toán – Vật lý</h3>
              </div>
              <button onClick={() => setShowFormulaModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs font-serif">
              {/* Math Formulas */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                <h4 className="font-bold text-blue-900 text-sm">1. Công thức Đạo hàm & Tích phân Giải tích 12</h4>
                <div className="space-y-1 text-slate-800 font-mono">
                  <p>• Đạo hàm hàm hợp: (u^n)' = n · u^(n-1) · u'</p>
                  <p>• Đạo hàm mũ: (e^u)' = u' · e^u; (a^x)' = a^x · ln a</p>
                  <p>• Tích phân từng phần: ∫ u dv = u·v - ∫ v du</p>
                  <p>• Thể tích khối tròn xoay quanh trục Ox: V = π ∫_a^b [f(x)]² dx</p>
                </div>
              </div>

              {/* Physics Formulas */}
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
                <h4 className="font-bold text-emerald-900 text-sm">2. Dao động cơ & Sóng cơ học 12</h4>
                <div className="space-y-1 text-slate-800 font-mono">
                  <p>• Phương trình li độ: x = A cos(ωt + φ)</p>
                  <p>• Vận tốc & Gia tốc: v = -ωA sin(ωt + φ); a = -ω²x</p>
                  <p>• Chu kỳ con lắc lò xo: T = 2π √(m / k)</p>
                  <p>• Chu kỳ con lắc đơn: T = 2π √(l / g)</p>
                  <p>• Bước sóng: λ = v · T = v / f</p>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <button
                  onClick={() => setShowFormulaModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Đóng sổ tay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload Resource */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full">
            <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-2xl flex items-center justify-between">
              <h3 className="font-bold text-base">Tải lên học liệu số</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên tài liệu (*):</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  placeholder="VD: Kế hoạch bài dạy Chương Este - Lipit"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn học:</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="TOAN">Toán học</option>
                    <option value="VATLY">Vật lý</option>
                    <option value="HOAHOC">Hóa học</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp:</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(Number(e.target.value) as any)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân loại:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="lesson_plan">Giáo án CV 5512</option>
                    <option value="document">Tài liệu tham khảo</option>
                    <option value="slide">Slide trình chiếu</option>
                    <option value="formula">Sổ tay công thức</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Định dạng file:</label>
                  <select
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="pdf">PDF (.pdf)</option>
                    <option value="docx">Word (.docx)</option>
                    <option value="pptx">PowerPoint (.pptx)</option>
                    <option value="mp4">Video (.mp4)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả tóm tắt:</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  placeholder="Ghi chú mục tiêu hoặc nguồn tài liệu..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Lưu học liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
