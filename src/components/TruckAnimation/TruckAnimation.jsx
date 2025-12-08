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
  const [isDocked, setIsDocked] = useState(false); // Track if truck is docked
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
          // Xe đang vào dock
          console.log(`🚛 ${plateNumber}: Starting entering animation to ${toDock}`);
          setAnimationPhase('entering');
          const smoothEnteringPath = smoothPath(paths.entering, 15);
          await animateTruck(smoothEnteringPath, duration, true);
          
          console.log(`✅ ${plateNumber}: Arrived at ${toDock}`);
          
          // Khi đến dock - đổi sang docking phase NHƯNG KHÔNG remove component
          setAnimationPhase('docking');
          setIsDocked(true);
          
          if (onDockArrival) {
            onDockArrival(toDock);
          }
          
          // KHÔNG gọi onAnimationComplete để component không bị remove
          // if (onAnimationComplete) {
          //   onAnimationComplete();
          // }
        } else if (phase === 'exiting') {
          // Xe đang ra cổng
          console.log(`🚛 ${plateNumber}: Starting exiting animation from ${toDock}`);
          setAnimationPhase('exiting');
          const smoothExitingPath = smoothPath(paths.exiting, 15);
          await animateTruck(smoothExitingPath, duration, true);
          
          console.log(`✅ ${plateNumber}: Exited to gate`);
          
          if (onDockDeparture) {
            onDockDeparture(toDock);
          }
          
          // Chỉ remove component khi xe ra cổng xong
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

  const animateTruck = (path, duration, stopRotationBeforeEnd = false) => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let lockedRotation = null;
      const isA10Path = path.length > 0 && Math.abs(path[0].y - path[path.length - 1].y) > 50;
      
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
        
        let angle = rotation;
        
        if (stopRotationBeforeEnd) {
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
          animationId.current = requestAnimationFrame(animate);
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
      className={`truck-animation truck-animation--${animationPhase} ${isDocked ? 'truck-animation--docked' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        transition: 'none'
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
