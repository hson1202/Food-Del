import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard/Dashboard'
import Orders from './pages/Orders/Orders'
import Category from './pages/Category/Category'
import Products from './pages/Products/Products'
import Users from './pages/Users/Users'
import Permissions from './pages/Permissions/Permissions'
import Blog from './pages/Blog/Blog'
import Reservations from './pages/Reservations/Reservations'
import Messages from './pages/Messages/Messages'
import EmailTest from './pages/EmailTest/EmailTest'
import Add from './pages/Add/Add'
import Login from './pages/Login/Login'
import DeliveryZones from './pages/DeliveryZones/DeliveryZones'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './i18n';
import config from './config/config';

const App = () => {
  const url = config.BACKEND_URL
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Desktop mặc định mở

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
    
    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('sidebarOpen');
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === 'true');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

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
      
      // Alt + M to toggle sidebar (alternative)
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        setSidebarOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => {
      window.removeEventListener('keydown', handleKeyboard);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

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
    // Save state to localStorage
    localStorage.setItem('sidebarOpen', newState.toString());
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleContentInteraction = () => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <ToastContainer/>
        <Routes>
          <Route path='/admin/login' element={<Login url={url} setIsAuthenticated={setIsAuthenticated}/>}/>
          <Route path='*' element={<Navigate to="/admin/login" replace />}/>
        </Routes>
      </div>
    );
  }

  return (
    <div className={`app-shell ${sidebarOpen ? 'app-shell--sidebar-open' : ''}`}>
      <ToastContainer 
        position="top-right"
        style={{ marginTop: '70px' }}
        toastStyle={{ 
          fontSize: '14px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      />
      <Navbar
        setIsAuthenticated={setIsAuthenticated}
        onMenuToggle={handleMenuToggle}
        isSidebarOpen={sidebarOpen}
      />
      <div className={`app-content ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose}/>
        <main
          className="app-main"
          role="main"
          onClick={handleContentInteraction}
        >
          <Routes>
          <Route path='/admin' element={<Dashboard url={url}/>}/>
          <Route path='/admin/orders' element={<Orders url={url}/>}/>
          <Route path='/admin/category' element={<Category url={url}/>}/>
          <Route path='/admin/products' element={<Products url={url}/>}/>
          <Route path='/admin/users' element={<Users url={url}/>}/>
          <Route path='/admin/permissions' element={<Permissions url={url}/>}/>
          <Route path='/admin/blog' element={<Blog url={url}/>}/>
          <Route path='/admin/reservations' element={<Reservations url={url}/>}/>
          <Route path='/admin/delivery-zones' element={<DeliveryZones url={url}/>}/>
          <Route path='/admin/messages' element={<Messages url={url}/>}/>
          <Route path='/admin/email-test' element={<EmailTest url={url}/>}/>
          <Route path='/admin/add' element={<Add url={url}/>}/>
            <Route path='/admin/login' element={<Navigate to="/admin" replace />}/>
            <Route path='*' element={<Navigate to="/admin" replace />}/>
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App