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
 * Tính toán offset cho 2 slot trong dock (slot 1 bên trái, slot 2 bên phải)
 */
export const calculatePositionOffset = (position, dockPos, dockCode) => {
  if (!dockPos) return { x: 0, y: 0 };
  
  // Xác định hướng dock (vertical hoặc horizontal)
  const isVerticalDock = /^[BC]\d+/.test(dockCode); // B và C là vertical
  const isHorizontalDock = /^[AD]\d+/.test(dockCode); // A và D là horizontal
  
  if (isVerticalDock) {
    // Dock dọc: slot 1 bên trái, slot 2 bên phải
    const offsetX = position === 1 ? -20 : 20; // Cách nhau 40px
    return {
      x: dockPos.x + offsetX,
      y: dockPos.y
    };
  } else if (isHorizontalDock) {
    // Dock ngang: slot 1 phía trên, slot 2 phía dưới
    const offsetY = position === 1 ? -15 : 15; // Cách nhau 30px
    return {
      x: dockPos.x,
      y: dockPos.y + offsetY
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
    console.error('Gate or dock position not found:', fromGate, toDock);
    return path;
  }

  const finalPos = calculatePositionOffset(targetPosition, dockPos, toDock);
  
  // Điểm dừng trước dock (để chuẩn bị lùi)
  const approachDistance = 80; // Dừng cách dock 80px để lùi
  const isVerticalDock = /^[BC]\d+/.test(toDock);
  const isA10Dock = /^[CD]\d+/.test(toDock);
  
  let approachPoint;
  if (isVerticalDock) {
    // Dock dọc: dừng phía dưới (A8) hoặc phía trên (A10)
    approachPoint = {
      x: finalPos.x,
      y: isA10Dock ? finalPos.y - approachDistance : finalPos.y + approachDistance
    };
  } else {
    // Dock ngang (A2, A3, D1-D3): dừng phía trái
    approachPoint = {
      x: finalPos.x - approachDistance,
      y: finalPos.y
    };
  }

  // CỔNG 1 hoặc CỔNG 2 -> Dock B hoặc A
  if ((fromGate === 'CONG_1' || fromGate === 'CONG_2') && 
      (toDock.startsWith('B') || toDock.startsWith('A'))) {
    
    const roadY = positions.roads.DUONG_KINH_DO?.y || (dockPos.y + 60);
    
    if (toDock.startsWith('B')) {
      path.push({ x: gatePos.x, y: gatePos.y }); // Từ cổng
      path.push({ x: gatePos.x, y: roadY }); // Xuống đường số 8
      path.push({ x: approachPoint.x, y: roadY }); // Đi dọc đường số 8
      path.push(approachPoint); // Đến điểm dừng trước dock
      path.push(finalPos); // Lùi vào dock
    } else if (toDock.startsWith('A')) {
      const turnPointX = dockPos.x - 50;
      
      path.push({ x: gatePos.x, y: gatePos.y });
      path.push({ x: gatePos.x, y: roadY });
      path.push({ x: turnPointX, y: roadY });
      path.push(approachPoint); // Đến điểm dừng
      path.push(finalPos); // Lùi vào dock
    }
  }
  
  // CỔNG 3 -> Dock C hoặc D
  else if (fromGate === 'CONG_3' && 
           (toDock.startsWith('C') || toDock.startsWith('D'))) {
    
    const roadY = positions.roads.DUONG_TRANG_VANG?.y || (dockPos.y - 60);
    
    if (toDock.startsWith('C')) {
      path.push({ x: gatePos.x, y: gatePos.y });
      path.push({ x: gatePos.x, y: roadY });
      path.push({ x: approachPoint.x, y: roadY });
      path.push(approachPoint); // Đến điểm dừng
      path.push(finalPos); // Lùi vào dock
    } else if (toDock.startsWith('D')) {
      const turnPointX = dockPos.x + 50;
      
      path.push({ x: gatePos.x, y: gatePos.y });
      path.push({ x: gatePos.x, y: roadY });
      path.push({ x: turnPointX, y: roadY });
      path.push(approachPoint); // Đến điểm dừng
      path.push(finalPos); // Lùi vào dock
    }
  }

  console.log(`📍 Path with reversing: ${fromGate} -> ${toDock}`, path);
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
