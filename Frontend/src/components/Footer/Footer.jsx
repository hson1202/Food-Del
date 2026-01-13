import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import useRestaurantInfo from '../../hooks/useRestaurantInfo'

const Footer = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { restaurantInfo, loading } = useRestaurantInfo()
  const isContactPage = location?.pathname === '/contact'

  return (
    <footer className='footer' id='footer'>
      <div className='footer-container'>
        {/* 4 Columns */}
        <div className='footer-grid'>
          {/* Column 1: Company Info */}
          <div className='footer-col'>
            <h3 className='footer-title'>{t('footer.companyTitle') || 'Company'}</h3>
            <ul className='footer-list'>
              <li><a href='/'>Home</a></li>
              <li><a href='/#about-us'>{t('footer.aboutUs') || 'About Us'}</a></li>
              <li><a href='/menu'>Menu</a></li>
              <li><a href='/blog'>{t('footer.blog') || 'Blog'}</a></li>
            </ul>
          </div>

          {/* Column 2: Services */}
          <div className='footer-col'>
            <h3 className='footer-title'>{t('footer.servicesTitle') || 'Services'}</h3>
            <ul className='footer-list'>
              <li><a href='/menu'>{t('footer.delivery') || 'Delivery'}</a></li>
              <li><a href='/menu'>{t('footer.takeaway') || 'Takeaway'}</a></li>
              <li><a href='/reservation'>{t('footer.reservation') || 'Reservation'}</a></li>
              <li><a href='/catering'>{t('footer.catering') || 'Catering'}</a></li>
            </ul>
          </div>

          {/* Column 3: Contact (hidden on /contact to avoid duplicated phone/email) */}
          {!isContactPage && (
            <div className='footer-col'>
              <h3 className='footer-title'>{t('footer.contactTitle') || 'Contact'}</h3>
              <ul className='footer-list'>
                <li>
                  <span className='footer-label'>{t('footer.phone') || 'Phone'}:</span>
                  <span className='footer-value'>
                    {loading ? '...' : restaurantInfo?.phone || '+421 123 456 789'}
                  </span>
                </li>
                <li>
                  <span className='footer-label'>{t('footer.email') || 'Email'}:</span>
                  <span className='footer-value'>
                    {loading ? '...' : restaurantInfo?.email || 'info@vietbowls.sk'}
                  </span>
                </li>
                <li>
                  <span className='footer-label'>{t('footer.address') || 'Address'}:</span>
                  <span className='footer-value'>
                    {loading ? '...' : restaurantInfo?.address || 'Trnava, Slovakia'}
                  </span>
                </li>
              </ul>
            </div>
          )}

          {/* Column 4: Reserve Table */}
          <div className='footer-col'>
            <h3 className='footer-title'>{t('footer.reserveTitle') || 'Reserve a Table'}</h3>
            <p className='footer-text'>
              {t('footer.reserveDescription') || 'Book your table now and enjoy authentic Vietnamese cuisine'}
            </p>
            <button 
              className='footer-reserve-btn'
              onClick={() => navigate('/reservation')}
            >
              {t('footer.reserveButton') || 'Book Now'}
            </button>
            <div className='footer-social'>
              {!loading && restaurantInfo?.socialMedia?.facebook && (
                <a href={restaurantInfo.socialMedia.facebook} target='_blank' rel='noreferrer'>
                  <img src={assets.facebook_icon} alt='Facebook' />
                </a>
              )}
              {!loading && restaurantInfo?.socialMedia?.twitter && (
                <a href={restaurantInfo.socialMedia.twitter} target='_blank' rel='noreferrer'>
                  <img src={assets.twitter_icon} alt='Twitter' />
                </a>
              )}
              {!loading && restaurantInfo?.socialMedia?.linkedin && (
                <a href={restaurantInfo.socialMedia.linkedin} target='_blank' rel='noreferrer'>
                  <img src={assets.linkedin_icon} alt='LinkedIn' />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='footer-bottom'>
          <p>
            {loading 
              ? '© 2024 Viet Bowls. All rights reserved.' 
              : restaurantInfo?.copyrightText || '© 2024 Viet Bowls. All rights reserved.'
            }
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer