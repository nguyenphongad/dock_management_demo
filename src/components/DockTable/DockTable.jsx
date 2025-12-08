import React, { useState, useEffect } from 'react';
import { 
  getVehiclesFromStorage, 
  categorizeVehiclesByTime,
  extractDockCode 
} from '../../utils/vehicleStorageManager';

const DockTable = ({ docks, kpis }) => {
  const [insideWarehouseVehicles, setInsideWarehouseVehicles] = useState([]);

  useEffect(() => {
    const updateVehiclesList = () => {
      const storedVehicles = getVehiclesFromStorage();
      const categorized = categorizeVehiclesByTime(storedVehicles);
      
      // Lấy tất cả xe đang ở trong kho (đã vào cổng nhưng chưa ra cổng)
      const insideVehicles = [
        ...categorized.entering,
        ...categorized.loading
      ].map(v => ({
        ...v,
        dockCode: extractDockCode(v.DockName),
        statusText: categorized.entering.some(ev => ev.ID === v.ID) 
          ? 'Đang vào' 
          : 'Đang làm hàng'
      }));
      
      setInsideWarehouseVehicles(insideVehicles);
      
      console.log('Inside warehouse vehicles:', insideVehicles.length);
    };
    
    // Initial load
    updateVehiclesList();
    
    // Update mỗi 5 giây
    const interval = setInterval(updateVehiclesList, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const miniKpis = [
    { 
      title: 'Currently Loading', 
      value: kpis?.currentlyLoading || 0,
      icon: '🚛',
      color: '#3498db'
    },
    { 
      title: 'Waiting', 
      value: kpis?.waiting || 0,
      icon: '⏳',
      color: '#f39c12'
    },
    { 
      title: 'Completed Today', 
      value: kpis?.completedToday || 0,
      icon: '✅',
      color: '#27ae60'
    },
    { 
      title: 'Avg Turnaround Time', 
      value: `${kpis?.avgTurnaroundTime || 0}p`,
      icon: '⏱️',
      color: '#9b59b6'
    },
    { 
      title: 'Avg Loading Time', 
      value: `${kpis?.avgLoadingTime || 0}p`,
      icon: '📦',
      color: '#e67e22'
    },
    { 
      title: 'Avg Wait Time', 
      value: `${kpis?.avgWaitTime || 0}p`,
      icon: '⌛',
      color: '#e74c3c'
    }
  ];

  return (
    <div className="dock-table">
      <h3 className="dock-table__title">Bảng Giám Sát Dock</h3>
      
      <div className="dock-table__kpis">
        {miniKpis.map((kpi, index) => (
          <div key={index} className="mini-kpi-card" style={{ borderLeftColor: kpi.color }}>
            <div className="mini-kpi-card__icon">{kpi.icon}</div>
            <div className="mini-kpi-card__content">
              <div className="mini-kpi-card__value">{kpi.value}</div>
              <div className="mini-kpi-card__title">{kpi.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bảng xe đang trong kho */}
      <div className="dock-table__vehicles-section">
        <h4 className="vehicles-section__title">
          🚛 Xe đang trong kho ({insideWarehouseVehicles.length})
        </h4>
        <div className="vehicles-section__content">
          {insideWarehouseVehicles.length === 0 ? (
            <div className="no-vehicles">Không có xe nào trong kho</div>
          ) : (
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Biển số</th>
                  <th>Dock</th>
                  <th>Tài xế</th>
                  <th>Trạng thái</th>
                  <th>Vào cổng</th>
                </tr>
              </thead>
              <tbody>
                {insideWarehouseVehicles.map((vehicle) => (
                  <tr key={vehicle.ID}>
                    <td className="cell-id">{vehicle.ID}</td>
                    <td className="cell-regno">
                      <strong>{vehicle.RegNo}</strong>
                    </td>
                    <td className="cell-dock">
                      <span className="dock-badge">
                        {vehicle.dockCode || vehicle.DockName || '-'}
                      </span>
                    </td>
                    <td className="cell-driver">{vehicle.DriverName || '-'}</td>
                    <td className="cell-status">
                      <span className={`status-badge ${vehicle.statusText === 'Đang vào' ? 'status-badge--entering' : 'status-badge--loading'}`}>
                        {vehicle.statusText}
                      </span>
                    </td>
                    <td className="cell-time">
                      {vehicle.GateIn 
                        ? new Date(vehicle.GateIn).toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bảng tổng quan docks */}
      <div className="dock-table__content">
        <h4 className="dock-overview__title">📊 Tổng quan Docks</h4>
        <table>
          <thead>
            <tr>
              <th>Dock</th>
              <th>Status</th>
              <th>Vehicle</th>
              <th>Utilization</th>
              <th>Daily</th>
            </tr>
          </thead>
          <tbody>
            {docks?.map((dock, idx) => (
              <tr key={idx}>
                <td>
                  <span className={`status-dot status-dot--${dock.status}`}></span>
                  {dock.name}
                </td>
                <td>
                  <span className={`badge badge--${dock.status}`}>
                    {dock.status === 'loading' ? 'Loading' : 'Empty'}
                  </span>
                </td>
                <td className="vehicle-cell">{dock.currentVehicle || '-'}</td>
                <td>
                  <span className={`badge badge--${dock.utilization}`}>
                    {dock.utilizationText || '-'}
                  </span>
                </td>
                <td className="performance-cell">{dock.dailyPerformance || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DockTable;
