import React from 'react';
import { FiTruck } from 'react-icons/fi';

const DockItem = ({
  dockCode,
  vehicles = [],
  isCompact = false,
  orientation = 'vertical',
  labelPosition = 'top'
}) => {
  const vehicle1 = vehicles[0] || null;
  const vehicle2 = vehicles[1] || null;
  const hasVehicle = vehicle1 || vehicle2;

  const renderDockContent = () => (
    <>

      {/* Label phía dưới (cho compact) */}
      {labelPosition === 'bottom' && (
        <div className="dock-item__label dock-item__label--bottom">
          <span>{dockCode}</span>
        </div>
      )}

      
      {/* Body - 2 vị trí xe */}
      <div className="dock-item__body">
        <div className="dock-item__position">
          {vehicle1 ? (
            <>
              <div className="vehicle-icon">
                <FiTruck size={isCompact ? 10 : 12} />
              </div>
              <div className="vehicle-plate">{vehicle1.plateNumber}</div>
              <div className={`vehicle-indicator vehicle-indicator--${vehicle1.utilizationStatus}`}></div>
            </>
          ) : (
            <div className="position-empty">-</div>
          )}
        </div>

        <div className="dock-item__divider"></div>

        <div className="dock-item__position">
          {vehicle2 ? (
            <>
              <div className="vehicle-icon">
                <FiTruck size={isCompact ? 10 : 12} />
              </div>
              <div className="vehicle-plate">{vehicle2.plateNumber}</div>
              <div className={`vehicle-indicator vehicle-indicator--${vehicle2.utilizationStatus}`}></div>
            </>
          ) : (
            <div className="position-empty">-</div>
          )}
        </div>
      </div>


      {/* Label phía trên (cho vertical) */}
      {labelPosition === 'top' && (
        <div className="dock-item__label dock-item__label--top">
          <span>{dockCode}</span>
        </div>
      )}


    </>
  );

  // Wrapper với label bên ngoài (cho D1-D3, A2-A3)
  if (labelPosition === 'left' || labelPosition === 'right') {
    return (
      <div className={`dock-item-wrapper dock-item-wrapper--horizontal`}>


        <div
          className={`dock-item dock-item--horizontal dock-item--${isCompact ? 'compact' : 'normal'} ${hasVehicle ? 'dock-item--occupied' : 'dock-item--empty'}`}
        >
          {renderDockContent()}
        </div>
        {labelPosition === 'left' && (
          <div className="dock-item__label-outside dock-item__label-outside--right">
            {dockCode}
          </div>
        )}
        {labelPosition === 'right' && (
          <div className="dock-item__label-outside dock-item__label-outside--right">
            {dockCode}
          </div>
        )}
      </div>
    );
  }

  // Default vertical
  return (
    <div
      className={`dock-item dock-item--vertical dock-item--${isCompact ? 'compact' : 'normal'} ${hasVehicle ? 'dock-item--occupied' : 'dock-item--empty'}`}
    >
      {renderDockContent()}
    </div>
  );
};

export default DockItem;
