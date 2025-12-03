import { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import axios from 'axios';
import config from '../../config/config';
import { useTranslation } from 'react-i18next';
import { assets } from '../../assets/assets';
import './AddressBookPage.css';

const AddressBookPage = () => {
    const { token, isAuthenticated } = useAuth();
    const { t } = useTranslation();
    const url = config.BACKEND_URL;

    const [addresses, setAddresses] = useState([]);
    const [defaultAddressId, setDefaultAddressId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        label: '',
        fullName: '',
        phone: '',
        street: '',
        houseNumber: '',
        city: '',
        state: '',
        zipcode: '',
        country: 'Slovakia',
        coordinates: null,
        isDefault: false
    });

    useEffect(() => {
        if (isAuthenticated && token) {
            loadAddresses();
        }
    }, [isAuthenticated, token]);

    const loadAddresses = async () => {
        setLoading(true);
        try {
            const response = await axios.get(url + '/api/user/addresses', {
                headers: { token }
            });

            if (response.data.success) {
                setAddresses(response.data.data || []);
                setDefaultAddressId(response.data.defaultAddressId || null);
            }
        } catch (error) {
            console.error('Error loading addresses:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('account.addresses.loadError')
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            label: '',
            fullName: '',
            phone: '',
            street: '',
            houseNumber: '',
            city: '',
            state: '',
            zipcode: '',
            country: 'Slovakia',
            coordinates: null,
            isDefault: false
        });
        setEditingId(null);
        setShowAddForm(false);
        setMessage({ type: '', text: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = (address) => {
        setFormData({
            label: address.label || '',
            fullName: address.fullName || '',
            phone: address.phone || '',
            street: address.street || '',
            houseNumber: address.houseNumber || '',
            city: address.city || '',
            state: address.state || '',
            zipcode: address.zipcode || '',
            country: address.country || 'Slovakia',
            coordinates: address.coordinates || null,
            isDefault: address.isDefault || false
        });
        setEditingId(address._id);
        setShowAddForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Backend currently yêu cầu các field: label, fullName, phone, street, city, state, country
        // Form UI chỉ cho nhập 1 dòng địa chỉ (street), nên ta tự fill các field còn lại để backend không báo lỗi
        const payload = {
            ...formData,
            city: formData.city || 'N/A',
            state: formData.state || 'N/A',
            country: formData.country || 'Slovakia'
        };

        try {
            if (editingId) {
                // Update existing address
                const response = await axios.put(
                    `${url}/api/user/addresses/${editingId}`,
                    payload,
                    { headers: { token } }
                );

                if (response.data.success) {
                    setMessage({
                        type: 'success',
                        text: t('account.addresses.updateSuccess') || 'Address updated successfully!'
                    });
                    await loadAddresses();
                    resetForm();
                }
            } else {
                // Add new address
                const response = await axios.post(
                    `${url}/api/user/addresses`,
                    payload,
                    { headers: { token } }
                );

                if (response.data.success) {
                    setMessage({
                        type: 'success',
                        text: t('account.addresses.addSuccess') || 'Address added successfully!'
                    });
                    await loadAddresses();
                    resetForm();
                }
            }
        } catch (error) {
            console.error('Error saving address:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('account.addresses.saveError')
            });
        }
    };

    const handleDelete = async (addressId) => {
        if (!window.confirm(t('account.addresses.deleteConfirm') || 'Are you sure you want to delete this address?')) {
            return;
        }

        try {
            const response = await axios.delete(
                `${url}/api/user/addresses/${addressId}`,
                { headers: { token } }
            );

            if (response.data.success) {
                setMessage({
                    type: 'success',
                    text: t('account.addresses.deleteSuccess') || 'Address deleted successfully!'
                });
                await loadAddresses();
            }
        } catch (error) {
            console.error('Error deleting address:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('account.addresses.deleteError')
            });
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            const response = await axios.post(
                `${url}/api/user/addresses/${addressId}/set-default`,
                {},
                { headers: { token } }
            );

            if (response.data.success) {
                setMessage({
                    type: 'success',
                    text: t('account.addresses.setDefaultSuccess') || 'Default address updated!'
                });
                await loadAddresses();
            }
        } catch (error) {
            console.error('Error setting default address:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('account.addresses.setDefaultError')
            });
        }
    };

    if (loading) {
        return (
            <div className="addresses-loading">
                <div className="loading-spinner"></div>
                <p>{t('account.addresses.loading') || 'Loading addresses...'}</p>
            </div>
        );
    }

    return (
        <div className="addresses-page">
            <div className="addresses-header">
                <h1>{t('account.addresses.title') || 'Address Book'}</h1>
                <p>{t('account.addresses.subtitle') || 'Manage your delivery addresses'}</p>
            </div>

            {message.text && (
                <div className={`addresses-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {!showAddForm ? (
                <>
                    <div className="addresses-actions">
                        <button 
                            onClick={() => setShowAddForm(true)} 
                            className="btn-primary"
                        >
                            {t('account.addresses.addNew') || '+ Add New Address'}
                        </button>
                    </div>

                    {addresses.length === 0 ? (
                        <div className="addresses-empty">
                            <p>{t('account.addresses.empty') || 'No addresses saved yet.'}</p>
                            <button 
                                onClick={() => setShowAddForm(true)} 
                                className="btn-primary"
                            >
                                {t('account.addresses.addFirst') || 'Add Your First Address'}
                            </button>
                        </div>
                    ) : (
                        <div className="addresses-list">
                            {addresses.map((address) => (
                                <div 
                                    key={address._id} 
                                    className={`address-card ${address.isDefault ? 'default' : ''}`}
                                >
                                    {address.isDefault && (
                                        <div className="address-badge">
                                            {t('account.addresses.default') || 'Default'}
                                        </div>
                                    )}
                                    <div className="address-content">
                                        <h3>{address.label}</h3>
                                        <p className="address-name">{address.fullName}</p>
                                        <p className="address-phone">{address.phone}</p>
                                        <p className="address-full">
                                            {address.street}
                                        </p>
                                    </div>
                                    <div className="address-actions">
                                        {!address.isDefault && (
                                            <button
                                                onClick={() => handleSetDefault(address._id)}
                                                className="btn-secondary"
                                            >
                                                {t('account.addresses.setDefault') || 'Set as Default'}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(address)}
                                            className="btn-secondary"
                                        >
                                            {t('account.addresses.edit') || 'Edit'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(address._id)}
                                            className="btn-danger"
                                        >
                                            {t('account.addresses.delete') || 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="address-form-container">
                    <h2>
                        {editingId 
                            ? (t('account.addresses.editAddress') || 'Edit Address')
                            : (t('account.addresses.addAddress') || 'Add New Address')
                        }
                    </h2>
                    <form onSubmit={handleSubmit} className="address-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>{t('account.addresses.label') || 'Label'} *</label>
                                <input
                                    type="text"
                                    name="label"
                                    value={formData.label}
                                    onChange={handleChange}
                                    required
                                    placeholder={t('account.addresses.labelPlaceholder') || 'Home, Work, etc.'}
                                />
                            </div>
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isDefault"
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                                    />
                                    {' '}{t('account.addresses.setAsDefault') || 'Set as default address'}
                                </label>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>{t('account.addresses.fullName') || 'Full Name'} *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('account.addresses.phone') || 'Phone'} *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>{t('account.addresses.street') || 'Full Address'} *</label>
                            <input
                                type="text"
                                name="street"
                                value={formData.street}
                                onChange={handleChange}
                                required
                                placeholder={t('account.addresses.streetPlaceholder') || '123 Lê Lợi, Quận 1, TP.HCM'}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                {editingId 
                                    ? (t('account.addresses.update') || 'Update Address')
                                    : (t('account.addresses.add') || 'Add Address')
                                }
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                {t('account.addresses.cancel') || 'Cancel'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AddressBookPage;

