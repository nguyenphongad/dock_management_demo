import React, { useEffect, useState, useRef } from 'react';
import { MdExitToApp, MdFactory } from 'react-icons/md';
import { FiTruck } from 'react-icons/fi';
import { 
  getVehiclesFromStorage, 
  categorizeVehiclesByTime,
  determineGateFromDock,
  extractDockCode,
  calculateAnimationDuration
} from '../../utils/vehicleStorageManager';
import TruckAnimation from '../TruckAnimation/TruckAnimation';
import DockItem from '../DockItem/DockItem';
import DockingTruck from '../DockingTruck/DockingTruck';

const DockMap = ({ vehicles = [], warehouse }) => {
  const [activeAnimations, setActiveAnimations] = useState([]);
  const [activeDocks, setActiveDocks] = useState(new Set());
  const [dockingTrucks, setDockingTrucks] = useState(new Map());
  const processedVehicleIds = useRef(new Set());
  
  useEffect(() => {
    const updateAnimations = () => {
      const storedVehicles = getVehiclesFromStorage();
      
      if (storedVehicles.length === 0) return;
      
      const categorized = categorizeVehiclesByTime(storedVehicles);
      
      // Cập nhật docking trucks (xe đang đỗ tại dock)
      const dockingMap = new Map();
      categorized.loading.forEach(vehicle => {
        const dockCode = extractDockCode(vehicle.DockName);
        if (dockCode) {
          dockingMap.set(dockCode, {
            plateNumber: vehicle.RegNo,
            dockCode: dockCode,
            dockName: vehicle.DockName
          });
        }
      });
      setDockingTrucks(dockingMap);
      
      // Animation cho xe đang entering
      const enteringAnimations = categorized.entering
        .filter(vehicle => !processedVehicleIds.current.has(`entering_${vehicle.ID}`))
        .map(vehicle => {
          const dockCode = extractDockCode(vehicle.DockName);
          const fromGate = determineGateFromDock(vehicle.DockName);
          const animationInfo = calculateAnimationDuration(vehicle);
          
          processedVehicleIds.current.add(`entering_${vehicle.ID}`);
          
          return {
            id: `entering_${vehicle.ID}`,
            vehicleId: vehicle.ID,
            plateNumber: vehicle.RegNo,
            fromGate: fromGate,
            toDock: dockCode,
            toGate: fromGate,
            dockName: vehicle.DockName,
            phase: 'entering',
            duration: animationInfo?.duration || 4000
          };
        });
      
      // Animation cho xe đang exiting
      const exitingAnimations = categorized.exiting
        .filter(vehicle => !processedVehicleIds.current.has(`exiting_${vehicle.ID}`))
        .map(vehicle => {
          const dockCode = extractDockCode(vehicle.DockName);
          const toGate = determineGateFromDock(vehicle.DockName);
          const animationInfo = calculateAnimationDuration(vehicle);
          
          processedVehicleIds.current.add(`exiting_${vehicle.ID}`);
          
          return {
            id: `exiting_${vehicle.ID}`,
            vehicleId: vehicle.ID,
            plateNumber: vehicle.RegNo,
            fromGate: toGate,
            toDock: dockCode,
            toGate: toGate,
            dockName: vehicle.DockName,
            phase: 'exiting',
            duration: animationInfo?.duration || 4000
          };
        });
      
      setActiveAnimations(prev => {
        const newAnimations = [...enteringAnimations, ...exitingAnimations];
        const existingIds = new Set(prev.map(a => a.id));
        const filtered = newAnimations.filter(a => !existingIds.has(a.id));
        
        return filtered.length > 0 ? [...prev, ...filtered] : prev;
      });
      
      const loadingDockCodes = new Set(
        categorized.loading.map(v => extractDockCode(v.DockName)).filter(Boolean)
      );
      setActiveDocks(loadingDockCodes);
      
      categorized.completed.forEach(v => {
        processedVehicleIds.current.delete(`entering_${v.ID}`);
        processedVehicleIds.current.delete(`exiting_${v.ID}`);
      });
    };
    
    updateAnimations();
    const interval = setInterval(updateAnimations, 30000);
    
    return () => {
      clearInterval(interval);
      processedVehicleIds.current.clear();
    };
  }, []);
  
  const handleAnimationComplete = (animationId) => {
    console.log('Animation completed:', animationId);
    
    // Chỉ remove animation nếu là exiting phase
    // Entering phase sẽ giữ lại để hiển thị truck ở dock
    if (animationId.includes('exiting_')) {
      setActiveAnimations(prev => prev.filter(a => a.id !== animationId));
    }
  };
  
  const handleDockArrival = (dockCode) => {
    setActiveDocks(prev => new Set([...prev, dockCode]));
  };
  
  const handleDockDeparture = (dockCode) => {
    setTimeout(() => {
      setActiveDocks(prev => {
        const newSet = new Set(prev);
        newSet.delete(dockCode);
        return newSet;
      });
    }, 500);
  };

  const a10MainDocks = ['C8', 'C7', 'C6', 'C5', 'C4', 'C3', 'C2', 'C1'];
  const a10SideDocks = ['D3', 'D2', 'D1'];
  const a8MainDocks = Array.from({ length: 20 }, (_, i) => `B${20 - i}`);
  const a8SideDocks = ['A2', 'A3'];

  const getVehiclesAtDock = (dockCode) => {
    return vehicles?.filter(v => v.dockName?.includes(dockCode) && v.status === 'loading') || [];
  };

  return (
    <div className="dock-map">
      <div className="dock-map__header">
        <div className="header-left">
          <h3 className="dock-map__title">Sơ đồ Dock - {warehouse}</h3>
        </div>
        <div className="header-center"></div>
        <div className="header-right">
          <div className="dock-map__legend">
            <div className="legend-item">
              <span className="legend-dot legend-dot--empty"></span>
              <span>Trống</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot--loading"></span>
              <span>Đang load</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot--warning"></span>
              <span>Gần hết</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot--exceeded"></span>
              <span>Vượt</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dock-map__content">
        {activeAnimations.map(animation => (
          <TruckAnimation
            key={animation.id}
            plateNumber={animation.plateNumber}
            fromGate={animation.fromGate}
            toDock={animation.toDock}
            toGate={animation.toGate}
            phase={animation.phase}
            duration={animation.duration}
            onDockArrival={handleDockArrival}
            onDockDeparture={handleDockDeparture}
            onAnimationComplete={() => handleAnimationComplete(animation.id)}
          />
        ))}

        {Array.from(dockingTrucks.values()).map(truck => (
          <DockingTruck
            key={`docking_${truck.dockCode}`}
            plateNumber={truck.plateNumber}
            dockCode={truck.dockCode}
          />
        ))}

        <div className="dock-area dock-area--a10">
          <div className="gate-exit gate-exit--top">
            <MdExitToApp size={18} />
            <span>CỔNG 3</span>
          </div>
          <div className="area-label">
            <span className="area-name">Đường Số 10 - VSIP 1</span>
          </div>
          <div className="a10-layout">
            <div className="a10-main">
              <div className="duong-lu">ĐƯỜNG LƯ</div>
              {a10MainDocks.map(dock => (
                <div key={dock} className={activeDocks.has(dock) ? 'dock-arrival-animation' : ''}>
                  <DockItem
                    dockCode={dock}
                    vehicles={getVehiclesAtDock(dock)}
                    orientation="vertical"
                    labelPosition="top"
                  />
                </div>
              ))}
            </div>
            <div className="a10-side">
              {a10SideDocks.map(dock => (
                <div key={dock} className={activeDocks.has(dock) ? 'dock-arrival-animation' : ''}>
                  <DockItem
                    dockCode={dock}
                    vehicles={getVehiclesAtDock(dock)}
                    orientation="horizontal"
                    labelPosition="right"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="duong-trang-vang">ĐƯỜNG TRẮNG VÀNG</div>
        </div>

        <div className="area-separator">
          <div className="separator-road"></div>
        </div>

        <div className="factory-area">
          <div className="factory-area__background"></div>
          <div className="factory-area__content">
            <div className="factory-area__icon">
              <MdFactory />
            </div>
            <div className="factory-area__label">Factory Area</div>
            <div className="factory-area__sublabel">Khu vực sản xuất</div>
          </div>
        </div>

        <div className="dock-area dock-area--a8">
          <div className="gate-exit gate-exit--left">
            <MdExitToApp size={18} />
            <span>CỔNG 1</span>
          </div>
          <div className="area-label">
            <span className="area-name">Đường Số 8 - VSIP 1</span>
          </div>
          <div className="a8-layout">
            <div className="duong-trung-thu">ĐƯỜNG TRUNG THƯ</div>
            <div className="a8-content-wrapper">
              <div className="a8-docks">
                {a8MainDocks.map(dock => (
                  <div key={dock} className={activeDocks.has(dock) ? 'dock-arrival-animation' : ''}>
                    <DockItem
                      dockCode={dock}
                      vehicles={getVehiclesAtDock(dock)}
                      isCompact={true}
                      orientation="vertical"
                      labelPosition="bottom"
                    />
                  </div>
                ))}
              </div>
              <div className="a8-side-docks">
                {a8SideDocks.map(dock => (
                  <div key={dock} className={activeDocks.has(dock) ? 'dock-arrival-animation' : ''}>
                    <DockItem
                      dockCode={dock}
                      vehicles={getVehiclesAtDock(dock)}
                      isCompact={true}
                      orientation="horizontal"
                      labelPosition="left"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="duong-kinh-do">ĐƯỜNG KINH ĐÔ</div>
          </div>
          <div className="gate-exit gate-exit--right">
            <MdExitToApp size={18} />
            <span>CỔNG 2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DockMap;
