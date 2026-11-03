-- ==============================================================================
-- DATABASE SCHEMA: HỆ THỐNG QUẢN LÝ VÀ HỖ TRỢ GIẢNG DẠY THÔNG MINH - THẦY HOÀNG NHẬT
-- TRƯỜNG THPT THẠNH LỘC - HCM (TOÁN HỌC - VẬT LÝ - HÓA HỌC)
-- ĐẦY ĐỦ 18 BẢNG, KHÓA CHÍNH, KHÓA NGOẠI, INDEX VÀ CHÍNH SÁCH BẢO MẬT ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- 1. BẢNG NĂM HỌC (academic_years)
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE, -- e.g., '2024 - 2025'
    is_current BOOLEAN DEFAULT false,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG HỒ SƠ NGƯỜI DÙNG (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('teacher', 'student', 'parent')),
    title VARCHAR(255) DEFAULT 'Giáo viên THPT Thạnh Lộc',
    school VARCHAR(255) DEFAULT 'Trường THPT Thạnh Lộc',
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG LỚP HỌC (classes)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- '12A1', '12A2', '11A1'...
    grade INTEGER NOT NULL CHECK (grade IN (10, 11, 12)),
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    homeroom_teacher VARCHAR(255) DEFAULT 'Thầy Hoàng Nhật',
    room VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG MÔN HỌC (subjects)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE, -- 'TOAN', 'VATLY', 'HOAHOC'
    name VARCHAR(100) NOT NULL,
    teacher_name VARCHAR(255) DEFAULT 'Hoàng Nhật',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BẢNG HỌC SINH (students)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_code VARCHAR(50) NOT NULL UNIQUE, -- 'HS001', 'HS002'...
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Nam', 'Nữ')),
    class_id UUID REFERENCES public.classes(id) ON DELETE RESTRICT,
    address TEXT,
    phone VARCHAR(50),
    parent_name VARCHAR(255),
    parent_phone VARCHAR(50),
    parent_email VARCHAR(255),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BẢNG GHI DANH LỚP HỌC (enrollments)
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, class_id, academic_year_id)
);

-- 7. BẢNG LOẠI ĐIỂM (grade_categories)
CREATE TABLE IF NOT EXISTS public.grade_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- Thường xuyên, Giữa kỳ, Cuối kỳ
    weight NUMERIC(3, 1) NOT NULL DEFAULT 1.0, -- TX=1, GK=2, CK=3
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BẢNG SỔ ĐIỂM (grades)
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    semester VARCHAR(10) NOT NULL CHECK (semester IN ('HK1', 'HK2')),
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
    tx_score NUMERIC(4, 2) CHECK (tx_score >= 0 AND tx_score <= 10),
    gk_score NUMERIC(4, 2) CHECK (gk_score >= 0 AND gk_score <= 10),
    ck_score NUMERIC(4, 2) CHECK (ck_score >= 0 AND ck_score <= 10),
    tb_score NUMERIC(4, 2) CHECK (tb_score >= 0 AND tb_score <= 10),
    note TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, subject_id, semester, academic_year_id)
);

-- 9. BẢNG NGÂN HÀNG CÂU HỎI (questions)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    grade INTEGER NOT NULL CHECK (grade IN (10, 11, 12)),
    chapter VARCHAR(255) NOT NULL,
    lesson VARCHAR(255),
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao')),
    content TEXT NOT NULL,
    options JSONB, -- Danh sách phương án trắc nghiệm A, B, C, D
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    points NUMERIC(4, 2) DEFAULT 0.25,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BẢNG ĐỀ KIỂM TRA (exams)
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    grade INTEGER NOT NULL CHECK (grade IN (10, 11, 12)),
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    total_points NUMERIC(4, 2) DEFAULT 10.0,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
    is_online BOOLEAN DEFAULT true,
    open_time TIMESTAMPTZ,
    close_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. BẢNG CÂU HỎI TRONG ĐỀ KIỂM TRA (exam_questions)
CREATE TABLE IF NOT EXISTS public.exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 1,
    UNIQUE(exam_id, question_id)
);

-- 12. BẢNG BÀI LÀM KIỂM TRA (exam_submissions)
CREATE TABLE IF NOT EXISTS public.exam_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    score NUMERIC(4, 2) CHECK (score >= 0 AND score <= 10),
    auto_score NUMERIC(4, 2),
    essay_score NUMERIC(4, 2),
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded')),
    teacher_feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, student_id)
);

