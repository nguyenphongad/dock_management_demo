import React, { useEffect, useState } from 'react';
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
  onDockArrival,
  onDockDeparture,
  onAnimationComplete 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [animationPhase, setAnimationPhase] = useState('entering');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const runAnimation = async () => {
      try {
        const positions = calculateDockPositions();
        
        console.log('Dock positions:', positions);
        
        const paths = createCompletePath(fromGate, toDock, toGate, positions);
        
        if (!paths.entering.length || !paths.exiting.length) {
          console.error('Failed to create paths');
          return;
        }

        // Phase 1: Từ cổng vào đến dock - dừng xoay trước khi đến dock
        setAnimationPhase('entering');
        const smoothEnteringPath = smoothPath(paths.entering, 15);
        await animateTruck(smoothEnteringPath, 3000, true); // stopRotationBeforeEnd = true
        
        // Khi đến dock, trigger animation cho dock
        if (onDockArrival) {
          onDockArrival(toDock);
        }
        
        // Phase 2: Đỗ tại dock - hoàn toàn đứng yên
        setAnimationPhase('docking');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Khi rời dock, tắt animation
        if (onDockDeparture) {
          onDockDeparture(toDock);
        }
        
        // Phase 3: Từ dock ra cổng
        setAnimationPhase('exiting');
        const smoothExitingPath = smoothPath(paths.exiting, 15);
        await animateTruck(smoothExitingPath, 3000, true);
        
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      } catch (error) {
        console.error('Animation error:', error);
      }
    };

    runAnimation();
  }, [isReady, fromGate, toDock, toGate]);

  const animateTruck = (path, duration, stopRotationBeforeEnd = false) => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let lockedRotation = null;
      const isA10Path = path.length > 0 && Math.abs(path[0].y - path[path.length - 1].y) > 50; // Nếu di chuyển dọc nhiều = A10
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const currentIndex = Math.floor(eased * (path.length - 1));
        const nextIndex = Math.min(currentIndex + 1, path.length - 1);
        const localProgress = (eased * (path.length - 1)) - currentIndex;
        
        const current = path[currentIndex];
        const next = path[nextIndex];
        
        const x = current.x + (next.x - current.x) * localProgress;
        const y = current.y + (next.y - current.y) * localProgress;
        
        // Logic xoay: dừng xoay sớm hơn cho A10
        let angle = rotation;
        
        if (stopRotationBeforeEnd) {
          // Cho A10 (C, D docks): dừng xoay từ 70% quãng đường
          // Cho A8 (A, B docks): dừng xoay từ 80% quãng đường
          const stopThreshold = isA10Path ? 0.7 : 0.8;
          
          if (progress < stopThreshold) {
            const dx = next.x - current.x;
            const dy = next.y - current.y;
            if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
              angle = Math.atan2(dy, dx) * (180 / Math.PI);
              lockedRotation = angle;
            }
          } else if (lockedRotation !== null) {
            angle = lockedRotation;
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
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  };

  if (!isReady) return null;

  return (
    <div 
      className={`truck-animation truck-animation--${animationPhase}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        transition: animationPhase === 'docking' ? 'none' : 'transform 0.05s linear'
      }}
    >
      <div className="truck-body">
        <div className="truck-cabin"></div>
        <div className="truck-container"></div>
      </div>
      <div className="truck-plate">{plateNumber}</div>
    </div>
  );
};

export default TruckAnimation;
