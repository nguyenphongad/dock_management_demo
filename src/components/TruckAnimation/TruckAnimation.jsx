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
  onDockArrival,
  onDockDeparture,
  onAnimationComplete 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(phase);
  const [isReady, setIsReady] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const [progress, setProgress] = useState(0); // Theo dõi tiến độ
  const hasAnimated = useRef(false);
  const animationId = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || hasAnimated.current) return;

    const runAnimation = async () => {
      try {
        hasAnimated.current = true;
        
        const positions = calculateDockPositions();
        const paths = createCompletePath(fromGate, toDock, toGate, positions);
        
        if (!paths.entering.length && !paths.exiting.length) {
          console.error('Failed to create paths');
          return;
        }

        if (phase === 'entering') {
          console.log(`🚛 ${plateNumber}: Starting entering animation to ${toDock}`);
          setAnimationPhase('entering');
          const smoothEnteringPath = smoothPath(paths.entering, 15);
          await animateTruck(smoothEnteringPath, duration * 3, true); // GIÁ TRỊ TỐC ĐỘ X3
          
          console.log(`✅ ${plateNumber}: Arrived at ${toDock}`);
          
          // GỌI callback TRƯỚC
          if (onDockArrival) {
            onDockArrival(toDock);
          }
          
          // DELAY 800ms để DockingTruck có thời gian xuất hiện
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Bây giờ mới remove TruckAnimation
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        } else if (phase === 'exiting') {
          console.log(`🚛 ${plateNumber}: Starting exiting animation from ${toDock}`);
          setAnimationPhase('exiting');
          const smoothExitingPath = smoothPath(paths.exiting, 15);
          await animateTruck(smoothExitingPath, duration * 3, true); // GIÁ TRỊ TỐC ĐỘ X3
          
          console.log(`✅ ${plateNumber}: Exited to gate`);
          
          if (onDockDeparture) {
            onDockDeparture(toDock);
          }
          
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }
      } catch (error) {
        console.error('Animation error:', error);
      }
    };

    runAnimation();

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [isReady, phase]);

  const animateTruck = (path, baseDuration, stopRotationBeforeEnd = false) => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const totalPoints = path.length;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const normalizedElapsed = elapsed / baseDuration;
        
        let adjustedProgress;
        if (animationPhase === 'entering') {
          // Chậm lại khi gần dock
          if (normalizedElapsed < 0.6) {
            adjustedProgress = normalizedElapsed;
          } else if (normalizedElapsed < 0.8) {
            adjustedProgress = 0.6 + (normalizedElapsed - 0.6) * 0.7;
          } else {
            adjustedProgress = 0.6 + 0.14 + (normalizedElapsed - 0.8) * 0.4;
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
        
        // ===== LOGIC MỚI: VÀO DOCK BẰNG ĐUÔI, RA BẰNG ĐẦU =====
        if (animationPhase === 'entering') {
          // Khi vào dock
          const isNearDock = currentIndex >= totalPoints - 3; // 2 điểm cuối
          
          if (!isNearDock) {
            // Đang đi trên đường: hướng theo chiều di chuyển
            const dx = next.x - current.x;
            const dy = next.y - current.y;
            if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
              angle = Math.atan2(dy, dx) * (180 / Math.PI);
            }
          } else {
            // Gần dock: QUAY ĐẦU 180° để LÙI VÀO (đuôi xe vào dock)
            const dx = next.x - current.x;
            const dy = next.y - current.y;
            if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
              const forwardAngle = Math.atan2(dy, dx) * (180 / Math.PI);
              angle = forwardAngle + 180; // Quay ngược lại để lùi
            }
          }
        } else if (animationPhase === 'exiting') {
          // Khi ra khỏi dock: TIẾN RA BẰNG ĐẦU XE
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
          resolve();
        }
      };
      
      animate();
    });
  };

  if (!isReady) return null;

  // ĐỔI TỪ SIDE VIEW SANG TOP-DOWN VIEW
  return (
    <div 
      className={`truck-animation truck-animation--${animationPhase}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        transition: 'none'
      }}
      data-progress={Math.round(progress * 100)}
    >
      {/* BODY XE 3D - TOP-DOWN VIEW (giống DockingTruck) */}
      <div className={`truck-body truck-body--${animationPhase}`}>
        {/* THÙNG XE (Container) - Nhìn từ trên xuống */}
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

        {/* CABIN XE (Driver) - Nhìn từ trên xuống */}
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
      </div>

      {/* BIỂN SỐ XE */}
      <div 
        className="truck-plate"
        style={{
          transform: `rotate(${-rotation}deg)`,
        }}
      >
        {plateNumber}
        {animationPhase === 'entering' && progress > 0.7 && (
          <span className="truck-plate__reversing"> ⚠️ Đang lùi</span>
        )}
      </div>

      {/* THANH TIẾN ĐỘ */}
      {(animationPhase === 'entering' || animationPhase === 'exiting') && (
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
