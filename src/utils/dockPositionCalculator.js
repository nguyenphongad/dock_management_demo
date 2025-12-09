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
      console.warn('Dock map content not found');
      return positions;
    }

    const contentRect = mapContent.getBoundingClientRect();

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

  } catch (error) {
    console.error('Error calculating dock positions:', error);
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
 * Tính toán offset cho vị trí trong dock
 */
export const calculatePositionOffset = (position, dockPos) => {
  if (!dockPos) return { x: 0, y: 0 };
  
  const offsetX = position === 1 ? -15 : 15;
  
  return {
    x: dockPos.x + offsetX,
    y: dockPos.y
  };
};

/**
 * Xác định đường đi chính dựa trên dock
 */
const getRoadForDock = (dockCode) => {
  // Tất cả dock đều đi trên ĐƯỜNG SỐ 8 - VSIP 1
  if (dockCode.startsWith('B') || dockCode.startsWith('A')) {
    return 'DUONG_SO_8_DUOI'; // Đường số 8 phía dưới (cho dock B và A)
  }
  if (dockCode.startsWith('C') || dockCode.startsWith('D')) {
    return 'DUONG_SO_8_TREN'; // Đường số 8 phía trên (cho dock C và D)
  }
  return 'DUONG_SO_8_DUOI';
};

/**
 * Tạo đường đi từ cổng đến dock với vị trí cụ thể
 */
export const createPathToDock = (fromGate, toDock, positions, targetPosition = 1) => {
  const path = [];
  
  const gatePos = positions.gates[fromGate];
  const dockPos = positions.docks[toDock];
  
  if (!gatePos || !dockPos) {
    console.error('Gate or dock position not found:', fromGate, toDock);
    console.log('Available gates:', Object.keys(positions.gates));
    console.log('Available docks:', Object.keys(positions.docks));
    return path;
  }

  const finalPos = calculatePositionOffset(targetPosition, dockPos);
  const roadType = getRoadForDock(toDock);

  // CỔNG 1 hoặc CỔNG 2 -> Dock B (B1-B20) hoặc A (A2, A3)
  if ((fromGate === 'CONG_1' || fromGate === 'CONG_2') && 
      (toDock.startsWith('B') || toDock.startsWith('A'))) {
    
    // Lấy vị trí đường số 8 phía dưới dock
    const roadY = positions.roads.DUONG_KINH_DO?.y || (dockPos.y + 60);
    
    if (toDock.startsWith('B')) {
      // Dock B: Đi thẳng trên đường số 8, rồi rẽ lên dock
      path.push({ x: gatePos.x, y: gatePos.y }); // Từ cổng
      path.push({ x: gatePos.x, y: roadY }); // Xuống đường số 8
      path.push({ x: finalPos.x, y: roadY }); // Đi dọc đường số 8
      path.push({ x: finalPos.x, y: finalPos.y }); // Rẽ lên dock
    } else if (toDock.startsWith('A')) {
      // Dock A2, A3: Đi trên đường số 8, rồi rẽ trái vào dock
      const turnPointX = dockPos.x - 30; // Điểm rẽ trước khi vào dock
      
      path.push({ x: gatePos.x, y: gatePos.y }); // Từ cổng
      path.push({ x: gatePos.x, y: roadY }); // Xuống đường số 8
      path.push({ x: turnPointX, y: roadY }); // Đi dọc đường số 8
      path.push({ x: turnPointX, y: finalPos.y }); // Rẽ trái
      path.push({ x: finalPos.x, y: finalPos.y }); // Vào dock
    }
  }
  
  // CỔNG 3 -> Dock C (C1-C8) hoặc D (D1, D2, D3)
  else if (fromGate === 'CONG_3' && 
           (toDock.startsWith('C') || toDock.startsWith('D'))) {
    
    // Lấy vị trí đường số 8 phía trên dock (ĐƯỜNG TRẮNG VÀNG)
    const roadY = positions.roads.DUONG_TRANG_VANG?.y || (dockPos.y - 60);
    
    if (toDock.startsWith('C')) {
      // Dock C: Đi thẳng trên đường số 8, rồi rẽ xuống dock
      path.push({ x: gatePos.x, y: gatePos.y }); // Từ cổng
      path.push({ x: gatePos.x, y: roadY }); // Lên đường số 8
      path.push({ x: finalPos.x, y: roadY }); // Đi dọc đường số 8
      path.push({ x: finalPos.x, y: finalPos.y }); // Rẽ xuống dock
    } else if (toDock.startsWith('D')) {
      // Dock D1, D2, D3: Đi trên đường số 8, rồi rẽ trái vào dock
      const turnPointX = dockPos.x + 30; // Điểm rẽ trước khi vào dock
      
      path.push({ x: gatePos.x, y: gatePos.y }); // Từ cổng
      path.push({ x: gatePos.x, y: roadY }); // Lên đường số 8
      path.push({ x: turnPointX, y: roadY }); // Đi dọc đường số 8
      path.push({ x: turnPointX, y: finalPos.y }); // Rẽ trái
      path.push({ x: finalPos.x, y: finalPos.y }); // Vào dock
    }
  }
  
  // Fallback: đường đi mặc định nếu không khớp case nào
  else {
    console.warn('Using fallback path for:', fromGate, '->', toDock);
    const roadY = dockPos.area === 'A8' 
      ? (positions.roads.DUONG_KINH_DO?.y || (dockPos.y + 50))
      : (positions.roads.DUONG_TRANG_VANG?.y || (dockPos.y - 50));
    
    path.push({ x: gatePos.x, y: gatePos.y });
    path.push({ x: gatePos.x, y: roadY });
    path.push({ x: finalPos.x, y: roadY });
    path.push({ x: finalPos.x, y: finalPos.y });
  }

  console.log(`📍 Path created: ${fromGate} -> ${toDock}`, path);
  return path;
};

/**
 * Tạo đường đi từ dock ra cổng với vị trí cụ thể
 */
export const createPathFromDock = (fromDock, toGate, positions, fromPosition = 1) => {
  const path = [];
  
  const dockPos = positions.docks[fromDock];
  const gatePos = positions.gates[toGate];
  
  if (!dockPos || !gatePos) {
    console.error('Dock or gate position not found:', fromDock, toGate);
    console.log('Available docks:', Object.keys(positions.docks));
    console.log('Available gates:', Object.keys(positions.gates));
    return path;
  }

  const startPos = calculatePositionOffset(fromPosition, dockPos);
  const roadType = getRoadForDock(fromDock);

  // Dock B hoặc A -> CỔNG 1 hoặc CỔNG 2
  if ((fromDock.startsWith('B') || fromDock.startsWith('A')) &&
      (toGate === 'CONG_1' || toGate === 'CONG_2')) {
    
    const roadY = positions.roads.DUONG_KINH_DO?.y || (dockPos.y + 60);
    
    if (fromDock.startsWith('B')) {
      // Từ dock B: Xuống đường số 8, rồi ra cổng
      path.push({ x: startPos.x, y: startPos.y }); // Từ dock
      path.push({ x: startPos.x, y: roadY }); // Xuống đường số 8
      path.push({ x: gatePos.x, y: roadY }); // Đi dọc đường số 8
      path.push({ x: gatePos.x, y: gatePos.y }); // Ra cổng
    } else if (fromDock.startsWith('A')) {
      // Từ dock A: Ra đường, lên đường số 8, rồi ra cổng
      const turnPointX = dockPos.x - 30;
      
      path.push({ x: startPos.x, y: startPos.y }); // Từ dock
      path.push({ x: turnPointX, y: startPos.y }); // Ra khỏi dock
      path.push({ x: turnPointX, y: roadY }); // Lên đường số 8
      path.push({ x: gatePos.x, y: roadY }); // Đi dọc đường số 8
      path.push({ x: gatePos.x, y: gatePos.y }); // Ra cổng
    }
  }
  
  // Dock C hoặc D -> CỔNG 3
  else if ((fromDock.startsWith('C') || fromDock.startsWith('D')) &&
           toGate === 'CONG_3') {
    
    const roadY = positions.roads.DUONG_TRANG_VANG?.y || (dockPos.y - 60);
    
    if (fromDock.startsWith('C')) {
      // Từ dock C: Lên đường số 8, rồi ra cổng
      path.push({ x: startPos.x, y: startPos.y }); // Từ dock
      path.push({ x: startPos.x, y: roadY }); // Lên đường số 8
      path.push({ x: gatePos.x, y: roadY }); // Đi dọc đường số 8
      path.push({ x: gatePos.x, y: gatePos.y }); // Ra cổng
    } else if (fromDock.startsWith('D')) {
      // Từ dock D: Ra đường, lên đường số 8, rồi ra cổng
      const turnPointX = dockPos.x + 30;
      
      path.push({ x: startPos.x, y: startPos.y }); // Từ dock
      path.push({ x: turnPointX, y: startPos.y }); // Ra khỏi dock
      path.push({ x: turnPointX, y: roadY }); // Lên đường số 8
      path.push({ x: gatePos.x, y: roadY }); // Đi dọc đường số 8
      path.push({ x: gatePos.x, y: gatePos.y }); // Ra cổng
    }
  }
  
  // Fallback
  else {
    console.warn('Using fallback exit path for:', fromDock, '->', toGate);
    const roadY = dockPos.area === 'A8'
      ? (positions.roads.DUONG_KINH_DO?.y || (dockPos.y + 50))
      : (positions.roads.DUONG_TRANG_VANG?.y || (dockPos.y - 50));
    
    path.push({ x: startPos.x, y: startPos.y });
    path.push({ x: startPos.x, y: roadY });
    path.push({ x: gatePos.x, y: roadY });
    path.push({ x: gatePos.x, y: gatePos.y });
  }

  console.log(`📍 Exit path created: ${fromDock} -> ${toGate}`, path);
  return path;
};

/**
 * Tạo đường đi hoàn chỉnh với xử lý vị trí
 */
export const createCompletePath = (fromGate, dock, toGate, positions, occupiedPositions = []) => {
  const targetPosition = getAvailablePosition(dock, occupiedPositions);
  
  if (targetPosition === null) {
    console.warn('Dock is full:', dock);
    return {
      entering: [],
      exiting: [],
      position: null
    };
  }

  return {
    entering: createPathToDock(fromGate, dock, positions, targetPosition),
    exiting: createPathFromDock(dock, toGate, positions, targetPosition),
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
