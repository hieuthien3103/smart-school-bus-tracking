// DriverApp component - Driver-specific interface
import React from 'react';
import DriverDashboard from '../dashboard/DriverDashboard';
import type { User } from '../../types';

interface DriverAppProps {
  user: User;
  onLogout: () => void;
}

export const DriverApp: React.FC<DriverAppProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Smart School Bus - Tài xế</h1>
              <p className="text-sm text-gray-600">Xin chào, {user?.name}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
      <DriverDashboard driverData={{
        id: parseInt(user.id) || 1,
        name: user.name,
        busId: 1,
        route: 'Tuyến A1'
      }} />
    </div>
  );
};