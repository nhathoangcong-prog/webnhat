export type UserRole = 'teacher' | 'student' | 'parent';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  email?: string;
  phone?: string;
  school?: string;
  title?: string;
  studentCode?: string;
  studentId?: string; // Linked student record ID
  className?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  school: string;
  title: string;
  subjects?: string[];
  studentId?: string; // For student or parent linking
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2024 - 2025"
  semester: 'HK1' | 'HK2';
  isCurrent: boolean;
  startDate: string;
  endDate: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "12A1"
  grade: 10 | 11 | 12;
  academicYear: string;
  studentCount: number;
  homeroomTeacher?: string;
  room?: string;
  description?: string;
}

export interface Student {
  id: string;
  studentCode: string; // e.g. "HS001"
  fullName: string;
  birthDate: string;
  gender: 'Nam' | 'Nữ';
  classId: string;
  className: string;
  grade: 10 | 11 | 12;
  address: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  note?: string;
  avatarUrl?: string;
}

export interface Subject {
  id: string;
  code: 'TOAN' | 'VATLY' | 'HOAHOC';
  name: string;
  teacherName: string;
}

export interface GradeItem {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  classId: string;
  subjectCode: 'TOAN' | 'VATLY' | 'HOAHOC';
  semester: 'HK1' | 'HK2';
  academicYear: string;
  // Component grades
  tx1?: number; // Thường xuyên 1
  tx2?: number; // Thường xuyên 2
  tx3?: number; // Thường xuyên 3
  tx4?: number; // Thường xuyên 4
  txAverage: number; // Trung bình điểm thường xuyên (TX)
  gk: number; // Giữa kỳ (Hệ số 2)
  ck: number; // Cuối kỳ (Hệ số 3)
  tb: number; // Trung bình môn = (TX*1 + GK*2 + CK*3) / 6 (theo Thông tư 22/BGDĐT)
  note?: string;
}

export interface StudentCombinedGrade {
  stt: number;
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  toan: { tx: number; gk: number; ck: number; tb: number };
  vatly: { tx: number; gk: number; ck: number; tb: number };
  hoahoc: { tx: number; gk: number; ck: number; tb: number };
  dtb3Mon: number;
  rank: 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu';
}

export interface GradeConfiguration {
  txWeight: number; // typically 1
  gkWeight: number; // typically 2
  ckWeight: number; // typically 3
  roundingPrecision: number; // 1 or 2 decimal places
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
export type DifficultyLevel = 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';

export interface Question {
  id: string;
  subjectCode: 'TOAN' | 'VATLY' | 'HOAHOC';
  grade: 10 | 11 | 12;
  chapter: string;
  lesson?: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  content: string; // supports LaTeX formulas
  options?: string[]; // for multiple choice
  correctAnswer: string | number; // option index or text
  explanation?: string;
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  subjectCode: 'TOAN' | 'VATLY' | 'HOAHOC';
  grade: 10 | 11 | 12;
  classIds: string[];
  durationMinutes: number;
  totalPoints: number;
  questionIds: string[];
  status: 'draft' | 'published' | 'closed';
  openTime?: string;
  closeTime?: string;
  isOnline: boolean;
  createdAt: string;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  className: string;
  answers: Record<string, string | number>; // questionId -> answer
  score?: number;
  autoScore?: number;
  essayScore?: number;
  submittedAt: string;
  status: 'submitted' | 'graded';
  teacherFeedback?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  classId: string;
  subjectCode: 'TOAN' | 'VATLY' | 'HOAHOC';
  date: string; // YYYY-MM-DD
  period: number; // Tiết 1 - 5
  status: 'present' | 'excused' | 'unexcused' | 'late'; // Có mặt | Có phép | Không phép | Đi trễ
  reason?: string;
}

export interface LearningResource {
  id: string;
  title: string;
  subjectCode: 'TOAN' | 'VATLY' | 'HOAHOC';
  grade: 10 | 11 | 12;
  category: 'lesson_plan' | 'document' | 'slide' | 'video' | 'formula' | 'periodic_table' | 'exam_sample';
  fileType: 'pdf' | 'docx' | 'pptx' | 'mp4' | 'link' | 'interactive';
  fileSize?: string;
  url?: string;
  author: string;
  uploadedAt: string;
  downloads: number;
  description?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: 'exam' | 'homework' | 'grade' | 'general' | 'urgent';
  targetType: 'all' | 'class' | 'student';
  targetClassId?: string;
  targetStudentId?: string;
  date: string;
  isRead?: boolean;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  dayOfWeek: string;
  timeOrPeriod: string;
  classTarget: string;
  subject: string;
  type: 'exam_15' | 'exam_45' | 'parent_meeting' | 'lesson';
}
