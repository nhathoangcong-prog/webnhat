import { getSupabase, isSupabaseConfigured } from './supabaseClient.ts';
import { db } from './db.ts';
import { authService } from './authService.ts';
import { UserAccount, Student, SchoolClass, GradeItem, AttendanceRecord, Question, Exam } from '../types/index.ts';

export interface SyncStats {
  accounts: number;
  classes: number;
  students: number;
  grades: number;
  attendance: number;
  questions: number;
  exams: number;
}

class SupabaseDataService {
  public isConnected(): boolean {
    return isSupabaseConfigured() && getSupabase() !== null;
  }

  // 1. TÀI KHOẢN NGƯỜI DÙNG (User Accounts)
  public async fetchUserAccounts(): Promise<UserAccount[] | null> {
    const client = getSupabase();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('user_accounts')
        .select('*');

      if (error) {
        console.warn('Supabase fetchUserAccounts error:', error);
        return null;
      }

      if (data) {
        return data.map((row: any) => ({
          id: row.id,
          username: row.username,
          password: row.password,
          fullName: row.full_name,
          role: row.role,
          email: row.email,
          phone: row.phone,
          school: row.school,
          title: row.title,
          studentCode: row.student_code,
          studentId: row.student_id,
          className: row.class_name,
          avatarUrl: row.avatar_url,
          createdAt: row.created_at
        }));
      }
    } catch (err) {
      console.error('Error fetching user_accounts from Supabase:', err);
    }
    return null;
  }

  public async saveUserAccount(user: UserAccount): Promise<boolean> {
    const client = getSupabase();
    if (!client) return false;

    try {
      const { error } = await client
        .from('user_accounts')
        .upsert({
          id: user.id,
          username: user.username,
          password: user.password,
          full_name: user.fullName,
          role: user.role,
          email: user.email || null,
          phone: user.phone || null,
          school: user.school || 'TRƯỜNG TRUNG HỌC PHỔ THÔNG THẠNH LỘC',
          title: user.title || null,
          student_code: user.studentCode || null,
          student_id: user.studentId || null,
          class_name: user.className || null,
          avatar_url: user.avatarUrl || null,
          created_at: user.createdAt || new Date().toISOString()
        }, { onConflict: 'username' });

      if (error) {
        console.error('Supabase saveUserAccount error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to save user account to Supabase:', err);
      return false;
    }
  }

  // 2. HỌC SINH (Students)
  public async fetchStudents(): Promise<Student[] | null> {
    const client = getSupabase();
    if (!client) return null;

    try {
      const { data, error } = await client.from('students').select('*');
      if (error) {
        console.warn('Supabase fetchStudents error:', error);
        return null;
      }
      if (data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          studentCode: r.student_code,
          fullName: r.full_name,
          birthDate: r.birth_date,
          gender: r.gender,
          classId: r.class_id,
          className: r.class_name || 'Lớp 12A1',
          grade: r.grade || 12,
          address: r.address || '',
          phone: r.phone || '',
          parentName: r.parent_name || '',
          parentPhone: r.parent_phone || '',
          parentEmail: r.parent_email || '',
          note: r.note || '',
          avatarUrl: r.avatar_url || ''
        }));
      }
    } catch (err) {
      console.error('Error fetching students from Supabase:', err);
    }
    return null;
  }

  public async saveStudent(student: Student): Promise<boolean> {
    const client = getSupabase();
    if (!client) return false;

    try {
      const { error } = await client.from('students').upsert({
        id: student.id,
        student_code: student.studentCode,
        full_name: student.fullName,
        birth_date: student.birthDate,
        gender: student.gender,
        class_id: student.classId,
        address: student.address,
        phone: student.phone,
        parent_name: student.parentName,
        parent_phone: student.parentPhone,
        parent_email: student.parentEmail,
        note: student.note
      }, { onConflict: 'id' });

      return !error;
    } catch (e) {
      console.error('Error saving student to Supabase:', e);
      return false;
    }
  }

  // 3. ĐIỂM DANH (Attendance)
  public async fetchAttendance(): Promise<AttendanceRecord[] | null> {
    const client = getSupabase();
    if (!client) return null;

    try {
      const { data, error } = await client.from('attendance').select('*');
      if (error) return null;
      if (data) {
        return data.map((r: any) => ({
          id: r.id,
          studentId: r.student_id,
          studentCode: r.student_code || '',
          studentName: r.student_name || '',
          classId: r.class_id,
          subjectCode: r.subject_code || 'TOAN',
          date: r.date,
          period: r.period,
          status: r.status,
          reason: r.reason || ''
        }));
      }
    } catch (e) {
      console.error('Error fetching attendance from Supabase:', e);
    }
    return null;
  }

  public async saveAttendance(records: AttendanceRecord[]): Promise<boolean> {
    const client = getSupabase();
    if (!client || records.length === 0) return false;

    try {
      const payload = records.map(r => ({
        id: r.id,
        student_id: r.studentId,
        class_id: r.classId,
        date: r.date,
        period: r.period,
        status: r.status,
        reason: r.reason || null
      }));

      const { error } = await client.from('attendance').upsert(payload, { onConflict: 'id' });
      return !error;
    } catch (e) {
      console.error('Error saving attendance to Supabase:', e);
      return false;
    }
  }

  // 4. SỔ ĐIỂM (Grades)
  public async saveGrades(grades: GradeItem[]): Promise<boolean> {
    const client = getSupabase();
    if (!client || grades.length === 0) return false;

    try {
      const payload = grades.map(g => ({
        id: g.id,
        student_id: g.studentId,
        subject_id: g.subjectCode,
        semester: g.semester,
        tx_score: g.txAverage,
        gk_score: g.gk,
        ck_score: g.ck,
        tb_score: g.tb,
        note: g.note || null
      }));

      const { error } = await client.from('grades').upsert(payload, { onConflict: 'id' });
      return !error;
    } catch (e) {
      console.error('Error saving grades to Supabase:', e);
      return false;
    }
  }

  // 5. ĐỒNG BỘ TOÀN BỘ DỮ LIỆU CỤC BỘ LÊN SUPABASE (1-Click Sync to Cloud)
  public async syncLocalDataToSupabase(): Promise<{ success: boolean; message: string; stats?: SyncStats }> {
    const client = getSupabase();
    if (!client) {
      return { success: false, message: 'Chưa kết nối Supabase! Vui lòng cấu hình URL và Anon Key trước.' };
    }

    try {
      const state = db.getState();
      const accounts = authService.getUsers();

      let syncedAccounts = 0;
      let syncedStudents = 0;
      let syncedClasses = 0;
      let syncedAttendance = 0;
      let syncedGrades = 0;

      // 1. Sync User Accounts
      if (accounts.length > 0) {
        const payloadAccounts = accounts.map(u => ({
          id: u.id,
          username: u.username,
          password: u.password,
          full_name: u.fullName,
          role: u.role,
          email: u.email || null,
          phone: u.phone || null,
          school: u.school || 'TRƯỜNG TRUNG HỌC PHỔ THÔNG THẠNH LỘC',
          title: u.title || null,
          student_code: u.studentCode || null,
          student_id: u.studentId || null,
          class_name: u.className || null,
          created_at: u.createdAt || new Date().toISOString()
        }));
        const { error: accErr } = await client.from('user_accounts').upsert(payloadAccounts, { onConflict: 'username' });
        if (!accErr) syncedAccounts = accounts.length;
      }

      // 2. Sync Students
      if (state.students.length > 0) {
        const payloadStudents = state.students.map(s => ({
          id: s.id,
          student_code: s.studentCode,
          full_name: s.fullName,
          birth_date: s.birthDate,
          gender: s.gender,
          class_id: s.classId,
          address: s.address,
          phone: s.phone,
          parent_name: s.parentName,
          parent_phone: s.parentPhone,
          parent_email: s.parentEmail,
          note: s.note
        }));
        const { error: stErr } = await client.from('students').upsert(payloadStudents, { onConflict: 'id' });
        if (!stErr) syncedStudents = state.students.length;
      }

      // 3. Sync Attendance
      if (state.attendance.length > 0) {
        const payloadAtt = state.attendance.map(a => ({
          id: a.id,
          student_id: a.studentId,
          class_id: a.classId,
          date: a.date,
          period: a.period,
          status: a.status,
          reason: a.reason || null
        }));
        const { error: attErr } = await client.from('attendance').upsert(payloadAtt, { onConflict: 'id' });
        if (!attErr) syncedAttendance = state.attendance.length;
      }

      // 4. Sync Grades
      if (state.grades.length > 0) {
        const payloadGrades = state.grades.map(g => ({
          id: g.id,
          student_id: g.studentId,
          subject_id: g.subjectCode,
          semester: g.semester,
          tx_score: g.txAverage,
          gk_score: g.gk,
          ck_score: g.ck,
          tb_score: g.tb,
          note: g.note || null
        }));
        const { error: grErr } = await client.from('grades').upsert(payloadGrades, { onConflict: 'id' });
        if (!grErr) syncedGrades = state.grades.length;
      }

      const stats: SyncStats = {
        accounts: syncedAccounts,
        classes: state.classes.length,
        students: syncedStudents,
        grades: syncedGrades,
        attendance: syncedAttendance,
        questions: state.questions.length,
        exams: state.exams.length
      };

      return {
        success: true,
        message: `Đồng bộ thành công lên Supabase: ${syncedAccounts} tài khoản, ${syncedStudents} học sinh, ${syncedAttendance} bản ghi điểm danh và ${syncedGrades} bảng điểm!`,
        stats
      };
    } catch (err: any) {
      console.error('Sync error:', err);
      return {
        success: false,
        message: `Lỗi đồng bộ dữ liệu lên Supabase: ${err.message || 'Không xác định'}`
      };
    }
  }

  // 6. TẢI DỮ LIỆU TỪ SUPABASE VỀ BỘ NHỚ CỤC BỘ (1-Click Pull from Cloud)
  public async pullDataFromSupabase(): Promise<{ success: boolean; message: string }> {
    const client = getSupabase();
    if (!client) {
      return { success: false, message: 'Chưa kết nối Supabase!' };
    }

    try {
      const [remoteAccounts, remoteStudents, remoteAttendance] = await Promise.all([
        this.fetchUserAccounts(),
        this.fetchStudents(),
        this.fetchAttendance()
      ]);

      let updatedCount = 0;

      if (remoteAccounts && remoteAccounts.length > 0) {
        // Save to authService
        remoteAccounts.forEach(acc => {
          authService.register({
            username: acc.username,
            password: acc.password,
            fullName: acc.fullName,
            role: acc.role,
            phone: acc.phone,
            email: acc.email,
            studentId: acc.studentId,
            className: acc.className
          });
        });
        updatedCount += remoteAccounts.length;
      }

      if (remoteStudents && remoteStudents.length > 0) {
        remoteStudents.forEach(st => {
          db.saveStudent(st);
        });
        updatedCount += remoteStudents.length;
      }

      if (remoteAttendance && remoteAttendance.length > 0) {
        db.saveAttendance(remoteAttendance);
        updatedCount += remoteAttendance.length;
      }

      return {
        success: true,
        message: `Đã nạp ${updatedCount} bản ghi mới nhất từ Supabase về ứng dụng thành công!`
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Lỗi nạp dữ liệu từ Supabase: ${e.message}`
      };
    }
  }
}

export const supabaseDataService = new SupabaseDataService();
