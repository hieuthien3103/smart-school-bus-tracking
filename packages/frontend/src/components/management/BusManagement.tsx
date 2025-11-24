import { useState } from 'react';
import { Plus, Edit, Trash2, Bus as BusIcon, Wrench, AlertTriangle, CheckCircle, X } from 'lucide-react';
import type { Bus } from '../../types';

interface BusManagementProps {
  busesData: Bus[];
  onAdd: () => void;
  onEdit: (bus: Bus) => void;
  onDelete: (id: number) => void;
}

const BusManagement = ({ busesData, onAdd, onEdit, onDelete }: BusManagementProps) => {
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'san_sang':
      case 'hoạt động':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'bao_duong':
      case 'bảo trì':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'dang_su_dung':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'hỏng hóc':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'không hoạt động':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-blue-600 bg-blue-100 border-blue-200';
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
                {busesData.filter(b => b.trang_thai === 'san_sang').length}
              </p>
            </div>
            <div className="p-3 bg-green-400 bg-opacity-30 rounded-lg">
              <CheckCircle className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Bảo dưỡng</p>
              <p className="text-3xl font-bold">
                {busesData.filter(b => b.trang_thai === 'bao_duong').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-400 bg-opacity-30 rounded-lg">
              <Wrench className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Đang sử dụng</p>
              <p className="text-3xl font-bold">
                {busesData.filter(b => b.trang_thai === 'dang_su_dung').length}
              </p>
            </div>
            <div className="p-3 bg-blue-300 bg-opacity-30 rounded-lg">
              <AlertTriangle className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Detail Information Panel */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Chọn xe buýt để xem thông tin chi tiết</h2>
          {selectedBus && (
            <button
              onClick={() => setSelectedBus(null)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="p-6">
          {selectedBus ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Thông tin cơ bản</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã xe:</span>
                    <span className="font-medium text-gray-900">{selectedBus.ma_xe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Biển số:</span>
                    <span className="font-medium text-gray-900">{selectedBus.bien_so}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sức chứa:</span>
                    <span className="font-medium text-gray-900">{selectedBus.suc_chua} chỗ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedBus.trang_thai)}`}>
                      {selectedBus.trang_thai === 'san_sang' ? 'Sẵn sàng' : selectedBus.trang_thai === 'bao_duong' ? 'Bảo dưỡng' : 'Đang sử dụng'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Tài xế phụ trách</h3>
                <div className="space-y-3">
                  {selectedBus.tai_xe ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tên tài xế:</span>
                        <span className="font-medium text-gray-900">{selectedBus.tai_xe.ho_ten}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số điện thoại:</span>
                        <span className="font-medium text-gray-900">{selectedBus.tai_xe.so_dien_thoai}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bằng lái:</span>
                        <span className="font-medium text-gray-900">{selectedBus.tai_xe.so_gplx}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng thái tài xế:</span>
                        <span className="font-medium text-gray-900">
                          {selectedBus.tai_xe.trang_thai === 'san_sang' ? 'Sẵn sàng' : selectedBus.tai_xe.trang_thai === 'dang_chay' ? 'Đang chạy' : 'Nghỉ'}
                        </span>
                      </div>
                    </>
                  ) : selectedBus.ma_tai_xe ? (
                    <div className="text-gray-500 italic">Mã tài xế: {selectedBus.ma_tai_xe} (Chưa có thông tin chi tiết)</div>
                  ) : (
                    <div className="text-gray-500 italic">Chưa phân công tài xế</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Vị trí hiện tại</h3>
                <div className="space-y-3">
                  {selectedBus.vi_tri_hien_tai ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vĩ độ:</span>
                        <span className="font-medium text-gray-900">{selectedBus.vi_tri_hien_tai.vi_do || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kinh độ:</span>
                        <span className="font-medium text-gray-900">{selectedBus.vi_tri_hien_tai.kinh_do || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tốc độ:</span>
                        <span className="font-medium text-gray-900">
                          {selectedBus.vi_tri_hien_tai.toc_do ? `${selectedBus.vi_tri_hien_tai.toc_do} km/h` : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cập nhật:</span>
                        <span className="font-medium text-gray-900">
                          {selectedBus.vi_tri_hien_tai.thoi_gian ? new Date(selectedBus.vi_tri_hien_tai.thoi_gian).toLocaleString('vi-VN') : '-'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500 italic">Chưa có thông tin vị trí</div>
                  )}
                </div>
              </div>
              </div>

              <div className="mt-6 pt-6 border-t flex gap-3">
                <button
                  onClick={() => onEdit(selectedBus)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa thông tin
                </button>
                <button
                  onClick={() => {
                    if (confirm('Bạn có chắc chắn muốn xóa xe buýt này không?')) {
                      onDelete(selectedBus.ma_xe);
                      setSelectedBus(null);
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa xe buýt
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BusIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Chưa chọn xe buýt</p>
              <p className="text-sm">Nhấp vào một xe buýt ở bên dưới để xem thông tin chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* Buses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {busesData.map((bus) => (
          <div 
            key={bus.ma_xe} 
            onClick={() => setSelectedBus(bus)}
            className={`bg-white rounded-xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
              selectedBus?.ma_xe === bus.ma_xe ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BusIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{bus.bien_so}</h3>
                    <p className="text-sm text-gray-600">Mã xe: {bus.ma_xe}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(bus.trang_thai)}`}>
                  {bus.trang_thai === 'san_sang' ? 'Sẵn sàng' : bus.trang_thai === 'bao_duong' ? 'Bảo dưỡng' : 'Đang sử dụng'}
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
                  <p className="font-medium text-gray-900">
                    {bus.trang_thai === 'san_sang' ? 'Sẵn sàng' : bus.trang_thai === 'bao_duong' ? 'Bảo dưỡng' : 'Đang sử dụng'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Tài xế</p>
                  <p className="font-medium text-gray-900">{bus.ma_tai_xe ? `#${bus.ma_tai_xe}` : 'Chưa phân'}</p>
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
            <div className="bg-gray-50 p-4 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
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
          <div className="text-center col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
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