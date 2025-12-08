const STORAGE_KEY = 'dock_vehicles';

/**
 * Lưu danh sách xe vào localStorage và tự động xóa xe đã rời kho
 */
export const saveVehiclesToStorage = (vehicles) => {
  try {
    const filteredVehicles = vehicles
      .filter(v => {
        // Loại bỏ xe đã rời kho (StatusID 1029 hoặc Status "Đã rời kho")
        if (v.DockRegisterStatusID === 1029 || v.DockRegisterStatus === "Đã rời kho") {
          console.log('Removing vehicle from storage (left warehouse):', v.RegNo);
          return false;
        }
        return true;
      })
      .map(v => ({
        ID: v.ID,
        DockName: v.DockName,
        TypeOfDockName: v.TypeOfDockName,
        RegNo: v.RegNo,
        DriverName: v.DriverName,
        DockRegisterStatus: v.DockRegisterStatus,
        DockRegisterStatusID: v.DockRegisterStatusID,
        RegisterDate: v.RegisterDate,
        GateIn: v.GateIn,
        LoadingStart: v.LoadingStart,
        LoadingEnd: v.LoadingEnd,
        GateOut: v.GateOut
      }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredVehicles));
    console.log('Saved vehicles to localStorage:', filteredVehicles.length);
    return true;
  } catch (error) {
    console.error('Error saving vehicles to localStorage:', error);
    return false;
  }
};

/**
 * Lấy danh sách xe từ localStorage
 */
export const getVehiclesFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading vehicles from localStorage:', error);
    return [];
  }
};

/**
 * Cập nhật hoặc thêm xe mới
 */
export const updateVehicleInStorage = (vehicle) => {
  const vehicles = getVehiclesFromStorage();
  const index = vehicles.findIndex(v => v.ID === vehicle.ID);
  
  const filteredVehicle = {
    ID: vehicle.ID,
    DockName: vehicle.DockName,
    TypeOfDockName: vehicle.TypeOfDockName,
    RegNo: vehicle.RegNo,
    DriverName: vehicle.DriverName,
    DockRegisterStatus: vehicle.DockRegisterStatus,
    DockRegisterStatusID: vehicle.DockRegisterStatusID,
    RegisterDate: vehicle.RegisterDate,
    GateIn: vehicle.GateIn,
    LoadingStart: vehicle.LoadingStart,
    LoadingEnd: vehicle.LoadingEnd,
    GateOut: vehicle.GateOut
  };
  
  if (index !== -1) {
    vehicles[index] = filteredVehicle;
  } else {
    vehicles.push(filteredVehicle);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
  return vehicles;
};

/**
 * Xóa xe đã hoàn thành ra khỏi storage
 */
export const cleanupCompletedVehicles = () => {
  const vehicles = getVehiclesFromStorage();
  const now = new Date();
  
  // Giữ lại xe chưa hoàn thành hoặc hoàn thành trong vòng 1 giờ
  const filtered = vehicles.filter(v => {
    if (!v.GateOut) return true;
    const gateOutTime = new Date(v.GateOut);
    const hoursSinceCompletion = (now - gateOutTime) / (1000 * 60 * 60);
    return hoursSinceCompletion < 1;
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
};

/**
 * Xác định cổng dựa trên DockName
 */
export const determineGateFromDock = (dockName) => {
  if (!dockName) return 'CONG_3';
  
  const dockCode = extractDockCode(dockName);
  if (!dockCode) return 'CONG_3';
  
  // Cổng 1: D01-D03, C01-C08
  if (/^D0?[1-3]$/.test(dockCode) || /^C0?[1-8]$/.test(dockCode)) {
    return 'CONG_1';
  }
  
  // Cổng 2: A02, A03, A2, A3, B1-B9
  if (/^A0?[23]$/.test(dockCode) || /^B[1-9]$/.test(dockCode)) {
    return 'CONG_2';
  }
  
  // Cổng 3: B10-B20
  if (/^B(1[0-9]|20)$/.test(dockCode)) {
    return 'CONG_3';
  }
  
  return 'CONG_3'; // Default
};

/**
 * Trích xuất mã dock từ DockName 
 * VD: "DB5" -> "B5" (bỏ chữ D đầu)
 *     "BKD1-DockB10" -> "B10"
 *     "BKD3-DockD01" -> "D1" (pattern cũ)
 *     "A2" -> "A2"
 *     "B1" -> "B1"
 */
export const extractDockCode = (dockName) => {
  if (!dockName) return null;
  
  // Pattern 1: DB5, DC8 -> Bỏ chữ D đầu tiên, lấy B5, C8
  if (/^D[A-D]\d{1,2}$/i.test(dockName)) {
    return dockName.substring(1).toUpperCase(); // Bỏ chữ D đầu
  }
  
  // Pattern 2: BKD#-Dock[A-D]## (VD: BKD1-DockB10, BKD3-DockD01)
  const pattern2 = dockName.match(/Dock([A-D])(\d{1,2})/i);
  if (pattern2) {
    const letter = pattern2[1].toUpperCase();
    const number = parseInt(pattern2[2], 10); // Parse để bỏ số 0 đầu
    return `${letter}${number}`;
  }
  
  // Pattern 3: Direct format [A-D]## (VD: B10, A2, D1)
  const pattern3 = dockName.match(/^([A-D])(\d{1,2})$/i);
  if (pattern3) {
    const letter = pattern3[1].toUpperCase();
    const number = parseInt(pattern3[2], 10);
    return `${letter}${number}`;
  }
  
  // Pattern 4: [A-D]0## format (VD: A02, D01)
  const pattern4 = dockName.match(/^([A-D])0?(\d{1,2})$/i);
  if (pattern4) {
    const letter = pattern4[1].toUpperCase();
    const number = parseInt(pattern4[2], 10);
    return `${letter}${number}`;
  }
  
  console.warn('Cannot extract dock code from:', dockName);
  return null;
};

/**
 * Phân loại xe theo trạng thái dựa trên thời gian và xóa xe đã rời kho
 */
export const categorizeVehiclesByTime = (vehicles) => {
  const now = new Date();
  
  // Lọc bỏ xe đã rời kho
  const activeVehicles = vehicles.filter(v => 
    v.DockRegisterStatusID !== 1029 && 
    v.DockRegisterStatus !== "Đã rời kho"
  );
  
  return {
    waiting: activeVehicles.filter(v => {
      const gateIn = v.GateIn ? new Date(v.GateIn) : null;
      
      // Chưa vào cổng
      return !gateIn || gateIn > now;
    }),
    
    entering: activeVehicles.filter(v => {
      const gateIn = v.GateIn ? new Date(v.GateIn) : null;
      const loadingStart = v.LoadingStart ? new Date(v.LoadingStart) : null;
      
      // ĐÃ VÀO CỔNG nhưng chưa có LoadingStart hoặc LoadingStart trong tương lai
      if (gateIn && gateIn <= now && (!loadingStart || loadingStart > now)) {
        const minutesSinceGateIn = (now - gateIn) / (1000 * 60);
        // Chỉ show animation trong 5 phút đầu sau khi vào cổng
        if (minutesSinceGateIn < 5) {
          return true;
        }
      }
      
      // Đang di chuyển từ cổng vào dock (có cả GateIn và LoadingStart)
      if (gateIn && loadingStart && now >= gateIn && now < loadingStart) {
        return true;
      }
      
      return false;
    }),
    
    loading: activeVehicles.filter(v => {
      const loadingStart = v.LoadingStart ? new Date(v.LoadingStart) : null;
      const loadingEnd = v.LoadingEnd ? new Date(v.LoadingEnd) : null;
      
      // Đang trong quá trình loading
      return loadingStart && loadingStart <= now && (!loadingEnd || loadingEnd > now);
    }),
    
    exiting: activeVehicles.filter(v => {
      const loadingEnd = v.LoadingEnd ? new Date(v.LoadingEnd) : null;
      const gateOut = v.GateOut ? new Date(v.GateOut) : null;
      
      // Đang di chuyển từ dock ra cổng
      if (loadingEnd && gateOut && now >= loadingEnd && now < gateOut) {
        const minutesSinceLoadingEnd = (now - loadingEnd) / (1000 * 60);
        // Chỉ show animation trong 5 phút sau khi hoàn thành loading
        return minutesSinceLoadingEnd < 5;
      }
      
      return false;
    }),
    
    completed: activeVehicles.filter(v => {
      const gateOut = v.GateOut ? new Date(v.GateOut) : null;
      
      // Đã ra cổng nhưng chưa rời kho
      return gateOut && gateOut <= now;
    })
  };
};

/**
 * Tính thời gian animation dựa trên thời gian thực
 */
export const calculateAnimationDuration = (vehicle) => {
  const now = new Date();
  
  // Animation vào dock: từ GateIn đến LoadingStart (hoặc giả định)
  if (vehicle.GateIn) {
    const gateIn = new Date(vehicle.GateIn);
    
    // Nếu chưa có LoadingStart, giả định xe sẽ đến dock sau 3 phút
    let loadingStart;
    if (vehicle.LoadingStart) {
      loadingStart = new Date(vehicle.LoadingStart);
    } else {
      // Giả định: 3 phút sau khi vào cổng sẽ đến dock
      loadingStart = new Date(gateIn.getTime() + 3 * 60 * 1000);
    }
    
    if (now >= gateIn && now < loadingStart) {
      // Đang trong quá trình di chuyển vào dock
      const totalDuration = loadingStart - gateIn;
      const elapsed = now - gateIn;
      const remaining = loadingStart - now;
      
      return {
        phase: 'entering',
        duration: Math.max(Math.min(remaining, 4000), 1000), // 1-4 giây
        progress: elapsed / totalDuration,
        estimatedArrival: loadingStart
      };
    }
  }
  
  // Animation ra cổng: từ LoadingEnd đến GateOut
  if (vehicle.LoadingEnd && vehicle.GateOut) {
    const loadingEnd = new Date(vehicle.LoadingEnd);
    const gateOut = new Date(vehicle.GateOut);
    
    if (now >= loadingEnd && now < gateOut) {
      // Đang trong quá trình di chuyển ra cổng
      const totalDuration = gateOut - loadingEnd;
      const elapsed = now - loadingEnd;
      const remaining = gateOut - now;
      
      return {
        phase: 'exiting',
        duration: Math.max(Math.min(remaining, 4000), 1000), // 1-4 giây
        progress: elapsed / totalDuration
      };
    }
  }
  
  // Đang đỗ tại dock
  if (vehicle.LoadingStart && !vehicle.LoadingEnd) {
    return {
      phase: 'docking',
      duration: 0,
      progress: 1
    };
  }
  
  // Mặc định: animation 4 giây
  return {
    phase: 'entering',
    duration: 4000,
    progress: 0
  };
};
