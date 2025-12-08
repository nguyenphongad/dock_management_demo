import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdRefresh, MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import { fetchDockData } from '../../redux/thunks/dockThunk';
import { setSelectedWarehouse } from '../../redux/slices/dockSlice';
import { REFRESH_INTERVAL, WAREHOUSE_TYPES } from '../../utils/constants';
import MenuDropdown from '../MenuDropdown/MenuDropdown';
import ApiModeSelector from '../ApiModeSelector';
import AccountMenu from '../AccountMenu/AccountMenu';
import ProfileModal from '../ProfileModal/ProfileModal';
import './DashboardHeader.scss';

const DashboardHeader = ({ 
  title = 'Dock Management',
  subtitle = 'Real-time Monitoring System',
  icon = '🚛'
}) => {
  const dispatch = useDispatch();
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
            {icon}
          </div>
          <div className="header-title">
            <h1>{title}</h1>
            <span className="subtitle">{subtitle}</span>
          </div>
        </div>

        <div className="dashboard-controls">
          <select 
            value={selectedWarehouse}
            onChange={(e) => dispatch(setSelectedWarehouse(e.target.value))}
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
