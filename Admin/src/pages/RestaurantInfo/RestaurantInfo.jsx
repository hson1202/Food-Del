import React, { useState, useEffect } from 'react';
import './RestaurantInfo.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const RestaurantInfo = ({ url }) => {
  const { t } = useTranslation();
  const [info, setInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // basic, hours, social, translations

  // Form state
  const [formData, setFormData] = useState({
    restaurantName: '',
    phone: '',
    email: '',
    address: '',
    openingHours: {
      weekdays: '',
      sunday: ''
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: ''
    },
    googleMapsUrl: '',
    copyrightText: '',
    translations: {
      vi: {
        restaurantName: '',
        address: '',
        openingHours: {
          weekdays: '',
          sunday: ''
        }
      },
      en: {
        restaurantName: '',
        address: '',
        openingHours: {
          weekdays: '',
          sunday: ''
        }
      },
      sk: {
        restaurantName: '',
        address: '',
        openingHours: {
          weekdays: '',
          sunday: ''
        }
      }
    }
  });

  useEffect(() => {
    fetchRestaurantInfo();
  }, []);

  const fetchRestaurantInfo = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${url}/api/restaurant-info`);
      
      if (response.data.success) {
        const data = response.data.data;
        setInfo(data);
        setFormData({
          restaurantName: data.restaurantName || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          openingHours: {
            weekdays: data.openingHours?.weekdays || '',
            sunday: data.openingHours?.sunday || ''
          },
          socialMedia: {
            facebook: data.socialMedia?.facebook || '',
            twitter: data.socialMedia?.twitter || '',
            linkedin: data.socialMedia?.linkedin || '',
            instagram: data.socialMedia?.instagram || ''
          },
          googleMapsUrl: data.googleMapsUrl || '',
          copyrightText: data.copyrightText || '',
          translations: {
            vi: {
              restaurantName: data.translations?.vi?.restaurantName || '',
              address: data.translations?.vi?.address || '',
              openingHours: {
                weekdays: data.translations?.vi?.openingHours?.weekdays || '',
                sunday: data.translations?.vi?.openingHours?.sunday || ''
              }
            },
            en: {
              restaurantName: data.translations?.en?.restaurantName || '',
              address: data.translations?.en?.address || '',
              openingHours: {
                weekdays: data.translations?.en?.openingHours?.weekdays || '',
                sunday: data.translations?.en?.openingHours?.sunday || ''
              }
            },
            sk: {
              restaurantName: data.translations?.sk?.restaurantName || '',
              address: data.translations?.sk?.address || '',
              openingHours: {
                weekdays: data.translations?.sk?.openingHours?.weekdays || '',
                sunday: data.translations?.sk?.openingHours?.sunday || ''
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching restaurant info:', error);
      toast.error('Không thể tải thông tin nhà hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = JSON.parse(JSON.stringify(prev)); // Deep clone
        let current = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      const token = localStorage.getItem('adminToken');
      
      console.log('=== RESTAURANT INFO UPDATE ===');
      console.log('URL:', `${url}/api/restaurant-info`);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Form Data:', formData);
      
      const response = await axios.put(
        `${url}/api/restaurant-info`,
        formData,
        {
          headers: { token }
        }
      );
      
      console.log('Response:', response.data);
      
      if (response.data.success) {
        toast.success('Cập nhật thông tin thành công!');
        setInfo(response.data.data);
      } else {
        toast.error(response.data.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating restaurant info:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Bạn có chắc muốn reset về giá trị mặc định?')) {
      return;
    }
    
    try {
      setIsSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await axios.post(
        `${url}/api/restaurant-info/reset`,
        {},
        {
          headers: { token }
        }
      );
      
      if (response.data.success) {
        toast.success('Đã reset về giá trị mặc định!');
        await fetchRestaurantInfo();
      }
    } catch (error) {
      console.error('Error resetting restaurant info:', error);
      toast.error('Không thể reset thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="restaurant-info-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('ri.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-info-page">
      <div className="page-header">
        <div>
          <h1>🏪 {t('ri.title')}</h1>
          <p>{t('ri.subtitle')}</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-reset" 
            onClick={handleReset}
            disabled={isSaving}
          >
            ↺ {t('ri.reset')}
          </button>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          📝 {t('ri.basicInfo')}
        </button>
        <button 
          className={`tab ${activeTab === 'hours' ? 'active' : ''}`}
          onClick={() => setActiveTab('hours')}
        >
          🕐 {t('ri.openingHours')}
        </button>
        <button 
          className={`tab ${activeTab === 'social' ? 'active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          📱 {t('ri.socialMedia')}
        </button>
        <button 
          className={`tab ${activeTab === 'translations' ? 'active' : ''}`}
          onClick={() => setActiveTab('translations')}
        >
          🌍 {t('ri.translations')}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <div className="form-section">
            <h2>{t('ri.basicInfo')}</h2>
            
            <div className="form-group">
              <label>{t('ri.restaurantName')}</label>
              <input
                type="text"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleInputChange}
                placeholder="VD: Viet Bowls"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('ri.phone')}</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="VD: +421 123 456 789"
                />
              </div>

              <div className="form-group">
                <label>{t('ri.email')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="VD: info@vietbowls.sk"
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('ri.address')}</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="VD: Hlavná 33/36, 927 01 Šaľa, Slovakia"
              />
            </div>

            <div className="form-group">
              <label>{t('ri.googleMapsUrl')}</label>
              <textarea
                name="googleMapsUrl"
                value={formData.googleMapsUrl}
                onChange={handleInputChange}
                placeholder="Paste Google Maps embed URL here"
                rows={3}
              />
              <small>Lấy từ Google Maps → Share → Embed a map</small>
            </div>

            <div className="form-group">
              <label>{t('ri.copyrightText')}</label>
              <input
                type="text"
                name="copyrightText"
                value={formData.copyrightText}
                onChange={handleInputChange}
                placeholder="VD: © 2024 Viet Bowls. All rights reserved."
              />
            </div>
          </div>
        )}

        {/* Opening Hours Tab */}
        {activeTab === 'hours' && (
          <div className="form-section">
            <h2>{t('ri.openingHours')}</h2>
            
            <div className="form-group">
              <label>{t('ri.weekdays')}</label>
              <input
                type="text"
                name="openingHours.weekdays"
                value={formData.openingHours.weekdays}
                onChange={handleInputChange}
                placeholder="VD: 11:00 - 20:00"
              />
            </div>

            <div className="form-group">
              <label>{t('ri.sunday')}</label>
              <input
                type="text"
                name="openingHours.sunday"
                value={formData.openingHours.sunday}
                onChange={handleInputChange}
                placeholder="VD: 11:00 - 17:00"
              />
            </div>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div className="form-section">
            <h2>{t('ri.socialMedia')}</h2>
            
            <div className="form-group">
              <label>Facebook</label>
              <input
                type="url"
                name="socialMedia.facebook"
                value={formData.socialMedia.facebook}
                onChange={handleInputChange}
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div className="form-group">
              <label>Instagram</label>
              <input
                type="url"
                name="socialMedia.instagram"
                value={formData.socialMedia.instagram}
                onChange={handleInputChange}
                placeholder="https://instagram.com/yourpage"
              />
            </div>

            <div className="form-group">
              <label>Twitter</label>
              <input
                type="url"
                name="socialMedia.twitter"
                value={formData.socialMedia.twitter}
                onChange={handleInputChange}
                placeholder="https://twitter.com/yourpage"
              />
            </div>

            <div className="form-group">
              <label>LinkedIn</label>
              <input
                type="url"
                name="socialMedia.linkedin"
                value={formData.socialMedia.linkedin}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/company/yourpage"
              />
            </div>
          </div>
        )}

        {/* Translations Tab */}
        {activeTab === 'translations' && (
          <div className="form-section">
            <h2>{t('ri.translations')}</h2>
            
            {/* Vietnamese */}
            <div className="translation-section">
              <h3>🇻🇳 Tiếng Việt (Vietnamese)</h3>
              
              <div className="form-group">
                <label>Tên Nhà Hàng</label>
                <input
                  type="text"
                  name="translations.vi.restaurantName"
                  value={formData.translations.vi.restaurantName}
                  onChange={handleInputChange}
                  placeholder="Viet Bowls"
                />
              </div>

              <div className="form-group">
                <label>Địa Chỉ</label>
                <input
                  type="text"
                  name="translations.vi.address"
                  value={formData.translations.vi.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giờ Mở Cửa (Weekdays)</label>
                  <input
                    type="text"
                    name="translations.vi.openingHours.weekdays"
                    value={formData.translations.vi.openingHours.weekdays}
                    onChange={handleInputChange}
                    placeholder="Thứ 2 - Thứ 7: 11:00 - 20:00"
                  />
                </div>

                <div className="form-group">
                  <label>Giờ Mở Cửa (Sunday)</label>
                  <input
                    type="text"
                    name="translations.vi.openingHours.sunday"
                    value={formData.translations.vi.openingHours.sunday}
                    onChange={handleInputChange}
                    placeholder="Chủ nhật: 11:00 - 17:00"
                  />
                </div>
              </div>
            </div>

            {/* English */}
            <div className="translation-section">
              <h3>🇬🇧 English</h3>
              
              <div className="form-group">
                <label>Restaurant Name</label>
                <input
                  type="text"
                  name="translations.en.restaurantName"
                  value={formData.translations.en.restaurantName}
                  onChange={handleInputChange}
                  placeholder="Viet Bowls"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="translations.en.address"
                  value={formData.translations.en.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Opening Hours (Weekdays)</label>
                  <input
                    type="text"
                    name="translations.en.openingHours.weekdays"
                    value={formData.translations.en.openingHours.weekdays}
                    onChange={handleInputChange}
                    placeholder="Mon - Sat: 11:00 AM - 8:00 PM"
                  />
                </div>

                <div className="form-group">
                  <label>Opening Hours (Sunday)</label>
                  <input
                    type="text"
                    name="translations.en.openingHours.sunday"
                    value={formData.translations.en.openingHours.sunday}
                    onChange={handleInputChange}
                    placeholder="Sunday: 11:00 AM - 5:00 PM"
                  />
                </div>
              </div>
            </div>

            {/* Slovak */}
            <div className="translation-section">
              <h3>🇸🇰 Slovenčina (Slovak)</h3>
              
              <div className="form-group">
                <label>Názov Reštaurácie</label>
                <input
                  type="text"
                  name="translations.sk.restaurantName"
                  value={formData.translations.sk.restaurantName}
                  onChange={handleInputChange}
                  placeholder="Viet Bowls"
                />
              </div>

              <div className="form-group">
                <label>Adresa</label>
                <input
                  type="text"
                  name="translations.sk.address"
                  value={formData.translations.sk.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Otváracie Hodiny (Weekdays)</label>
                  <input
                    type="text"
                    name="translations.sk.openingHours.weekdays"
                    value={formData.translations.sk.openingHours.weekdays}
                    onChange={handleInputChange}
                    placeholder="Pon - Sob: 11:00 - 20:00"
                  />
                </div>

                <div className="form-group">
                  <label>Otváracie Hodiny (Sunday)</label>
                  <input
                    type="text"
                    name="translations.sk.openingHours.sunday"
                    value={formData.translations.sk.openingHours.sunday}
                    onChange={handleInputChange}
                    placeholder="Nedeľa: 11:00 - 17:00"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-save"
            disabled={isSaving}
          >
            {isSaving ? `💾 ${t('ri.saving')}` : `💾 ${t('ri.saveChanges')}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RestaurantInfo;
