import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Play,
  Clock,
  CheckCircle,
  AlertTriangle,
  Award,
  Users,
  Eye,
  Send,
  X,
  FileQuestion
} from 'lucide-react';
import { db } from '../services/db.ts';
import { Exam, ExamSubmission, Question, UserRole } from '../types/index.ts';

interface OnlineExamViewProps {
  currentRole: UserRole;
}

export const OnlineExamView: React.FC<OnlineExamViewProps> = ({ currentRole }) => {
  const [exams, setExams] = useState<Exam[]>(db.getExams());
  const [submissions, setSubmissions] = useState<ExamSubmission[]>(db.getSubmissions());
  const [activeTakingExam, setActiveTakingExam] = useState<Exam | null>(null);

  // Exam taker state
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [examFinishedScore, setExamFinishedScore] = useState<number | null>(null);

  // Create exam modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamSubject, setNewExamSubject] = useState<'TOAN' | 'VATLY' | 'HOAHOC'>('TOAN');
  const [newExamGrade, setNewExamGrade] = useState<10 | 11 | 12>(12);
  const [newExamDuration, setNewExamDuration] = useState(15);

  // Submissions review modal
  const [reviewingExam, setReviewingExam] = useState<Exam | null>(null);

  const refreshData = () => {
    setExams(db.getExams());
    setSubmissions(db.getSubmissions());
  };

  // Timer countdown
  useEffect(() => {
    if (!activeTakingExam || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTakingExam, timeLeftSeconds]);

  // Start taking exam
  const handleStartExam = (exam: Exam) => {
    setActiveTakingExam(exam);
    setCurrentAnswers({});
    setTimeLeftSeconds(exam.durationMinutes * 60);
    setExamFinishedScore(null);
  };

  // Submit student answers
  const handleAutoSubmit = () => {
    if (!activeTakingExam) return;
    const questions = db.getQuestions().filter(q => activeTakingExam.questionIds.includes(q.id));
    let correctCount = 0;

    questions.forEach(q => {
      if (currentAnswers[q.id] === Number(q.correctAnswer)) {
        correctCount++;
      }
    });

    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 10 * 10) / 10 : 10;
    setExamFinishedScore(score);

    db.submitExam({
      examId: activeTakingExam.id,
      studentId: 's1',
      studentCode: 'HS001',
      studentName: 'Nguyễn Văn An',
      className: 'Lớp 12A1',
      answers: currentAnswers,
      score,
      autoScore: score,
      status: 'graded',
      teacherFeedback: score >= 8 ? 'Làm bài rất tốt!' : 'Cần ôn lại các dạng câu hỏi sai.'
    });

    refreshData();
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim()) {
      alert('Vui lòng nhập tiêu đề bài kiểm tra!');
      return;
    }

    // Pick questions matching subject
    const availableQuestions = db.getQuestions(newExamSubject, newExamGrade);
    const questionIds = availableQuestions.map(q => q.id);

    db.addExam({
      title: newExamTitle,
      subjectCode: newExamSubject,
      grade: newExamGrade,
      classIds: ['c1', 'c2'],
      durationMinutes: newExamDuration,
      totalPoints: 10,
      questionIds: questionIds.length > 0 ? questionIds : ['q1', 'q2'],
      status: 'published',
      isOnline: true,
      openTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      closeTime: '2025-02-15 23:59'
    });

    setShowCreateModal(false);
    setNewExamTitle('');
    refreshData();
    alert('Đã tạo đề kiểm tra trực tuyến thành công!');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Taking Exam Active View
  if (activeTakingExam) {
    const questions = db.getQuestions().filter(q => activeTakingExam.questionIds.includes(q.id));

    return (
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4 md:p-6 space-y-4">
        {/* Header bar of the test */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {activeTakingExam.subjectCode} • Khối {activeTakingExam.grade}
            </span>
            <h2 className="text-base md:text-lg font-bold text-slate-900 mt-1">
              {activeTakingExam.title}
            </h2>
            <div className="text-xs text-slate-500">
              Học sinh: <strong className="text-blue-900">Nguyễn Văn An (12A1)</strong> • Tổng số: {questions.length} câu hỏi
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-300 px-4 py-2 rounded-xl text-rose-700 font-bold">
            <Clock className="w-5 h-5 animate-pulse text-rose-600" />
            <span className="text-xl font-mono">{formatTimer(timeLeftSeconds)}</span>
          </div>
        </div>

        {/* Finished Score Screen */}
        {examFinishedScore !== null ? (
          <div className="py-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
            <Award className="w-16 h-16 text-emerald-600 mx-auto" />
            <h3 className="text-xl font-extrabold text-emerald-900">
              Chúc mừng em đã hoàn thành bài kiểm tra!
            </h3>
            <div className="text-3xl font-extrabold text-emerald-700">
              Điểm số: {examFinishedScore.toFixed(1).replace('.', ',')} / 10
            </div>
            <p className="text-xs text-emerald-800 max-w-md mx-auto">
              Bài làm đã được chấm tự động và ghi nhận vào Sổ điểm điện tử của Thầy Hoàng Nhật.
            </p>
            <button
              onClick={() => setActiveTakingExam(null)}
              className="mt-3 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Quay lại danh sách bài kiểm tra
            </button>
          </div>
        ) : (
          /* Question form */
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <span>{q.content}</span>
                </div>

                {q.options && (
                  <div className="space-y-1.5 pl-8 pt-1 text-xs">
                    {q.options.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                          currentAnswers[q.id] === oIdx
                            ? 'bg-blue-50 border-blue-400 font-bold text-blue-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          checked={currentAnswers[q.id] === oIdx}
                          onChange={() => setCurrentAnswers({ ...currentAnswers, [q.id]: oIdx })}
                          className="cursor-pointer"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn hủy bài làm?')) {
                    setActiveTakingExam(null);
                  }
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Thoát bài thi
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Xác nhận nộp bài kiểm tra và kết thúc thời gian làm bài?')) {
                    handleAutoSubmit();
                  }
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Nộp bài kiểm tra</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Bài tập & Kiểm tra trực tuyến
            </h2>
            <p className="text-xs text-slate-500">
              Hệ thống phòng thi số, đếm ngược thời gian, chấm điểm tự động Toán – Lý – Hóa
            </p>
          </div>
        </div>

        {currentRole === 'teacher' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo bài kiểm tra mới</span>
          </button>
        )}
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {exams.map((ex) => {
          const examSubmissions = submissions.filter(s => s.examId === ex.id);
          const isTakingAllowed = ex.status === 'published';

          return (
            <div
              key={ex.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                    {ex.subjectCode === 'TOAN' ? 'Toán học' : ex.subjectCode === 'VATLY' ? 'Vật lý' : 'Hóa học'} • Khối {ex.grade}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ex.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {ex.status === 'published' ? 'Đang mở' : 'Bản nháp'}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  {ex.title}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span>Thời gian làm bài:</span>
                    <strong className="text-slate-800">{ex.durationMinutes} phút</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Số câu hỏi:</span>
                    <strong className="text-slate-800">{ex.questionIds.length} câu</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Đã nộp bài:</span>
                    <strong className="text-blue-700">{examSubmissions.length} học sinh</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                {/* Take Exam Button */}
                <button
                  onClick={() => handleStartExam(ex)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{currentRole === 'student' ? 'Làm bài kiểm tra' : 'Thử nghiệm làm bài'}</span>
                </button>

                {currentRole === 'teacher' && (
                  <button
                    onClick={() => setReviewingExam(ex)}
                    className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="Xem danh sách bài nộp"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Online Exam */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full">
            <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-2xl flex items-center justify-between">
              <h3 className="font-bold text-base">Tạo bài kiểm tra trực tuyến</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề bài kiểm tra (*):</label>
                <input
                  type="text"
                  required
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  placeholder="VD: Kiểm tra 15 phút Giải tích 12"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn học:</label>
                  <select
                    value={newExamSubject}
                    onChange={(e) => setNewExamSubject(e.target.value as any)}
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
                    value={newExamGrade}
                    onChange={(e) => setNewExamGrade(Number(e.target.value) as any)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thời gian làm bài (phút):</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={newExamDuration}
                  onChange={(e) => setNewExamDuration(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="p-2.5 bg-blue-50 text-blue-900 rounded-lg text-[11px]">
                Đề thi sẽ tự động lấy câu hỏi từ Ngân hàng đề kiểm tra môn {newExamSubject} khối {newExamGrade} và mở cho toàn bộ các lớp của khối.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Phát hành đề thi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Review Submissions */}
      {reviewingExam && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Danh sách bài nộp: {reviewingExam.title}</h3>
                <p className="text-xs text-blue-200">Theo dõi kết quả nộp bài trực tuyến của học sinh</p>
              </div>
              <button onClick={() => setReviewingExam(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              {submissions.filter(s => s.examId === reviewingExam.id).length === 0 ? (
                <div className="py-6 text-center text-slate-500 italic">
                  Chưa có học sinh nào nộp bài cho đề kiểm tra này.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="p-2">Mã HS</th>
                      <th className="p-2">Họ và tên</th>
                      <th className="p-2">Lớp</th>
                      <th className="p-2">Thời gian nộp</th>
                      <th className="p-2 text-center">Điểm số</th>
                      <th className="p-2">Nhận xét</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions
                      .filter(s => s.examId === reviewingExam.id)
                      .map((sub, idx) => (
                        <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="p-2 font-bold text-blue-900">{sub.studentCode}</td>
                          <td className="p-2 font-bold text-slate-800">{sub.studentName}</td>
                          <td className="p-2">{sub.className}</td>
                          <td className="p-2 text-slate-500">{sub.submittedAt}</td>
                          <td className="p-2 text-center font-extrabold text-blue-900 text-sm">
                            {sub.score?.toFixed(1).replace('.', ',')}
                          </td>
                          <td className="p-2 text-slate-600 italic">{sub.teacherFeedback || 'Đã chấm'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <button
                  onClick={() => setReviewingExam(null)}
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
