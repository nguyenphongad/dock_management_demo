/**
 * Util functions cho tính toán dữ liệu biểu đồ - Dùng chung cho tất cả kho
 */

/**
 * Tính toán dữ liệu Time Slot Chart (khung giờ)
 * @param {Array} vehicles - Danh sách xe
 * @returns {Array} Data cho Line Chart
 */
export const calculateTimeSlotData = (vehicles) => {
  const timeSlots = Array.from({ length: 18 }, (_, i) => i + 6); // 6h -> 23h
  
  return timeSlots.map(hour => {
    const count = vehicles.filter(v => {
      if (!v.GateIn) return false;
      const gateInHour = new Date(v.GateIn).getHours();
      return gateInHour === hour;
    }).length;
    
    return { time: `${hour}:00`, count };
  });
};

/**
 * Tính toán sản lượng theo dock (Top 5)
 * @param {Array} vehicles - Danh sách xe
 * @returns {Array} Data cho Bar Chart
 */
export const calculateDockProductionData = (vehicles) => {
  const dockProduction = vehicles.reduce((acc, v) => {
    if (!v.DockName || !v.LoadingEnd) return acc;
    const dockCode = extractDockCodeFromName(v.DockName);
    acc[dockCode] = (acc[dockCode] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(dockProduction)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([dock, count]) => ({ dock, count }));
};

/**
 * Tính toán tốc độ xử lý trung bình (Top 5 nhanh nhất)
 * @param {Array} vehicles - Danh sách xe
 * @returns {Array} Data cho Horizontal Bar Chart
 */
export const calculateSpeedData = (vehicles) => {
  const processingSpeed = vehicles
    .filter(v => v.LoadingStart && v.LoadingEnd)
    .map(v => {
      const dockCode = extractDockCodeFromName(v.DockName);
      const duration = (new Date(v.LoadingEnd) - new Date(v.LoadingStart)) / 60000; // phút
      return { dock: dockCode, duration };
    });

  const avgSpeedByDock = processingSpeed.reduce((acc, item) => {
    if (!acc[item.dock]) {
      acc[item.dock] = { total: 0, count: 0 };
    }
    acc[item.dock].total += item.duration;
    acc[item.dock].count += 1;
    return acc;
  }, {});

  return Object.entries(avgSpeedByDock)
    .map(([dock, data]) => ({
      dock,
      avg: Math.round(data.total / data.count)
    }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 5);
};

/**
 * Tính toán thời gian dock trống (Top 5 trống nhiều nhất)
 * @param {Array} vehicles - Danh sách xe
 * @returns {Array} Data cho Horizontal Bar Chart
 */
export const calculateIdleTimeData = (vehicles) => {
  const TOTAL_WORK_HOURS = 16 * 60; // 16 giờ = 960 phút (6h-22h)
  
  // Tính thời gian hoạt động của từng dock
  const dockBusyTime = vehicles.reduce((acc, v) => {
    if (!v.DockName || !v.LoadingStart || !v.LoadingEnd) return acc;
    const dockCode = extractDockCodeFromName(v.DockName);
    
    const duration = (new Date(v.LoadingEnd) - new Date(v.LoadingStart)) / 60000; // phút
    acc[dockCode] = (acc[dockCode] || 0) + duration;
    return acc;
  }, {});

  // Lấy tất cả dock (A2, A3, B1-B20, C1-C8, D1-D3)
  const allDocks = [
    'A2', 'A3',
    ...Array.from({ length: 20 }, (_, i) => `B${i + 1}`),
    ...Array.from({ length: 8 }, (_, i) => `C${i + 1}`),
    'D1', 'D2', 'D3'
  ];

  return allDocks.map(dock => {
    const busyTime = dockBusyTime[dock] || 0;
    const idleTime = TOTAL_WORK_HOURS - busyTime;
    return {
      dock,
      idleTime: Math.max(0, Math.round(idleTime))
    };
  })
  .sort((a, b) => b.idleTime - a.idleTime)
  .slice(0, 5);
};

/**
 * Tính toán KPIs cơ bản
 * @param {Array} vehicles - Danh sách xe
 * @returns {Object} KPIs data
 */
export const calculateKPIs = (vehicles) => {
  const totalVehicles = vehicles.length;
  
  const vehiclesInWarehouse = vehicles.filter(v => v.GateIn && !v.GateOut).length;
  
  const loadingVehicles = vehicles.filter(v => v.LoadingStart && !v.LoadingEnd).length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = vehicles.filter(v => {
    if (!v.GateOut) return false;
    return new Date(v.GateOut) >= today;
  }).length;

  return {
    totalVehicles,
    vehiclesInWarehouse,
    loadingVehicles,
    completedToday
  };
};

/**
 * Tính toán thông tin cho Vehicle Activity Table
 * @param {Object} vehicle - Thông tin xe
 * @returns {Object} Processed data
 */
export const calculateVehicleActivity = (vehicle) => {
  const waitTime = vehicle.GateIn && vehicle.LoadingStart
    ? Math.round((new Date(vehicle.LoadingStart) - new Date(vehicle.GateIn)) / 60000)
    : 0;
    
  const processingTime = vehicle.LoadingStart && vehicle.LoadingEnd
    ? Math.round((new Date(vehicle.LoadingEnd) - new Date(vehicle.LoadingStart)) / 60000)
    : 0;
  
  const isOnTime = waitTime <= 30 && processingTime <= 45;
  
  const status = vehicle.LoadingEnd 
    ? 'completed' 
    : vehicle.LoadingStart 
      ? 'loading' 
      : vehicle.GateIn 
        ? 'entered' 
        : 'waiting';
  
  const statusLabel = {
    completed: 'Đã hoàn thành',
    loading: 'Đang hoạt động',
    entered: 'Đã vào cổng',
    waiting: 'Chờ'
  }[status];
  
  const compliance = isOnTime 
    ? 'on-time' 
    : vehicle.LoadingEnd 
      ? 'exceeded' 
      : 'near-limit';
  
  const complianceLabel = {
    'on-time': 'Trong định mức',
    'exceeded': 'Vượt định mức',
    'near-limit': 'Gần hết định mức'
  }[compliance];

  return {
    waitTime,
    processingTime,
    isOnTime,
    status,
    statusLabel,
    compliance,
    complianceLabel
  };
};

/**
 * Helper: Trích xuất mã dock từ DockName
 * @param {string} dockName - Tên dock
 * @returns {string} Mã dock (VD: B5, C8, A2)
 */
const extractDockCodeFromName = (dockName) => {
  if (!dockName) return '-';
  
  // Pattern 1: DB5, DC8
  if (/^D[A-D]\d{1,2}$/i.test(dockName)) {
    return dockName.substring(1).toUpperCase();
  }
  
  // Pattern 2: BKD#-Dock[A-D]##
  const pattern2 = dockName.match(/Dock([A-D])(\d{1,2})/i);
  if (pattern2) {
    const letter = pattern2[1].toUpperCase();
    const number = parseInt(pattern2[2], 10);
    return `${letter}${number}`;
  }
  
  // Pattern 3: Direct [A-D]##
  const pattern3 = dockName.match(/^([A-D])(\d{1,2})$/i);
  if (pattern3) {
    const letter = pattern3[1].toUpperCase();
    const number = parseInt(pattern3[2], 10);
    return `${letter}${number}`;
  }
  
  return dockName.match(/[A-D]\d+/)?.[0] || '-';
};

/**
 * Format thời gian hiển thị
 * @param {string|Date} dateTime - Thời gian
 * @returns {string} Formatted time
 */
export const formatTime = (dateTime) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Lưu dữ liệu biểu đồ vào localStorage
 * @param {string} warehouse - Mã kho (BKD, NKD)
 * @param {Object} data - Dữ liệu biểu đồ
 */
export const saveChartDataToStorage = (warehouse, data) => {
  try {
    localStorage.setItem(`dashboard_chart_data_${warehouse}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving chart data:', error);
  }
};

/**
 * Đọc dữ liệu biểu đồ từ localStorage
 * @param {string} warehouse - Mã kho (BKD, NKD)
 * @returns {Object|null} Dữ liệu biểu đồ
 */
export const loadChartDataFromStorage = (warehouse) => {
  try {
    const data = localStorage.getItem(`dashboard_chart_data_${warehouse}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading chart data:', error);
    return null;
  }
};
