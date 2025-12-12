import React from 'react';
import { FiTruck, FiUser, FiClock } from 'react-icons/fi';
import './DockItemPopup.scss';

const DockItemPopup = ({ dockCode, vehicles, position = 'top' }) => {
  const formatTime = (dateTime) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`dock-popup dock-popup--${position}`}>
      <div className="dock-popup__arrow"></div>
      <div className="dock-popup__content">
        <div className="dock-popup__header">
          <h4>Dock {dockCode}</h4>
          <span className="vehicle-count">{vehicles.length}/2 xe</span>
        </div>
        
        <div className="dock-popup__body">
          {vehicles.length === 0 ? (
            <div className="no-vehicle-message">
              <FiTruck size={24} />
              <p>Không có xe nào ở dock</p>
            </div>
          ) : (
            <div className="vehicle-list">
              {vehicles.map((vehicle, index) => (
                <div key={index} className="vehicle-item">
                  <div className="vehicle-item__icon">
                    <FiTruck size={16} />
                  </div>
                  <div className="vehicle-item__info">
                    <div className="vehicle-item__row">
                      <span className="label">Biển số:</span>
                      <strong className="value">{vehicle.plateNumber}</strong>
                    </div>
                    <div className="vehicle-item__row">
                      <FiUser size={12} />
                      <span className="value">{vehicle.driverName || 'Chưa có thông tin'}</span>
                    </div>
                    <div className="vehicle-item__row">
                      <FiClock size={12} />
                      <span className="value">Vào: {formatTime(vehicle.gateInTime)}</span>
                    </div>
                    <div className="vehicle-item__status">
                      <span className={`status-indicator status-indicator--${vehicle.utilizationStatus || 'normal'}`}>
                        {vehicle.utilizationStatus === 'warning' ? '⚠️ Gần hết' : 
                         vehicle.utilizationStatus === 'exceeded' ? '🚨 Vượt' : 
                         '✅ Bình thường'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DockItemPopup;
