import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDockData } from '../../redux/thunks/dockThunk';
import { REFRESH_INTERVAL } from '../../utils/constants';
import { getVehiclesFromStorage } from '../../utils/vehicleStorageManager';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

// CustomizedDot component
const CustomizedDot = (props) => {
  const { cx, cy, value } = props;

  if (cx == null || cy == null) {
    return null;
  }

  // Nếu số xe = 0, hiển thị biểu tượng xanh (không có xe)
  if (value === 0) {
    return (
      <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="red" viewBox="0 0 1024 1024">
        <path d="M517.12 53.248q95.232 0 179.2 36.352t145.92 98.304 98.304 145.92 36.352 179.2-36.352 179.2-98.304 145.92-145.92 98.304-179.2 36.352-179.2-36.352-145.92-98.304-98.304-145.92-36.352-179.2 36.352-179.2 98.304-145.92 145.92-98.304 179.2-36.352zM663.552 261.12q-15.36 0-28.16 6.656t-23.04 18.432-15.872 27.648-5.632 33.28q0 35.84 21.504 61.44t51.2 25.6 51.2-25.6 21.504-61.44q0-17.408-5.632-33.28t-15.872-27.648-23.04-18.432-28.16-6.656zM373.76 261.12q-29.696 0-50.688 25.088t-20.992 60.928 20.992 61.44 50.688 25.6 50.176-25.6 20.48-61.44-20.48-60.928-50.176-25.088zM520.192 602.112q-51.2 0-97.28 9.728t-82.944 27.648-62.464 41.472-35.84 51.2q-1.024 1.024-1.024 2.048-1.024 3.072-1.024 8.704t2.56 11.776 7.168 11.264 12.8 6.144q25.6-27.648 62.464-50.176 31.744-19.456 79.36-35.328t114.176-15.872q67.584 0 116.736 15.872t81.92 35.328q37.888 22.528 63.488 50.176 17.408-5.12 19.968-18.944t0.512-18.944-3.072-7.168-1.024-3.072q-26.624-55.296-100.352-88.576t-176.128-33.28z" />
      </svg>
    );
  }

  // Nếu số xe > 0, hiển thị biểu tượng đỏ (có xe)
  return (
    <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="green" viewBox="0 0 1024 1024">
      <path d="M512 1009.984c-274.912 0-497.76-222.848-497.76-497.76s222.848-497.76 497.76-497.76c274.912 0 497.76 222.848 497.76 497.76s-222.848 497.76-497.76 497.76zM340.768 295.936c-39.488 0-71.52 32.8-71.52 73.248s32.032 73.248 71.52 73.248c39.488 0 71.52-32.8 71.52-73.248s-32.032-73.248-71.52-73.248zM686.176 296.704c-39.488 0-71.52 32.8-71.52 73.248s32.032 73.248 71.52 73.248c39.488 0 71.52-32.8 71.52-73.248s-32.032-73.248-71.52-73.248zM772.928 555.392c-18.752-8.864-40.928-0.576-49.632 18.528-40.224 88.576-120.256 143.552-208.832 143.552-85.952 0-164.864-52.64-205.952-137.376-9.184-18.912-31.648-26.592-50.08-17.28-18.464 9.408-21.216 21.472-15.936 32.64 52.8 111.424 155.232 186.784 269.76 186.784 117.984 0 217.12-70.944 269.76-186.784 8.672-19.136 9.568-31.2-9.12-40.096z" />
    </svg>
  );
};

