import React, { useState, useEffect } from 'react';
import { FiTruck } from 'react-icons/fi';
import { 
  getVehiclesFromStorage, 
  categorizeVehiclesByTime,
  extractDockCode 
} from '../../utils/vehicleStorageManager';
import './WaitingAreaTable.scss';

const WaitingAreaTable = () => {
  const [waitingVehicles, setWaitingVehicles] = useState([]);
  const [enteringVehicles, setEnteringVehicles] = useState([]);

  useEffect(() => {
    const updateWaitingList = () => {
      const storedVehicles = getVehiclesFromStorage();
      const categorized = categorizeVehiclesByTime(storedVehicles);
      
      // Thêm dock code cho mỗi vehicle
      const waitingWithDockCode = categorized.waiting.map(v => ({
        ...v,
        dockCode: extractDockCode(v.DockName)
      }));
      
      const enteringWithDockCode = categorized.entering.map(v => ({
        ...v,
        dockCode: extractDockCode(v.DockName)
      }));
      
      setWaitingVehicles(waitingWithDockCode);
      setEnteringVehicles(enteringWithDockCode);
      
      console.log('Waiting list updated:', {
        waiting: waitingWithDockCode.length,
        entering: enteringWithDockCode.length
      });
    };
    
    // Initial load
    updateWaitingList();
    
    // Update mỗi 5 giây
    const interval = setInterval(updateWaitingList, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const allVehicles = [...waitingVehicles, ...enteringVehicles];

  return (
    <div className="waiting-area-table">
      <div className="waiting-area-table__header">
        <FiTruck size={18} />
        <h3>Bãi chờ & Đang vào ({allVehicles.length})</h3>
        <div style={{ fontSize: '12px', marginLeft: '10px', color: '#999' }}>
          Chờ: {waitingVehicles.length} | Đang vào: {enteringVehicles.length}
        </div>
      </div>

      <div className="waiting-area-table__content">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Biển số xe (RegNo)</th>
              <th>Dock dự kiến</th>
              <th>Tài xế</th>
              <th>Trạng thái</th>
              <th>Thời gian vào cổng</th>
            </tr>
          </thead>
          <tbody>
            {allVehicles.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  Không có xe đang chờ
                </td>
              </tr>
            ) : (
              allVehicles.map((vehicle) => {
                const isEntering = enteringVehicles.some(v => v.ID === vehicle.ID);
                return (
                  <tr key={vehicle.ID} style={{ backgroundColor: isEntering ? '#e3f2fd' : 'transparent' }}>
                    <td className="cell-id">{vehicle.ID}</td>
                    <td className="cell-regno">
                      <strong>{vehicle.RegNo}</strong>
                    </td>
                    <td className="cell-dock">
                      <strong style={{ color: '#667eea', fontSize: '15px' }}>
                        {vehicle.dockCode || vehicle.DockName || '-'}
                      </strong>
                      {vehicle.DockName && vehicle.dockCode && (
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                          {vehicle.DockName}
                        </div>
                      )}
                    </td>
                    <td className="cell-driver">
                      {vehicle.DriverName || 'Chưa cập nhật'}
                    </td>
                    <td className="cell-status">
                      <span className={`status-badge status-badge--${isEntering ? 'entering' : 'waiting'}`}>
                        {isEntering ? '🚗 Đang vào' : vehicle.DockRegisterStatus || 'Đang chờ'}
                      </span>
                    </td>
                    <td className="cell-time">
                      {vehicle.GateIn 
                        ? new Date(vehicle.GateIn).toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit'
                          })
                        : '-'
                      }
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WaitingAreaTable;
