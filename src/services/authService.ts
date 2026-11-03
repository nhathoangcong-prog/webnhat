import { UserAccount, UserRole } from '../types/index.ts';
import { db } from './db.ts';
import { getSupabase } from './supabaseClient.ts';

const USERS_STORAGE_KEY = 'thpt_thanh_loc_users_v2';
const SESSION_STORAGE_KEY = 'thpt_thanh_loc_session_v2';

export const initialAccounts: UserAccount[] = [
  {
    id: 'usr_teacher_01',
    username: 'thayhoangnhat',
    password: '123',
    fullName: 'Hoàng Nhật',
    role: 'teacher',
    email: 'thayhoangnhat@thptthanhloc.edu.vn',
    phone: '0903888999',
    school: 'TRƯỜNG TRUNG HỌC PHỔ THÔNG THẠNH LỘC',
    title: 'Giáo viên bộ môn Toán – Vật lý – Hóa học',
    createdAt: '2024-09-01'
  },
  {
    id: 'usr_student_01',
    username: 'hs001',
    password: '123',
    fullName: 'Nguyễn Văn An',
    role: 'student',
    studentCode: 'HS001',
    studentId: 's1',
    className: 'Lớp 12A1',
    email: 'hs001@thptthanhloc.edu.vn',
    phone: '0903112233',
    school: 'TRƯỜNG TRUNG HỌC PHỔ THÔNG THẠNH LỘC',
    title: 'Học sinh lớp 12A1',
    createdAt: '2024-09-01'
  },
  {
    id: 'usr_parent_01',
    username: 'ph001',
    password: '123',
    fullName: 'Nguyễn Văn Bình',
    role: 'parent',
    studentCode: 'HS001',
    studentId: 's1',
    className: 'Lớp 12A1',
    email: 'nguyenvanbinh@gmail.com',
    phone: '0918123456',
    school: 'TRƯỜNG TRUNG HỌC PHỔ THÔNG THẠNH LỘC',
    title: 'Phụ huynh học sinh Nguyễn Văn An (12A1)',
    createdAt: '2024-09-01'
  },
  {
    id: 'usr_teacher_02',
    username: 'cothu',
    password: '123',
    fullName: 'Trần Thị Thu',
    role: 'teacher',
    email: 'cothu@thptthanhloc.edu.vn',
    phone: '0903777888',
    school: 'TRƯỜNG TRUNG HỌC PHỔ THÔNG THẠNH LỘC',
    title: 'Giáo viên chủ nhiệm 12A2',
    createdAt: '2024-09-01'
  }
];

class AuthService {
  private users: UserAccount[];

  constructor() {
    this.users = this.loadUsers();
  }

