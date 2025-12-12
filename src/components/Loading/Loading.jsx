import React from 'react';
import './Loading.scss';

const Loading = ({ message = 'Đang tải...' }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-message">{message}</div>
        <div className="loading-submessage">Vui lòng đợi trong giây lát</div>
      </div>
    </div>
  );
};

export default Loading;
