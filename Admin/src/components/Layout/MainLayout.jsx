import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import './MainLayout.css';
import config from '../../config/config';

const MainLayout = ({ children, setIsAuthenticated }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [restaurantInfo, setRestaurantInfo] = useState(null);

  useEffect(() => {
    // Load sidebar state from localStorage on mount
    const savedSidebarState = localStorage.getItem('sidebarOpen');
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === 'true');
    }
  }, []);

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        const res = await axios.get(`${config.BACKEND_URL}/api/restaurant-info`);
        if (res.data?.data) {
          setRestaurantInfo(res.data.data);
        }
      } catch {
        // silently fail — sidebar will show fallback text
      }
    };
    fetchRestaurantInfo();
  }, []);

  useEffect(() => {
    if (!restaurantInfo) return;
    if (restaurantInfo.restaurantName) {
      document.title = `${restaurantInfo.restaurantName} — Admin`;
    }
    const iconUrl = restaurantInfo.faviconUrl || restaurantInfo.logoUrl;
    if (iconUrl) {
      let link = document.getElementById('favicon');
      if (!link) {
        link = document.createElement('link');
        link.id = 'favicon';
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = iconUrl;
    }
  }, [restaurantInfo]);

  useEffect(() => {
    // Handle keyboard shortcuts
    const handleKeyboard = (event) => {
      // ESC to close sidebar
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
      
      // Ctrl/Cmd + B to toggle sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setSidebarOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [sidebarOpen]);

  useEffect(() => {
    // Handle body scroll lock on mobile
    const updateBodyScrollLock = () => {
      const shouldLock = sidebarOpen && window.matchMedia('(max-width: 768px)').matches;
      document.body.classList.toggle('sidebar-locked', shouldLock);
    };

    updateBodyScrollLock();
    window.addEventListener('resize', updateBodyScrollLock);

    return () => {
      document.body.classList.remove('sidebar-locked');
      window.removeEventListener('resize', updateBodyScrollLock);
    };
  }, [sidebarOpen]);

  const handleMenuToggle = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', newState.toString());
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <aside className="layout-sidebar">
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} restaurantInfo={restaurantInfo} />
      </aside>
      
      <div className="layout-content">
        <header className="layout-header">
           <Navbar 
             setIsAuthenticated={setIsAuthenticated} 
             onMenuToggle={handleMenuToggle}
             isSidebarOpen={sidebarOpen}
           />
        </header>
        
        <main className="layout-main">
          <div className="main-container">
            {children}
          </div>
        </main>
      </div>

       {/* Overlay for mobile */}
       {sidebarOpen && (
        <div 
          className="layout-overlay"
          onClick={handleSidebarClose}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default MainLayout;
