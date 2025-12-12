import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { 
  getVehiclesFromStorage, 
  categorizeVehiclesByTime,
  extractDockCode 
} from '../../utils/vehicleStorageManager';

const DockTable = ({ docks = [], kpis = {}, isVisible: isVisibleProp = true, onToggleVisibility }) => {
  const [insideWarehouseVehicles, setInsideWarehouseVehicles] = useState([]);
  const [waitingVehicles, setWaitingVehicles] = useState([]);
  const [enteringVehicles, setEnteringVehicles] = useState([]);
  const [isWaitingCollapsed, setIsWaitingCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(isVisibleProp);

  // Sync với prop từ parent
  useEffect(() => {
    setIsVisible(isVisibleProp);
  }, [isVisibleProp]);

  // Hàm toggle visibility
  const handleToggle = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    if (onToggleVisibility) {
      onToggleVisibility(newVisibility);
    }
  };

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
      
      const insideVehicles = [
        ...categorized.entering,
        ...categorized.loading
      ]
        .filter(v => isValidDock(v.DockName))
        .map(v => ({
          ...v,
          dockCode: extractDockCode(v.DockName),
          statusText: categorized.entering.some(ev => ev.ID === v.ID) 
            ? 'Đang vào' 
            : 'Đang làm hàng'
        }));
      
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
    <div className={`dock-table ${isVisible ? 'dock-table--visible' : 'dock-table--hidden'}`}>
      <h3 className="dock-table__title">📋 Bảng Giám Sát Dock</h3>

      <div className="dock-table__content">
        {/* Bảng xe đang trong kho */}
        <div className="vehicle-section">
          <div className="vehicle-section__header">
            <h4 className="vehicle-section__title">
              🚛 Xe trong kho <span>({insideWarehouseVehicles.length})</span>
            </h4>
          </div>
          <div className="vehicle-section__content">
            {insideWarehouseVehicles.length === 0 ? (
              <div className="no-vehicles">Không có xe nào trong kho</div>
            ) : (
              <table>
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
                      <td>{vehicle.ID}</td>
                      <td>
                        <strong>{vehicle.RegNo}</strong>
                      </td>
                      <td>
                        <span className="badge badge--loading">
                          {vehicle.dockCode || vehicle.DockName || '-'}
                        </span>
                      </td>
                      <td>{vehicle.DriverName || '-'}</td>
                      <td>
                        {/* HIỂN THỊ ĐÚNG DockRegisterStatus */}
                        <span className="badge badge--loading">
                          {vehicle.DockRegisterStatus || '-'}
                        </span>
                      </td>
                      <td>
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

        {/* Bảng xe chờ & đang vào */}
        <div className="vehicle-section">
          <div className="vehicle-section__header">
            <h4 className="vehicle-section__title">
              🚗 Bãi chờ & Đang vào <span>({allWaitingVehicles.length})</span>
            </h4>
            <div className="vehicle-section__stats">
              Chờ: {waitingVehicles.length} | Đang vào: {enteringVehicles.length}
            </div>
            <button 
              className="vehicle-section__toggle"
              onClick={() => setIsWaitingCollapsed(!isWaitingCollapsed)}
              title={isWaitingCollapsed ? "Mở rộng" : "Thu gọn"}
            >
              {isWaitingCollapsed ? <FiChevronDown size={16} /> : <FiChevronUp size={16} />}
            </button>
          </div>
          
          <div className={`vehicle-section__content ${isWaitingCollapsed ? 'vehicle-section__content--collapsed' : ''}`}>
            {allWaitingVehicles.length === 0 ? (
              <div className="no-vehicles">Không có xe đang chờ</div>
            ) : (
              <table>
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
                  {allWaitingVehicles.map((vehicle) => {
                    const isEntering = enteringVehicles.some(v => v.ID === vehicle.ID);
                    return (
                      <tr key={vehicle.ID} className={isEntering ? 'row-entering' : ''}>
                        <td>{vehicle.ID}</td>
                        <td>
                          <strong>{vehicle.RegNo}</strong>
                        </td>
                        <td>
                          <span className="badge badge--empty">
                            {vehicle.dockCode || vehicle.DockName || '-'}
                          </span>
                        </td>
                        <td>{vehicle.DriverName || 'Chưa cập nhật'}</td>
                        <td>
                          {/* HIỂN THỊ ĐÚNG DockRegisterStatus */}
                          <span className="badge badge--waiting">
                            {vehicle.DockRegisterStatus || '-'}
                          </span>
                        </td>
                        <td>
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
    </div>
  );
};

export default DockTable;