  private loadUsers(): UserAccount[] {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading users from storage:', e);
    }
    // Seed initial accounts
    this.saveUsersToStorage(initialAccounts);
    return initialAccounts;
  }

  private saveUsersToStorage(users: UserAccount[]): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      this.users = users;
    } catch (e) {
      console.error('Error saving users to storage:', e);
    }
  }

  public getUsers(): UserAccount[] {
    return [...this.users];
  }

  public getCurrentUser(): UserAccount | null {
    try {
      const session = localStorage.getItem(SESSION_STORAGE_KEY);
      if (session) {
        const user = JSON.parse(session) as UserAccount;
        // Verify user still exists
        const match = this.users.find(u => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase());
        return match || user;
      }
    } catch (e) {
      console.warn('Error reading active session:', e);
    }
    return null;
  }

  public login(username: string, password: string): { success: boolean; message: string; user?: UserAccount } {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      return { success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!' };
    }

    const found = this.users.find(u => u.username.toLowerCase() === cleanUsername);

    if (!found) {
      return { success: false, message: 'Tên đăng nhập không tồn tại trong hệ thống!' };
    }

    if (found.password !== cleanPassword) {
      return { success: false, message: 'Mật khẩu không chính xác! Vui lòng thử lại.' };
    }

    // Save active session
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(found));
    } catch (e) {
      console.error('Error writing session:', e);
    }

    return {
      success: true,
      message: `Đăng nhập thành công! Xin chào ${found.fullName}.`,
      user: found
    };
  }

  public register(data: {
    username: string;
    password: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    email?: string;
    studentId?: string;
    className?: string;
  }): { success: boolean; message: string; user?: UserAccount } {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanPassword = data.password.trim();
    const cleanFullName = data.fullName.trim();

    if (!cleanUsername) {
      return { success: false, message: 'Tên đăng nhập không được để trống!' };
    }

    if (cleanUsername.length < 3) {
      return { success: false, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' };
    }

    if (!cleanPassword || cleanPassword.length < 3) {
      return { success: false, message: 'Mật khẩu phải có ít nhất 3 ký tự!' };
    }

    if (!cleanFullName) {
      return { success: false, message: 'Họ và tên không được để trống!' };
    }

    // Check if username already exists
    const exists = this.users.some(u => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      return { success: false, message: 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác!' };
    }

    let studentCode = '';
    let finalTitle = '';

    if (data.role === 'teacher') {
      finalTitle = 'Giáo viên bộ môn THPT Thạnh Lộc';
    } else if (data.role === 'student') {
      if (data.studentId) {
        const st = db.getStudents().find(s => s.id === data.studentId);
        if (st) {
          studentCode = st.studentCode;
          finalTitle = `Học sinh lớp ${st.className}`;
        }
      }
      if (!finalTitle) finalTitle = `Học sinh ${data.className || 'THPT Thạnh Lộc'}`;
    } else if (data.role === 'parent') {
      if (data.studentId) {
        const st = db.getStudents().find(s => s.id === data.studentId);
        if (st) {
          studentCode = st.studentCode;
          finalTitle = `Phụ huynh học sinh ${st.fullName} (${st.className})`;
        }
      }
      if (!finalTitle) finalTitle = 'Phụ huynh học sinh THPT Thạnh Lộc';
    }

    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      password: cleanPassword,
      fullName: cleanFullName,
      role: data.role,
      phone: data.phone?.trim() || '',
      email: data.email?.trim() || '',
      school: 'TRƯỜNG TRUNG HỌC PHỔ THÔNG THẠNH LỘC',
      title: finalTitle,
      studentId: data.studentId,
      studentCode,
      className: data.className,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [...this.users, newUser];
    this.saveUsersToStorage(updated);

    // Asynchronously save to Supabase if connected
    const client = getSupabase();
    if (client) {
      client.from('user_accounts').upsert({
        id: newUser.id,
        username: newUser.username,
        password: newUser.password,
        full_name: newUser.fullName,
        role: newUser.role,
        email: newUser.email || null,
        phone: newUser.phone || null,
        school: newUser.school,
        title: newUser.title,
        student_code: newUser.studentCode || null,
        student_id: newUser.studentId || null,
        class_name: newUser.className || null,
        created_at: newUser.createdAt
      }, { onConflict: 'username' }).then(({ error }) => {
        if (error) console.warn('Could not sync user to Supabase:', error);
      });
    }

    return {
      success: true,
      message: 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.',
      user: newUser
    };
  }

  public logout(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing session:', e);
    }
  }

  public changePassword(userId: string, oldPass: string, newPass: string): { success: boolean; message: string } {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'Không tìm thấy thông tin tài khoản!' };
    }

    if (this.users[userIndex].password !== oldPass) {
      return { success: false, message: 'Mật khẩu hiện tại không chính xác!' };
    }

    if (newPass.length < 3) {
      return { success: false, message: 'Mật khẩu mới phải từ 3 ký tự trở lên!' };
    }

    this.users[userIndex].password = newPass;
    this.saveUsersToStorage([...this.users]);

    // Update active session if changing own password
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      current.password = newPass;
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(current));
      } catch (e) {
        console.error('Error updating session password:', e);
      }
    }

    return { success: true, message: 'Đổi mật khẩu thành công!' };
  }
}

export const authService = new AuthService();
