import React from 'react';

const KPICards = ({ totalVehicles, vehiclesInWarehouse, loadingVehicles, completedToday }) => {
  return (
    <div className="kpi-section">
      <div className="kpi-card kpi-card--blue">
        <div className="kpi-card__value">{totalVehicles}</div>
        <div className="kpi-card__label">Tổng Lượt Xe</div>
      </div>
      <div className="kpi-card kpi-card--orange">
        <div className="kpi-card__value">{vehiclesInWarehouse} <span className="kpi-unit">xe</span></div>
        <div className="kpi-card__label">Tổ Chờ Vào Dock (TB)</div>
        <div className="kpi-card__meta">Target: 14g (Good) - 30g (Critical)</div>
      </div>
      <div className="kpi-card kpi-card--green">
        <div className="kpi-card__value">{loadingVehicles} <span className="kpi-unit">xe</span></div>
        <div className="kpi-card__label">Tổ Xử Lý Tại Dock (TB)</div>
        <div className="kpi-card__meta">Target: 40p (Good) - 42p (Critical)</div>
      </div>
      <div className="kpi-card kpi-card--purple">
        <div className="kpi-card__value">{completedToday} <span className="kpi-unit">p</span></div>
        <div className="kpi-card__label">Tỷ Lệ Đạt Chuẩn</div>
        <div className="kpi-card__meta">Cả 3: 94% đạt chuẩn xử lý</div>
      </div>
    </div>
  );
};

export default KPICards;
