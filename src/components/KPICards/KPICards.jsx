import React from 'react';

const KPICards = ({ kpis }) => {
  const cards = [
    { 
      title: 'Currently Loading', 
      value: kpis?.currentlyLoading || 0,
      icon: '🚛',
      color: 'blue'
    },
    { 
      title: 'Waiting', 
      value: kpis?.waiting || 0,
      icon: '⏳',
      color: 'yellow'
    },
    { 
      title: 'Completed Today', 
      value: kpis?.completedToday || 0,
      icon: '✅',
      color: 'green'
    },
    { 
      title: 'Avg Turnaround Time', 
      value: `${kpis?.avgTurnaroundTime || 0}p`,
      icon: '⏱️',
      color: 'purple'
    },
    { 
      title: 'Avg Loading Time', 
      value: `${kpis?.avgLoadingTime || 0}p`,
      icon: '📦',
      color: 'orange'
    },
    { 
      title: 'Avg Wait Time', 
      value: `${kpis?.avgWaitTime || 0}p`,
      icon: '⌛',
      color: 'red'
    }
  ];

  return (
    <div className="kpi-cards">
      {cards.map((card, index) => (
        <div key={index} className={`kpi-card kpi-card--${card.color}`}>
          <div className="kpi-card__icon">{card.icon}</div>
          <div className="kpi-card__content">
            <div className="kpi-card__value">{card.value}</div>
            <div className="kpi-card__title">{card.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
