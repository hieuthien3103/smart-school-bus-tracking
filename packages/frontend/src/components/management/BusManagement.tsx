import { Plus, Edit, Trash2, Bus as BusIcon, Wrench, CheckCircle, Settings, AlertTriangle } from 'lucide-react';
import type { Bus } from '../../types';

interface BusManagementProps {
  busesData: Bus[];
  onAdd: () => void;
  onEdit: (bus: Bus) => void;
  onDelete: (id: number) => void;
}

const BusManagement = ({ busesData, onAdd, onEdit, onDelete }: BusManagementProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'san_sang':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'dang_su_dung':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'bao_duong':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'san_sang':
        return '✅ Sẵn sàng';
      case 'dang_su_dung':
        return '🚌 Đang sử dụng';
      case 'bao_duong':
        return '🔧 Bảo dưỡng';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Xe buýt</h1>
          <p className="text-gray-600">Quản lý thông tin và trạng thái xe buýt</p>
        </div>
        <button
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Thêm Xe buýt
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tổng xe buýt</p>
              <p className="text-3xl font-bold">{busesData.length}</p>
            </div>
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-lg">
              <BusIcon className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Sẵn sàng</p>
              <p className="text-3xl font-bold">
                {busesData.filter(b => b.status === 'san_sang').length}
              </p>
            </div>
            <div className="p-3 bg-green-400 bg-opacity-30 rounded-lg">
              <CheckCircle className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Đang sử dụng</p>
              <p className="text-3xl font-bold">
                {busesData.filter(b => b.status === 'dang_su_dung').length}
              </p>
            </div>
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-lg">
              <BusIcon className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Bảo dưỡng</p>
              <p className="text-3xl font-bold">
                {busesData.filter(b => b.status === 'bao_duong').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-400 bg-opacity-30 rounded-lg">
              <Wrench className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Buses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {busesData.map((bus) => (
          <div key={bus.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BusIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{bus.license_plate}</h3>
                    <p className="text-sm text-gray-600">ID: {bus.id}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(bus.status)}`}>
                  {getStatusLabel(bus.status)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Biển số</p>
                  <p className="font-medium text-gray-900">{bus.license_plate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Sức chứa</p>
                  <p className="font-medium text-gray-900">{bus.capacity} chỗ</p>
                </div>
                <div>
                  <p className="text-gray-500">Trạng thái</p>
                  <p className="font-medium text-gray-900">{getStatusLabel(bus.status)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tài xế</p>
                  <p className="font-medium text-gray-900">{bus.driver_name || 'Chưa phân công'}</p>
                </div>
              </div>

              {/* Current Assignment */}
              {bus.driver_name && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">ĐANG PHỤC VỤ</p>
                  <p className="text-sm font-medium text-gray-900">Tài xế: {bus.driver_name}</p>
                  {bus.route_name && (
                    <p className="text-sm text-gray-600">Tuyến: {bus.route_name}</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-gray-50 p-4 flex justify-end gap-2">
              <button
                onClick={() => onEdit(bus)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="Chỉnh sửa"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(bus.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {busesData.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <BusIcon className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Chưa có xe buýt nào</h3>
            <p className="text-sm text-center max-w-md">
              Thêm xe buýt đầu tiên để bắt đầu quản lý đội xe của bạn
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusManagement;