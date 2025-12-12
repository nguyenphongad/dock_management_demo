/**
 * Tính toán vị trí thực tế của các dock trên màn hình
 * @returns {Object} Object chứa vị trí các dock và gates
 */
export const calculateDockPositions = () => {
  const positions = {
    gates: {},
    docks: {},
    roads: {}
  };

  try {
    // Lấy container chính
    const mapContent = document.querySelector('.dock-map__content');
    if (!mapContent) {
      console.warn('⚠️ Dock map content not found, using fallback positions');
      // FALLBACK POSITIONS
      return {
        gates: {
          CONG_1: { x: 50, y: 500, width: 60, height: 40 },
          CONG_2: { x: 950, y: 500, width: 60, height: 40 },
          CONG_3: { x: 950, y: 50, width: 60, height: 40 },
          GATE_NKD: { x: 900, y: 600, width: 60, height: 40 }
        },
        docks: {
          // A10 docks
          C1: { x: 800, y: 150, width: 60, height: 100, area: 'A10' },
          C2: { x: 740, y: 150, width: 60, height: 100, area: 'A10' },
          C3: { x: 680, y: 150, width: 60, height: 100, area: 'A10' },
          C4: { x: 620, y: 150, width: 60, height: 100, area: 'A10' },
          C5: { x: 560, y: 150, width: 60, height: 100, area: 'A10' },
          C6: { x: 500, y: 150, width: 60, height: 100, area: 'A10' },
          C7: { x: 440, y: 150, width: 60, height: 100, area: 'A10' },
          C8: { x: 380, y: 150, width: 60, height: 100, area: 'A10' },
          D1: { x: 900, y: 200, width: 100, height: 60, area: 'A10' },
          D2: { x: 900, y: 150, width: 100, height: 60, area: 'A10' },
          D3: { x: 900, y: 100, width: 100, height: 60, area: 'A10' },
          // A8 docks
          B1: { x: 850, y: 400, width: 60, height: 100, area: 'A8' },
          B2: { x: 810, y: 400, width: 60, height: 100, area: 'A8' },
          B3: { x: 770, y: 400, width: 60, height: 100, area: 'A8' },
          B4: { x: 730, y: 400, width: 60, height: 100, area: 'A8' },
          B5: { x: 690, y: 400, width: 60, height: 100, area: 'A8' },
          // ... thêm B6-B20
          A2: { x: 950, y: 430, width: 100, height: 60, area: 'A8' },
          A3: { x: 950, y: 370, width: 100, height: 60, area: 'A8' }
        },
        roads: {
          DUONG_KINH_DO: { x: 500, y: 480, width: 800, height: 40 },
          DUONG_TRANG_VANG: { x: 500, y: 80, width: 800, height: 40 }
        }
      };
    }

    const contentRect = mapContent.getBoundingClientRect();
    console.log('📐 Map content rect:', contentRect);

    // Tính vị trí các cổng
    const gates = document.querySelectorAll('.gate-exit');
    gates.forEach(gate => {
      const gateRect = gate.getBoundingClientRect();
      const gateText = gate.textContent.trim();
      
      // Map tên cổng
      let gateName = gateText;
      if (gateText.includes('CỔNG 1')) {
        gateName = 'CONG_1';
      } else if (gateText.includes('CỔNG 2')) {
        gateName = 'CONG_2';
      } else if (gateText.includes('CỔNG 3')) {
        gateName = 'CONG_3';
      }
      
      // Tính vị trí tương đối so với container
      const relativeX = gateRect.left + gateRect.width / 2 - contentRect.left;
      const relativeY = gateRect.top + gateRect.height / 2 - contentRect.top;
      
      positions.gates[gateName] = {
        x: relativeX,
        y: relativeY,
        width: gateRect.width,
        height: gateRect.height
      };
    });

    // Tính vị trí các dock A10 (C8-C1, D3-D1)
    const a10Docks = document.querySelectorAll('.dock-area--a10 .dock-item');
    a10Docks.forEach(dock => {
      const dockRect = dock.getBoundingClientRect();
      // Tìm label trong hoặc ngoài dock
      const dockLabel = dock.querySelector('.dock-item__label span') || 
                       dock.parentElement.querySelector('.dock-item__label-outside');
      
      if (dockLabel) {
        const dockCode = dockLabel.textContent.trim();
        
        const relativeX = dockRect.left + dockRect.width / 2 - contentRect.left;
        const relativeY = dockRect.top + dockRect.height / 2 - contentRect.top;
        
        positions.docks[dockCode] = {
          x: relativeX,
          y: relativeY,
          width: dockRect.width,
          height: dockRect.height,
          area: 'A10'
        };
      }
    });

    // Tính vị trí các dock A8 (B1-B20, A2-A3)
    const a8Docks = document.querySelectorAll('.dock-area--a8 .dock-item');
    a8Docks.forEach(dock => {
      const dockRect = dock.getBoundingClientRect();
      // Tìm label trong hoặc ngoài dock
      const dockLabel = dock.querySelector('.dock-item__label span') || 
                       dock.parentElement.querySelector('.dock-item__label-outside');
      
      if (dockLabel) {
        const dockCode = dockLabel.textContent.trim();
        
        const relativeX = dockRect.left + dockRect.width / 2 - contentRect.left;
        const relativeY = dockRect.top + dockRect.height / 2 - contentRect.top;
        
        positions.docks[dockCode] = {
          x: relativeX,
          y: relativeY,
          width: dockRect.width,
          height: dockRect.height,
          area: 'A8'
        };
      }
    });

    // Tính vị trí đường đi (roads)
    const roads = {
      DUONG_TRUNG_THU: document.querySelector('.duong-trung-thu'),
      DUONG_KINH_DO: document.querySelector('.duong-kinh-do'),
      DUONG_LU: document.querySelector('.duong-lu'),
      DUONG_TRANG_VANG: document.querySelector('.duong-trang-vang')
    };

    Object.entries(roads).forEach(([roadName, roadElement]) => {
      if (roadElement) {
        const roadRect = roadElement.getBoundingClientRect();
        const relativeX = roadRect.left + roadRect.width / 2 - contentRect.left;
        const relativeY = roadRect.top + roadRect.height / 2 - contentRect.top;
        
        positions.roads[roadName] = {
          x: relativeX,
          y: relativeY,
          width: roadRect.width,
          height: roadRect.height
        };
      }
    });

    console.log('📍 Calculated positions:', {
      gates: Object.keys(positions.gates).length,
      docks: Object.keys(positions.docks).length,
      roads: Object.keys(positions.roads).length
    });

  } catch (error) {
    console.error('❌ Error calculating dock positions:', error);
  }

  return positions;
};

/**
 * Lấy vị trí trống trong dock (position 1 hoặc 2)
 */
export const getAvailablePosition = (dockCode, occupiedPositions) => {
  const occupied = occupiedPositions.filter(pos => pos.dock === dockCode);
  
  if (occupied.length === 0) return 1;
  if (occupied.some(pos => pos.position === 1) && !occupied.some(pos => pos.position === 2)) {
    return 2;
  }
  if (!occupied.some(pos => pos.position === 1)) return 1;
  
  return null;
};

/**
 * Tính toán offset cho 2 slot trong dock (slot 1 bên trái, slot 2 bên phải)
 */
export const calculatePositionOffset = (position, dockPos, dockCode) => {
  if (!dockPos) return { x: 0, y: 0 };
  
  // Xác định hướng dock
  const isHorizontalDock = /^[AD][1-3]$/.test(dockCode); // A2, A3, D1, D2, D3
  const isVerticalDock = /^[BC]\d+/.test(dockCode); // B1-B20, C1-C8
  
  if (isHorizontalDock) {
    // Dock NGANG: slot 1 phía TRÊN, slot 2 phía DƯỚI
    const offsetY = position === 1 ? -15 : 15; // Cách nhau 30px theo chiều dọc
    return {
      x: dockPos.x,
      y: dockPos.y + offsetY
    };
  } else if (isVerticalDock) {
    // Dock DỌC: slot 1 bên TRÁI, slot 2 bên PHẢI
    const offsetX = position === 1 ? -20 : 20; // Cách nhau 40px theo chiều ngang
    return {
      x: dockPos.x + offsetX,
      y: dockPos.y
    };
  }
  
  // Default
  return { x: dockPos.x, y: dockPos.y };
};

/**
 * Tính toán đường đi cho xe vào dock
 */
export const createPathToDock = (fromGate, toDock, positions, targetPosition = 1) => {
  const path = [];
  
  const gatePos = positions.gates[fromGate];
  const dockPos = positions.docks[toDock];
  
  if (!gatePos || !dockPos) {
    console.error('❌ Gate or dock position not found:', fromGate, toDock);
    return path;
  }

  // Tính vị trí cuối cùng với offset theo slot
  const finalPos = calculatePositionOffset(targetPosition, dockPos, toDock);
  
  // Điểm tiếp cận dock
  const isHorizontalDock = /^[AD][1-3]$/.test(toDock);
  const isVerticalDock = /^[BC]\d+/.test(toDock);
  const isA10Dock = /^[CD]\d+/.test(toDock);
  
  let approachPoint;
  const approachDistance = 100; // Tăng khoảng cách tiếp cận
  
  if (isHorizontalDock) {
    approachPoint = {
      x: finalPos.x - approachDistance,
      y: finalPos.y
    };
  } else if (isVerticalDock) {
    approachPoint = {
      x: finalPos.x,
      y: isA10Dock ? finalPos.y - approachDistance : finalPos.y + approachDistance
    };
  }

  // Xây dựng path chi tiết
  if ((fromGate === 'CONG_1' || fromGate === 'CONG_2') && 
      (toDock.startsWith('B') || toDock.startsWith('A'))) {
    
    const roadY = positions.roads.DUONG_KINH_DO?.y || (dockPos.y + 60);
    
    path.push({ x: gatePos.x, y: gatePos.y });
    path.push({ x: gatePos.x, y: roadY });
    path.push({ x: approachPoint.x, y: roadY });
    path.push(approachPoint);
    path.push(finalPos);
  }
  else if (fromGate === 'CONG_3' && 
           (toDock.startsWith('C') || toDock.startsWith('D'))) {
    
    const roadY = positions.roads.DUONG_TRANG_VANG?.y || (dockPos.y - 60);
    
    path.push({ x: gatePos.x, y: gatePos.y });
    path.push({ x: gatePos.x, y: roadY });
    path.push({ x: approachPoint.x, y: roadY });
    path.push(approachPoint);
    path.push(finalPos);
  }

  console.log(`📍 Path to ${toDock} slot ${targetPosition}:`, path.length, 'points');
  return path;
};

/**
 * Tạo đường đi RA khỏi dock với ĐẦU XE (tiến ra)
 */
export const createPathFromDock = (fromDock, toGate, positions, fromPosition = 1) => {
  const path = [];
  
  const dockPos = positions.docks[fromDock];
  const gatePos = positions.gates[toGate];
  
  if (!dockPos || !gatePos) {
    console.error('Dock or gate position not found:', fromDock, toGate);
    return path;
  }

  const startPos = calculatePositionOffset(fromPosition, dockPos, fromDock);
  
  // Điểm thoát ra khỏi dock (tiến ra trước)
  const exitDistance = 80;
  const isVerticalDock = /^[BC]\d+/.test(fromDock);
  const isA10Dock = /^[CD]\d+/.test(fromDock);
  
  let exitPoint;
  if (isVerticalDock) {
    exitPoint = {
      x: startPos.x,
      y: isA10Dock ? startPos.y - exitDistance : startPos.y + exitDistance
    };
  } else {
    exitPoint = {
      x: startPos.x - exitDistance,
      y: startPos.y
    };
  }

  // Dock B hoặc A -> CỔNG 1 hoặc CỔNG 2
  if ((fromDock.startsWith('B') || fromDock.startsWith('A')) &&
      (toGate === 'CONG_1' || toGate === 'CONG_2')) {
    
    const roadY = positions.roads.DUONG_KINH_DO?.y || (dockPos.y + 60);
    
    if (fromDock.startsWith('B')) {
      path.push(startPos); // Từ dock
      path.push(exitPoint); // Tiến ra khỏi dock
      path.push({ x: exitPoint.x, y: roadY }); // Xuống đường số 8
      path.push({ x: gatePos.x, y: roadY }); // Đi dọc đường số 8
      path.push({ x: gatePos.x, y: gatePos.y }); // Ra cổng
    } else if (fromDock.startsWith('A')) {
      const turnPointX = dockPos.x - 50;
      
      path.push(startPos);
      path.push(exitPoint); // Tiến ra
      path.push({ x: turnPointX, y: exitPoint.y });
      path.push({ x: turnPointX, y: roadY });
      path.push({ x: gatePos.x, y: roadY });
      path.push({ x: gatePos.x, y: gatePos.y });
    }
  }
  
  // Dock C hoặc D -> CỔNG 3
  else if ((fromDock.startsWith('C') || fromDock.startsWith('D')) &&
           toGate === 'CONG_3') {
    
    const roadY = positions.roads.DUONG_TRANG_VANG?.y || (dockPos.y - 60);
    
    if (fromDock.startsWith('C')) {
      path.push(startPos);
      path.push(exitPoint); // Tiến ra
      path.push({ x: exitPoint.x, y: roadY });
      path.push({ x: gatePos.x, y: roadY });
      path.push({ x: gatePos.x, y: gatePos.y });
    } else if (fromDock.startsWith('D')) {
      const turnPointX = dockPos.x + 50;
      
      path.push(startPos);
      path.push(exitPoint); // Tiến ra
      path.push({ x: turnPointX, y: exitPoint.y });
      path.push({ x: turnPointX, y: roadY });
      path.push({ x: gatePos.x, y: roadY });
      path.push({ x: gatePos.x, y: gatePos.y });
    }
  }

  console.log(`📍 Exit path (forward): ${fromDock} -> ${toGate}`, path);
  return path;
};

/**
 * Tạo đường đi hoàn chỉnh với xử lý vị trí
 */
export const createCompletePath = (fromGate, dock, toGate, positions, occupiedPositions = [], requestedPosition = null) => {
  const targetPosition = requestedPosition || getAvailablePosition(dock, occupiedPositions);
  
  if (targetPosition === null) {
    console.warn('⚠️ Dock is full:', dock);
    return {
      entering: [],
      exiting: [],
      position: null
    };
  }

  const enteringPath = createPathToDock(fromGate, dock, positions, targetPosition);
  const exitingPath = createPathFromDock(dock, toGate, positions, targetPosition);

  console.log(`✅ Complete path for ${dock} slot ${targetPosition} created`);

  return {
    entering: enteringPath,
    exiting: exitingPath,
    position: targetPosition
  };
};

/**
 * Làm mịn đường đi bằng interpolation
 */
export const smoothPath = (waypoints, pointsPerSegment = 10) => {
  if (waypoints.length < 2) return waypoints;
  
  const smoothed = [];
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    
    for (let j = 0; j < pointsPerSegment; j++) {
      const t = j / pointsPerSegment;
      smoothed.push({
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t
      });
    }
  }
  
  smoothed.push(waypoints[waypoints.length - 1]);
  return smoothed;
};

/**
 * Hook để recalculate positions khi window resize
 */
export const useDockPositions = () => {
  const [positions, setPositions] = React.useState(null);

  React.useEffect(() => {
    const updatePositions = () => {
      const newPositions = calculateDockPositions();
      setPositions(newPositions);
    };

    // Initial calculation
    setTimeout(updatePositions, 500); // Đợi DOM render xong

    // Recalculate on resize
    window.addEventListener('resize', updatePositions);
    
    return () => {
      window.removeEventListener('resize', updatePositions);
    };
  }, []);

  return positions;
};
