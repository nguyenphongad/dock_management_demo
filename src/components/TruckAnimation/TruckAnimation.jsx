import React, { useEffect, useState, useRef } from 'react';
import { 
  calculateDockPositions, 
  createCompletePath, 
  smoothPath 
} from '../../utils/dockPositionCalculator';

const TruckAnimation = ({ 
  plateNumber, 
  fromGate, 
  toDock, 
  toGate,
  phase = 'entering',
  duration = 4000,
  slotPosition = 1,
  onDockArrival,
  onDockDeparture,
  onAnimationComplete 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(phase);
  const [isReady, setIsReady] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const hasAnimated = useRef(false);
  const animationId = useRef(null);

  // Log để debug
  useEffect(() => {
    console.log(`🚛 TruckAnimation CREATED: ${plateNumber}`, {
      phase,
      fromGate,
      toDock,
      slotPosition
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      console.log(`✅ TruckAnimation READY: ${plateNumber}`);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || hasAnimated.current) {
      console.log(`⏸️ TruckAnimation WAITING: ${plateNumber}`, { isReady, hasAnimated: hasAnimated.current });
      return;
    }

    const runAnimation = async () => {
      try {
        hasAnimated.current = true;
        console.log(`🎬 TruckAnimation STARTED: ${plateNumber} - ${phase}`);
        
        // Tính toán positions - THÊM TIMEOUT để đảm bảo DOM đã render
        await new Promise(resolve => setTimeout(resolve, 200));
        const positions = calculateDockPositions();
        
        console.log(`📍 Positions calculated:`, {
          gates: Object.keys(positions.gates),
          docks: Object.keys(positions.docks),
          fromGate,
          toDock
        });

        // Kiểm tra positions có hợp lệ không
        if (!positions.gates[fromGate]) {
          console.error(`❌ Gate not found: ${fromGate}`);
          // Fallback: set vị trí mặc định
          positions.gates[fromGate] = { x: 100, y: 100, width: 50, height: 50 };
        }

        if (!positions.docks[toDock]) {
          console.error(`❌ Dock not found: ${toDock}`);
          // Fallback: set vị trí mặc định
          positions.docks[toDock] = { x: 500, y: 300, width: 80, height: 120 };
        }

        // Tạo path
        const paths = createCompletePath(fromGate, toDock, toGate, positions, [], slotPosition);
        
        console.log(`🛤️ Paths created:`, {
          enteringLength: paths.entering?.length || 0,
          exitingLength: paths.exiting?.length || 0,
          position: paths.position
        });

        if (phase === 'entering') {
          const enterPath = paths.entering;
          
          if (!enterPath || enterPath.length === 0) {
            console.error(`❌ No entering path for ${plateNumber}`);
            // Tạo path đơn giản từ gate đến dock
            const gatePos = positions.gates[fromGate];
            const dockPos = positions.docks[toDock];
            const simplePath = [
              { x: gatePos.x, y: gatePos.y },
              { x: (gatePos.x + dockPos.x) / 2, y: (gatePos.y + dockPos.y) / 2 },
              { x: dockPos.x, y: dockPos.y }
            ];
            console.log(`🔧 Using SIMPLE PATH:`, simplePath);
            await animateTruck(simplePath, duration, true);
          } else {
            console.log(`✅ Animating ENTERING: ${plateNumber} - ${enterPath.length} points`);
            const smoothEnteringPath = smoothPath(enterPath, 15);
            await animateTruck(smoothEnteringPath, duration, true);
          }
          
          console.log(`🎯 ${plateNumber}: ARRIVED at ${toDock} - DOCKED`);
          
          setIsDocked(true);
          setAnimationPhase('docked');
          setIsVisible(true);
          
          if (onDockArrival) {
            onDockArrival(toDock, slotPosition);
          }
          
        } else if (phase === 'exiting') {
          console.log(`🚪 ${plateNumber}: EXITING from ${toDock}`);
          setAnimationPhase('exiting');
          setIsDocked(false);
          
          const exitPath = paths.exiting;
          
          if (!exitPath || exitPath.length === 0) {
            console.error(`❌ No exiting path for ${plateNumber}`);
            const dockPos = positions.docks[toDock];
            const gatePos = positions.gates[toGate];
            const simplePath = [
              { x: dockPos.x, y: dockPos.y },
              { x: (dockPos.x + gatePos.x) / 2, y: (dockPos.y + gatePos.y) / 2 },
              { x: gatePos.x, y: gatePos.y }
            ];
            await animateTruck(simplePath, duration, false);
          } else {
            const smoothExitingPath = smoothPath(exitPath, 15);
            await animateTruck(smoothExitingPath, duration, false);
          }
          
          console.log(`✅ ${plateNumber}: EXITED successfully`);
          
          if (onDockDeparture) {
            onDockDeparture(toDock);
          }
          
          setTimeout(() => {
            setIsVisible(false);
            if (onAnimationComplete) {
              onAnimationComplete();
            }
          }, 500);
        }
      } catch (error) {
        console.error(`❌ Animation error for ${plateNumber}:`, error);
        setIsVisible(true); // VẪN GIỮ VISIBLE khi lỗi
      }
    };

    runAnimation();

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [isReady, phase, slotPosition]);

  const animateTruck = (path, baseDuration, isEntering) => {
    return new Promise((resolve) => {
      if (!path || path.length === 0) {
        console.error('❌ Empty path in animateTruck');
        resolve();
        return;
      }

      const startTime = Date.now();
      const totalPoints = path.length;
      
      console.log(`🎬 Starting animation: ${totalPoints} points, ${baseDuration}ms`);
      
      // Set vị trí ban đầu
      setPosition({ x: path[0].x, y: path[0].y });
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const normalizedElapsed = elapsed / baseDuration;
        
        let adjustedProgress;
        if (isEntering) {
          if (normalizedElapsed < 0.7) {
            adjustedProgress = normalizedElapsed * 0.85;
          } else {
            adjustedProgress = 0.595 + (normalizedElapsed - 0.7) * 0.4;
          }
        } else {
          adjustedProgress = normalizedElapsed;
        }
        
        const progress = Math.min(adjustedProgress, 1);
        setProgress(progress);
        
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const currentIndex = Math.floor(eased * (totalPoints - 1));
        const nextIndex = Math.min(currentIndex + 1, totalPoints - 1);
        const localProgress = (eased * (totalPoints - 1)) - currentIndex;
        
        const current = path[currentIndex];
        const next = path[nextIndex];
        
        const x = current.x + (next.x - current.x) * localProgress;
        const y = current.y + (next.y - current.y) * localProgress;
        
        let angle = rotation;
        
        const isHorizontalDock = /^[AD][1-3]$/.test(toDock);
        const isNearEnd = currentIndex >= totalPoints - 4;
        
        if (!isNearEnd) {
          const dx = next.x - current.x;
          const dy = next.y - current.y;
          if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            angle = Math.atan2(dy, dx) * (180 / Math.PI);
          }
        } else if (isEntering) {
          if (isHorizontalDock) {
            if (toDock.startsWith('D')) {
              angle = 0;
            } else if (toDock.startsWith('A')) {
              angle = 180;
            }
          } else {
            const area = /^[CD]/.test(toDock) ? 'A10' : 'A8';
            if (area === 'A10') {
              angle = 90;
            } else {
              angle = -90;
            }
          }
        } else {
          const dx = next.x - current.x;
          const dy = next.y - current.y;
          if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            angle = Math.atan2(dy, dx) * (180 / Math.PI);
          }
        }
        
        setPosition({ x, y });
        setRotation(angle);
        
        if (progress < 1) {
          animationId.current = requestAnimationFrame(animate);
        } else {
          console.log(`✅ Animation completed: ${progress * 100}%`);
          if (isEntering) {
            const finalRotation = isHorizontalDock 
              ? (toDock.startsWith('D') ? 0 : 180)
              : (/^[CD]/.test(toDock) ? -90 : 90);
            setRotation(finalRotation);
          }
          resolve();
        }
      };
      
      animate();
    });
  };

  // LUÔN render khi isReady, bỏ check isVisible
  if (!isReady) {
    console.log(`⏳ TruckAnimation NOT READY: ${plateNumber}`);
    return null;
  }

  if (!isVisible) {
    console.log(`👻 TruckAnimation INVISIBLE: ${plateNumber}`);
    return null;
  }

  console.log(`🚛 RENDERING TruckAnimation: ${plateNumber}`, { position, rotation, isDocked, phase: animationPhase });

  return (
    <div 
      className={`truck-animation truck-animation--${animationPhase} ${isDocked ? 'truck-animation--docked' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        transition: 'none',
        opacity: isDocked ? 1 : 0.95,
        zIndex: isDocked ? 100 : 50
      }}
      data-docked={isDocked}
      data-slot={slotPosition}
      data-plate={plateNumber}
    >
      {/* BODY XE - Giống DockingTruck khi docked */}
      <div className={`truck-body truck-body--${animationPhase}`}>
        {/* THÙNG XE */}
        <div className="truck-container">
          <div className="truck-container__top"></div>
          <div className="truck-container__main">
            <div className="truck-container__ribs">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="truck-container__logo"></div>
          </div>
          <div className="truck-container__lights">
            <span className="light-left"></span>
            <span className="light-right"></span>
          </div>
          <div className="truck-container__bottom"></div>
        </div>

        {/* CABIN XE */}
        <div className="truck-cabin">
          <div className="truck-cabin__roof"></div>
          <div className="truck-cabin__body">
            <div className="truck-cabin__windshield">
              <div className="windshield-shine"></div>
            </div>
            <div className="truck-cabin__grille">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="truck-cabin__headlights">
              <span className="headlight-left"></span>
              <span className="headlight-right"></span>
            </div>
          </div>
          <div className="truck-cabin__mirrors">
            <div className="mirror-left"></div>
            <div className="mirror-right"></div>
          </div>
        </div>

        {/* KHÓI XẢ */}
        <div className="truck-exhaust">
          <span className="smoke"></span>
          <span className="smoke"></span>
          <span className="smoke"></span>
        </div>

        {/* ĐÈN CẢNH BÁO khi docked */}
        {isDocked && (
          <div className="truck-warning-light"></div>
        )}
      </div>

      {/* BIỂN SỐ XE */}
      <div 
        className="truck-plate"
        style={{
          transform: `rotate(${-rotation}deg)`,
        }}
      >
        {plateNumber}
        {animationPhase === 'entering' && progress > 0.7 && !isDocked && (
          <span className="truck-plate__reversing"> ⚠️ Lùi</span>
        )}
        {isDocked && (
          <span className="truck-plate__status"> 🔴 Loading</span>
        )}
      </div>

      {/* THANH TIẾN ĐỘ */}
      {!isDocked && (
        <div className="truck-progress">
          <div 
            className="truck-progress__bar" 
            style={{ width: `${progress * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default TruckAnimation;
