import React from 'react';
import { MdLogout, MdPerson, MdClose } from 'react-icons/md';

const AccountMenu = ({ isOpen, onClose, onLogout, onViewProfile }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="account-menu" onClick={(e) => e.stopPropagation()}>
        <div className="account-menu__header">
          <h3>Tài khoản</h3>
          <button className="btn-close" onClick={onClose}>
            <MdClose size={20} />
          </button>
        </div>
        
        <div className="account-menu__content">
          <div className="user-info">
            <div className="user-avatar">MD</div>
            <div className="user-details">
              <div className="user-name">MDLZSP1</div>
              <div className="user-email">MDLZSP1@gosmartlog.com</div>
            </div>
          </div>

          <div className="menu-divider"></div>

          <button className="menu-item" onClick={onViewProfile}>
            <MdPerson size={20} />
            <span>Thông tin cá nhân</span>
          </button>

          <button className="menu-item menu-item--danger" onClick={onLogout}>
            <MdLogout size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountMenu;
