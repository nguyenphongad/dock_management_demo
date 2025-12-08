import React, { useEffect, useState } from 'react';
import { calculateDockPositions } from '../../utils/dockPositionCalculator';
import './DockingTruck.scss';

const DockingTruck = ({ plateNumber, dockCode }) => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const updatePosition = () => {
      const positions = calculateDockPositions();
      const dockPos = positions.docks[dockCode];
      
      if (dockPos) {
        setPosition({
          x: dockPos.x,
          y: dockPos.y
        });
      }
    };

    // Initial position
    setTimeout(updatePosition, 500);

    // Update on resize
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [dockCode]);

  if (!position) return null;

  return (
    <div 
      className="docking-truck"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transformOrigin: 'center center'
      }}
    >
      <div className="docking-truck__body">
        <div className="docking-truck__cabin"></div>
        <div className="docking-truck__container"></div>
      </div>
      <div className="docking-truck__plate">{plateNumber}</div>
    </div>
  );
};

export default DockingTruck;
