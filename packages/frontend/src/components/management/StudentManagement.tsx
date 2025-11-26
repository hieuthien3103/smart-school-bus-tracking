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
    stops,
    stopsLoading,
    stopsError,
    fetchStudents,
    fetchParents,
    fetchStops,
    addStudent,
    updateStudent,
    deleteStudent,
  } = useStudentsContext();

  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);

  // Build parents options (string values for Form)
  const parentsOptions = useMemo(
    () =>
      (parents || []).map((p: any) => ({
        value: String(p.ma_phu_huynh ?? p.id ?? ''),
        label: p.ho_ten ?? p.name ?? '—',
      })),
    [parents]
  );

  // Build stops options from context
  const stopsOptions = useMemo(() => {
    return (stops || []).map((stop: any) => ({
      value: String(stop.ma_tram ?? stop.id ?? ''),
      label: `${stop.ten_tram ?? stop.name ?? '—'} ${stop.dia_chi ? `(${stop.dia_chi})` : ''}`,
    }));
  }, [stops]);

  const openAdd = async () => {
    // ensure parents and stops loaded before opening create modal
    if (!parents || parents.length === 0) {
      await fetchParents();
    }
    if (!stops || stops.length === 0) {
      await fetchStops();
    }
    setEditingStudent(null);
    setShowModal(true);
  };

  const openEdit = async (s: any) => {
    if (!parents || parents.length === 0) {
      await fetchParents();
    }
    if (!stops || stops.length === 0) {
      await fetchStops();
    }
    // prefill form values as strings for select controls
    setEditingStudent({
      ...s,
      ma_phu_huynh: s.ma_phu_huynh != null ? String(s.ma_phu_huynh) : '',
      ma_diem_don: s.ma_diem_don != null ? String(s.ma_diem_don) : '',
      ma_diem_tra: s.ma_diem_tra != null ? String(s.ma_diem_tra) : '',
      trang_thai: s.trang_thai ?? 'dang_hoc',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStudent(null);
  };

  const handleSubmit = async (data: any) => {
    try {
      // Validate required fields
      if (!data.ho_ten || !data.ho_ten.trim()) {
        alert('Vui lòng nhập tên học sinh!');
        return;
      }
      if (!data.lop || !data.lop.trim()) {
        alert('Vui lòng nhập lớp!');
        return;
      }
      if (!data.ma_phu_huynh || String(data.ma_phu_huynh).trim() === '') {
        alert('Vui lòng chọn phụ huynh!');
        return;
      }
      if (!data.ma_diem_don || String(data.ma_diem_don).trim() === '') {
        alert('Vui lòng chọn trạm đón!');
        return;
      }
      if (!data.ma_diem_tra || String(data.ma_diem_tra).trim() === '') {
        alert('Vui lòng chọn trạm trả!');
        return;
      }

      const payload = {
        ho_ten: data.ho_ten.trim(),
        lop: data.lop.trim(),
        ma_phu_huynh: Number(data.ma_phu_huynh),
        ma_diem_don: Number(data.ma_diem_don),
        ma_diem_tra: Number(data.ma_diem_tra),
        trang_thai: data.trang_thai ?? 'dang_hoc',
      };

      if (editingStudent && (editingStudent.ma_hs ?? editingStudent.id)) {
        const id = editingStudent.ma_hs ?? editingStudent.id;
        await updateStudent(Number(id), payload);
        alert('Cập nhật học sinh thành công!');
      } else {
        await addStudent(payload);
        alert('Thêm học sinh thành công!');
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa học sinh này?')) return;
    try {
      await deleteStudent(id);
      alert('Xóa học sinh thành công!');
      await fetchStudents();
    } catch (err: any) {
      console.error('Delete error', err);
      alert('Lỗi xóa: ' + (err?.message || 'Unknown'));
    }
  };

  // Build form fields with labels and proper defaultValues
  const formFields = useMemo(() => {
    return [
      { 
        name: 'ho_ten', 
        label: 'Họ tên',
        type: 'text' as const, 
        placeholder: 'VD: Nguyễn Văn A', 
        required: true,
        defaultValue: editingStudent?.ho_ten ?? ''
      },
      { 
        name: 'lop', 
        label: 'Lớp',
        type: 'text' as const, 
        placeholder: 'VD: 6A, 7B', 
        required: true,
        defaultValue: editingStudent?.lop ?? ''
      },
      { 
        name: 'ma_phu_huynh', 
        label: 'Phụ huynh',
        type: 'select' as const, 
        placeholder: 'Chọn phụ huynh', 
        options: parentsOptions, 
        required: true,
        defaultValue: editingStudent?.ma_phu_huynh ?? ''
      },
      { 
        name: 'ma_diem_don', 
        label: 'Trạm đón',
        type: 'select' as const, 
        placeholder: 'Chọn trạm đón', 
        options: stopsOptions, 
        required: true,
        defaultValue: editingStudent?.ma_diem_don ?? ''
      },
      { 
        name: 'ma_diem_tra', 
        label: 'Trạm trả',
        type: 'select' as const, 
        placeholder: 'Chọn trạm trả', 
        options: stopsOptions, 
        required: true,
        defaultValue: editingStudent?.ma_diem_tra ?? ''
      },
      { 
        name: 'trang_thai', 
        label: 'Trạng thái',
        type: 'select' as const, 
        placeholder: 'Chọn trạng thái',
        options: [
          { value: 'dang_hoc', label: '✅ Đang học' }, 
          { value: 'nghi_hoc', label: '⏸️ Nghỉ học' },
          { value: 'chuyen_truong', label: '🔄 Chuyển trường' },
          { value: 'tot_nghiep', label: '🎓 Tốt nghiệp' }
        ], 
        required: true,
        defaultValue: editingStudent?.trang_thai ?? 'dang_hoc'
      },
    ];
  }, [editingStudent, parentsOptions, stopsOptions]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Học sinh</h1>
          <p className="text-sm text-gray-600 mt-2">
            Tổng số: {students.length} học sinh
            {parentsLoading && ' | Đang tải phụ huynh...'}
            {stopsLoading && ' | Đang tải trạm...'}
          </p>
        </div>
        <div>
          <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
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
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phụ huynh</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm đón/trả</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
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
                  students.map((s: any) => {
                    // Find parent info
                    const parent = parents.find((p: any) => p.ma_phu_huynh === s.ma_phu_huynh);
                    // Find stop info
                    const stopDon = stops.find((st: any) => st.ma_tram === s.ma_diem_don);
                    const stopTra = stops.find((st: any) => st.ma_tram === s.ma_diem_tra);
                    
                    return (
                      <tr key={s.ma_hs ?? s.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{s.ma_hs}</td>
                        <td className="px-4 py-2 font-medium">{s.ho_ten}</td>
                        <td className="px-4 py-2">{s.lop ?? '-'}</td>
                        <td className="px-4 py-2">
                          {parent ? (
                            <>
                              <div>{parent.ho_ten}</div>
                              <div className="text-xs text-gray-500">{parent.so_dien_thoai}</div>
                            </>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {stopDon || stopTra ? (
                            <div className="text-sm">
                              <div>Đón: {stopDon?.ten_tram ?? '-'}</div>
                              <div>Trả: {stopTra?.ten_tram ?? '-'}</div>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs rounded font-medium ${
                            s.trang_thai === 'dang_hoc' ? 'bg-green-100 text-green-800' : 
                            s.trang_thai === 'nghi_hoc' ? 'bg-yellow-100 text-yellow-800' : 
                            s.trang_thai === 'chuyen_truong' ? 'bg-blue-100 text-blue-800' : 
                            s.trang_thai === 'tot_nghiep' ? 'bg-purple-100 text-purple-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {s.trang_thai === 'dang_hoc' ? '✅ Đang học' : 
                             s.trang_thai === 'nghi_hoc' ? '⏸️ Nghỉ học' : 
                             s.trang_thai === 'chuyen_truong' ? '🔄 Chuyển trường' : 
                             s.trang_thai === 'tot_nghiep' ? '🎓 Tốt nghiệp' : 
                             s.trang_thai ?? '-'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex space-x-2">
                            <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-800" title="Sửa"> 
                              <Edit className="h-4 w-4" /> 
                            </button>
                            <button onClick={() => handleDelete(s.ma_hs ?? s.id)} className="text-red-600 hover:text-red-800" title="Xóa"> 
                              <Trash2 className="h-4 w-4" /> 
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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