import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDockData } from '../../../redux/thunks/dockThunk';
import { setSelectedWarehouse } from '../../../redux/slices/dockSlice';
import { REFRESH_INTERVAL, WAREHOUSE_TYPES } from '../../../utils/constants';
import DashboardHeader from '../../../components/DashboardHeader/DashboardHeader';
import DockMapNKD from '../../../components/DockMapNKD/DockMapNKD';
import DockTable from '../../../components/DockTable/DockTable';

const DockDashboardNKD = () => {
  const dispatch = useDispatch();
  const { autoRefresh, selectedWarehouse } = useSelector(state => state.dock);
  const warehouseData = useSelector(state => state.dock[WAREHOUSE_TYPES.NKD]);
  const [isTableVisible, setIsTableVisible] = useState(true);

  // Đảm bảo warehouse được set đúng và sync với localStorage khi vào page
  useEffect(() => {
    if (selectedWarehouse !== WAREHOUSE_TYPES.NKD) {
      dispatch(setSelectedWarehouse(WAREHOUSE_TYPES.NKD));
    }
  }, [dispatch, selectedWarehouse]);

  useEffect(() => {
    dispatch(fetchDockData({ warehouse: WAREHOUSE_TYPES.NKD }));
  }, [dispatch]);

  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      dispatch(fetchDockData({ warehouse: WAREHOUSE_TYPES.NKD }));
    }, REFRESH_INTERVAL);

    return () => clearInterval(timer);
  }, [dispatch, autoRefresh]);

  const handleToggleTable = (newVisibility) => {
    setIsTableVisible(newVisibility);
  };

  return (
    <div className="dock-dashboard dock-dashboard--nkd">
      <DashboardHeader 
        title="Dock Management - Mondelēz NKD"
        subtitle="Real-time Monitoring System - Kho NKD"
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
        
        <div className={`map-and-table-container ${isTableVisible ? '' : 'map-and-table-container--table-hidden'}`}>
          <DockMapNKD 
            warehouse={WAREHOUSE_TYPES.NKD}
            kpis={warehouseData.kpis}
          />
          <DockTable 
            docks={warehouseData.docks}
            kpis={warehouseData.kpis}
            isVisible={isTableVisible}
            onToggleVisibility={handleToggleTable}
          />
        </div>
      </div>
    </div>
  );
};

export default DockDashboardNKD;
