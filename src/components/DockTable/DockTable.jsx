import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { 
  getVehiclesFromStorage, 
  categorizeVehiclesByTime,
  extractDockCode 
} from '../../utils/vehicleStorageManager';

const DockTable = ({ docks, kpis }) => {
  const [insideWarehouseVehicles, setInsideWarehouseVehicles] = useState([]);
  const [waitingVehicles, setWaitingVehicles] = useState([]);
  const [enteringVehicles, setEnteringVehicles] = useState([]);
  const [isWaitingCollapsed, setIsWaitingCollapsed] = useState(false);

  // Hàm kiểm tra dock có hợp lệ không
  const isValidDock = (dockName) => {
    if (!dockName) return false;
    
    const dockCode = extractDockCode(dockName);
    if (!dockCode) return false;
    
    // Check A2, A3
    if (dockCode === 'A2' || dockCode === 'A3') return true;
    
    // Check B1-B20
    if (dockCode.startsWith('B')) {
      const num = parseInt(dockCode.substring(1));
      return num >= 1 && num <= 20;
    }
    
    // Check C1-C8
    if (dockCode.startsWith('C')) {
      const num = parseInt(dockCode.substring(1));
      return num >= 1 && num <= 8;
    }
    
    // Check D1-D3
    if (dockCode.startsWith('D')) {
      const num = parseInt(dockCode.substring(1));
      return num >= 1 && num <= 3;
    }
    
    return false;
  };

  useEffect(() => {
    const updateVehiclesList = () => {
      const storedVehicles = getVehiclesFromStorage();
      const categorized = categorizeVehiclesByTime(storedVehicles);
      
      // Xe đang trong kho - CHỈ LỌC CÁC DOCK HỢP LỆ
      const insideVehicles = [
        ...categorized.entering,
        ...categorized.loading
      ]
        .filter(v => isValidDock(v.DockName)) // Thêm filter ở đây
        .map(v => ({
          ...v,
          dockCode: extractDockCode(v.DockName),
          statusText: categorized.entering.some(ev => ev.ID === v.ID) 
            ? 'Đang vào' 
            : 'Đang làm hàng'
        }));
      
      // Xe đang chờ - KHÔNG LỌC, GIỮ NGUYÊN TẤT CẢ
      const waitingWithDockCode = categorized.waiting.map(v => ({
        ...v,
        dockCode: extractDockCode(v.DockName)
      }));
      
      const enteringWithDockCode = categorized.entering.map(v => ({
        ...v,
        dockCode: extractDockCode(v.DockName)
      }));
      
      setInsideWarehouseVehicles(insideVehicles);
      setWaitingVehicles(waitingWithDockCode);
      setEnteringVehicles(enteringWithDockCode);

      console.log('📋 DockTable updated:', {
        insideWarehouse: insideVehicles.length,
        insideWarehouseFiltered: `(only valid docks: A2,A3,B1-B20,C1-C8,D1-D3)`,
        waiting: waitingWithDockCode.length,
        waitingNote: '(all docks, no filter)',
        entering: enteringWithDockCode.length
      });
    };
    
    updateVehiclesList();
    const interval = setInterval(updateVehiclesList, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const allWaitingVehicles = [...waitingVehicles, ...enteringVehicles];

  return (
    <div className="dock-table">
      <h3 className="dock-table__title">Bảng Giám Sát Dock</h3>

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

      {/* Bảng xe chờ & đang vào - Tích hợp WaitingAreaTable */}
      <div className="dock-table__vehicles-section">
        <div className="vehicles-section__header">
          <h4 className="vehicles-section__title">
            🚗 Bãi chờ & Đang vào ({allWaitingVehicles.length})
          </h4>
          <div className="vehicles-section__stats">
            Chờ: {waitingVehicles.length} | Đang vào: {enteringVehicles.length}
          </div>
          <button 
            className="vehicles-section__toggle"
            onClick={() => setIsWaitingCollapsed(!isWaitingCollapsed)}
            title={isWaitingCollapsed ? "Mở rộng" : "Thu gọn"}
          >
            {isWaitingCollapsed ? <FiChevronDown size={18} /> : <FiChevronUp size={18} />}
          </button>
        </div>
        
        <div className={`vehicles-section__content ${isWaitingCollapsed ? 'vehicles-section__content--collapsed' : ''}`}>
          {allWaitingVehicles.length === 0 ? (
            <div className="no-vehicles">Không có xe đang chờ</div>
          ) : (
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Biển số</th>
                  <th>Dock dự kiến</th>
                  <th>Tài xế</th>
                  <th>Trạng thái</th>
                  <th>Vào cổng</th>
                </tr>
              </thead>
              <tbody>
                {allWaitingVehicles.map((vehicle) => {
                  const isEntering = enteringVehicles.some(v => v.ID === vehicle.ID);
                  return (
                    <tr key={vehicle.ID} className={isEntering ? 'row-entering' : ''}>
                      <td className="cell-id">{vehicle.ID}</td>
                      <td className="cell-regno">
                        <strong>{vehicle.RegNo}</strong>
                      </td>
                      <td className="cell-dock">
                        <span className="dock-badge">
                          {vehicle.dockCode || vehicle.DockName || '-'}
                        </span>
                      </td>
                      <td className="cell-driver">{vehicle.DriverName || 'Chưa cập nhật'}</td>
                      <td className="cell-status">
                        <span className={`status-badge ${isEntering ? 'status-badge--entering' : 'status-badge--waiting'}`}>
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
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DockTable;
