import { Plus, Edit, Trash2 } from 'lucide-react';

interface Schedule {
  id: number;
  route: string;
  time: string;
  driver: string;
  bus: string;
  students: number;
  status: string;
}

interface ScheduleManagementProps {
  scheduleData: Schedule[];
  onAdd: () => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: number) => void;
}

const ScheduleManagement = ({ scheduleData, onAdd, onEdit, onDelete }: ScheduleManagementProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Lịch trình</h1>
        <button 
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm lịch trình
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuyến</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giờ khởi hành</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tài xế</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học sinh</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scheduleData.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{schedule.route}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.driver}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.bus}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{schedule.students}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      schedule.status === 'Đang chạy' ? 'bg-green-100 text-green-800' :
                      schedule.status === 'Chờ khởi hành' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {schedule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onEdit(schedule)}
                        className="text-blue-600 hover:text-blue-900" 
                        title="Chỉnh sửa lịch trình"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(schedule.id)}
                        className="text-red-600 hover:text-red-900" 
                        title="Xóa lịch trình"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;