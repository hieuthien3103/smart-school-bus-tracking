const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get performance data
router.get('/performance', async (req, res) => {
  try {
    const { startDate, endDate, schoolId } = req.query;

    // Mock data for now - in real implementation, this would query actual trip/performance data
    const performanceData = [
      { month: 'T1', trips: 1240, onTime: 92, students: 2340, fuel: 1850, cost: 41500000 },
      { month: 'T2', trips: 1180, onTime: 88, students: 2280, fuel: 1720, cost: 38600000 },
      { month: 'T3', trips: 1350, onTime: 94, students: 2520, fuel: 1920, cost: 43200000 },
      { month: 'T4', trips: 1280, onTime: 91, students: 2410, fuel: 1840, cost: 41300000 },
      { month: 'T5', trips: 1420, onTime: 96, students: 2680, fuel: 2010, cost: 45100000 },
      { month: 'T6', trips: 1380, onTime: 93, students: 2590, fuel: 1960, cost: 44000000 }
    ];

    res.json({
      success: true,
      data: performanceData
    });

  } catch (error) {
    console.error('Get performance data error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Get route analysis
router.get('/routes', async (req, res) => {
  try {
    const { schoolId, period } = req.query;

    // In real implementation, this would query actual route performance data
    const routeAnalysis = [
      { route: 'Tuyến A', efficiency: 92, cost: 8500000, distance: 245, students: 156 },
      { route: 'Tuyến B', efficiency: 88, cost: 7200000, distance: 198, students: 134 },
      { route: 'Tuyến C', efficiency: 95, cost: 9800000, distance: 287, students: 178 },
      { route: 'Tuyến D', efficiency: 85, cost: 6900000, distance: 167, students: 112 },
      { route: 'Tuyến E', efficiency: 90, cost: 8100000, distance: 223, students: 145 }
    ];

    res.json({
      success: true,
      data: routeAnalysis
    });

  } catch (error) {
    console.error('Get route analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Get maintenance data
router.get('/maintenance', async (req, res) => {
  try {
    const { schoolId, period } = req.query;

    // In real implementation, this would query maintenance records
    const maintenanceData = [
      { type: 'Bảo trì định kỳ', count: 24, cost: 12500000, color: '#3b82f6' },
      { type: 'Sửa chữa khẩn cấp', count: 8, cost: 8900000, color: '#ef4444' },
      { type: 'Thay thế phụ tùng', count: 15, cost: 15600000, color: '#f59e0b' },
      { type: 'Kiểm tra an toàn', count: 32, cost: 6700000, color: '#10b981' }
    ];

    res.json({
      success: true,
      data: maintenanceData
    });

  } catch (error) {
    console.error('Get maintenance data error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Get driver performance
router.get('/drivers', async (req, res) => {
  try {
    const { schoolId, period } = req.query;

    // Try to get real driver data from database
    let driverPerformance;
    
    try {
      const drivers = await query(`
        SELECT u.name, COUNT(*) as trips 
        FROM drivers d 
        LEFT JOIN users u ON d.user_id = u.id 
        WHERE u.name IS NOT NULL
        GROUP BY d.id, u.name
        LIMIT 5
      `);

      if (drivers && drivers.length > 0) {
        // Use real data with mock performance metrics
        driverPerformance = drivers.map((driver, index) => ({
          name: driver.name,
          trips: Math.floor(Math.random() * 50) + 120, // Random trips between 120-170
          onTime: Math.floor(Math.random() * 10) + 90, // Random on-time % between 90-100
          rating: (Math.random() * 0.5 + 4.5).toFixed(1), // Random rating between 4.5-5.0
          violations: Math.floor(Math.random() * 3) // Random violations 0-2
        }));
      } else {
        // Fallback to mock data
        driverPerformance = [
          { name: 'Nguyễn Văn A', trips: 145, onTime: 96, rating: 4.8, violations: 0 },
          { name: 'Trần Thị B', trips: 138, onTime: 94, rating: 4.7, violations: 1 },
          { name: 'Lê Văn C', trips: 152, onTime: 98, rating: 4.9, violations: 0 },
          { name: 'Phạm Thị D', trips: 141, onTime: 92, rating: 4.6, violations: 2 },
          { name: 'Hoàng Văn E', trips: 149, onTime: 95, rating: 4.8, violations: 0 }
        ];
      }
    } catch (dbError) {
      console.log('Database query failed, using mock data:', dbError.message);
      // Use mock data if database query fails
      driverPerformance = [
        { name: 'Nguyễn Văn A', trips: 145, onTime: 96, rating: 4.8, violations: 0 },
        { name: 'Trần Thị B', trips: 138, onTime: 94, rating: 4.7, violations: 1 },
        { name: 'Lê Văn C', trips: 152, onTime: 98, rating: 4.9, violations: 0 },
        { name: 'Phạm Thị D', trips: 141, onTime: 92, rating: 4.6, violations: 2 },
        { name: 'Hoàng Văn E', trips: 149, onTime: 95, rating: 4.8, violations: 0 }
      ];
    }

    res.json({
      success: true,
      data: driverPerformance
    });

  } catch (error) {
    console.error('Get driver performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

// Get report statistics (summary data)
router.get('/stats', async (req, res) => {
  try {
    // Try to get real data from database
    let stats = {
      totalTrips: 8850,
      activeStudents: 2590,
      totalRevenue: 268500000,
      onTimePercentage: 93,
      totalBuses: 12,
      activeDrivers: 8
    };

    try {
      // Get real counts from database
      const [busCount] = await query('SELECT COUNT(*) as count FROM buses');
      const [driverCount] = await query('SELECT COUNT(*) as count FROM drivers');
      const [studentCount] = await query('SELECT COUNT(*) as count FROM students');

      stats.totalBuses = busCount.count || 12;
      stats.activeDrivers = driverCount.count || 8;
      stats.activeStudents = studentCount.count || 2590;

    } catch (dbError) {
      console.log('Database query failed for stats, using mock data:', dbError.message);
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server nội bộ',
      error: error.message
    });
  }
});

module.exports = router;