import { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import axios from 'axios';
import config from '../../config/config';
import { useTranslation } from 'react-i18next';
import './ChangePasswordPage.css';

const ChangePasswordPage = () => {
    const { token } = useAuth();
    const { t } = useTranslation();
    const url = config.BACKEND_URL;

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [validationErrors, setValidationErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear message and validation errors when user types
        setMessage({ type: '', text: '' });
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.currentPassword) {
            errors.currentPassword = t('account.password.currentRequired') || 'Current password is required';
        }

        if (!formData.newPassword) {
            errors.newPassword = t('account.password.newRequired') || 'New password is required';
        } else if (formData.newPassword.length < 8) {
            errors.newPassword = t('account.password.minLength') || 'Password must be at least 8 characters long';
        }

        if (!formData.confirmNewPassword) {
            errors.confirmNewPassword = t('account.password.confirmRequired') || 'Please confirm your new password';
        } else if (formData.newPassword !== formData.confirmNewPassword) {
            errors.confirmNewPassword = t('account.password.mismatch') || 'Passwords do not match';
        }

        if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
            errors.newPassword = t('account.password.sameAsCurrent') || 'New password must be different from current password';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setValidationErrors({});

        // Validate form
        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {
            const response = await axios.post(
                url + '/api/user/change-password',
                {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                },
                {
                    headers: { token }
                }
            );

            if (response.data.success) {
                setMessage({
                    type: 'success',
                    text: t('account.password.changeSuccess') || 'Password changed successfully!'
                });
                // Clear form on success
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: ''
                });
            }
        } catch (error) {
            console.error('Error changing password:', error);
            const errorMessage = error.response?.data?.message || t('account.password.changeError') || 'Failed to change password';
            setMessage({
                type: 'error',
                text: errorMessage
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="change-password-page">
            <div className="change-password-header">
                <h1>{t('account.password.title') || 'Change Password'}</h1>
                <p>{t('account.password.subtitle') || 'Update your password to keep your account secure'}</p>
            </div>

            {message.text && (
                <div className={`change-password-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="change-password-form">
                <div className="form-group">
                    <label htmlFor="currentPassword">
                        {t('account.password.current') || 'Current Password'} *
                    </label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                        placeholder={t('account.password.currentPlaceholder') || 'Enter your current password'}
                        className={validationErrors.currentPassword ? 'error' : ''}
                    />
                    {validationErrors.currentPassword && (
                        <small className="error-text">{validationErrors.currentPassword}</small>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="newPassword">
                        {t('account.password.new') || 'New Password'} *
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        placeholder={t('account.password.newPlaceholder') || 'Enter your new password (min. 8 characters)'}
                        className={validationErrors.newPassword ? 'error' : ''}
                    />
                    {validationErrors.newPassword && (
                        <small className="error-text">{validationErrors.newPassword}</small>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmNewPassword">
                        {t('account.password.confirm') || 'Confirm New Password'} *
                    </label>
                    <input
                        type="password"
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                        required
                        placeholder={t('account.password.confirmPlaceholder') || 'Confirm your new password'}
                        className={validationErrors.confirmNewPassword ? 'error' : ''}
                    />
                    {validationErrors.confirmNewPassword && (
                        <small className="error-text">{validationErrors.confirmNewPassword}</small>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={saving} className="btn-primary">
                        {saving 
                            ? (t('account.password.saving') || 'Changing Password...') 
                            : (t('account.password.change') || 'Change Password')
                        }
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePasswordPage;




