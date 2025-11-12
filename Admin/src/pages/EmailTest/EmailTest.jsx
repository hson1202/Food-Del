import React, { useState, useEffect } from 'react';
import './EmailTest.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmailTest = ({ url }) => {
  const [emailStatus, setEmailStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Fetch email status on component mount
  useEffect(() => {
    fetchEmailStatus();
  }, []);

  const fetchEmailStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/email/status`);
      setEmailStatus(response.data);
    } catch (error) {
      console.error('Error fetching email status:', error);
      toast.error('Failed to fetch email status');
    } finally {
      setLoading(false);
    }
  };

  const testEmailConnection = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/email/test`);
      
      if (response.data.success) {
        toast.success('✅ Email service is working!');
        setEmailStatus({ ...emailStatus, lastTest: response.data });
      } else {
        toast.error(`❌ Email test failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error testing email:', error);
      toast.error('Failed to test email connection');
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async (e) => {
    e.preventDefault();
    
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setSendingTest(true);
      setTestResult(null);
      
      const response = await axios.post(`${url}/api/email/send-test`, {
        email: testEmail
      });
      
      if (response.data.success) {
        toast.success(`✅ Test email sent to ${testEmail}!`);
        setTestResult({
          success: true,
          message: response.data.message
        });
      } else {
        toast.error(`❌ Failed: ${response.data.message}`);
        setTestResult({
          success: false,
          message: response.data.message
        });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
      setTestResult({
        success: false,
        message: error.message
      });
    } finally {
      setSendingTest(false);
    }
  };

  if (loading && !emailStatus) {
    return <div className="email-test-loading">Loading email configuration...</div>;
  }

  const isConfigured = emailStatus?.configured;

  return (
    <div className="email-test-container">
      <div className="email-test-header">
        <h2>📧 Email Service Configuration</h2>
        <button 
          onClick={fetchEmailStatus} 
          className="refresh-btn"
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Status Card */}
      <div className={`status-card ${isConfigured ? 'configured' : 'not-configured'}`}>
        <div className="status-icon">
          {isConfigured ? '✅' : '⚠️'}
        </div>
        <div className="status-content">
          <h3>{isConfigured ? 'Email Service Configured' : 'Email Service NOT Configured'}</h3>
          <p>
            {isConfigured 
              ? 'Email service is set up. Orders and notifications will be sent via email.'
              : 'Email service is not configured. Emails will NOT be sent.'}
          </p>
        </div>
      </div>

      {/* Configuration Details */}
      {emailStatus && (
        <div className="config-details">
          <h3>Configuration Details</h3>
          <div className="config-grid">
            {Object.entries(emailStatus.config || {}).map(([key, value]) => (
              <div key={key} className="config-item">
                <span className="config-key">{key}:</span>
                <span className={`config-value ${value.includes('✓') ? 'success' : 'warning'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Connection */}
      <div className="test-section">
        <h3>Test Email Connection</h3>
        <p>Verify that email credentials are valid and SMTP connection works.</p>
        <button 
          onClick={testEmailConnection} 
          className="test-btn"
          disabled={loading || !isConfigured}
        >
          {loading ? '⏳ Testing...' : '🔍 Test Connection'}
        </button>
      </div>

      {/* Send Test Email */}
      <div className="send-test-section">
        <h3>Send Test Email</h3>
        <p>Send a test email to verify the complete email flow.</p>
        <form onSubmit={sendTestEmail} className="test-email-form">
          <input
            type="email"
            placeholder="Enter email address"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="test-email-input"
            disabled={!isConfigured}
          />
          <button 
            type="submit" 
            className="send-btn"
            disabled={sendingTest || !isConfigured}
          >
            {sendingTest ? '📤 Sending...' : '📧 Send Test Email'}
          </button>
        </form>
        
        {testResult && (
          <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
            <span className="result-icon">{testResult.success ? '✅' : '❌'}</span>
            <span className="result-message">{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {!isConfigured && emailStatus?.recommendations && (
        <div className="recommendations">
          <h3>⚡ How to Fix</h3>
          <ol>
            {emailStatus.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ol>
          <div className="help-links">
            <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">
              📝 Create Gmail App Password
            </a>
            <a href="https://dashboard.render.com" target="_blank" rel="noopener noreferrer">
              🚀 Render Dashboard
            </a>
          </div>
        </div>
      )}

      {/* Usage Info */}
      <div className="usage-info">
        <h3>📚 Email Usage</h3>
        <div className="usage-grid">
          <div className="usage-item">
            <div className="usage-icon">👤</div>
            <div className="usage-content">
              <h4>Customer Emails</h4>
              <ul>
                <li>Order confirmation with tracking code</li>
                <li>Reservation confirmation</li>
                <li>Contact message confirmation</li>
              </ul>
            </div>
          </div>
          <div className="usage-item">
            <div className="usage-icon">👨‍💼</div>
            <div className="usage-content">
              <h4>Admin Emails</h4>
              <ul>
                <li>New order notifications</li>
                <li>New contact messages</li>
                <li>System alerts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTest;

