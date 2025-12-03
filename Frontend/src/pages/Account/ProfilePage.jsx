import { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import axios from 'axios';
import config from '../../config/config';
import { useTranslation } from 'react-i18next';
import './ProfilePage.css';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

const ProfilePage = () => {
    const { token, user, isAuthenticated, refreshUser } = useAuth();
    const { t } = useTranslation();
    const url = config.BACKEND_URL;

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        avatarUrl: '',
        email: ''
    });
    const [originalData, setOriginalData] = useState({
        name: '',
        phone: '',
        avatarUrl: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Load user profile
    useEffect(() => {
        if (isAuthenticated && token) {
            loadProfile();
        }
    }, [isAuthenticated, token]);

    // Initialize formData with user data from context if available and formData is empty
    useEffect(() => {
        if (user && !formData.name && !formData.email && !loading) {
            const initialData = {
                name: user.name || '',
                email: user.email || '',
                phone: '',
                avatarUrl: user.avatarUrl || ''
            };
            setFormData(initialData);
            setOriginalData(initialData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, loading]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.get(url + '/api/user/profile', {
                headers: { token }
            });

            if (response.data.success) {
                const profile = response.data.data;
                const profileData = {
                    name: profile.name || '',
                    phone: profile.phone || '',
                    avatarUrl: profile.avatarUrl || '',
                    email: profile.email || ''
                };
                setFormData(profileData);
                setOriginalData(profileData);
            } else {
                console.error('Failed to load profile:', response.data);
                setMessage({
                    type: 'error',
                    text: response.data?.message || t('account.profile.loadError')
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            const errorMessage = error.response?.data?.message || error.message || t('account.profile.loadError');
            setMessage({
                type: 'error',
                text: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setMessage({ type: '', text: '' });
    };

    const handleEdit = () => {
        setIsEditing(true);
        setMessage({ type: '', text: '' });
    };

    const handleCancel = () => {
        // Reset form to original data
        setFormData({ ...originalData });
        setAvatarFile(null);
        setIsEditing(false);
        setMessage({ type: '', text: '' });
    };

    const handleAvatarFileChange = (e) => {
        const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
        setAvatarFile(null);

        if (!file) return;

        // Giới hạn định dạng cho Cloudinary free: jpg, jpeg, png, webp
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setMessage({
                type: 'error',
                text: t('account.profile.avatarInvalidType') || 'Please upload JPG, PNG or WEBP image only.'
            });
            return;
        }

        // Giới hạn dung lượng ~2MB để an toàn cho gói free
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            setMessage({
                type: 'error',
                text: t('account.profile.avatarTooLarge') || 'Image size must be less than 2MB.'
            });
            return;
        }

        setMessage({ type: '', text: '' });
        setAvatarFile(file);
    };

    const handleUploadAvatar = async () => {
        if (!avatarFile) {
            setMessage({
                type: 'error',
                text: t('account.profile.avatarNoFile') || 'Please choose an image to upload.'
            });
            return;
        }

        if (!token) {
            setMessage({
                type: 'error',
                text: t('account.profile.notAuthenticated') || 'You must be logged in to upload avatar.'
            });
            return;
        }

        setUploadingAvatar(true);
        setMessage({ type: '', text: '' });

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', avatarFile);

            const response = await axios.post(
                url + '/api/upload-cloud/image',
                formDataUpload,
                {
                    headers: {
                        token,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data?.success && response.data?.url) {
                const uploadedUrl = response.data.url;

                setFormData(prev => ({
                    ...prev,
                    avatarUrl: uploadedUrl
                }));

                setMessage({
                    type: 'success',
                    text: t('account.profile.avatarUploadSuccess') || 'Avatar uploaded successfully. Don\'t forget to save your profile.'
                });
            } else {
                setMessage({
                    type: 'error',
                    text: response.data?.error || t('account.profile.avatarUploadError') || 'Failed to upload avatar.'
                });
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                t('account.profile.avatarUploadError');
            setMessage({
                type: 'error',
                text: errorMessage
            });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await axios.put(url + '/api/user/profile', formData, {
                headers: { token }
            });

            if (response.data.success) {
                setMessage({
                    type: 'success',
                    text: t('account.profile.updateSuccess') || 'Profile updated successfully!'
                });
                // Reload profile to get updated data
                await loadProfile();
                // Refresh user data in auth context (especially email)
                await refreshUser();
                // Exit edit mode
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMessage = error.response?.data?.message || t('account.profile.updateError');
            setMessage({
                type: 'error',
                text: errorMessage
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>{t('account.profile.loading') || 'Loading profile...'}</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <h1>{t('account.profile.title') || 'Profile Information'}</h1>
                <p>{t('account.profile.subtitle') || 'Manage your personal information'}</p>
            </div>

            {message.text && (
                <div className={`profile-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {!isEditing ? (
                // View Mode
                <div className="profile-view">
                    <div className="profile-info">
                        <div className="profile-info-item">
                            <label>{t('account.profile.name') || 'Full Name'}</label>
                            <div className="profile-info-value">
                                {formData.name || user?.name || '-'}
                            </div>
                        </div>
                        <div className="profile-info-item">
                            <label>{t('account.profile.email') || 'Email'}</label>
                            <div className="profile-info-value">
                                {formData.email || user?.email || '-'}
                            </div>
                        </div>
                        <div className="profile-info-item">
                            <label>{t('account.profile.phone') || 'Phone Number'}</label>
                            <div className="profile-info-value">
                                {formData.phone || '-'}
                            </div>
                        </div>
                        {(formData.avatarUrl || user?.avatarUrl) && (
                            <div className="profile-info-item">
                                <label>{t('account.profile.avatarUrl') || 'Avatar'}</label>
                                <div className="profile-avatar-display">
                                    <img 
                                        src={getOptimizedImageUrl(formData.avatarUrl || user?.avatarUrl, url, { width: 200, height: 200, crop: 'fill', gravity: 'face' })} 
                                        alt="Avatar" 
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }} 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="profile-actions">
                        <button type="button" onClick={handleEdit} className="btn-primary">
                            {t('account.profile.edit') || 'Edit'}
                        </button>
                    </div>
                </div>
            ) : (
                // Edit Mode
                <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                    <label htmlFor="name">
                        {t('account.profile.name') || 'Full Name'} *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder={t('account.profile.namePlaceholder') || 'Enter your full name'}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">
                        {t('account.profile.email') || 'Email'} *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder={t('account.profile.emailPlaceholder') || 'Enter your email address'}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">
                        {t('account.profile.phone') || 'Phone Number'}
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={t('account.profile.phonePlaceholder') || '+421912345678'}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="avatarUrl">
                        {t('account.profile.avatarUrl') || 'Avatar URL'}
                    </label>
                    <input
                        type="url"
                        id="avatarUrl"
                        name="avatarUrl"
                        value={formData.avatarUrl}
                        onChange={handleChange}
                        placeholder={t('account.profile.avatarUrlPlaceholder') || 'https://example.com/avatar.jpg'}
                    />
                    {formData.avatarUrl && (
                        <div className="avatar-preview">
                            <img
                                src={getOptimizedImageUrl(formData.avatarUrl, url, { width: 200, height: 200, crop: 'fill', gravity: 'face' })}
                                alt="Avatar preview"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>
                        {t('account.profile.avatarUploadLabel') || 'Upload Avatar (JPG/PNG/WEBP, max 2MB)'}
                    </label>
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={handleAvatarFileChange}
                    />
                    <button
                        type="button"
                        className="btn-secondary avatar-upload-btn"
                        onClick={handleUploadAvatar}
                        disabled={uploadingAvatar}
                    >
                        {uploadingAvatar
                            ? (t('account.profile.avatarUploading') || 'Uploading...')
                            : (t('account.profile.avatarUploadButton') || 'Upload Avatar')}
                    </button>
                    {avatarFile && (
                        <p className="avatar-file-info">
                            {avatarFile.name} ({(avatarFile.size / 1024).toFixed(0)} KB)
                        </p>
                    )}
                </div>

                    <div className="form-actions">
                        <button type="button" onClick={handleCancel} className="btn-secondary" disabled={saving}>
                            {t('account.profile.cancel') || 'Cancel'}
                        </button>
                        <button type="submit" disabled={saving} className="btn-primary">
                            {saving 
                                ? (t('account.profile.saving') || 'Saving...') 
                                : (t('account.profile.save') || 'Save Changes')
                            }
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProfilePage;

