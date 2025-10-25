import { Plus, Edit, Trash2, User, Phone, Car, Clock } from 'lucide-react';
import type { Driver } from '../../types';

interface DriverManagementProps {
  driversData: Driver[];
  onAdd: () => void;
  onEdit: (driver: Driver) => void;
  onDelete: (id: number) => void;
}

const DriverManagement = ({ driversData, onAdd, onEdit, onDelete }: DriverManagementProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dang_chay':
        return 'text-green-600 bg-green-100';
      case 'san_sang':
        return 'text-blue-600 bg-blue-100';
      case 'nghi':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Show empty state when no data
  if (driversData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài xế</h1>
            <p className="text-gray-600">Quản lý thông tin tài xế xe bus</p>
          </div>
          <button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm Tài xế
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚗</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có tài xế nào</h3>
            <p className="text-gray-500 mb-6">
              Hiện tại chưa có dữ liệu tài xế từ server. Vui lòng kiểm tra kết nối backend API hoặc thêm tài xế mới.
            </p>
            <button 
              onClick={onAdd}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto transition-colors"
            >
              <Plus className="h-5 w-5" />
              Thêm tài xế đầu tiên
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài xế</h1>
          <p className="text-gray-600">Quản lý thông tin tài xế xe bus</p>
        </div>
        <button
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm Tài xế
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng tài xế</p>
              <p className="text-xl font-semibold text-gray-900">{driversData.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Car className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đang lái</p>
              <p className="text-xl font-semibold text-gray-900">
                {driversData.filter(d => d.trang_thai === 'dang_chay').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sẵn sàng</p>
              <p className="text-xl font-semibold text-gray-900">
                {driversData.filter(d => d.trang_thai === 'san_sang').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Phone className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Nghỉ phép</p>
              <p className="text-xl font-semibold text-gray-900">
                {driversData.filter(d => d.trang_thai === 'nghi').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-900">ID</th>
                <th className="text-left p-4 font-semibold text-gray-900">Tên tài xế</th>
                <th className="text-left p-4 font-semibold text-gray-900">Số điện thoại</th>
                <th className="text-left p-4 font-semibold text-gray-900">Bằng lái</th>
                <th className="text-left p-4 font-semibold text-gray-900">Kinh nghiệm</th>
                <th className="text-left p-4 font-semibold text-gray-900">Tuyến hiện tại</th>
                <th className="text-left p-4 font-semibold text-gray-900">Xe hiện tại</th>
                <th className="text-left p-4 font-semibold text-gray-900">Trạng thái</th>
                <th className="text-left p-4 font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {driversData.map((driver, index) => (
                <tr key={driver.ma_tai_xe} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-4 text-gray-900">#{driver.ma_tai_xe.toString().padStart(3, '0')}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{driver.ho_ten}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{driver.so_dien_thoai}</td>
                  <td className="p-4 text-gray-600">{driver.so_gplx}</td>
                  <td className="p-4 text-gray-600">-</td>
                  <td className="p-4 text-gray-600">-</td>
                  <td className="p-4 text-gray-600">-</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.trang_thai)}`}>
                      {driver.trang_thai}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(driver)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(driver.ma_tai_xe)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {driversData.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-lg font-medium">Chưa có tài xế nào</p>
                    <p className="text-sm">Thêm tài xế đầu tiên để bắt đầu quản lý</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverManagement;