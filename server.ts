import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI server-side with required User-Agent
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System instruction for Teacher Hoang Nhat's AI assistant
const TEACHER_SYSTEM_INSTRUCTION = `
Bạn là Trợ lý Trí tuệ Nhân tạo thông minh, đắc lực của Thầy HOÀNG NHẬT - Giáo viên ba môn Toán học, Vật lý và Hóa học tại Trường THPT Thạnh Lộc, TP. Hồ Chí Minh.
Phương châm giảng dạy: "KẾT NỐI TRI THỨC – PHÁT TRIỂN NĂNG LỰC – KIẾN TẠO TƯƠNG LAI".

Nhiệm vụ của bạn:
1. Soạn giáo án theo công văn 5512/BGDĐT chuẩn mực cho môn Toán, Vật lý, Hóa học (Khối 10, 11, 12).
2. Xây dựng ma trận đề kiểm tra và bản đặc tả đề kiểm tra theo 4 mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao.
3. Tạo các câu hỏi trắc nghiệm (nhiều lựa chọn, đúng sai, trả lời ngắn) và tự luận có kèm đáp án và lời giải chi tiết.
4. Hỗ trợ giải bài tập chi tiết, giải thích các hiện tượng vật lý, hóa học, định lý toán học một cách dễ hiểu, sư phạm.
5. Phân tích kết quả học tập của lớp/học sinh và đề xuất kế hoạch phụ đạo học sinh yếu kém, bồi dưỡng học sinh giỏi.
6. Gợi ý các hoạt động khởi động sôi nổi, trò chơi học tập (Kahoot, Quizizz, lật mảnh ghép...) và dự án STEM thực tế.

Quy định phản hồi:
- Sử dụng tiếng Việt chuẩn mực sư phạm, phong thái tận tâm, chuyên nghiệp, khích lệ.
- Trình bày công thức Toán/Lý/Hóa rõ ràng (sử dụng định dạng LaTeX như $...$ hoặc $$...$$ khi cần).
- Cấu trúc rõ ràng với các mục, tiêu đề gạch đầu dòng, bảng biểu khoa học.
`;

// API endpoint for Gemini generation
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, action, subject, grade, contextData } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Nội dung yêu cầu (prompt) không được để trống.' });
    }

    if (!aiClient) {
      // In case no API key configured yet, return a helpful response with educational guidance
      return res.json({
        text: `[HỆ THỐNG TRỢ LÝ GIÁO VIÊN HOÀNG NHẬT]\n\nChào Thầy Hoàng Nhật! Yêu cầu "${prompt}" đã được ghi nhận. Để kích hoạt toàn bộ sức mạnh mô hình Gemini 3.8 Flash từ máy chủ, vui lòng đảm bảo biến môi trường GEMINI_API_KEY đã được thiết lập trong Settings > Secrets.\n\nĐề xuất mẫu sư phạm cho ${subject || 'Bộ môn'}:\n1. Mục tiêu bài học: Nắm vững kiến thức trọng tâm, rèn kỹ năng giải bài và phát triển tư duy phản biện.\n2. Chuẩn kiến thức kỹ năng: Bám sát chương trình GDPT 2018 THPT Thạnh Lộc.\n3. Đánh giá: Kết hợp trắc nghiệm khách quan và đánh giá theo tiến trình.`
      });
    }

    let dynamicInstruction = TEACHER_SYSTEM_INSTRUCTION;
    if (action) {
      dynamicInstruction += `\nNhiệm vụ cụ thể hiện tại: ${action}. Môn học: ${subject || 'Toán/Lý/Hóa'}. Khối: ${grade || 'THPT'}.`;
    }
    if (contextData) {
      dynamicInstruction += `\nDữ liệu ngữ cảnh lớp học thực tế: ${JSON.stringify(contextData)}`;
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: dynamicInstruction,
      },
    });

    return res.json({
      text: response.text || 'Không nhận được kết quả từ trợ lý AI.',
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: error?.message || 'Có lỗi xảy ra khi xử lý yêu cầu AI từ máy chủ.',
    });
  }
});

// API endpoint for multi-turn chat
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, message, subject } = req.body;
    const currentMessage = message || (messages && messages[messages.length - 1]?.content);

    if (!currentMessage) {
      return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống.' });
    }

    if (!aiClient) {
      return res.json({
        reply: `Chào Thầy Hoàng Nhật! Em là Trợ lý AI trường THPT Thạnh Lộc. Em đã sẵn sàng hỗ trợ Thầy về chuyên môn ${subject || 'Toán - Lý - Hóa'}, phân tích điểm và soạn đề kiểm tra. Thầy hãy đặt câu hỏi hoặc gửi yêu cầu cụ thể nhé!`
      });
    }

    // Build contents with history if available
    let contents = currentMessage;
    if (Array.isArray(messages) && messages.length > 1) {
      const formattedHistory = messages.map((m: any) => `${m.role === 'user' ? 'Thầy Hoàng Nhật' : 'Trợ lý AI'}: ${m.content}`).join('\n\n');
      contents = `Lịch sử hội thoại trước:\n${formattedHistory}\n\nTin nhắn mới nhất từ Thầy: ${currentMessage}`;
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: TEACHER_SYSTEM_INSTRUCTION + (subject ? `\nBộ môn tập trung: ${subject}` : ''),
      },
    });

    return res.json({
      reply: response.text || 'Em đã tiếp nhận thông tin từ Thầy!',
    });
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    return res.status(500).json({
      error: error?.message || 'Lỗi kết nối Trợ lý AI.',
    });
  }
});

// Setup Vite middlewares in development or serve static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server THẦY HOÀNG NHẬT - SMART EDUCATION running on port ${PORT}`);
  });
}

startServer();
