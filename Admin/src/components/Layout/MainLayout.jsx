import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import './MainLayout.css';

const MainLayout = ({ children, setIsAuthenticated }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Load sidebar state from localStorage on mount
    const savedSidebarState = localStorage.getItem('sidebarOpen');
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === 'true');
    }
  }, []);

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
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
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
