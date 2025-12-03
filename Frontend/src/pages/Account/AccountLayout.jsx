import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useTranslation } from 'react-i18next';
import { assets } from '../../assets/assets';
import './AccountLayout.css';
import config from '../../config/config';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

const AccountLayout = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const url = config.BACKEND_URL;

    const navItems = [
        { path: '/account/profile', label: t('account.nav.profile') || 'Profile', icon: assets.profile_icon },
        { path: '/account/password', label: t('account.nav.password') || 'Change Password', icon: assets.profile_icon },
        { path: '/account/addresses', label: t('account.nav.addresses') || 'Addresses', icon: assets.parcel_icon },
        { path: '/account/orders', label: t('account.nav.orders') || 'Orders', icon: assets.bag_icon },
    ];

    return (
        <div className="account-layout">
            <div className="account-container">
                {/* Sidebar Navigation */}
                <aside className="account-sidebar">
                    <div className="account-sidebar-header">
                        <img
                            src={
                                user?.avatarUrl
                                    ? getOptimizedImageUrl(user.avatarUrl, url, { width: 80, height: 80, crop: 'fill', gravity: 'face' })
                                    : assets.profile_icon
                            }
                            alt={user?.name || 'Profile'}
                            className="account-avatar"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = assets.profile_icon;
                            }}
                        />
                        <div className="account-user-info">
                            <h3>{user?.name || t('account.profile.user')}</h3>
                            <p>{user?.email || ''}</p>
                        </div>
                    </div>
                    <nav className="account-nav">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `account-nav-item ${isActive ? 'active' : ''}`
                                }
                            >
                                <img src={item.icon} alt="" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="account-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AccountLayout;

