import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation()

  const navLinks = t('footer.navLinks', { returnObjects: true }) || []
  const serviceLinks = t('footer.serviceLinks', { returnObjects: true }) || []
  const contactInfo = t('footer.contactInfo', { returnObjects: true }) || []
  const socialLabels = t('footer.socialLabels', { returnObjects: true }) || {}

  const socialLinks = [
    { label: 'Facebook', icon: assets.facebook_icon, href: 'https://facebook.com', id: 'fb' },
    { label: 'Twitter', icon: assets.twitter_icon, href: 'https://twitter.com', id: 'tw' },
    { label: 'LinkedIn', icon: assets.linkedin_icon, href: 'https://linkedin.com', id: 'in' },
  ]

  return (
    <footer className='footer' id='footer'>
      <div className='footer-shell'>
        <div className='footer-top'>
          <div className='footer-brand'>
            <img src={assets.logo} alt='Viet Bowls' />
            <p>{t('footer.brandDescription')}</p>
          </div>
          <button type='button' className='footer-cta'>
            {t('footer.cta')}
          </button>
        </div>

        <div className='footer-content'>
          <div className='footer-column'>
            <p className='footer-label'>{t('footer.navTitle')}</p>
            <ul>
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className='footer-column'>
            <p className='footer-label'>{t('footer.serviceTitle')}</p>
            <ul>
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className='footer-column footer-contact'>
            <p className='footer-label'>{t('footer.contactTitle')}</p>
            <ul>
              {contactInfo.map((item) => (
                <li key={item.label}>
                  <span>{item.label}:</span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
            <div className='footer-social-icons'>
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  aria-label={socialLabels[social.id] || social.label}
                  target='_blank'
                  rel='noreferrer'
                >
                  <img src={social.icon} alt={social.label} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className='footer-bottom'>
          <p>{t('footer.bottomCopyright')}</p>
          <span>{t('footer.bottomTagline')}</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer