import React from 'react';

const DockTable = ({ docks, kpis }) => {
  const miniKpis = [
    { 
      title: 'Currently Loading', 
      value: kpis?.currentlyLoading || 0,
      icon: '🚛',
      color: '#3498db'
    },
    { 
      title: 'Waiting', 
      value: kpis?.waiting || 0,
      icon: '⏳',
      color: '#f39c12'
    },
    { 
      title: 'Completed Today', 
      value: kpis?.completedToday || 0,
      icon: '✅',
      color: '#27ae60'
    },
    { 
      title: 'Avg Turnaround Time', 
      value: `${kpis?.avgTurnaroundTime || 0}p`,
      icon: '⏱️',
      color: '#9b59b6'
    },
    { 
      title: 'Avg Loading Time', 
      value: `${kpis?.avgLoadingTime || 0}p`,
      icon: '📦',
      color: '#e67e22'
    },
    { 
      title: 'Avg Wait Time', 
      value: `${kpis?.avgWaitTime || 0}p`,
      icon: '⌛',
      color: '#e74c3c'
    }
  ];

  return (
    <div className="dock-table">
      <h3 className="dock-table__title">Bảng Giám Sát Dock</h3>
      
      <div className="dock-table__kpis">
        {miniKpis.map((kpi, index) => (
          <div key={index} className="mini-kpi-card" style={{ borderLeftColor: kpi.color }}>
            <div className="mini-kpi-card__icon">{kpi.icon}</div>
            <div className="mini-kpi-card__content">
              <div className="mini-kpi-card__value">{kpi.value}</div>
              <div className="mini-kpi-card__title">{kpi.title}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dock-table__content">
        <table>
          <thead>
            <tr>
              <th>Dock</th>
              <th>Status</th>
              <th>Vehicle</th>
              <th>Utilization</th>
              <th>Daily</th>
            </tr>
          </thead>
          <tbody>
            {docks?.map((dock, idx) => (
              <tr key={idx}>
                <td>
                  <span className={`status-dot status-dot--${dock.status}`}></span>
                  {dock.name}
                </td>
                <td>
                  <span className={`badge badge--${dock.status}`}>
                    {dock.status === 'loading' ? 'Loading' : 'Empty'}
                  </span>
                </td>
                <td className="vehicle-cell">{dock.currentVehicle || '-'}</td>
                <td>
                  <span className={`badge badge--${dock.utilization}`}>
                    {dock.utilizationText || '-'}
                  </span>
                </td>
                <td className="performance-cell">{dock.dailyPerformance || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DockTable;
