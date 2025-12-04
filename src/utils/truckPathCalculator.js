/**
 * Định nghĩa vị trí các điểm trên bản đồ (tương đối với container)
 */
const POSITIONS = {
  // Cổng A8
  GATE_1: { x: 50, y: 500 },
  GATE_2: { x: 950, y: 500 },
  
  // Các dock B (A8) - nằm ngang
  B1: { x: 850, y: 400 },
  B2: { x: 820, y: 400 },
  B3: { x: 790, y: 400 },
  B4: { x: 760, y: 400 },
  B5: { x: 730, y: 400 },
  B6: { x: 700, y: 400 },
  B7: { x: 670, y: 400 },
  B8: { x: 640, y: 400 },
  B9: { x: 610, y: 400 },
  B10: { x: 580, y: 400 },
  B11: { x: 550, y: 400 },
  B12: { x: 520, y: 400 },
  B13: { x: 490, y: 400 },
  B14: { x: 460, y: 400 },
  B15: { x: 430, y: 400 },
  B16: { x: 400, y: 400 },
  B17: { x: 370, y: 400 },
  B18: { x: 340, y: 400 },
  B19: { x: 310, y: 400 },
  B20: { x: 280, y: 400 },
  
  // Dock A2, A3
  A2: { x: 950, y: 430 },
  A3: { x: 950, y: 370 },
  
  // Điểm trung gian
  MIDDLE_ROAD: { x: 500, y: 480 },
};

/**
 * Tính toán đường đi của xe từ điểm A đến điểm B
 * @param {string} from - Điểm xuất phát (Gate, Dock)
 * @param {string} to - Điểm đích (Gate, Dock)
 * @param {string} area - Khu vực (A8 hoặc A10)
 * @returns {Array} Mảng các điểm trên đường đi
 */
export const calculateTruckPath = (from, to, area = 'A8') => {
  const startPos = getPosition(from);
  const endPos = getPosition(to);
  
  if (!startPos || !endPos) {
    console.error('Invalid position:', from, to);
    return [{ x: 0, y: 0 }];
  }
  
  // Tạo đường đi với các điểm trung gian
  const path = [];
  
  if (area === 'A8') {
    // Đường đi trong khu A8
    if (from.includes('GATE')) {
      // Từ cổng vào dock
      path.push(startPos);
      path.push({ x: startPos.x, y: POSITIONS.MIDDLE_ROAD.y });
      path.push({ x: endPos.x, y: POSITIONS.MIDDLE_ROAD.y });
      path.push(endPos);
    } else if (to.includes('GATE')) {
      // Từ dock ra cổng
      path.push(startPos);
      path.push({ x: startPos.x, y: POSITIONS.MIDDLE_ROAD.y });
      path.push({ x: endPos.x, y: POSITIONS.MIDDLE_ROAD.y });
      path.push(endPos);
    } else {
      // Từ dock sang dock khác
      path.push(startPos);
      path.push({ x: startPos.x, y: POSITIONS.MIDDLE_ROAD.y });
      path.push({ x: endPos.x, y: POSITIONS.MIDDLE_ROAD.y });
      path.push(endPos);
    }
  }
  
  return path;
};

/**
 * Lấy tọa độ của một điểm
 * @param {string} point - Tên điểm (GATE_1, B13, A2, ...)
 * @returns {Object} Tọa độ {x, y}
 */
const getPosition = (point) => {
  return POSITIONS[point] || null;
};

/**
 * Tính khoảng cách giữa 2 điểm
 * @param {Object} pos1 - Điểm 1 {x, y}
 * @param {Object} pos2 - Điểm 2 {x, y}
 * @returns {number} Khoảng cách
 */
export const calculateDistance = (pos1, pos2) => {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Tính góc quay giữa 2 điểm
 * @param {Object} from - Điểm xuất phát {x, y}
 * @param {Object} to - Điểm đích {x, y}
 * @returns {number} Góc (degree)
 */
export const calculateAngle = (from, to) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
};

/**
 * Làm mịn đường đi bằng Bezier curve
 * @param {Array} points - Các điểm trên đường đi
 * @param {number} segments - Số đoạn chia nhỏ
 * @returns {Array} Đường đi mịn hơn
 */
export const smoothPath = (points, segments = 10) => {
  if (points.length < 2) return points;
  
  const smoothed = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1];
    
    for (let t = 0; t < segments; t++) {
      const u = t / segments;
      const point = catmullRom(p0, p1, p2, p3, u);
      smoothed.push(point);
    }
  }
  
  smoothed.push(points[points.length - 1]);
  return smoothed;
};

/**
 * Catmull-Rom spline interpolation
 */
const catmullRom = (p0, p1, p2, p3, t) => {
  const t2 = t * t;
  const t3 = t2 * t;
  
  const x = 0.5 * (
    (2 * p1.x) +
    (-p0.x + p2.x) * t +
    (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
    (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
  );
  
  const y = 0.5 * (
    (2 * p1.y) +
    (-p0.y + p2.y) * t +
    (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
    (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
  );
  
  return { x, y };
};
