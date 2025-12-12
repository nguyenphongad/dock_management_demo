import React, { useState } from 'react';
import DockItemPopup from './DockItemPopup';

const DockItem = ({
  dockCode,
  vehicles = [],
  isCompact = false,
  orientation = 'vertical',
  labelPosition = 'top'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const vehicle1 = vehicles[0] || null;
  const vehicle2 = vehicles[1] || null;
  const hasVehicle = vehicle1 || vehicle2;

  // Xác định vị trí popup dựa trên labelPosition
  const getPopupPosition = () => {
    if (labelPosition === 'top') return 'bottom';
    if (labelPosition === 'bottom') return 'top';
    if (labelPosition === 'left') return 'right';
    if (labelPosition === 'right') return 'left';
    return 'top';
  };

  const renderDockContent = () => (
    <>
      {/* Label phía dưới (cho compact) */}
      {labelPosition === 'bottom' && (
        <div className="dock-item__label dock-item__label--bottom">
          <span>{dockCode}</span>
        </div>
      )}

      {/* Body - 2 SLOTS RÕ RÀNG */}
      <div className="dock-item__body">
        {/* SLOT 1 */}
        <div className={`dock-item__slot ${vehicle1 ? 'dock-item__slot--occupied' : ''}`}>
          {/* Không hiển thị nội dung, chỉ có visual indicator */}
        </div>
        
        {/* SLOT 2 */}
        <div className={`dock-item__slot ${vehicle2 ? 'dock-item__slot--occupied' : ''}`}>
          {/* Không hiển thị nội dung, chỉ có visual indicator */}
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
      <div 
        className={`dock-item-wrapper dock-item-wrapper--horizontal`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
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
        
        {/* POPUP BÊN NGOÀI - CHỈ HIỆN KHI HOVER */}
        {isHovered && (
          <DockItemPopup 
            dockCode={dockCode}
            vehicles={vehicles}
            position={getPopupPosition()}
          />
        )}
      </div>
    );
  }

  // Default vertical
  return (
    <div
      className="dock-item-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`dock-item dock-item--vertical dock-item--${isCompact ? 'compact' : 'normal'} ${hasVehicle ? 'dock-item--occupied' : 'dock-item--empty'}`}
      >
        {renderDockContent()}
      </div>
      
      {/* POPUP BÊN NGOÀI - CHỈ HIỆN KHI HOVER */}
      {isHovered && (
        <DockItemPopup 
          dockCode={dockCode}
          vehicles={vehicles}
          position={getPopupPosition()}
        />
      )}
    </div>
  );
};

export default DockItem;
