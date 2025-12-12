import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MdMenu, MdDashboard, MdWarehouse } from 'react-icons/md';
import { WAREHOUSE_TYPES } from '../../utils/constants';
import './MenuDropdown.scss';

const MenuDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { selectedWarehouse } = useSelector(state => state.dock);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    {
      id: 'dock-management-bkd',
      label: 'Dock Management BKD',
      icon: <MdWarehouse size={20} />,
      warehouse: WAREHOUSE_TYPES.BKD,
      path: '/modelez/dock-bkd'
    },
    {
      id: 'dock-management-nkd',
      label: 'Dock Management NKD',
      icon: <MdWarehouse size={20} />,
      warehouse: WAREHOUSE_TYPES.NKD,
      path: '/modelez/dock-nkd'
    },
    {
      id: 'dashboard-detail-bkd',
      label: 'Dashboard Detail BKD',
      icon: <MdDashboard size={20} />,
      warehouse: WAREHOUSE_TYPES.BKD,
      path: '/modelez/dashboard-detail-bkd'
    },
    {
      id: 'dashboard-detail-nkd',
      label: 'Dashboard Detail NKD',
      icon: <MdDashboard size={20} />,
      warehouse: WAREHOUSE_TYPES.NKD,
      path: '/modelez/dashboard-detail-nkd'
    }
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  // Filter menu items based on selected warehouse
  const filteredMenuItems = menuItems.filter(
    item => item.warehouse === selectedWarehouse
  );

  return (
    <div className="menu-dropdown" ref={dropdownRef}>
      <button 
        className="menu-dropdown__trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Menu"
      >
        <MdMenu size={24} />
        <span>Menu</span>
      </button>

      {isOpen && (
        <div className="menu-dropdown__content">
          {filteredMenuItems.map(item => (
            <button
              key={item.id}
              className={`menu-dropdown__item ${location.pathname === item.path ? 'menu-dropdown__item--active' : ''}`}
              onClick={() => handleMenuClick(item.path)}
            >
              <span className="menu-dropdown__item-icon">{item.icon}</span>
              <span className="menu-dropdown__item-label">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuDropdown;