const DashboardDetail = () => {
  const dispatch = useDispatch();
  const { selectedWarehouse, autoRefresh } = useSelector(state => state.dock);
  const [vehicles, setVehicles] = useState([]);
  const [timeSlotData, setTimeSlotData] = useState([]);
  const [dockProductionData, setDockProductionData] = useState([]);
  const [speedData, setSpeedData] = useState([]);
  const [idleTimeData, setIdleTimeData] = useState([]);

  useEffect(() => {
    dispatch(fetchDockData({ warehouse: selectedWarehouse }));
  }, [dispatch, selectedWarehouse]);

  useEffect(() => {
    const updateVehicles = () => {
      const storedVehicles = getVehiclesFromStorage();
      setVehicles(storedVehicles);
      
      // Lưu vào localStorage
      localStorage.setItem('dashboard_vehicles_data', JSON.stringify(storedVehicles));
      
      calculateChartData(storedVehicles);
    };

    // Load from localStorage first
    const savedData = localStorage.getItem('dashboard_vehicles_data');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setVehicles(parsedData);
      calculateChartData(parsedData);
    }

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

  const calculateChartData = (vehiclesData) => {
    // 1. Phân tích khung giờ (Line Chart)
    const timeSlots = Array.from({ length: 18 }, (_, i) => i + 6); // 6h -> 23h
    const timeSlotAnalysis = timeSlots.map(hour => {
      const count = vehiclesData.filter(v => {
        if (!v.GateIn) return false;
        const gateInHour = new Date(v.GateIn).getHours();
        return gateInHour === hour;
      }).length;
      return { time: `${hour}:00`, count };
    });
    setTimeSlotData(timeSlotAnalysis);
    localStorage.setItem('dashboard_timeslot_data', JSON.stringify(timeSlotAnalysis));

    // 2. Sản lượng theo dock (Tiny Bar Chart - Top 5)
    const dockProduction = vehiclesData.reduce((acc, v) => {
      if (!v.DockName || !v.LoadingEnd) return acc;
      const dockCode = v.DockName.match(/[A-D]\d+/)?.[0] || v.DockName;
      acc[dockCode] = (acc[dockCode] || 0) + 1;
      return acc;
    }, {});

    const topDocks = Object.entries(dockProduction)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([dock, count]) => ({ dock, count }));
    setDockProductionData(topDocks);
    localStorage.setItem('dashboard_production_data', JSON.stringify(topDocks));

    // 3. Tốc độ xử lý (Horizontal Bar - Top 5 fastest)
    const processingSpeed = vehiclesData
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

    const speedAnalysis = Object.entries(avgSpeedByDock)
      .map(([dock, data]) => ({
        dock,
        avg: Math.round(data.total / data.count)
      }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 5);
    setSpeedData(speedAnalysis);
    localStorage.setItem('dashboard_speed_data', JSON.stringify(speedAnalysis));

    // 4. Thời gian dock TRỐNG (Idle time - Top 5 có thời gian trống NHIỀU NHẤT)
    const TOTAL_WORK_HOURS = 16 * 60; // 16 giờ = 960 phút (6h-22h)
    
    // Tính thời gian hoạt động của từng dock
    const dockBusyTime = vehiclesData.reduce((acc, v) => {
      if (!v.DockName || !v.LoadingStart || !v.LoadingEnd) return acc;
      const dockCode = v.DockName.match(/[A-D]\d+/)?.[0] || v.DockName;
      
      const duration = (new Date(v.LoadingEnd) - new Date(v.LoadingStart)) / 60000; // phút
      acc[dockCode] = (acc[dockCode] || 0) + duration;
      return acc;
    }, {});

    // Lấy tất cả dock (A2, A3, B1-B20, C1-C8, D1-D3)
    const allDocks = [
      'A2', 'A3',
      ...Array.from({ length: 20 }, (_, i) => `B${i + 1}`),
      ...Array.from({ length: 8 }, (_, i) => `C${i + 1}`),
      'D1', 'D2', 'D3'
    ];

    const idleTimeAnalysis = allDocks.map(dock => {
      const busyTime = dockBusyTime[dock] || 0;
      const idleTime = TOTAL_WORK_HOURS - busyTime;
      return {
        dock,
        idleTime: Math.max(0, Math.round(idleTime)) // Thời gian trống (phút)
      };
    })
    .sort((a, b) => b.idleTime - a.idleTime) // Sắp xếp giảm dần (dock trống nhiều nhất lên đầu)
    .slice(0, 5);

    setIdleTimeData(idleTimeAnalysis);
    localStorage.setItem('dashboard_idle_data', JSON.stringify(idleTimeAnalysis));
  };

  // Tính toán KPI
  const totalVehicles = vehicles.length;
  const vehiclesInWarehouse = vehicles.filter(v => v.GateIn && !v.GateOut).length;
  const loadingVehicles = vehicles.filter(v => v.LoadingStart && !v.LoadingEnd).length;
  const completedToday = vehicles.filter(v => {
    if (!v.GateOut) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(v.GateOut) >= today;
  }).length;

  const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#27ae60', '#9b59b6'];

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

        {/* Line Chart - Full Width with CustomizedDot */}
        <div className="chart-card chart-card--full">
          <h3 className="chart-card__title">⏰ Phân Tích Khung Giờ: Lượng Xe Vào Load Hàng</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart 
              data={timeSlotData}
              margin={{
                top: 20,
                right: 30,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3498db" 
                strokeWidth={3}
                dot={CustomizedDot}
                name="Số xe"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-card__note">
            🟢 Xanh: Không có xe (0 xe) | 🔴 Đỏ: Có xe đang hoạt động (&gt; 0 xe)
          </div>
        </div>

        {/* Horizontal Charts Grid */}
        <div className="charts-grid-horizontal">
          {/* Sản Lượng - Tiny Bar */}
          <div className="chart-card">
            <h3 className="chart-card__title">📊 Sản Lượng: Tổng Số Xe Đã Xử Lý</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart layout="vertical" data={dockProductionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="dock" type="category" />
                <Tooltip />
                <Bar dataKey="count" name="Số xe">
                  {dockProductionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="chart-card__note">Tổng hợp số liệu trên toàn thành phố (Daily Performance)</div>
          </div>

          {/* Tốc Độ - Horizontal Bar */}
          <div className="chart-card">
            <h3 className="chart-card__title">⚡ Tốc Độ: Hiệu Suất Xử Lý (Avg)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart layout="vertical" data={speedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="dock" type="category" />
                <Tooltip />
                <Bar dataKey="avg" fill="#e67e22" name="Phút" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Khả Dụng - Horizontal Bar */}
          <div className="chart-card">
            <h3 className="chart-card__title">⏱️ Khả Dụng: Thời Gian Dock Trống</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart layout="vertical" data={idleTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="dock" type="category" />
                <Tooltip />
                <Bar dataKey="idleTime" fill="#27ae60" name="Phút trống" />
              </BarChart>
            </ResponsiveContainer>
            <div className="chart-card__note">Top 5 dock có thời gian trống nhiều nhất (sẵn sàng)</div>
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
                          {vehicle.LoadingEnd ? 'Đã hoàn thành' : vehicle.LoadingStart ? 'Đang hoạt động' : vehicle.GateIn ? 'Đã vào cổng' : 'Chờ'}
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
