import { Plus, Edit, Trash2 } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import type { Student } from '../../types';
import Form from '../shared/Form';
import { useStudentsContext } from '../../contexts/StudentsContext';

const StudentManagement: React.FC = () => {
  const {
    students,
    loading,
    error,
    parents,
    parentsLoading,
    parentsError,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    fetchParents,
  } = useStudentsContext();

  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [defaultParent, setDefaultParent] = useState<string>('');

  // Build parents options (string values for Form)
  const parentsOptions = useMemo(
    () =>
      (parents || []).map((p: any) => ({
        value: String(p.ma_phu_huynh ?? p.id ?? ''),
        label: p.ho_ten ?? p.name ?? '—',
      })),
    [parents]
  );

  // Build stops options from students (if tram info present) OR empty — ideally you have a StopsContext or service
  const stopsOptions = useMemo(() => {
    // collect unique stops from students' tram_don/tram_tra (fallback)
    const setMap = new Map<string, string>();
    (students || []).forEach((s: any) => {
      if (s.tram_don) setMap.set(String(s.tram_don), s.tram_don);
      if (s.tram_tra) setMap.set(String(s.tram_tra), s.tram_tra);
    });
    return Array.from(setMap.entries()).map(([k, v]) => ({ value: String(k), label: String(v) }));
  }, [students]);

  const openAdd = async () => {
    // ensure parents loaded before opening create modal (so user can select)
    if (!parents || parents.length === 0) {
      await fetchParents();
    }
    setEditingStudent(null);
    setShowModal(true);
  };

  const openEdit = async (s: any) => {
    if (!parents || parents.length === 0) {
      await fetchParents();
    }
    // prefill form values as strings for select controls
    setEditingStudent({
      ...s,
      ma_phu_huynh: s.ma_phu_huynh != null ? String(s.ma_phu_huynh) : '',
      ma_diem_don: s.ma_diem_don != null ? String(s.ma_diem_don) : '',
      ma_diem_tra: s.ma_diem_tra != null ? String(s.ma_diem_tra) : '',
      trang_thai: s.trang_thai ?? 'hoat_dong',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStudent(null);
  };

  const handleSubmit = async (data: any) => {
    try {
      // Require ma_phu_huynh when editing
      if (editingStudent) {
        if (!data.ma_phu_huynh || String(data.ma_phu_huynh).trim() === '') {
          alert('Vui lòng chọn phụ huynh khi chỉnh sửa học sinh.');
          return;
        }
      }
      const ma_phu_huynh_value =
        data.ma_phu_huynh && String(data.ma_phu_huynh).trim() !== ''
          ? Number(data.ma_phu_huynh)
          : defaultParent
          ? Number(defaultParent)
          : null;

      const payload = {
        ho_ten: data.ho_ten,
        lop: data.lop,
        ma_phu_huynh: ma_phu_huynh_value,
        ma_diem_don: data.ma_diem_don ? Number(data.ma_diem_don) : null,
        ma_diem_tra: data.ma_diem_tra ? Number(data.ma_diem_tra) : null,
        trang_thai: data.trang_thai ?? 'hoat_dong',
      };

      if (editingStudent && (editingStudent.ma_hs ?? editingStudent.id)) {
        const id = editingStudent.ma_hs ?? editingStudent.id;
        await updateStudent(Number(id), payload);
      } else {
        await addStudent(payload);
      }

      await fetchStudents();
      closeModal();
    } catch (err: any) {
      console.error('Save student error', err);
      alert('Lỗi lưu học sinh: ' + (err?.message || 'Unknown'));
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;
    try {
      await deleteStudent(id);
      await fetchStudents();
    } catch (err: any) {
      console.error('Delete error', err);
      alert('Lỗi xóa: ' + (err?.message || 'Unknown'));
    }
  };

  // Build form fields (Form expects option.value string)
  const formFieldsBase = [
    { name: 'ho_ten', type: 'text', placeholder: 'Tên học sinh', required: true },
    { name: 'lop', type: 'text', placeholder: 'Lớp', required: true },
    { name: 'ma_phu_huynh', type: 'select', placeholder: 'Chọn phụ huynh', options: parentsOptions, required: true },
    { name: 'ma_diem_don', type: 'select', placeholder: 'Chọn trạm đón', options: stopsOptions, required: true },
    { name: 'ma_diem_tra', type: 'select', placeholder: 'Chọn trạm trả', options: stopsOptions, required: true },
    { name: 'trang_thai', type: 'select', options: [{ value: 'hoat_dong', label: 'Hoạt động' }, { value: 'nghi', label: 'Nghỉ' }], required: true },
  ];

  // attach defaultValue from editingStudent
  const formFields = formFieldsBase.map((f) => {
    const defaultValue = editingStudent ? (editingStudent as any)[f.name] ?? '' : '';
    return { ...f, defaultValue };
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Học sinh</h1>
          <div className="mt-2 text-sm text-gray-600">
            Gán phụ huynh mặc định:{" "}
            <select value={defaultParent} onChange={(e) => setDefaultParent(e.target.value)} className="ml-2 p-1 border rounded">
              <option value="">— Không gán —</option>
              {parentsOptions.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
            <Plus className="inline-block mr-2 h-4 w-4" /> Thêm học sinh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8">Đang tải...</div>
      ) : error ? (
        <div className="p-8 text-red-600">Lỗi: {error}</div>
      ) : (
        <div className="bg-white rounded shadow p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Tên</th>
                  <th className="px-4 py-2 text-left">Lớp</th>
                  <th className="px-4 py-2 text-left">Phụ huynh</th>
                  <th className="px-4 py-2 text-left">Tuyến</th>
                  <th className="px-4 py-2 text-left">Trạng thái</th>
                  <th className="px-4 py-2 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      Chưa có học sinh
                    </td>
                  </tr>
                ) : (
                  students.map((s: any) => (
                    <tr key={s.ma_hs ?? s.id} className="border-t">
                      <td className="px-4 py-2">{s.ma_hs}</td>
                      <td className="px-4 py-2 font-medium">{s.ho_ten}</td>
                      <td className="px-4 py-2">{s.lop ?? '-'}</td>
                      <td className="px-4 py-2">
                        {s.parent_label ?? '-'}
                        {s.parent_phone ? <div className="text-xs text-gray-500">{s.parent_phone}</div> : null}
                      </td>
                      <td className="px-4 py-2">
                        {s.tram_don || s.tram_tra ? `${s.tram_don ?? '-'} → ${s.tram_tra ?? '-'}` : "-"}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded ${s.trang_thai === 'hoat_dong' ? 'bg-blue-100 text-blue-800' : s.trang_thai === 'nghi' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                          {s.trang_thai === 'hoat_dong' ? 'Hoạt động' : s.trang_thai === 'nghi' ? 'Nghỉ' : (s.trang_thai ?? '-')}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-2">
                          <button onClick={() => openEdit(s)} className="text-blue-600"> <Edit className="h-4 w-4" /> </button>
                          <button onClick={() => handleDelete(s.ma_hs ?? s.id)} className="text-red-600"> <Trash2 className="h-4 w-4" /> </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h3 className="mb-4 text-lg font-semibold">{editingStudent ? 'Cập nhật học sinh' : 'Thêm học sinh'}</h3>
            <Form fields={formFields as any} onSubmit={handleSubmit} onCancel={closeModal} submitLabel={editingStudent ? 'Cập nhật' : 'Thêm'} isEditing={!!editingStudent} />
          </div>
        </div>
      )}
    </div>
  );
};

export default  StudentManagement;