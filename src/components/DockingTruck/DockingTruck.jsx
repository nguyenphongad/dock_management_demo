import React, { useEffect, useState } from 'react';
import { calculateDockPositions, calculatePositionOffset } from '../../utils/dockPositionCalculator';
import './DockingTruck.scss';

const DockingTruck = ({ plateNumber, dockCode, slotPosition = 1 }) => {
  const [position, setPosition] = useState(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      const positions = calculateDockPositions();
      const dockPos = positions.docks[dockCode];
      
      if (dockPos) {
        // Tính vị trí theo slot (1 hoặc 2)
        const slotPos = calculatePositionOffset(slotPosition, dockPos, dockCode);
        
        setPosition({
          x: slotPos.x,
          y: slotPos.y
        });
        
        // Xác định hướng xe dựa trên khu vực
        const dockArea = getDockArea(dockCode);
        const truckRotation = getTruckRotation(dockArea);
        setRotation(truckRotation);
        
        console.log(`🚛 DockingTruck at ${dockCode} slot ${slotPosition}:`, slotPos);
      }
    };

    // Initial position
    setTimeout(updatePosition, 500);

    // Update on resize
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [dockCode, slotPosition]);

  // Xác định khu vực dock (A10 hoặc A8)
  const getDockArea = (code) => {
    // A10: C1-C8, D1-D3
    if (/^[CD]\d+/.test(code)) {
      return 'A10';
    }
    // A8: B1-B20, A2-A3
    if (/^[AB]\d+/.test(code)) {
      return 'A8';
    }
    return 'A8'; // Default
  };

  // Tính góc quay cho xe
  const getTruckRotation = (area) => {
    if (area === 'A10') {
      // A10 (trên): đầu xe quay lên trên = -90°
      return -90;
    } else {
      // A8 (dưới): đầu xe quay xuống dưới = 90°
      return 90;
    }
  };

  if (!position) return null;

  return (
    <div 
      className="docking-truck"
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        transformOrigin: 'center center'
      }}
    >
      {/* BODY XE 3D - MÀU ĐỎ (đang làm hàng) - TOP-DOWN VIEW */}
      <div className="docking-truck__body">
        {/* THÙNG XE (Phía sau - Container) */}
        <div className="docking-truck__container">
          <div className="docking-truck__container-top"></div>
          <div className="docking-truck__container-main">
            <div className="docking-truck__container-ribs">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="docking-truck__container-logo"></div>
          </div>
          <div className="docking-truck__container-bottom"></div>
          <div className="docking-truck__container-lights">
            <span className="light-left"></span>
            <span className="light-right"></span>
          </div>
        </div>

        {/* CABIN XE (Phía trước - Driver) */}
        <div className="docking-truck__cabin">
          <div className="docking-truck__cabin-roof"></div>
          <div className="docking-truck__cabin-body">
            <div className="docking-truck__cabin-windshield">
              <div className="windshield-shine"></div>
            </div>
            <div className="docking-truck__cabin-grille">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="docking-truck__cabin-headlights">
              <span className="headlight-left"></span>
              <span className="headlight-right"></span>
            </div>
          </div>
          <div className="docking-truck__cabin-mirrors">
            <div className="mirror-left"></div>
            <div className="mirror-right"></div>
          </div>
        </div>

        {/* KHÓI XẢ */}
        <div className="docking-truck__exhaust">
          <span className="smoke"></span>
          <span className="smoke"></span>
          <span className="smoke"></span>
        </div>

        {/* ĐÈN CẢNH BÁO (nhấp nháy khi đang làm hàng) */}
        <div className="docking-truck__warning-light"></div>
      </div>

      {/* BIỂN SỐ XE với slot indicator */}
      <div 
        className="docking-truck__plate"
        style={{
          transform: `rotate(${-rotation}deg)`,
        }}
      >
        {plateNumber}
        {/* <span className="status-badge">🔴 #{slotPosition}</span> */}
      </div>
    </div>
  );
};

export default DockingTruck;
