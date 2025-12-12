import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setApiMode } from '../redux/slices/apiModeSlice';
import '../styles/ApiModeSelector.scss';

const ApiModeSelector = () => {
  const dispatch = useDispatch();
  const currentMode = useSelector(state => state.apiMode?.mode || 'api'); // Mặc định 'api' thay vì 'sample'
  const [showNotification, setShowNotification] = useState(false);

  // Hiển thị thông báo khi component mount nếu có mode đã lưu
  useEffect(() => {
    const savedMode = localStorage.getItem('apiMode');
    if (savedMode) {
      console.log('Loaded API mode from localStorage:', savedMode);
    } else {
      // Nếu chưa có mode trong localStorage, set mặc định là 'api'
      dispatch(setApiMode('api'));
      console.log('Set default API mode to: api (Mondelez)');
    }
  }, [dispatch]);

  const handleModeChange = (e) => {
    const newMode = e.target.value;
    dispatch(setApiMode(newMode));
    
    // Hiển thị notification tạm thời
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
    
    // Reload lại data với mode mới
    window.location.reload();
  };

  return (
    <>
      <div className="api-mode-selector">
        <label htmlFor="api-mode">Nguồn: </label>
        <select 
          id="api-mode" 
          value={currentMode} 
          onChange={handleModeChange}
          className="api-mode-dropdown"
        >
          <option value="api">🌐 Mondelez</option>
          {/* <option value="sample">📂 Sample</option> */}
        </select>
        <span className={`mode-indicator ${currentMode}`}>
          {currentMode === 'api' ? '● LIVE' : '● TEST'}
        </span>
      </div>

      {showNotification && (
        <div className="api-mode-notification">
          <span>✓</span>
          Đã chuyển sang: {currentMode === 'api' ? 'API Mondelez' : 'API Sample'}
        </div>
      )}
    </>
  );
};

export default ApiModeSelector;
