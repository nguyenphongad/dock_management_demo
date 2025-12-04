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

  if (dockPos.area === 'A8') {
    const roadY = positions.roads.DUONG_TRUNG_THU?.y || (dockPos.y - 50);
    
    path.push({ x: gatePos.x, y: gatePos.y });
    path.push({ x: gatePos.x, y: roadY });
    path.push({ x: finalPos.x, y: roadY });
    path.push({ x: finalPos.x, y: finalPos.y });
  } else if (dockPos.area === 'A10') {
    const roadY = positions.roads.DUONG_LU?.y || (dockPos.y + 50);
    
    path.push({ x: gatePos.x, y: gatePos.y });
    path.push({ x: gatePos.x, y: roadY });
    path.push({ x: finalPos.x, y: roadY });
    path.push({ x: finalPos.x, y: finalPos.y });
  }

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

  if (dockPos.area === 'A8') {
    const roadY = positions.roads.DUONG_KINH_DO?.y || (dockPos.y + 50);
    
    path.push({ x: startPos.x, y: startPos.y });
    path.push({ x: startPos.x, y: roadY });
    path.push({ x: gatePos.x, y: roadY });
    path.push({ x: gatePos.x, y: gatePos.y });
  } else if (dockPos.area === 'A10') {
    const roadY = positions.roads.DUONG_TRANG_VANG?.y || (dockPos.y - 50);
    
    path.push({ x: startPos.x, y: startPos.y });
    path.push({ x: startPos.x, y: roadY });
    path.push({ x: gatePos.x, y: roadY });
    path.push({ x: gatePos.x, y: gatePos.y });
  }

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
