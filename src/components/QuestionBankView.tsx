import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Trash2,
  Copy,
  Sparkles,
  FileQuestion,
  Layers,
  CheckCircle,
  FileText,
  X
} from 'lucide-react';
import { db } from '../services/db.ts';
import { Question, QuestionType, DifficultyLevel } from '../types/index.ts';

export const QuestionBankView: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(db.getQuestions());
  const [selectedSubject, setSelectedSubject] = useState<'all' | 'TOAN' | 'VATLY' | 'HOAHOC'>('all');
  const [selectedGrade, setSelectedGrade] = useState<number>(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add question modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQ, setNewQ] = useState<Omit<Question, 'id'>>({
    subjectCode: 'TOAN',
    grade: 12,
    chapter: 'Chương 1: Ứng dụng đạo hàm',
    type: 'multiple_choice',
    difficulty: 'nhan_biet',
    content: '',
    options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
    correctAnswer: 0,
    explanation: '',
    points: 0.25
  });

  const refreshList = () => {
    setQuestions(db.getQuestions());
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.content.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }
    db.addQuestion(newQ);
    setShowAddModal(false);
    setNewQ({
      subjectCode: 'TOAN',
      grade: 12,
      chapter: 'Chương 1: Ứng dụng đạo hàm',
      type: 'multiple_choice',
      difficulty: 'nhan_biet',
      content: '',
      options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
      correctAnswer: 0,
      explanation: '',
      points: 0.25
    });
    refreshList();
    alert('Đã thêm câu hỏi vào Ngân hàng đề kiểm tra!');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa câu hỏi này khỏi ngân hàng?')) {
      db.deleteQuestion(id);
      refreshList();
    }
  };

  const handleDuplicate = (q: Question) => {
    const { id, ...rest } = q;
    db.addQuestion({
      ...rest,
      content: rest.content + ' (Bản sao)'
    });
    refreshList();
    alert('Đã sao chép câu hỏi thành công!');
  };

  const filtered = questions.filter(q => {
    const matchSub = selectedSubject === 'all' || q.subjectCode === selectedSubject;
    const matchGrade = selectedGrade === 0 || q.grade === selectedGrade;
    const matchDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    const matchSearch = !searchQuery.trim() ||
      q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.chapter.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSub && matchGrade && matchDiff && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Ngân hàng Đề & Câu hỏi kiểm tra
            </h2>
            <p className="text-xs text-slate-500">
              Kho dữ liệu chuẩn ma trận 4 mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao môn Toán – Lý – Hóa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Quick auto generate sample question
              const sample: Omit<Question, 'id'> = {
                subjectCode: 'TOAN',
                grade: 12,
                chapter: 'Chương 2: Tích phân ứng dụng',
                type: 'multiple_choice',
                difficulty: 'thong_hieu',
                content: 'Tính diện tích hình phẳng giới hạn bởi đồ thị $y = x^2 - 4x + 3$ và trục hoành $Ox$.',
                options: ['A. S = 4/3', 'B. S = 2/3', 'C. S = 5/3', 'D. S = 8/3'],
                correctAnswer: 0,
                explanation: 'Phương trình hoành độ giao điểm $x^2 - 4x + 3 = 0 \\Leftrightarrow x=1, x=3$. Diện tích $S = \\int_1^3 |x^2 - 4x + 3| dx = 4/3$.',
                points: 0.25
              };
              db.addQuestion(sample);
              refreshList();
            }}
            className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thêm câu hỏi mẫu</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo câu hỏi mới</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Môn */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700">Môn:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 font-medium"
            >
              <option value="all">Tất cả môn</option>
              <option value="TOAN">Toán học</option>
              <option value="VATLY">Vật lý</option>
              <option value="HOAHOC">Hóa học</option>
            </select>
          </div>

          {/* Khối */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700">Khối:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 font-medium"
            >
              <option value={0}>Tất cả khối</option>
              <option value={10}>Khối 10</option>
              <option value={11}>Khối 11</option>
              <option value={12}>Khối 12</option>
            </select>
          </div>

          {/* Mức độ */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700">Mức độ:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 font-medium"
            >
              <option value="all">Tất cả mức độ</option>
              <option value="nhan_biet">Nhận biết</option>
              <option value="thong_hieu">Thông hiểu</option>
              <option value="van_dung">Vận dụng</option>
              <option value="van_dung_cao">Vận dụng cao</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo nội dung câu hỏi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
            Chưa có câu hỏi nào trong ngân hàng phù hợp với điều kiện tìm kiếm.
          </div>
        ) : (
          filtered.map((q, idx) => {
            const diffBadges: Record<DifficultyLevel, { label: string; color: string }> = {
              nhan_biet: { label: 'Nhận biết', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
              thong_hieu: { label: 'Thông hiểu', color: 'bg-blue-100 text-blue-800 border-blue-300' },
              van_dung: { label: 'Vận dụng', color: 'bg-amber-100 text-amber-800 border-amber-300' },
              van_dung_cao: { label: 'Vận dụng cao', color: 'bg-rose-100 text-rose-800 border-rose-300' },
            };

            const subLabels = { TOAN: 'Toán học', VATLY: 'Vật lý', HOAHOC: 'Hóa học' };

            return (
              <div
                key={q.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:border-blue-300 transition-colors space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Câu {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">
                      {subLabels[q.subjectCode]} • Khối {q.grade}
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-600 italic font-medium">{q.chapter}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${diffBadges[q.difficulty].color}`}>
                      {diffBadges[q.difficulty].label}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {q.points} điểm
                    </span>

                    <button
                      onClick={() => handleDuplicate(q)}
                      className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
                      title="Sao chép câu hỏi"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Content */}
                <div className="text-xs md:text-sm font-semibold text-slate-800 leading-relaxed">
                  {q.content}
                </div>

                {/* Options if MCQ */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = Number(q.correctAnswer) === optIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-lg border flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrect && (
                            <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">
                              Đáp án đúng
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-950">
                    <span className="font-bold text-blue-900">💡 Hướng dẫn giải chi tiết: </span>
                    <span>{q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Question */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-2xl flex items-center justify-between">
              <h3 className="font-bold text-base">Thêm câu hỏi mới vào Ngân hàng đề</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn học:</label>
                  <select
                    value={newQ.subjectCode}
                    onChange={(e) => setNewQ({ ...newQ, subjectCode: e.target.value as any })}
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
                    value={newQ.grade}
                    onChange={(e) => setNewQ({ ...newQ, grade: Number(e.target.value) as any })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức độ phân hóa:</label>
                  <select
                    value={newQ.difficulty}
                    onChange={(e) => setNewQ({ ...newQ, difficulty: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="nhan_biet">Nhận biết</option>
                    <option value="thong_hieu">Thông hiểu</option>
                    <option value="van_dung">Vận dụng</option>
                    <option value="van_dung_cao">Vận dụng cao</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chương / Chuyên đề:</label>
                <input
                  type="text"
                  required
                  value={newQ.chapter}
                  onChange={(e) => setNewQ({ ...newQ, chapter: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  placeholder="VD: Chương 1: Dao động điều hòa"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung câu hỏi (hỗ trợ công thức LaTeX $...$):</label>
                <textarea
                  rows={3}
                  required
                  value={newQ.content}
                  onChange={(e) => setNewQ({ ...newQ, content: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  placeholder="VD: Cho hàm số y = f(x)..."
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Các phương án trắc nghiệm (Chọn radio cho đáp án đúng):</label>
                {newQ.options?.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={Number(newQ.correctAnswer) === i}
                      onChange={() => setNewQ({ ...newQ, correctAnswer: i })}
                      className="cursor-pointer"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...(newQ.options || [])];
                        updated[i] = e.target.value;
                        setNewQ({ ...newQ, options: updated });
                      }}
                      className="flex-1 border border-slate-300 rounded p-1.5"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hướng dẫn giải chi tiết:</label>
                <textarea
                  rows={2}
                  value={newQ.explanation}
                  onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  placeholder="Trình bày các bước suy luận và công thức giải..."
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
                  Lưu câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
