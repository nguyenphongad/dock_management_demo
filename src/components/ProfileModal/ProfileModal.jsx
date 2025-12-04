import React from 'react';
import { MdClose, MdEmail, MdBusiness, MdPerson } from 'react-icons/md';

const ProfileModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const userInfo = {
    name: 'MDLZSP1',
    email: 'MDLZSP1@gosmartlog.com',
    company: 'Mondelez',
    role: 'Warehouse Manager',
    warehouse: 'BKD - Kho trong - BKD',
    lastLogin: new Date().toLocaleString('vi-VN')
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal__header">
          <h3>Thông tin cá nhân</h3>
          <button className="btn-close" onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        <div className="profile-modal__content">
          <div className="profile-avatar-section">
            <div className="profile-avatar">MD</div>
            <h4>{userInfo.name}</h4>
            <p className="profile-role">{userInfo.role}</p>
          </div>

          <div className="profile-info-section">
            <div className="info-item">
              <div className="info-icon">
                <MdEmail size={20} />
              </div>
              <div className="info-details">
                <label>Email</label>
                <span>{userInfo.email}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <MdBusiness size={20} />
              </div>
              <div className="info-details">
                <label>Công ty</label>
                <span>{userInfo.company}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <MdPerson size={20} />
              </div>
              <div className="info-details">
                <label>Kho quản lý</label>
                <span>{userInfo.warehouse}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <MdPerson size={20} />
              </div>
              <div className="info-details">
                <label>Đăng nhập lần cuối</label>
                <span>{userInfo.lastLogin}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-modal__footer">
          <button className="btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
