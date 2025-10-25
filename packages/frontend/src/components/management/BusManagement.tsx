import { Plus, Edit, Trash2, Bus as BusIcon, Wrench, CheckCircle } from 'lucide-react';
import type { Bus } from '../../types';

interface BusManagementProps {
  busesData: Bus[];
  onAdd: () => void;
  onEdit: (bus: Bus) => void;
  onDelete: (id: number) => void;
}

const BusManagement = ({ busesData, onAdd, onEdit, onDelete }: BusManagementProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
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
        {busesData.map((bus) => (
          <div key={bus.ma_xe} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BusIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{bus.bien_so}</h3>
                    <p className="text-sm text-gray-600">ID: {bus.ma_xe}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(bus.trang_thai)}`}>
                  {getStatusLabel(bus.trang_thai)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Biển số</p>
                  <p className="font-medium text-gray-900">{bus.bien_so}</p>
                </div>
                <div>
                  <p className="text-gray-500">Sức chứa</p>
                  <p className="font-medium text-gray-900">{bus.suc_chua} chỗ</p>
                </div>
                <div>
                  <p className="text-gray-500">Trạng thái</p>
                  <p className="font-medium text-gray-900">{getStatusLabel(bus.trang_thai)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tài xế</p>
                  <p className="font-medium text-gray-900">{bus.tai_xe?.ho_ten || 'Chưa phân công'}</p>
                </div>
              </div>

              {/* Current Assignment */}
              {bus.tai_xe && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">ĐANG PHỤC VỤ</p>
                  <p className="text-sm font-medium text-gray-900">Tài xế: {bus.tai_xe.ho_ten}</p>
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
                onClick={() => onDelete(bus.ma_xe)}
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