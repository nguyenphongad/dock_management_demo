import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdMenu, MdDashboard, MdWarehouse } from 'react-icons/md';
import './MenuDropdown.scss';

const MenuDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

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
      id: 'dashboard-detail',
      label: 'Dashboard Detail',
      icon: <MdDashboard size={20} />,
      path: '/dashboard-detail'
    },
    {
      id: 'dock-management',
      label: 'Dock Management',
      icon: <MdWarehouse size={20} />,
      path: '/'
    }
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

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
          {menuItems.map(item => (
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
