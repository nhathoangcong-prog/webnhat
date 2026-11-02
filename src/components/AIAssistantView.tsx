import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  FileQuestion,
  HelpCircle,
  BarChart3,
  Lightbulb,
  Copy,
  Check,
  Download,
  RotateCcw,
  BookOpen,
  Atom,
  FlaskConical,
  Paperclip,
  Loader2
} from 'lucide-react';
import { db } from '../services/db.ts';

interface AIAssistantViewProps {
  initialAction?: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ initialAction }) => {
  const [selectedSubject, setSelectedSubject] = useState<'TOAN' | 'VATLY' | 'HOAHOC'>('TOAN');
  const [selectedGrade, setSelectedGrade] = useState<10 | 11 | 12>(12);
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resultText, setResultText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [attachedDocName, setAttachedDocName] = useState<string>('');

  const quickTemplates = [
    {
      id: 'lesson_plan',
      label: 'Soạn giáo án CV 5512',
      prompt: 'Hãy soạn kế hoạch bài dạy (giáo án) chuẩn theo công văn 5512/BGDĐT cho bài học: "Nguyên hàm và Tích phân" môn Toán lớp 12. Bao gồm đầy đủ 4 hoạt động: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng mở rộng.'
    },
    {
      id: 'exam_generator',
      label: 'Ma trận & Bản đặc tả đề thi',
      prompt: 'Hãy xây dựng ma trận đề kiểm tra 1 tiết và bản đặc tả chi tiết 4 mức độ (Nhận biết 40%, Thông hiểu 30%, Vận dụng 20%, Vận dụng cao 10%) cho chương: "Dao động cơ học" môn Vật lý lớp 12.'
    },
    {
      id: 'solve_problem',
      label: 'Giải thích bài tập & Hiện tượng',
      prompt: 'Hãy giải chi tiết bài toán sau và nêu phương pháp sư phạm giúp học sinh tránh bẫy: "Cho 0,1 mol este đơn chức X tác dụng vừa đủ với 100ml dung dịch NaOH 1M, cô cạn thu được 8,2g muối. Tìm công thức cấu tạo của X và giải thích bản chất phản ứng thủy phân este trong môi trường kiềm".'
    },
    {
      id: 'student_analysis',
      label: 'Phân tích & Phương pháp phụ đạo',
      prompt: 'Dựa trên thống kê lớp 12A1 có 3 em học sinh đạt điểm dưới 5.5 môn Toán phần Giải tích: Trần Minh Khoa (5.40), Lê Ngọc Mai (5.38), Phạm Tuấn Anh (5.27). Hãy phân tích các lỗ hổng kiến thức thường gặp và đề xuất kế hoạch phụ đạo trong 3 tuần để các em cải thiện điểm số.'
    },
    {
      id: 'game_starter',
      label: 'Trò chơi khởi động & Hoạt động STEM',
      prompt: 'Gợi ý 3 trò chơi khởi động sôi nổi (dưới 7 phút) và 1 ý tưởng dự án STEM đơn giản, dễ làm áp dụng cho bài học môn Vật lý/Hóa học THPT Thạnh Lộc.'
    }
  ];

  const handleRunAI = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim()) return;

    setLoading(true);
    setResultText('');

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          subject: selectedSubject === 'TOAN' ? 'Toán học' : selectedSubject === 'VATLY' ? 'Vật lý' : 'Hóa học',
          grade: selectedGrade,
          contextData: {
            school: 'Trường THPT Thạnh Lộc, TP.HCM',
            teacher: 'Thầy Hoàng Nhật',
            attachedDoc: attachedDocName || undefined
          }
        }),
      });

      const data = await response.json();
      if (data.error) {
        setResultText(`Lỗi: ${data.error}`);
      } else {
        setResultText(data.text);
      }
    } catch (err: any) {
      setResultText(`Lỗi kết nối máy chủ AI: ${err?.message || 'Không thể gọi API'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDoc = () => {
    const element = document.createElement('a');
    const file = new Blob([resultText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Tai_Lieu_AI_Thay_Hoang_Nhat_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003875] via-[#005da8] to-[#007cdb] rounded-2xl p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-cyan-300/40 flex items-center justify-center text-cyan-300 shadow-inner">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-xl font-bold tracking-wide">
                Trợ lý AI Sư phạm Thông minh – Thầy Hoàng Nhật
              </h2>
              <span className="bg-cyan-400 text-blue-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Soạn giáo án CV 5512, tạo đề kiểm tra ma trận, giải bài tập & phân tích học lực chuyên sâu
            </p>
          </div>
        </div>

        {/* Subject & Grade Picker */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as any)}
            className="bg-blue-900/80 border border-blue-400/40 text-white rounded-lg px-3 py-1.5 font-bold focus:outline-none"
          >
            <option value="TOAN">Bộ môn: Toán học</option>
            <option value="VATLY">Bộ môn: Vật lý</option>
            <option value="HOAHOC">Bộ môn: Hóa học</option>
          </select>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(Number(e.target.value) as any)}
            className="bg-blue-900/80 border border-blue-400/40 text-white rounded-lg px-3 py-1.5 font-bold focus:outline-none"
          >
            <option value={10}>Khối 10</option>
            <option value={11}>Khối 11</option>
            <option value={12}>Khối 12</option>
          </select>
        </div>
      </div>

      {/* Quick Action Prompts */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
        <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Gợi ý thao tác nhanh chuẩn chuyên môn THPT:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setPrompt(t.prompt);
                handleRunAI(t.prompt);
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/60 text-blue-900 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-2xs"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input Box */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="relative">
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Nhập yêu cầu sư phạm của Thầy (ví dụ: 'Hãy tạo cho tôi 5 câu hỏi trắc nghiệm mức độ vận dụng môn Hóa 12 chương Este có kèm giải thích bẫy học sinh')..."
            className="w-full border border-slate-300 rounded-xl p-3 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
          />

          {attachedDocName && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-md w-fit">
              <Paperclip className="w-3.5 h-3.5" />
              <span>Tài liệu đính kèm: <strong>{attachedDocName}</strong></span>
              <button
                onClick={() => setAttachedDocName('')}
                className="text-slate-400 hover:text-red-600 ml-1 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* File attachment simulator */}
          <label className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <Paperclip className="w-3.5 h-3.5" />
            <span>Tải tài liệu tham khảo (.docx, .pdf)</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setAttachedDocName(f.name);
              }}
            />
          </label>

          <button
            onClick={() => handleRunAI()}
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-bold text-xs md:text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95 ml-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang phân tích & soạn thảo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Gửi yêu cầu tới Trợ lý AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Result Box */}
      {(resultText || loading) && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm md:text-base text-slate-900">
                Kết quả phản hồi từ Trợ lý AI Giáo viên
              </h3>
            </div>

            {resultText && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>

                <button
                  onClick={handleDownloadDoc}
                  className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải văn bản</span>
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <div className="relative">
                <Bot className="w-12 h-12 text-blue-600 animate-bounce" />
                <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1 animate-spin" />
              </div>
              <p className="text-xs font-semibold">Trí tuệ nhân tạo đang phân tích tài liệu và cấu trúc sư phạm...</p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-xs md:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-serif bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              {resultText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
