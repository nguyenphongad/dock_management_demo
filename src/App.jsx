import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './redux/store';
import { clearWarehouseChangeLoading } from './redux/slices/dockSlice';
import DockDashboardBKD from './pages/DockDashboard/BKD/DockDashboardBKD';
import DockDashboardNKD from './pages/DockDashboard/NKD/DockDashboardNKD';
import DashboardDetailBKD from './pages/DashboardDetail/BKD/DashboardDetailBKD';
import DashboardDetailNKD from './pages/DashboardDetail/NKD/DashboardDetailNKD';
import Loading from './components/Loading/Loading';
import './styles/dock.scss';

const AppContent = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isChangingWarehouse, selectedWarehouse } = useSelector(state => state.dock);
  const warehouseData = useSelector(state => state.dock[selectedWarehouse]);
  const [isNavigating, setIsNavigating] = React.useState(false);

  // Clear loading sau khi đổi warehouse VÀ data đã load xong
  useEffect(() => {
    if (isChangingWarehouse) {
      // Kiểm tra xem data đã có chưa
      const checkDataLoaded = setInterval(() => {
        const hasData = warehouseData?.docks?.length > 0 || warehouseData?.kpis;
        
        if (hasData) {
          console.log(`✅ Data loaded for ${selectedWarehouse}, clearing loading...`);
          clearInterval(checkDataLoaded);
          setTimeout(() => {
            dispatch(clearWarehouseChangeLoading());
          }, 1000); // Delay thêm 1s để mượt
        }
      }, 500);

      // Timeout sau 3s nếu data không load được
      const timeout = setTimeout(() => {
        console.log('⏱️ Timeout: Force clearing loading');
        clearInterval(checkDataLoaded);
        dispatch(clearWarehouseChangeLoading());
      }, 3000);
      
      return () => {
        clearInterval(checkDataLoaded);
        clearTimeout(timeout);
      };
    }
  }, [isChangingWarehouse, warehouseData, selectedWarehouse, dispatch]);

  // Detect navigation changes
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 800); // 0.8s loading khi đổi route
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const getLoadingMessage = () => {
    if (isChangingWarehouse) {
      return `Đang chuyển sang ${selectedWarehouse === 'BKD' ? 'Kho BKD' : 'Kho NKD'}...`;
    }
    if (isNavigating) {
      if (location.pathname.includes('dashboard-detail')) {
        return 'Đang tải Dashboard Detail...';
      }
      return 'Đang tải Dock Management...';
    }
    return 'Đang tải...';
  };

  const showLoading = isChangingWarehouse || isNavigating;

  return (
    <>
      {showLoading && <Loading message={getLoadingMessage()} />}
      
      <Routes>
        <Route path="/" element={<Navigate to="/modelez/dock-bkd" replace />} />
        <Route path="/modelez/dock-bkd" element={<DockDashboardBKD />} />
        <Route path="/modelez/dock-nkd" element={<DockDashboardNKD />} />
        <Route path="/modelez/dashboard-detail-bkd" element={<DashboardDetailBKD />} />
        <Route path="/modelez/dashboard-detail-nkd" element={<DashboardDetailNKD />} />
        <Route path="*" element={<Navigate to="/modelez/dock-bkd" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
