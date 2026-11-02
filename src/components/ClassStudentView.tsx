import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Upload,
  Edit2,
  Trash2,
  Eye,
  School,
  X,
  Check,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { db } from '../services/db.ts';
import { ExcelService } from '../services/excelService.ts';
import { SchoolClass, Student } from '../types/index.ts';

export const ClassStudentView: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>(db.getClasses());
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [students, setStudents] = useState<Student[]>(db.getStudents());

  // Modal states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showImportExcelModal, setShowImportExcelModal] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // New Student form
  const [studentForm, setStudentForm] = useState({
    studentCode: '',
    fullName: '',
    birthDate: '2007-05-15',
    gender: 'Nam' as 'Nam' | 'Nữ',
    classId: classes[0]?.id || 'c1',
    address: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    note: ''
  });

  // New Class form
  const [classForm, setClassForm] = useState({
    name: '',
    grade: 12 as 10 | 11 | 12,
    room: '',
    homeroomTeacher: 'Thầy Hoàng Nhật',
    academicYear: '2024 - 2025'
  });

  // Import preview
  const [importPreviewList, setImportPreviewList] = useState<Omit<Student, 'id'>[]>([]);
  const [importTargetClass, setImportTargetClass] = useState<string>(classes[0]?.id || 'c1');
  const [importMessage, setImportMessage] = useState<string>('');

  const refreshData = () => {
    setClasses(db.getClasses());
    setStudents(db.getStudents());
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchClass = selectedClassId === 'all' || s.classId === selectedClassId;
    const matchGrade = selectedGrade === 0 || s.grade === selectedGrade;
    const matchSearch = !searchQuery.trim() ||
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);
    return matchClass && matchGrade && matchSearch;
  });

  // Add student handler
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.studentCode || !studentForm.fullName) {
      alert('Vui lòng nhập Mã học sinh và Họ tên!');
      return;
    }

    const targetClass = classes.find(c => c.id === studentForm.classId);
    if (!targetClass) return;

    if (editingStudent) {
      db.updateStudent(editingStudent.id, {
        ...studentForm,
        className: targetClass.name,
        grade: targetClass.grade
      });
      setEditingStudent(null);
    } else {
      db.addStudent({
        ...studentForm,
        className: targetClass.name,
        grade: targetClass.grade
      });
    }

    setShowAddStudentModal(false);
    refreshData();
  };

  // Add class handler
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name) {
      alert('Vui lòng nhập tên lớp (ví dụ: 12A3)!');
      return;
    }

    db.addClass({
      ...classForm,
      studentCount: 0
    });

    setShowAddClassModal(false);
    setClassForm({
      name: '',
      grade: 12,
      room: '',
      homeroomTeacher: 'Thầy Hoàng Nhật',
      academicYear: '2024 - 2025'
    });
    refreshData();
  };

  // Delete student
  const handleDeleteStudent = (student: Student) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa học sinh ${student.fullName} (${student.studentCode}) khỏi cơ sở dữ liệu?`)) {
      db.deleteStudent(student.id);
      refreshData();
    }
  };

  // Delete class
  const handleDeleteClass = (cls: SchoolClass) => {
    if (window.confirm(`CẢNH BÁO: Xóa lớp ${cls.name} sẽ đồng thời xóa toàn bộ học sinh và điểm số của lớp này. Bạn có chắc chắn muốn tiếp tục?`)) {
      db.deleteClass(cls.id);
      if (selectedClassId === cls.id) setSelectedClassId('all');
      refreshData();
    }
  };

  // Handle Excel file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const targetCls = classes.find(c => c.id === importTargetClass) || classes[0];
      const parsed = await ExcelService.parseStudentExcel(file, targetCls.id, targetCls.name, targetCls.grade);
      setImportPreviewList(parsed);
      setImportMessage(`Đã đọc thành công ${parsed.length} dòng dữ liệu từ file Excel!`);
    } catch (err: any) {
      setImportMessage(`Lỗi đọc file Excel: ${err?.message || 'Định dạng file không hợp lệ'}`);
    }
  };

  // Confirm Excel import
  const handleConfirmImport = () => {
    if (importPreviewList.length === 0) return;
    importPreviewList.forEach(st => {
      db.addStudent(st);
    });
    refreshData();
    setShowImportExcelModal(false);
    setImportPreviewList([]);
    setImportMessage('');
    alert(`Đã nhập thành công ${importPreviewList.length} học sinh vào hệ thống!`);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Action Buttons */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Quản lý Lớp học & Học sinh
            </h2>
            <p className="text-xs text-slate-500">
              Quản lý hồ sơ học sinh, danh sách lớp các khối 10, 11, 12 THPT Thạnh Lộc
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Class Button */}
          <button
            onClick={() => setShowAddClassModal(true)}
            className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <School className="w-3.5 h-3.5" />
            <span>Tạo lớp học</span>
          </button>

          {/* Add Student Button */}
          <button
            onClick={() => {
              setEditingStudent(null);
              setStudentForm({
                studentCode: `HS0${students.length + 1}`,
                fullName: '',
                birthDate: '2007-05-15',
                gender: 'Nam',
                classId: selectedClassId !== 'all' ? selectedClassId : classes[0]?.id || 'c1',
                address: 'P. Thạnh Lộc, Quận 12, TP.HCM',
                phone: '',
                parentName: '',
                parentPhone: '',
                note: ''
              });
              setShowAddStudentModal(true);
            }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm học sinh</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={() => {
              setImportPreviewList([]);
              setImportMessage('');
              setShowImportExcelModal(true);
            }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập Excel</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={() => {
              const currentCls = classes.find(c => c.id === selectedClassId);
              ExcelService.exportStudentsToExcel(filteredStudents, currentCls ? currentCls.name : 'Toàn_Trường');
            }}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          onClick={() => {
            setSelectedClassId('all');
            setSelectedGrade(0);
          }}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedClassId === 'all'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
          }`}
        >
          <div className="text-[11px] font-semibold opacity-90">Tất cả lớp</div>
          <div className="text-base font-bold mt-0.5">{students.length} học sinh</div>
        </button>

        {classes.map(cls => (
          <div
            key={cls.id}
            onClick={() => {
              setSelectedClassId(cls.id);
              setSelectedGrade(cls.grade);
            }}
            className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer group ${
              selectedClassId === cls.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold">{cls.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                selectedClassId === cls.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
              }`}>
                Khối {cls.grade}
              </span>
            </div>
            <div className="text-[11px] mt-1 opacity-90">
              {students.filter(s => s.classId === cls.id).length} học sinh
            </div>
            <div className="text-[10px] opacity-75 truncate mt-0.5">
              {cls.homeroomTeacher || 'GV Hoàng Nhật'}
            </div>

            {/* Quick delete class on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClass(cls);
              }}
              className="absolute top-1.5 right-1.5 hidden group-hover:flex w-5 h-5 rounded-full bg-red-500 text-white items-center justify-center text-[10px]"
              title="Xóa lớp học"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700">Lọc khối:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-medium"
            >
              <option value={0}>Tất cả khối</option>
              <option value={10}>Khối 10</option>
              <option value={11}>Khối 11</option>
              <option value={12}>Khối 12</option>
            </select>
          </div>

          <div className="text-slate-500">
            Hiển thị <strong className="text-blue-900">{filteredStudents.length}</strong> học sinh
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã HS, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#003875] to-[#005ba8] text-white">
                <th className="py-2.5 px-3 font-bold w-12 text-center">STT</th>
                <th className="py-2.5 px-3 font-bold w-24">Mã HS</th>
                <th className="py-2.5 px-4 font-bold min-w-[150px]">Họ và tên</th>
                <th className="py-2.5 px-3 font-bold w-20 text-center">Lớp</th>
                <th className="py-2.5 px-3 font-bold w-24">Ngày sinh</th>
                <th className="py-2.5 px-3 font-bold w-16 text-center">Giới tính</th>
                <th className="py-2.5 px-3 font-bold w-28">Số điện thoại</th>
                <th className="py-2.5 px-4 font-bold min-w-[140px]">Phụ huynh</th>
                <th className="py-2.5 px-3 font-bold w-28">SĐT PH</th>
                <th className="py-2.5 px-3 font-bold w-28 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 italic">
                    Không tìm thấy học sinh nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => (
                  <tr
                    key={st.id}
                    className={`hover:bg-blue-50/60 transition-colors border-b border-slate-100 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="py-2 px-3 text-center text-slate-600 font-medium">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-blue-900">{st.studentCode}</td>
                    <td className="py-2 px-4 font-bold text-slate-900">
                      <button
                        onClick={() => setViewingStudent(st)}
                        className="hover:text-blue-700 hover:underline cursor-pointer text-left font-bold"
                      >
                        {st.fullName}
                      </button>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">
                        {st.className}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">{st.birthDate}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-1.5 py-0.2 rounded text-[11px] font-semibold ${
                        st.gender === 'Nam' ? 'text-blue-700 bg-blue-50' : 'text-pink-700 bg-pink-50'
                      }`}>
                        {st.gender}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">{st.phone}</td>
                    <td className="py-2 px-4 text-slate-700 font-medium">{st.parentName}</td>
                    <td className="py-2 px-3 text-slate-600">{st.parentPhone}</td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewingStudent(st)}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
                          title="Xem hồ sơ học tập"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStudent(st);
                            setStudentForm({
                              studentCode: st.studentCode,
                              fullName: st.fullName,
                              birthDate: st.birthDate,
                              gender: st.gender,
                              classId: st.classId,
                              address: st.address,
                              phone: st.phone,
                              parentName: st.parentName,
                              parentPhone: st.parentPhone,
                              note: st.note || ''
                            });
                            setShowAddStudentModal(true);
                          }}
                          className="p-1 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded cursor-pointer"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(st)}
                          className="p-1 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                          title="Xóa học sinh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Edit Student */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-2xl">
              <h3 className="font-bold text-sm md:text-base">
                {editingStudent ? 'Cập nhật thông tin học sinh' : 'Thêm học sinh mới vào hệ thống'}
              </h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã học sinh (*):</label>
                  <input
                    type="text"
                    required
                    value={studentForm.studentCode}
                    onChange={(e) => setStudentForm({ ...studentForm, studentCode: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                    placeholder="VD: HS015"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên (*):</label>
                  <input
                    type="text"
                    required
                    value={studentForm.fullName}
                    onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                    placeholder="VD: Nguyễn Văn Hoàng"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp học (*):</label>
                  <select
                    value={studentForm.classId}
                    onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Khối {c.grade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới tính:</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày sinh:</label>
                  <input
                    type="date"
                    value={studentForm.birthDate}
                    onChange={(e) => setStudentForm({ ...studentForm, birthDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại:</label>
                  <input
                    type="text"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                    placeholder="VD: 0903123456"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa chỉ thường trú:</label>
                <input
                  type="text"
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  placeholder="VD: Hà Huy Giáp, P. Thạnh Lộc, Q.12"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ tên phụ huynh:</label>
                  <input
                    type="text"
                    value={studentForm.parentName}
                    onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">SĐT phụ huynh:</label>
                  <input
                    type="text"
                    value={studentForm.parentPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú học tập / Sức khỏe:</label>
                <textarea
                  rows={2}
                  value={studentForm.note}
                  onChange={(e) => setStudentForm({ ...studentForm, note: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
                  placeholder="VD: Học sinh cần chú ý rèn thêm môn Toán phần Hình học"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  {editingStudent ? 'Lưu cập nhật' : 'Thêm học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Class */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-2xl">
              <h3 className="font-bold text-sm md:text-base">Tạo mới lớp học</h3>
              <button
                onClick={() => setShowAddClassModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên lớp học (*):</label>
                <input
                  type="text"
                  required
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  placeholder="VD: Lớp 12A3"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khối lớp:</label>
                <select
                  value={classForm.grade}
                  onChange={(e) => setClassForm({ ...classForm, grade: Number(e.target.value) as any })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  <option value={10}>Khối 10</option>
                  <option value={11}>Khối 11</option>
                  <option value={12}>Khối 12</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phòng học:</label>
                <input
                  type="text"
                  value={classForm.room}
                  onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  placeholder="VD: Phòng A204"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giáo viên chủ nhiệm:</label>
                <input
                  type="text"
                  value={classForm.homeroomTeacher}
                  onChange={(e) => setClassForm({ ...classForm, homeroomTeacher: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Lưu lớp học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import Excel */}
      {showImportExcelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-emerald-700 text-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                <h3 className="font-bold text-base">Nhập danh sách học sinh từ file Excel</h3>
              </div>
              <button
                onClick={() => setShowImportExcelModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div>
                  <div className="font-bold text-blue-900">Mẫu file Excel chuẩn trường THPT Thạnh Lộc</div>
                  <div className="text-[11px] text-blue-700">Tải file mẫu về máy và điền theo đúng các cột chuẩn.</div>
                </div>
                <button
                  onClick={() => ExcelService.downloadStudentTemplate()}
                  className="flex items-center gap-1 bg-white text-blue-700 border border-blue-300 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-50 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file mẫu .xlsx</span>
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn lớp học tiếp nhận:</label>
                <select
                  value={importTargetClass}
                  onChange={(e) => setImportTargetClass(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Khối {c.grade})
                    </option>
                  ))}
                </select>
              </div>

              {/* File upload input */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700">Kéo thả file Excel hoặc bấm để chọn file</p>
                <p className="text-[11px] text-slate-500 mt-1">Định dạng hỗ trợ: .xlsx, .xls, .csv</p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="mt-3 block mx-auto text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
              </div>

              {importMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-medium">
                  {importMessage}
                </div>
              )}

              {/* Preview table */}
              {importPreviewList.length > 0 && (
                <div>
                  <div className="font-bold text-slate-800 mb-1">Xem trước dữ liệu ({importPreviewList.length} học sinh):</div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-100 text-slate-700 sticky top-0">
                        <tr>
                          <th className="p-1.5">Mã HS</th>
                          <th className="p-1.5">Họ và tên</th>
                          <th className="p-1.5">Ngày sinh</th>
                          <th className="p-1.5">Giới tính</th>
                          <th className="p-1.5">Phụ huynh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreviewList.map((st, i) => (
                          <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="p-1.5 font-bold text-blue-900">{st.studentCode}</td>
                            <td className="p-1.5 font-medium">{st.fullName}</td>
                            <td className="p-1.5">{st.birthDate}</td>
                            <td className="p-1.5">{st.gender}</td>
                            <td className="p-1.5">{st.parentName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowImportExcelModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={importPreviewList.length === 0}
                  onClick={handleConfirmImport}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Xác nhận nhập vào Database</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Student Full Profile */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#003875] to-[#005ba8] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white text-blue-900 font-bold flex items-center justify-center text-sm shadow">
                  {viewingStudent.fullName.split(' ').slice(-1)[0]?.substring(0, 2) || 'HS'}
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">{viewingStudent.fullName}</h3>
                  <p className="text-xs text-blue-200">{viewingStudent.studentCode} • {viewingStudent.className}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500">Ngày sinh:</span>
                  <div className="font-bold text-slate-800">{viewingStudent.birthDate}</div>
                </div>
                <div>
                  <span className="text-slate-500">Giới tính:</span>
                  <div className="font-bold text-slate-800">{viewingStudent.gender}</div>
                </div>
                <div>
                  <span className="text-slate-500">Khối lớp:</span>
                  <div className="font-bold text-slate-800">Khối {viewingStudent.grade}</div>
                </div>
                <div>
                  <span className="text-slate-500">Số điện thoại:</span>
                  <div className="font-bold text-slate-800">{viewingStudent.phone || 'Chưa cập nhật'}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Địa chỉ:</span>
                  <div className="font-bold text-slate-800">{viewingStudent.address}</div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                <div className="font-bold text-blue-900 mb-1">Thông tin liên hệ phụ huynh</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Họ tên PH:</span>
                    <div className="font-bold text-slate-800">{viewingStudent.parentName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">SĐT liên hệ:</span>
                    <div className="font-bold text-slate-800">{viewingStudent.parentPhone}</div>
                  </div>
                </div>
              </div>

              {viewingStudent.note && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="font-bold text-amber-900 mb-1">Ghi chú giáo viên bộ môn</div>
                  <div className="text-slate-800">{viewingStudent.note}</div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewingStudent(null)}
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
