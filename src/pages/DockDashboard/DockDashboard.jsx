import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDockData } from '../../redux/thunks/dockThunk';
import { REFRESH_INTERVAL } from '../../utils/constants';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import DockMap from '../../components/DockMap/DockMap';
import DockTable from '../../components/DockTable/DockTable';

const DockDashboard = () => {
  const dispatch = useDispatch();
  const { selectedWarehouse, autoRefresh } = useSelector(state => state.dock);
  const warehouseData = useSelector(state => state.dock[selectedWarehouse]);

  useEffect(() => {
    dispatch(fetchDockData({ warehouse: selectedWarehouse }));
  }, [dispatch, selectedWarehouse]);

  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      dispatch(fetchDockData({ warehouse: selectedWarehouse }));
    }, REFRESH_INTERVAL);

    return () => clearInterval(timer);
  }, [dispatch, selectedWarehouse, autoRefresh]);

  return (
    <div className="dock-dashboard">
      <DashboardHeader 
        title="Dock Management"
        subtitle="Real-time Monitoring System"
        icon="🚛"
      />

      <div className="dashboard-content">
        {warehouseData.error && (
          <div className="alert alert--error">
            ⚠️ {warehouseData.error}
          </div>
        )}

        {warehouseData.lastUpdated && (
          <div className="last-updated">
            Cập nhật lần cuối: {new Date(warehouseData.lastUpdated).toLocaleString('vi-VN')}
          </div>
        )}
        
        <div className="map-and-table-container">
          <DockMap 
            warehouse={selectedWarehouse}
            kpis={warehouseData.kpis}
          />
          <DockTable 
            docks={warehouseData.docks}
            kpis={warehouseData.kpis}
          />
        </div>
      </div>
    </div>
  );
};

export default DockDashboard;
