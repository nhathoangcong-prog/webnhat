import * as XLSX from 'xlsx';
import { Student, StudentCombinedGrade } from '../types/index.ts';

export class ExcelService {
  /**
   * Export students list to Excel
   */
  public static exportStudentsToExcel(students: Student[], className: string = 'Toàn trường') {
    const data = students.map((s, index) => ({
      'STT': index + 1,
      'Mã học sinh': s.studentCode,
      'Họ và tên': s.fullName,
      'Ngày sinh': s.birthDate,
      'Giới tính': s.gender,
      'Lớp': s.className,
      'Địa chỉ': s.address,
      'Số điện thoại': s.phone,
      'Họ tên phụ huynh': s.parentName,
      'SĐT phụ huynh': s.parentPhone,
      'Ghi chú': s.note || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách học sinh');

    const fileName = `Danh_Sach_Hoc_Sinh_${className.replace(/\s+/g, '_')}_THPT_Thanh_Loc.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Export Gradebook (Sổ điểm điện tử) to Excel
   */
  public static exportGradebookToExcel(grades: StudentCombinedGrade[], className: string = '12A1', semester: string = 'Học kỳ I') {
    const data = grades.map(g => ({
      'STT': g.stt,
      'Mã HS': g.studentCode,
      'Họ và tên': g.studentName,
      'Lớp': g.className,
      'Toán - TX': g.toan.tx,
      'Toán - GK': g.toan.gk,
      'Toán - CK': g.toan.ck,
      'Toán - ĐTB': g.toan.tb,
      'Vật lý - TX': g.vatly.tx,
      'Vật lý - GK': g.vatly.gk,
      'Vật lý - CK': g.vatly.ck,
      'Vật lý - ĐTB': g.vatly.tb,
      'Hóa học - TX': g.hoahoc.tx,
      'Hóa học - GK': g.hoahoc.gk,
      'Hóa học - CK': g.hoahoc.ck,
      'Hóa học - ĐTB': g.hoahoc.tb,
      'ĐTB 3 Môn': g.dtb3Mon,
      'Xếp loại': g.rank
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Sổ điểm ${className}`);

    const fileName = `So_Diem_Dien_Tu_${className}_${semester.replace(/\s+/g, '_')}_THPT_Thanh_Loc.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Download a sample Excel template for adding students
   */
  public static downloadStudentTemplate() {
    const sample = [
      {
        'Mã học sinh': 'HS011',
        'Họ và tên': 'Nguyễn Văn Minh',
        'Ngày sinh': '2007-05-12',
        'Giới tính': 'Nam',
        'Địa chỉ': '12 Hà Huy Giáp, P. Thạnh Lộc, Q.12',
        'Số điện thoại': '0901234567',
        'Họ tên phụ huynh': 'Nguyễn Văn Hùng',
        'SĐT phụ huynh': '0912345678',
        'Ghi chú': 'Học sinh mới chuyển trường'
      },
      {
        'Mã học sinh': 'HS012',
        'Họ và tên': 'Trần Ngọc Bích',
        'Ngày sinh': '2007-09-20',
        'Giới tính': 'Nữ',
        'Địa chỉ': '45 Thạnh Lộc 15, Q.12',
        'Số điện thoại': '0907654321',
        'Họ tên phụ huynh': 'Trần Văn Long',
        'SĐT phụ huynh': '0918765432',
        'Ghi chú': ''
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sample);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mẫu nhập học sinh');
    XLSX.writeFile(workbook, 'Mau_Nhap_Hoc_Sinh_THPT_Thanh_Loc.xlsx');
  }

  /**
   * Parse uploaded Excel file into Student objects
   */
  public static async parseStudentExcel(file: File, targetClassId: string, targetClassName: string, grade: 10 | 11 | 12): Promise<Omit<Student, 'id'>[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

          const students: Omit<Student, 'id'>[] = rows.map((r, i) => {
            const studentCode = r['Mã học sinh'] || r['Mã HS'] || `HS${String(Date.now()).slice(-3)}${i}`;
            const fullName = r['Họ và tên'] || r['Họ tên'] || r['Tên'] || 'Học sinh chưa đặt tên';
            const birthDate = r['Ngày sinh'] || '2007-01-01';
            const gender = (r['Giới tính'] || 'Nam') === 'Nữ' ? 'Nữ' : 'Nam';
            const address = r['Địa chỉ'] || 'P. Thạnh Lộc, Quận 12, TP.HCM';
            const phone = String(r['Số điện thoại'] || r['SĐT'] || '0900000000');
            const parentName = r['Họ tên phụ huynh'] || r['Phụ huynh'] || 'Phụ huynh học sinh';
            const parentPhone = String(r['SĐT phụ huynh'] || '0910000000');
            const note = r['Ghi chú'] || '';

            return {
              studentCode,
              fullName,
              birthDate,
              gender,
              classId: targetClassId,
              className: targetClassName,
              grade,
              address,
              phone,
              parentName,
              parentPhone,
              note
            };
          });

          resolve(students);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }
}
