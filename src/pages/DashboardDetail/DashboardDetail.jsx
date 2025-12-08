import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDockData } from '../../redux/thunks/dockThunk';
import { REFRESH_INTERVAL } from '../../utils/constants';
import { getVehiclesFromStorage } from '../../utils/vehicleStorageManager';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';


const DashboardDetail = () => {
  const dispatch = useDispatch();
  const { selectedWarehouse, autoRefresh } = useSelector(state => state.dock);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    dispatch(fetchDockData({ warehouse: selectedWarehouse }));
  }, [dispatch, selectedWarehouse]);

  useEffect(() => {
    const updateVehicles = () => {
      const storedVehicles = getVehiclesFromStorage();
      setVehicles(storedVehicles);
    };

    updateVehicles();
    const interval = setInterval(updateVehicles, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      dispatch(fetchDockData({ warehouse: selectedWarehouse }));
    }, REFRESH_INTERVAL);

    return () => clearInterval(timer);
  }, [dispatch, selectedWarehouse, autoRefresh]);

  // Tính toán số liệu
  const totalVehicles = vehicles.length;
  const vehiclesInWarehouse = vehicles.filter(v => v.GateIn && !v.GateOut).length;
  const loadingVehicles = vehicles.filter(v => v.LoadingStart && !v.LoadingEnd).length;
  const completedToday = vehicles.filter(v => {
    if (!v.GateOut) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(v.GateOut) >= today;
  }).length;

  // Phân tích khung giờ
  const timeSlots = ['6:00', '7:00', '8:00', '9:00', '10:00', '11:00'];
  const timeSlotData = timeSlots.map(slot => {
    const hour = parseInt(slot.split(':')[0]);
    const count = vehicles.filter(v => {
      if (!v.GateIn) return false;
      const gateInHour = new Date(v.GateIn).getHours();
      return gateInHour === hour;
    }).length;
    return { time: slot, count };
  });

  // Sản lượng theo dock
  const dockProduction = vehicles.reduce((acc, v) => {
    if (!v.DockName || !v.LoadingEnd) return acc;
    const dockCode = v.DockName.match(/[A-D]\d+/)?.[0] || v.DockName;
    acc[dockCode] = (acc[dockCode] || 0) + 1;
    return acc;
  }, {});

  const topDocks = Object.entries(dockProduction)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Tốc độ xử lý
  const processingSpeed = vehicles
    .filter(v => v.LoadingStart && v.LoadingEnd)
    .map(v => {
      const dockCode = v.DockName?.match(/[A-D]\d+/)?.[0] || v.DockName;
      const duration = (new Date(v.LoadingEnd) - new Date(v.LoadingStart)) / 60000;
      return { dock: dockCode, duration };
    });

  const avgSpeedByDock = processingSpeed.reduce((acc, item) => {
    if (!acc[item.dock]) {
      acc[item.dock] = { total: 0, count: 0 };
    }
    acc[item.dock].total += item.duration;
    acc[item.dock].count += 1;
    return acc;
  }, {});

  const speedData = Object.entries(avgSpeedByDock)
    .map(([dock, data]) => ({
      dock,
      avg: Math.round(data.total / data.count)
    }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 5);

  // Kho dùng thời gian dock trống
  const dockUtilization = vehicles.reduce((acc, v) => {
    if (!v.DockName) return acc;
    const dockCode = v.DockName.match(/[A-D]\d+/)?.[0] || v.DockName;
    if (!acc[dockCode]) acc[dockCode] = 0;
    if (v.LoadingStart && v.LoadingEnd) {
      const duration = (new Date(v.LoadingEnd) - new Date(v.LoadingStart)) / 60000;
      acc[dockCode] += duration;
    }
    return acc;
  }, {});

  const utilizationData = Object.entries(dockUtilization)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="dashboard-detail">
      <DashboardHeader 
        title="Dashboard Detail"
        subtitle="Analytics & Reports"
        icon="📊"
      />

      <div className="dashboard-detail__content">
        {/* KPI Cards */}
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

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Time Slot Analysis */}
          <div className="chart-card">
            <h3 className="chart-card__title">⏰ Phân Tích Khung Giờ: Lượng Xe Vào Load Hàng</h3>
            <div className="bar-chart">
              {timeSlotData.map(slot => (
                <div key={slot.time} className="bar-chart__item">
                  <div className="bar-chart__bar">
                    <div 
                      className="bar-chart__fill"
                      style={{ height: `${(slot.count / Math.max(...timeSlotData.map(s => s.count))) * 100}%` }}
                    >
                      {slot.count}
                    </div>
                  </div>
                  <div className="bar-chart__label">{slot.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Production by Dock */}
          <div className="chart-card">
            <h3 className="chart-card__title">📊 Sản Lượng: Tổng Số Xe Đã Xử Lý</h3>
            <div className="horizontal-bar-chart">
              {topDocks.map(([dock, count], idx) => (
                <div key={dock} className="horizontal-bar-chart__item">
                  <div className="horizontal-bar-chart__label">{dock}</div>
                  <div className="horizontal-bar-chart__bar">
                    <div 
                      className="horizontal-bar-chart__fill"
                      style={{ width: `${(count / topDocks[0][1]) * 100}%` }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chart-card__note">Tổng hợp số liệu trên toàn thành phố (Daily Performance)</div>
          </div>

          {/* Processing Speed */}
          <div className="chart-card">
            <h3 className="chart-card__title">⚡ Tốc Độ: Hiệu Suất Xử Lý (Avg)</h3>
            <div className="horizontal-bar-chart">
              {speedData.map(item => (
                <div key={item.dock} className="horizontal-bar-chart__item">
                  <div className="horizontal-bar-chart__label">{item.dock}</div>
                  <div className="horizontal-bar-chart__bar horizontal-bar-chart__bar--speed">
                    <div 
                      className="horizontal-bar-chart__fill"
                      style={{ width: `${Math.min((item.avg / 60) * 100, 100)}%` }}
                    >
                      {item.avg}p
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dock Utilization */}
          <div className="chart-card">
            <h3 className="chart-card__title">⏱️ Khả Dụng: Thời Gian Dock Trống</h3>
            <div className="horizontal-bar-chart">
              {utilizationData.map(([dock, minutes]) => (
                <div key={dock} className="horizontal-bar-chart__item">
                  <div className="horizontal-bar-chart__label">{dock}</div>
                  <div className="horizontal-bar-chart__bar horizontal-bar-chart__bar--utilization">
                    <div className="horizontal-bar-chart__fill">
                      {Math.round(minutes)}p
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chart-card__note">Màu xanh: Dock đang trống (sẵn sàng)</div>
          </div>
        </div>

        {/* Chi Tiết Hoạt Động Xe */}
        <div className="vehicle-activity-table">
          <h3 className="vehicle-activity-table__title">🚛 Chi Tiết Hoạt Động Xe</h3>
          <div className="vehicle-activity-table__content">
            <table>
              <thead>
                <tr>
                  <th>BIỂN SỐ</th>
                  <th>DOCK</th>
                  <th>VÀO CỔNG</th>
                  <th>VÀO DOCK</th>
                  <th>BẮT ĐẦU CHỜ</th>
                  <th>TG CHỜ LÝ</th>
                  <th>TG ĐẾN LÝ</th>
                  <th>ĐÁNH GIÁ TG</th>
                  <th>TRẠNG THÁI</th>
                  <th>TỶ LỆ ĐẠT MỨC</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.slice(0, 20).map(vehicle => {
                  const waitTime = vehicle.GateIn && vehicle.LoadingStart
                    ? Math.round((new Date(vehicle.LoadingStart) - new Date(vehicle.GateIn)) / 60000)
                    : 0;
                  const processingTime = vehicle.LoadingStart && vehicle.LoadingEnd
                    ? Math.round((new Date(vehicle.LoadingEnd) - new Date(vehicle.LoadingStart)) / 60000)
                    : 0;
                  
                  const isOnTime = waitTime <= 30 && processingTime <= 45;

                  return (
                    <tr key={vehicle.ID}>
                      <td>{vehicle.RegNo}</td>
                      <td>{vehicle.DockName?.match(/[A-D]\d+/)?.[0] || '-'}</td>
                      <td>{vehicle.GateIn ? new Date(vehicle.GateIn).toLocaleTimeString('vi-VN') : '-'}</td>
                      <td>{vehicle.LoadingStart ? new Date(vehicle.LoadingStart).toLocaleTimeString('vi-VN') : '-'}</td>
                      <td>{vehicle.GateIn ? new Date(vehicle.GateIn).toLocaleTimeString('vi-VN') : '-'}</td>
                      <td>{waitTime}p</td>
                      <td>{processingTime}p</td>
                      <td>
                        <span className={`badge badge--${isOnTime ? 'success' : 'warning'}`}>
                          {isOnTime ? 'Tốt' : 'Ngày cập'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge--${vehicle.LoadingEnd ? 'success' : vehicle.LoadingStart ? 'info' : 'default'}`}>
                          {vehicle.LoadingEnd ? 'Tốt' : vehicle.LoadingStart ? 'Đang hoàn thành' : vehicle.GateIn ? 'Đã hoàn thành' : 'Đã vào cổng'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge--${isOnTime ? 'success' : 'danger'}`}>
                          {isOnTime ? 'Trong định mức' : vehicle.LoadingEnd ? 'Vượt định mức' : 'Gần hết định mức'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDetail;
