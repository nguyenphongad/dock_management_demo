import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDockData } from '../../../redux/thunks/dockThunk';
import { setSelectedWarehouse } from '../../../redux/slices/dockSlice';
import { WAREHOUSE_TYPES } from '../../../utils/constants';
import { getVehiclesFromStorage } from '../../../utils/vehicleStorageManager';
import {
  calculateTimeSlotData,
  calculateDockProductionData,
  calculateSpeedData,
  calculateIdleTimeData,
  calculateKPIs,
  calculateVehicleActivity,
  formatTime,
  saveChartDataToStorage,
  loadChartDataFromStorage
} from '../../../utils/chartCalculations';
import DashboardHeader from '../../../components/DashboardHeader/DashboardHeader';
import KPICards from '../../../components/Charts/KPICards';
import TimeSlotChart from '../../../components/Charts/TimeSlotChart';
import DockProductionChart from '../../../components/Charts/DockProductionChart';
import SpeedChart from '../../../components/Charts/SpeedChart';
import IdleTimeChart from '../../../components/Charts/IdleTimeChart';

const DashboardDetailBKD = () => {
  const dispatch = useDispatch();
  const [vehicles, setVehicles] = useState([]);
  const [timeSlotData, setTimeSlotData] = useState([]);
  const [dockProductionData, setDockProductionData] = useState([]);
  const [speedData, setSpeedData] = useState([]);
  const [idleTimeData, setIdleTimeData] = useState([]);
  const [kpis, setKpis] = useState({
    totalVehicles: 0,
    vehiclesInWarehouse: 0,
    loadingVehicles: 0,
    completedToday: 0
  });

  useEffect(() => {
    dispatch(setSelectedWarehouse(WAREHOUSE_TYPES.BKD));
    dispatch(fetchDockData({ warehouse: WAREHOUSE_TYPES.BKD }));
  }, [dispatch]);

  useEffect(() => {
    const updateVehicles = () => {
      const storedVehicles = getVehiclesFromStorage();
      setVehicles(storedVehicles);
      
      // Tính toán tất cả dữ liệu biểu đồ
      const chartData = {
        timeSlot: calculateTimeSlotData(storedVehicles),
        production: calculateDockProductionData(storedVehicles),
        speed: calculateSpeedData(storedVehicles),
        idleTime: calculateIdleTimeData(storedVehicles),
        kpis: calculateKPIs(storedVehicles)
      };
      
      setTimeSlotData(chartData.timeSlot);
      setDockProductionData(chartData.production);
      setSpeedData(chartData.speed);
      setIdleTimeData(chartData.idleTime);
      setKpis(chartData.kpis);
      
      // Lưu vào localStorage
      saveChartDataToStorage(WAREHOUSE_TYPES.BKD, chartData);
    };

    // Load from localStorage first
    const savedData = loadChartDataFromStorage(WAREHOUSE_TYPES.BKD);
    if (savedData) {
      setTimeSlotData(savedData.timeSlot);
      setDockProductionData(savedData.production);
      setSpeedData(savedData.speed);
      setIdleTimeData(savedData.idleTime);
      setKpis(savedData.kpis);
    }

    updateVehicles();
    const interval = setInterval(updateVehicles, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-detail dashboard-detail--bkd">
      <DashboardHeader 
        title="Dashboard Detail - BKD"
        subtitle="Analytics & Reports"
        icon="📊"
      />

      <div className="dashboard-detail__content">
        <KPICards {...kpis} />

        <TimeSlotChart data={timeSlotData} />

        <div className="charts-grid-horizontal">
          <DockProductionChart data={dockProductionData} />
          <SpeedChart data={speedData} />
          <IdleTimeChart data={idleTimeData} />
        </div>

        {/* Vehicle Activity Table */}
        <div className="vehicle-activity-table">
          <h3 className="vehicle-activity-table__title">🚛 Chi Tiết Hoạt Động Xe - Kho BKD</h3>
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
                  const activity = calculateVehicleActivity(vehicle);
                  const dockCode = vehicle.DockName?.match(/[A-D]\d+/)?.[0] || '-';

                  return (
                    <tr key={vehicle.ID}>
                      <td>{vehicle.RegNo}</td>
                      <td>{dockCode}</td>
                      <td>{formatTime(vehicle.GateIn)}</td>
                      <td>{formatTime(vehicle.LoadingStart)}</td>
                      <td>{formatTime(vehicle.GateIn)}</td>
                      <td>{activity.waitTime}p</td>
                      <td>{activity.processingTime}p</td>
                      <td>
                        <span className={`badge badge--${activity.isOnTime ? 'success' : 'warning'}`}>
                          {activity.isOnTime ? 'Tốt' : 'Ngày cập'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge--${
                          activity.status === 'completed' ? 'success' : 
                          activity.status === 'loading' ? 'info' : 'default'
                        }`}>
                          {activity.statusLabel}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge--${
                          activity.compliance === 'on-time' ? 'success' : 
                          activity.compliance === 'exceeded' ? 'danger' : 'warning'
                        }`}>
                          {activity.complianceLabel}
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

export default DashboardDetailBKD;
