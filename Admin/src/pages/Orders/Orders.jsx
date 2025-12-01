import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Orders.css'
import {toast} from "react-toastify"
import axios from "axios"
import {assets} from "../../assets/assets"
import { useTranslation } from 'react-i18next'
import '../../i18n'
import config from '../../config/config'

const Orders = ({url}) => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true); // Auto-refresh toggle
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds default
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const audioRef = useRef(null);
  const [soundReady, setSoundReady] = useState(false);

  const fetchAllOrders = async (showLoadingToast = false) => {
    try {
      if (showLoadingToast) {
        toast.info('🔄 Đang tải lại orders...', { autoClose: 1000 })
      }
      
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        toast.error('Admin token not found. Please login again.');
        return;
      }

      const response = await axios.get(`${config.BACKEND_URL}/api/admin/orders`, {
        headers: {
          'token': adminToken
        }
      });

      if (response.status === 200) {
        const newOrders = response.data;
        
        // Check if there are new orders (only for auto-refresh, not manual refresh)
        if (!showLoadingToast && orders.length > 0 && newOrders.length > orders.length) {
          const newOrderCount = newOrders.length - orders.length;
          toast.success(`🆕 ${newOrderCount} new order${newOrderCount > 1 ? 's' : ''} received!`);
        }
        
        if (showLoadingToast) {
          toast.success(`✅ Đã tải lại ${newOrders.length} orders`, { autoClose: 2000 })
        }
        
        // Sort orders: Pending first, then by creation date
        const sortedOrders = newOrders.sort((a, b) => {
          // Pending orders first
          if (a.status === 'Pending' && b.status !== 'Pending') return -1;
          if (a.status !== 'Pending' && b.status === 'Pending') return 1;
          
          // Then by creation date (newest first)
          const dateA = new Date(a.createdAt || a.date || 0);
          const dateB = new Date(b.createdAt || b.date || 0);
          return dateB - dateA;
        });
        
        setOrders(sortedOrders);
        setLastRefresh(new Date());
        setLoading(false);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('adminToken');
      } else {
        toast.error('Error fetching orders: ' + (error.response?.data?.message || error.message));
      }
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      console.log(`🔄 Updating order ${orderId} status to: ${event.target.value}`);
      
      // Get admin token from localStorage
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        toast.error('Admin not logged in. Please login again.');
        return;
      }
      
      // Use the admin endpoint with auth token
      const response = await axios.put(`${config.BACKEND_URL}/api/admin/orders/${orderId}/status`, {
        status: event.target.value
      }, {
        headers: {
          'token': adminToken
        }
      });
      
      console.log('📦 Status update response:', response.data);
      
      if (response.data.success){
        await fetchAllOrders();
        toast.success(t('orders.statusUpdateSuccess', 'Order status updated successfully'));
      } else {
        toast.error(response.data.message || t('orders.statusUpdateError', 'Failed to update order status'));
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        request: error.request
      });
      
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Admin session expired. Please login again.');
          localStorage.removeItem('adminToken');
        } else {
          toast.error(`Failed to update order status: ${error.response.data?.message || error.message}`);
        }
      } else if (error.request) {
        toast.error('No response received. Check if backend is running.');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  }

  // Filter orders based on search term and status
  useEffect(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo?.phone?.includes(searchTerm) ||
        order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shortOrderId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, selectedStatus]);

  useEffect(()=>{
    fetchAllOrders();
  },[])

  // Ensure sound can play after a user gesture (browser autoplay policies)
  useEffect(() => {
    const enableSound = () => {
      if (audioRef.current && !soundReady) {
        const a = audioRef.current;
        a.muted = true;
        a.play().then(() => {
          a.pause();
          a.currentTime = 0;
          a.muted = false;
          setSoundReady(true);
        }).catch(() => {
          // ignore
        });
      }
    };
    window.addEventListener('click', enableSound, { once: true });
    window.addEventListener('keydown', enableSound, { once: true });
    return () => {
      window.removeEventListener('click', enableSound);
      window.removeEventListener('keydown', enableSound);
    };
  }, [soundReady]);

  // Realtime updates via Server-Sent Events (SSE)
  useEffect(() => {
    const eventsUrl = `${config.BACKEND_URL}/api/events?channel=orders`;
    const es = new EventSource(eventsUrl);

    es.addEventListener('connected', () => {
      toast.info('🔔 Realtime connected');
    });

    es.addEventListener('ping', () => {
      // keep-alive
    });

    es.addEventListener('message', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.type === 'order_created') {
          const newOrder = data.payload;
          // Optimistically add to list if not present
          setOrders(prev => {
            const exists = prev.some(o => o._id === newOrder._id);
            if (exists) return prev;
            const next = [newOrder, ...prev];
            // Maintain sorting: Pending first, then newest
            return next.sort((a, b) => {
              if (a.status === 'Pending' && b.status !== 'Pending') return -1;
              if (a.status !== 'Pending' && b.status === 'Pending') return 1;
              const dateA = new Date(a.createdAt || a.date || 0);
              const dateB = new Date(b.createdAt || b.date || 0);
              return dateB - dateA;
            });
          });
          toast.success(`🆕 New order from ${newOrder?.customerInfo?.name || 'Customer'}`);
          // Play notification sound if available
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        }
      } catch (_) {}
    });

    es.onerror = () => {
      // Auto-reconnect handled by EventSource; optional toast to avoid noise
    };

    return () => {
      es.close();
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#f59e0b';
      case 'Out for delivery':
        return '#3b82f6';
      case 'Delivered':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusClass = (status = '') => status.toLowerCase().replace(/\s+/g, '-');

  const getStatusCount = (status) => {
    return orders.filter(order => order.status === status).length;
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
  }

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  }

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setShowDetailsModal(false);
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className='orders-page'>
      {/* Hidden audio element for realtime notification */}
      <audio ref={audioRef} src={`${config.BACKEND_URL}/sound/thongbao.mp3`} preload="auto" />

      <section className="orders-top">
        <section className="orders-header">
          <div className="header-content">
            <p className="section-label">{t('orders.subtitle', 'Realtime order monitoring')}</p>
            <h1>{t('orders.title')}</h1>
          </div>
          <div className="header-actions">
            <button className="ghost-btn" onClick={() => fetchAllOrders(true)}>
              {t('common.refresh') || 'Refresh'}
            </button>
          </div>
        </section>

        <section className="orders-stats">
          <div className="stat-card">
            <span className="stat-label">{t('orders.totalOrders', 'Total Orders')}</span>
            <strong>{orders.length}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">{t('orders.pending', 'Pending')}</span>
            <strong>{getStatusCount('Pending')}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">{t('orders.outForDelivery', 'Out for Delivery')}</span>
            <strong>{getStatusCount('Out for delivery')}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">{t('orders.delivered', 'Delivered')}</span>
            <strong>{getStatusCount('Delivered')}</strong>
          </div>
        </section>
      </section>

      <section className="orders-toolbar">
        <div className="search-group">
          <div className="input-wrapper">
            <span className="input-icon">🔍</span>
            <input
              type="text"
              placeholder={t('orders.searchPlaceholder', 'Search orders by customer name, phone, or order ID...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-pill" onClick={clearSearch}>
                {t('common.clear', 'Clear')}
              </button>
            )}
          </div>
        </div>

        <div className="toolbar-divider" />

        <div className="refresh-stack">
          <label className="toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>{t('orders.autoRefresh', 'Auto refresh')}</span>
          </label>

          {autoRefresh && (
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            >
              <option value={15000}>15s</option>
              <option value={30000}>30s</option>
              <option value={60000}>1m</option>
              <option value={300000}>5m</option>
            </select>
          )}

          <button
            className="icon-button"
            onClick={() => {
              fetchAllOrders();
              setLastRefresh(new Date());
            }}
            title="Refresh now"
          >
            🔄
          </button>

          <span className="last-refresh">{t('orders.lastRefresh', 'Last update')} · {lastRefresh.toLocaleTimeString()}</span>
        </div>

        <div className="toolbar-spacer" />

        <button className="primary-btn" onClick={() => fetchAllOrders(true)}>
          {t('orders.refreshList', 'Reload list')}
        </button>
      </section>

      <section className="orders-panel">
        <div className="status-filter">
          <div className="status-tabs">
            <button 
              className={`status-tab ${selectedStatus === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('all')}
            >
              {t('orders.allStatuses', 'All statuses')}
            </button>
            <button 
              className={`status-tab ${selectedStatus === 'Pending' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('Pending')}
            >
              {t('orders.pending', 'Pending')}
            </button>
            <button 
              className={`status-tab ${selectedStatus === 'Out for delivery' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('Out for delivery')}
            >
              {t('orders.outForDelivery', 'Out for delivery')}
            </button>
            <button 
              className={`status-tab ${selectedStatus === 'Delivered' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('Delivered')}
            >
              {t('orders.delivered', 'Delivered')}
            </button>
          </div>
          {(searchTerm || selectedStatus !== 'all') && (
            <button className="link-btn" onClick={clearFilters}>
              {t('orders.resetFilters', 'Reset filters')}
            </button>
          )}
        </div>

        <div className="orders-table-wrapper">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">{t('orders.noOrders', 'No orders match your filters')}</p>
              <p className="empty-text">{t('orders.tryAdjusting', 'Try another search term or reset the filters.')}</p>
            </div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>{t('orders.orderId', 'Order')}</th>
                  <th>{t('orders.customer', 'Customer')}</th>
                  <th>{t('orders.items', 'Items')}</th>
                  <th>{t('orders.total', 'Payment')}</th>
                  <th>{t('orders.status', 'Status')}</th>
                  <th>{t('orders.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const createdAt = order.createdAt ? new Date(order.createdAt) : null;
                  const prettyDate = createdAt
                    ? createdAt.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
                    : 'N/A';
                  const prettyTime = createdAt
                    ? createdAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                    : '';
                  const items = Array.isArray(order.items) ? order.items : [];
                  const previewItems = items.slice(0, 2);
                  const remainingItems = Math.max(items.length - 2, 0);
                  const deliveryFee = Number(order.deliveryInfo?.deliveryFee ?? 0);
                  const showDeliveryFee = deliveryFee > 0;

                  return (
                    <tr key={order._id}>
                      <td data-label={t('orders.orderId', 'Order')}>
                        <div className="order-id-block">
                          <p className="order-code">#{order.shortOrderId || (order._id ? order._id.slice(-6) : 'N/A')}</p>
                          <span className="order-date">{prettyDate} · {prettyTime}</span>
                          {order.trackingCode && (
                            <span className="order-meta">
                              {t('orders.trackingCode', 'Tracking')} #{order.trackingCode}
                            </span>
                          )}
                        </div>
                      </td>
                      <td data-label={t('orders.customer', 'Customer')}>
                        <div className="customer-cell">
                          <p className="customer-name">{order.customerInfo?.name || t('orders.customerName', 'Customer')}</p>
                          <p className="customer-meta">
                            {order.customerInfo?.phone || '—'}
                            {order.address?.city ? ` • ${order.address.city}` : ''}
                          </p>
                          <span className={`order-type-chip ${order.orderType === 'guest' ? 'guest' : 'registered'}`}>
                            {order.orderType === 'guest' ? t('orders.guest', 'Guest checkout') : t('orders.user', 'Logged in')}
                          </span>
                        </div>
                      </td>
                      <td data-label={t('orders.items', 'Items')}>
                        <div className="items-preview">
                          {previewItems.length === 0 ? (
                            <span className="muted">{t('orders.noItems', 'No items')}</span>
                          ) : (
                            <>
                              {previewItems.map((item, index) => (
                                <span key={`${order._id}-${item.sku || index}`} className="item-pill">
                                  {item.name || 'Item'} ×{item.quantity || 1}
                                </span>
                              ))}
                              {remainingItems > 0 && (
                                <span className="extra-count">+{remainingItems}</span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td data-label={t('orders.total', 'Payment')}>
                        <div className="amount-stack">
                          <span className="total-amount">€{Number(order.amount || 0).toFixed(2)}</span>
                          {showDeliveryFee && (
                            <span className="delivery-fee">
                              {t('orders.deliveryFee', 'Delivery')} €{deliveryFee.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td data-label={t('orders.status', 'Status')}>
                        <div className="status-cell">
                          <span className={`status-pill ${getStatusClass(order.status)}`}>
                            {t(`orders.orderStatus.${order.status}`, order.status)}
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) => statusHandler(e, order._id)}
                          >
                            <option value="Pending">{t('orders.pending', 'Pending')}</option>
                            <option value="Out for delivery">{t('orders.outForDelivery', 'Out for delivery')}</option>
                            <option value="Delivered">{t('orders.delivered', 'Delivered')}</option>
                          </select>
                        </div>
                      </td>
                      <td data-label={t('orders.actions', 'Actions')}>
                        <div className="table-actions">
                          <button className="ghost-btn" onClick={() => showOrderDetails(order)}>
                            {t('orders.viewDetails', 'View details')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeOrderDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('orders.orderDetails', 'Order Details')}</h2>
              <button className="modal-close" onClick={closeOrderDetails}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>{t('orders.orderInfo', 'Order Information')}</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.orderId')}:</span>
                    <span className="detail-value">#{selectedOrder.shortOrderId || (selectedOrder._id ? selectedOrder._id.slice(-6) : 'N/A')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.orderDate', 'Order Date')}:</span>
                    <span className="detail-value">
                      {selectedOrder.createdAt 
                        ? new Date(selectedOrder.createdAt).toLocaleString(undefined, {
                            year: 'numeric', month: '2-digit', day: '2-digit',
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.status')}:</span>
                    <span 
                      className="detail-value status-badge"
                      style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                    >
                      {t(`orders.orderStatus.${selectedOrder.status}`, selectedOrder.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.orderType', 'Order Type')}:</span>
                    <span className="detail-value">
                      <span className={`order-type-badge ${selectedOrder.orderType === 'guest' ? 'guest' : 'registered'}`}>
                        {selectedOrder.orderType === 'guest' ? 'GUEST' : 'USER'}
                      </span>
                      {selectedOrder.orderType === 'guest' && (
                        <span className="guest-note">💡 Khách không đăng nhập</span>
                      )}
                      {selectedOrder.orderType === 'registered' && selectedOrder.userId && (
                        <span className="guest-note">
                          👤 {selectedOrder.customerInfo?.name || 'Unknown User'} 
                          <small> (ID: {selectedOrder.userId.slice(-8)})</small>
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.trackingCode', 'Tracking Code')}:</span>
                    <span className="detail-value">{selectedOrder.trackingCode || 'N/A'}</span>
                  </div>
                  {selectedOrder.preferredDeliveryTime && (
                    <div className="detail-item">
                      <span className="detail-label">🕐 {t('orders.preferredDeliveryTime', 'Preferred Time')}:</span>
                      <span className="detail-value">{selectedOrder.preferredDeliveryTime}</span>
                    </div>
                  )}
                  {selectedOrder.deliveryInfo && (
                    <div className="detail-item">
                      <span className="detail-label">🚚 {t('orders.deliveryInfo', 'Delivery Info')}:</span>
                      <span className="detail-value">
                        {selectedOrder.deliveryInfo.zone} • {selectedOrder.deliveryInfo.distance}km • €{selectedOrder.deliveryInfo.deliveryFee} • ~{selectedOrder.deliveryInfo.estimatedTime}min
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>
                  {selectedOrder.orderType === 'guest' ? t('orders.guestInfo', 'Guest Information') : t('orders.userInfo', 'User Information')}
                </h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.customerName', 'Name')}:</span>
                    <span className="detail-value">
                      {selectedOrder.customerInfo?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.phone')}:</span>
                    <span className="detail-value">{selectedOrder.customerInfo?.phone || 'N/A'}</span>
                  </div>
                  {selectedOrder.orderType === 'guest' && selectedOrder.customerInfo?.email && (
                    <div className="detail-item">
                      <span className="detail-label">{t('orders.email', 'Email')}:</span>
                      <span className="detail-value">{selectedOrder.customerInfo.email}</span>
                    </div>
                  )}
                  {selectedOrder.orderType === 'registered' && selectedOrder.userId && (
                    <div className="detail-item">
                      <span className="detail-label">{t('orders.userId', 'User')}:</span>
                      <span className="detail-value">
                        {selectedOrder.customerInfo?.name || 'Unknown User'}
                        <br />
                        <small>(ID: {selectedOrder.userId.slice(-8)})</small>
                      </span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">{t('orders.address')}:</span>
                    <span className="detail-value">
                      {selectedOrder.address?.street ? `${selectedOrder.address.street}, ${selectedOrder.address.city || ''}` : 'N/A'}
                    </span>
                  </div>
                  {selectedOrder.address?.state && (
                    <div className="detail-item">
                      <span className="detail-label">{t('orders.state', 'State')}:</span>
                      <span className="detail-value">{selectedOrder.address.state}</span>
                    </div>
                  )}
                  {selectedOrder.address?.zipcode && (
                    <div className="detail-item">
                      <span className="detail-label">{t('orders.zipcode', 'Postal Code')}:</span>
                      <span className="detail-value">{selectedOrder.address.zipcode}</span>
                    </div>
                  )}
                  {selectedOrder.address?.country && (
                    <div className="detail-item">
                      <span className="detail-label">{t('orders.country', 'Country')}:</span>
                      <span className="detail-value">{selectedOrder.address.country}</span>
                    </div>
                  )}
                  {(selectedOrder.note || selectedOrder.notes) && (
                    <div className="detail-item full-width">
                      <span className="detail-label">📝 {t('orders.customerNote', 'Customer Note')}:</span>
                      <span className="detail-value notes-text">{selectedOrder.note || selectedOrder.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>{t('orders.items')}</h3>
                <div className="modal-items">
                  {selectedOrder.items && Array.isArray(selectedOrder.items) ? (
                    selectedOrder.items.map((item, index) => (
                      <div key={index} className="modal-item">
                        <div className="modal-item-info">
                          <span className="modal-item-name">{item.name || 'Unknown Item'}</span>
                          <span className="modal-item-sku">SKU: {item.sku || 'N/A'}</span>
                        </div>
                        <div className="modal-item-quantity-price">
                          <span className="modal-item-quantity">x{item.quantity || 1}</span>
                          <span className="modal-item-price">€{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No items found</p>
                  )}
                </div>
                
                {/* Order Summary Breakdown */}
                <div className="order-summary-breakdown" style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                  <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ddd' }}>
                    <span className="detail-label">Subtotal:</span>
                    <span className="detail-value">
                      €{(() => {
                        const deliveryFee = selectedOrder.deliveryInfo?.deliveryFee ?? 0;
                        const subtotal = (selectedOrder.amount || 0) - deliveryFee;
                        return subtotal.toFixed(2);
                      })()}
                    </span>
                  </div>
                  <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ddd' }}>
                    <span className="detail-label">Delivery Fee:</span>
                    <span className="detail-value">
                      €{((selectedOrder.deliveryInfo?.deliveryFee ?? 0).toFixed(2))}
                    </span>
                  </div>
                  <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: '8px', borderTop: '2px solid #333' }}>
                    <span className="detail-label" style={{ fontWeight: 'bold', fontSize: '16px' }}>{t('orders.total', 'Total')}:</span>
                    <span className="detail-value total-amount" style={{ fontWeight: 'bold', fontSize: '18px', color: '#e74c3c' }}>€{(selectedOrder.amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;