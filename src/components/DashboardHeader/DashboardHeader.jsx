import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MdRefresh, MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import { fetchDockData } from '../../redux/thunks/dockThunk';
import { setSelectedWarehouse, setWarehouseChangeLoading } from '../../redux/slices/dockSlice';
import { REFRESH_INTERVAL, WAREHOUSE_TYPES } from '../../utils/constants';
import MenuDropdown from '../MenuDropdown/MenuDropdown';
import ApiModeSelector from '../ApiModeSelector';
import AccountMenu from '../AccountMenu/AccountMenu';
import ProfileModal from '../ProfileModal/ProfileModal';
import logo_smartlog from '../../assets/Logo-smartlog.png';

const DashboardHeader = ({ 
  title = 'Dock Management',
  subtitle = 'Real-time Monitoring System',
  icon = '🚛'
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedWarehouse } = useSelector(state => state.dock);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : REFRESH_INTERVAL / 1000);
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleWarehouseChange = async (e) => {
    const newWarehouse = e.target.value;
    
    if (newWarehouse === selectedWarehouse) return; // Không làm gì nếu chọn kho hiện tại
    
    console.log(`🔄 Switching warehouse from ${selectedWarehouse} to ${newWarehouse}`);
    
    // 1. Bật loading
    dispatch(setWarehouseChangeLoading(true));
    
    // 2. Xóa toàn bộ data cũ trong localStorage
    try {
      console.log('🗑️ Clearing old data from localStorage...');
      localStorage.removeItem('dock_vehicles');
      localStorage.removeItem('dashboard_chart_data_BKD');
      localStorage.removeItem('dashboard_chart_data_NKD');
      localStorage.removeItem('dashboard_vehicles_data');
      localStorage.removeItem('dashboard_timeslot_data');
      localStorage.removeItem('dashboard_production_data');
      localStorage.removeItem('dashboard_speed_data');
      localStorage.removeItem('dashboard_idle_data');
      console.log('✅ Old data cleared');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    
    // 3. Set warehouse mới
    dispatch(setSelectedWarehouse(newWarehouse));
    
    // 4. Fetch data mới
    console.log(`📡 Fetching data for ${newWarehouse}...`);
    await dispatch(fetchDockData({ warehouse: newWarehouse }));
    
    // 5. Navigate to new route
    if (newWarehouse === WAREHOUSE_TYPES.BKD) {
      navigate('/modelez/dock-bkd');
    } else if (newWarehouse === WAREHOUSE_TYPES.NKD) {
      navigate('/modelez/dock-nkd');
    }
    
    // 6. Loading sẽ tự động tắt sau 2s trong App.jsx
    console.log(`✅ Switched to ${newWarehouse}`);
  };

  const handleManualRefresh = () => {
    dispatch(fetchDockData({ warehouse: selectedWarehouse }));
    setCountdown(REFRESH_INTERVAL / 1000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Không thể vào chế độ toàn màn hình:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleLogout = () => {
    console.log('Đăng xuất');
    setShowAccountMenu(false);
    // TODO: Implement logout logic
  };

  const handleViewProfile = () => {
    setShowAccountMenu(false);
    setShowProfileModal(true);
  };

  return (
    <>
      <header className="dashboard-header">
        <div className="header-left">
          <MenuDropdown />
          <div className="logo-container">
            <img src={logo_smartlog} className="logo-image" alt="Logo Smartlog" />
          </div>
        </div>

        <div className="dashboard-controls">
          <select 
            value={selectedWarehouse}
            onChange={handleWarehouseChange}
            className="warehouse-select"
          >
            <option value={WAREHOUSE_TYPES.BKD}>Kho BKD</option>
            <option value={WAREHOUSE_TYPES.NKD}>Kho NKD</option>
          </select>
          
          <ApiModeSelector />
          
          <button 
            onClick={handleManualRefresh} 
            className="btn-icon" 
            title="Cập nhật ngay"
          >
            <MdRefresh size={18} />
            <span>Refresh</span>
          </button>
          
          <button 
            onClick={toggleFullscreen} 
            className="btn-icon" 
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          >
            {isFullscreen ? <MdFullscreenExit size={18} /> : <MdFullscreen size={18} />}
          </button>
          
          <div className="countdown">
            <strong>{countdown}s</strong>
          </div>

          <button 
            onClick={() => setShowAccountMenu(true)} 
            className="btn-account" 
            title="Tài khoản"
          >
            <div className="avatar">MD</div>
          </button>
        </div>
      </header>

      <AccountMenu 
        isOpen={showAccountMenu}
        onClose={() => setShowAccountMenu(false)}
        onLogout={handleLogout}
        onViewProfile={handleViewProfile}
      />

      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default DashboardHeader;
