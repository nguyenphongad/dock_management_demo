import React, { useState } from 'react';
import { MdExitToApp, MdFactory } from 'react-icons/md';
import { FiTruck } from 'react-icons/fi';
import TruckAnimation from '../TruckAnimation/TruckAnimation';
import DockItem from '../DockItem/DockItem';

const DockMap = ({ vehicles, warehouse }) => {
  // Docks cho A10 (Đường số 10): C8, C7, C6, C5, C4, C3, C2, C1, D3, D2, D1
  const a10MainDocks = ['C8', 'C7', 'C6', 'C5', 'C4', 'C3', 'C2', 'C1'];
  const a10SideDocks = ['D3', 'D2', 'D1'];
  
  // Docks cho A8 (Đường số 8): B1-B20 (reverse để hiển thị từ phải sang trái), A2, A3
  const a8MainDocks = Array.from({ length: 20 }, (_, i) => `B${20 - i}`); // B20, B19, ..., B2, B1
  const a8SideDocks = ['A2', 'A3'];

  // Helper function để lấy vehicles tại dock
  const getVehiclesAtDock = (dockCode) => {
    return vehicles?.filter(
      v => v.dockName?.includes(dockCode) && v.status === 'loading'
    ) || [];
  };

  const [animatingTrucks, setAnimatingTrucks] = useState([
    {
      id: 'demo-truck-1',
      plateNumber: 'X77',
      fromGate: 'CONG_1',
      toDock: 'D2',
      toGate: 'CONG_3'
    },
    {
      id: 'demo-truck-2',
      plateNumber: 'X79',
      fromGate: 'CONG_2',
      toDock: 'D2',
      toGate: 'CONG_2'
    },
    {
      id: 'demo-truck-3',
      plateNumber: 'X80',
      fromGate: 'CONG_2',
      toDock: 'D1',
      toGate: 'CONG_1'
    },
    {
      id: 'demo-truck-4',
      plateNumber: 'X81',
      fromGate: 'CONG_2',
      toDock: 'D1',
      toGate: 'CONG_1'
    },
  ]);

  // Track docks đang có xe đỗ (để trigger animation)
  const [activeDocks, setActiveDocks] = useState(new Set());

  const handleDockArrival = (dockCode) => {
    console.log('Truck arrived at dock:', dockCode);
    setActiveDocks(prev => new Set([...prev, dockCode]));
  };

  const handleDockDeparture = (dockCode) => {
    console.log('Truck departed from dock:', dockCode);
    setActiveDocks(prev => {
      const newSet = new Set(prev);
      newSet.delete(dockCode);
      return newSet;
    });
  };

  const handleAnimationComplete = (truckId) => {
    setAnimatingTrucks(prev => prev.filter(t => t.id !== truckId));
  };

  return (
    <div className="dock-map">
      <div className="dock-map__header">
        <div className="header-left">
          <h3 className="dock-map__title">Sơ đồ Dock - {warehouse}</h3>
        </div>

        <div className="header-center">
          {/* Bãi chờ */}
          <div className="waiting-area-header">
            <div className="waiting-header">
              <FiTruck size={16} />
              <span>Bãi chờ ({vehicles?.filter(v => v.status === 'waiting' || v.status === 'gated_in').length || 0})</span>
            </div>
            <div className="waiting-list">
              {vehicles
                ?.filter(v => v.status === 'waiting' || v.status === 'gated_in')
                .slice(0, 8)
                .map((vehicle, idx) => (
                  <div key={idx} className="waiting-item">
                    {vehicle.plateNumber}
                  </div>
                ))}
            </div>
          </div>
        </div>

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
        {/* Animation trucks */}
        {animatingTrucks.map(truck => (
          <TruckAnimation
            key={truck.id}
            plateNumber={truck.plateNumber}
            fromGate={truck.fromGate}
            toDock={truck.toDock}
            toGate={truck.toGate}
            onDockArrival={handleDockArrival}
            onDockDeparture={handleDockDeparture}
            onAnimationComplete={() => handleAnimationComplete(truck.id)}
          />
        ))}

        {/* Khu A10 - Đường số 10 */}
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

        {/* Separator */}
        <div className="area-separator">
          <div className="separator-road"></div>
        </div>

        {/* Factory Area */}
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

        {/* Khu A8 - Đường số 8 */}
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