-- 13. BẢNG CÂU TRẢ LỜI CỦA HỌC SINH (answers)
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.exam_submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    student_answer TEXT,
    is_correct BOOLEAN,
    awarded_points NUMERIC(4, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id, question_id)
);

-- 14. BẢNG BÀI TẬP VỀ NHÀ (assignments)
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. BẢNG ĐIỂM DANH & CHUYÊN CẦN (attendance)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 10),
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'excused', 'unexcused', 'late')),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date, period)
);

-- 16. BẢNG KHO HỌC LIỆU ĐIỆN TỬ (learning_resources)
CREATE TABLE IF NOT EXISTS public.learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    grade INTEGER NOT NULL CHECK (grade IN (10, 11, 12)),
    category VARCHAR(50) NOT NULL, -- lesson_plan, document, slide, video, formula, periodic_table
    file_type VARCHAR(20) NOT NULL, -- pdf, docx, pptx, mp4, interactive
    file_size VARCHAR(50),
    file_url TEXT,
    author VARCHAR(255) DEFAULT 'Thầy Hoàng Nhật',
    downloads INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. BẢNG THÔNG BÁO (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('exam', 'homework', 'grade', 'general', 'urgent')),
    target_type VARCHAR(50) DEFAULT 'all' CHECK (target_type IN ('all', 'class', 'student')),
    target_class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. BẢNG LIÊN KẾT PHỤ HUYNH - HỌC SINH (parent_student_links)
CREATE TABLE IF NOT EXISTS public.parent_student_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    relationship VARCHAR(50) DEFAULT 'Phụ huynh',
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_profile_id, student_id)
);

-- 19. BẢNG TÀI KHOẢN ĐĂNG NHẬP (user_accounts)
CREATE TABLE IF NOT EXISTS public.user_accounts (
    id TEXT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('teacher', 'student', 'parent')),
    email VARCHAR(255),
    phone VARCHAR(50),
    school VARCHAR(255) DEFAULT 'TRƯỜNG TRUNG HỌC PHỔ THÔNG THẠNH LỘC',
    title VARCHAR(255),
    student_code VARCHAR(50),
    student_id VARCHAR(100),
    class_name VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật RLS cho user_accounts
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

-- Cho phép cả anon (public key) và authenticated đọc và ghi tài khoản
CREATE POLICY "Allow public read user_accounts" ON public.user_accounts FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_accounts" ON public.user_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update user_accounts" ON public.user_accounts FOR UPDATE USING (true);

-- Cho phép công khai truy cập các bảng dữ liệu học tập (hỗ trợ cả anon key từ Frontend)
CREATE POLICY "Allow public read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow public insert classes" ON public.classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update classes" ON public.classes FOR UPDATE USING (true);

CREATE POLICY "Allow public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public insert students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update students" ON public.students FOR UPDATE USING (true);

CREATE POLICY "Allow public read grades" ON public.grades FOR SELECT USING (true);
CREATE POLICY "Allow public insert grades" ON public.grades FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update grades" ON public.grades FOR UPDATE USING (true);

CREATE POLICY "Allow public read attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow public insert attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update attendance" ON public.attendance FOR UPDATE USING (true);

CREATE POLICY "Allow public read questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert questions" ON public.questions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Allow public insert exams" ON public.exams FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- DỮ LIỆU MẪU TÀI KHOẢN BAN ĐẦU
INSERT INTO public.user_accounts (id, username, password, full_name, role, email, phone, title)
VALUES 
    ('usr_teacher_01', 'thayhoangnhat', '123', 'Hoàng Nhật', 'teacher', 'thayhoangnhat@thptthanhloc.edu.vn', '0903888999', 'Giáo viên bộ môn Toán – Vật lý – Hóa học'),
    ('usr_student_01', 'hs001', '123', 'Nguyễn Văn An', 'student', 'hs001@thptthanhloc.edu.vn', '0903112233', 'Học sinh lớp 12A1'),
    ('usr_parent_01', 'ph001', '123', 'Nguyễn Văn Bình', 'parent', 'nguyenvanbinh@gmail.com', '0918123456', 'Phụ huynh học sinh Nguyễn Văn An (12A1)'),
    ('usr_teacher_02', 'cothu', '123', 'Trần Thị Thu', 'teacher', 'cothu@thptthanhloc.edu.vn', '0903777888', 'Giáo viên chủ nhiệm 12A2')
ON CONFLICT (username) DO NOTHING;
