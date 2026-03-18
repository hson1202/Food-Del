import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Messages.css';
import config from '../../config/config';
import { useTranslation } from 'react-i18next';

const Messages = ({ url }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    subject: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });

  useEffect(() => {
    console.log('🔍 Messages component mounted');
    fetchMessages();
    fetchStats();
  }, []); // Chỉ chạy 1 lần khi mount

  useEffect(() => {
    if (filters.status !== 'all' || filters.subject !== 'all' || filters.search) {
      fetchMessages();
    }
  }, [filters]);

  useEffect(() => {
    if (pagination && pagination.currentPage > 1) {
      fetchMessages();
    }
  }, [pagination?.currentPage]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      console.log('🔍 Token for messages:', token); // Debug log
      
      if (!token) {
        toast.error('No admin token found. Please login again.');
        return;
      }

      const params = new URLSearchParams({
        page: pagination?.currentPage || 1,
        limit: 20,
        ...filters
      });

      console.log('🔍 Fetching messages with params:', params.toString()); // Debug log

             const response = await axios.get(`${config.BACKEND_URL}/api/contact?${params.toString()}`, {
        headers: { 
          token,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 Messages response:', response.data); // Debug log

      if (response.data?.success) {
        const payload = response.data.data || {};
        const list = Array.isArray(payload.messages) ? payload.messages : [];
        setMessages(list);
        setPagination(payload.pagination || { currentPage: 1, totalPages: 1, total: list.length });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      console.log('Error response:', error.response?.data); // Debug log
      setError(error.response?.data?.message || error.message);
      toast.error(`Failed to fetch messages: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken'); // Sửa từ 'token' thành 'adminToken'
      const response = await axios.get(`${config.BACKEND_URL}/api/contact/stats`, {
        headers: { token }
      });

      if (response.data.success) {
        const s = response.data.data?.statusStats || {};
        setStats({
          total: s.total || 0,
          unread: s.unread || 0,
          read: s.read || 0,
          inProgress: s['in-progress'] || 0,
          resolved: s.resolved || 0,
          closed: s.closed || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken'); // Sửa từ 'token' thành 'adminToken'
      const response = await axios.put(`${config.BACKEND_URL}/api/contact/${messageId}/status`, {
        status: newStatus
      }, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success('Message status updated');
        fetchMessages();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating message status:', error);
      toast.error('Failed to update message status');
      console.log('Error details:', error.response?.data || error.message);
    }
  };

  const addAdminResponse = async (messageId, response) => {
    try {
      const token = localStorage.getItem('adminToken'); // Sửa từ 'token' thành 'adminToken'
      const adminResponse = await axios.put(`${config.BACKEND_URL}/api/contact/${messageId}/response`, {
        adminResponse: response
      }, {
        headers: { token }
      });

      if (adminResponse.data.success) {
        toast.success('Response added successfully');
        setShowDetail(false);
        setSelectedMessage(null);
        fetchMessages();
        fetchStats();
      }
    } catch (error) {
      console.error('Error adding admin response:', error);
      toast.error('Failed to add response');
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const token = localStorage.getItem('adminToken'); // Sửa từ 'token' thành 'adminToken'
      const response = await axios.delete(`${config.BACKEND_URL}/api/contact/${messageId}`, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success('Message deleted successfully');
        fetchMessages();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ 
      currentPage: 1,
      totalPages: prev?.totalPages || 1,
      total: prev?.total || 0
    }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ 
      currentPage: page,
      totalPages: prev?.totalPages || 1,
      total: prev?.total || 0
    }));
  };

  const openMessageDetail = (message) => {
    setSelectedMessage(message);
    setShowDetail(true);
  };

  const closeMessageDetail = () => {
    setShowDetail(false);
    setSelectedMessage(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'unread': return 'status-unread';
      case 'read': return 'status-read';
      case 'in-progress': return 'status-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return 'status-default';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h1>{t('msg.title')}</h1>
        <p>{t('msg.subtitle')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">{t('msg.total')}</div>
        </div>
        <div className="stat-card unread">
          <div className="stat-number">{stats.unread}</div>
          <div className="stat-label">{t('msg.unread')}</div>
        </div>
        <div className="stat-card read">
          <div className="stat-number">{stats.read}</div>
          <div className="stat-label">{t('msg.read')}</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-number">{stats.resolved}</div>
          <div className="stat-label">{t('msg.resolved')}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>{t('msg.status')}</label>
          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">{t('msg.allStatus')}</option>
            <option value="unread">{t('msg.unread')}</option>
            <option value="read">{t('msg.read')}</option>
            <option value="in-progress">{t('msg.inProgress')}</option>
            <option value="resolved">{t('msg.resolved')}</option>
            <option value="closed">{t('msg.closed')}</option>
          </select>
        </div>

        <div className="filter-group">
          <label>{t('msg.subject')}</label>
          <select 
            value={filters.subject} 
            onChange={(e) => handleFilterChange('subject', e.target.value)}
          >
            <option value="all">{t('msg.allSubjects')}</option>
            <option value="general">{t('msg.general')}</option>
            <option value="reservation">{t('msg.reservation')}</option>
            <option value="feedback">{t('msg.feedback')}</option>
            <option value="complaint">{t('msg.complaint')}</option>
            <option value="partnership">{t('msg.partnership')}</option>
            <option value="other">{t('msg.other')}</option>
          </select>
        </div>

        <div className="filter-group">
          <label>{t('msg.search')}</label>
          <input
            type="text"
            placeholder={t('msg.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="messages-container">
        {error ? (
          <div className="error-message">
            <h3>{t('msg.errorLoading')}</h3>
            <p>{error}</p>
            <button onClick={() => {
              setError(null);
              fetchMessages();
            }}>{t('msg.retry')}</button>
          </div>
        ) : loading ? (
          <div className="loading">{t('msg.loading')}</div>
        ) : !Array.isArray(messages) || messages.length === 0 ? (
          <div className="no-messages">{t('msg.noMessages')}</div>
        ) : (
          <>
                         <div className="messages-list">
               {Array.isArray(messages) && messages.map((message) => (
                <div key={message._id} className="message-item" onClick={() => openMessageDetail(message)}>
                  <div className="message-header">
                    <div className="message-sender">
                      <strong>{message.name}</strong>
                      <span className="message-email">{message.email}</span>
                    </div>
                    <div className="message-meta">
                      <span className={`status-badge ${getStatusBadgeClass(message.status)}`}>
                        {message.status}
                      </span>
                      <span className={`priority-badge ${getPriorityBadgeClass(message.priority)}`}>
                        {message.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div className="message-subject">{message.subject}</div>
                  <div className="message-preview">
                    {message.message.length > 100 
                      ? `${message.message.substring(0, 100)}...` 
                      : message.message
                    }
                  </div>
                  
                  <div className="message-footer">
                    <span className="message-date">{formatDate(message.createdAt)}</span>
                    {message.adminResponse && (
                      <span className="has-response">✓ {t('msg.responded')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  {t('msg.previous')}
                </button>
                
                <span className="page-info">
                  {t('msg.page')} {pagination.currentPage} {t('msg.of')} {pagination.totalPages}
                </span>
                
                <button 
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  {t('msg.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Detail Modal */}
      {showDetail && selectedMessage && (
        <div className="message-detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{t('msg.details')}</h2>
              <button className="close-btn" onClick={closeMessageDetail}>×</button>
            </div>
            
            <div className="message-detail-content">
              <div className="message-info">
                <div className="info-row">
                  <label>{t('msg.from')}</label>
                  <span>{selectedMessage.name} ({selectedMessage.email})</span>
                </div>
                <div className="info-row">
                  <label>{t('msg.subject')}</label>
                  <span>{selectedMessage.subject}</span>
                </div>
                <div className="info-row">
                  <label>{t('msg.date')}</label>
                  <span>{formatDate(selectedMessage.createdAt)}</span>
                </div>
                <div className="info-row">
                  <label>{t('msg.status')}</label>
                  <select 
                    value={selectedMessage.status}
                    onChange={(e) => updateMessageStatus(selectedMessage._id, e.target.value)}
                  >
                    <option value="unread">{t('msg.unread')}</option>
                    <option value="read">{t('msg.read')}</option>
                    <option value="in-progress">{t('msg.inProgress')}</option>
                    <option value="resolved">{t('msg.resolved')}</option>
                    <option value="closed">{t('msg.closed')}</option>
                  </select>
                </div>
                <div className="info-row">
                  <label>{t('msg.priority')}</label>
                  <span className={`priority-badge ${getPriorityBadgeClass(selectedMessage.priority)}`}>
                    {selectedMessage.priority}
                  </span>
                </div>
              </div>

              <div className="message-content">
                <label>{t('msg.message')}</label>
                <div className="message-text">{selectedMessage.message}</div>
              </div>

              {selectedMessage.adminResponse && (
                <div className="admin-response">
                  <label>{t('msg.adminResponse')}</label>
                  <div className="response-text">{selectedMessage.adminResponse}</div>
                  <div className="response-meta">
                    {t('msg.respondedBy')} {selectedMessage.respondedBy || 'Admin'} {t('msg.on')} {formatDate(selectedMessage.respondedAt)}
                  </div>
                </div>
              )}

              <div className="message-actions">
                <button 
                  className="delete-btn"
                  onClick={() => deleteMessage(selectedMessage._id)}
                >
                  {t('msg.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
