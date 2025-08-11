import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './ContactUs.css'
// Load all hero images at once using Vite glob import
// You can place hero images in `src/assets/` and select by file name
const HERO_IMAGES = import.meta.glob('../../assets/*.{jpg,jpeg,png,webp}', { eager: true, as: 'url' })

const ContactUs = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('contact') // 'contact' or 'reservation'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const [reservationData, setReservationData] = useState({
    customerName: '',
    phone: '',
    email: '',
    reservationDate: '',
    reservationTime: '',
    numberOfPeople: 1,
    note: ''
  })

  // Contact form states
  const [contactLoading, setContactLoading] = useState(false)
  const [contactErrors, setContactErrors] = useState({})
  const [contactSuccess, setContactSuccess] = useState(false)

  // Reservation form states
  const [reservationLoading, setReservationLoading] = useState(false)
  const [reservationErrors, setReservationErrors] = useState({})
  const [reservationSuccess, setReservationSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error when user starts typing
    if (contactErrors[name]) {
      setContactErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleReservationChange = (e) => {
    const { name, value } = e.target
    setReservationData({
      ...reservationData,
      [name]: value
    })
    
    // Clear error when user starts typing
    if (reservationErrors[name]) {
      setReservationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Client-side validation for contact form
  const validateContactForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = t('contact.form.validation.nameRequired')
    } else if (formData.name.trim().length < 2) {
      errors.name = t('contact.form.validation.nameMinLength')
    }
    
    if (!formData.email.trim()) {
      errors.email = t('contact.form.validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = t('contact.form.validation.emailInvalid')
    }
    
    if (!formData.subject) {
      errors.subject = t('contact.form.validation.subjectRequired')
    }
    
    if (!formData.message.trim()) {
      errors.message = t('contact.form.validation.messageRequired')
    } else if (formData.message.trim().length < 10) {
      errors.message = t('contact.form.validation.messageMinLength')
    }
    
    return errors
  }

  // Client-side validation for reservation form
  const validateReservationForm = () => {
    const errors = {}
    
    if (!reservationData.customerName.trim()) {
      errors.customerName = t('contact.reservation.validation.fullNameRequired')
    } else if (reservationData.customerName.trim().length < 2) {
      errors.customerName = t('contact.reservation.validation.nameMinLength')
    }
    
    if (!reservationData.phone.trim()) {
      errors.phone = t('contact.reservation.validation.phoneRequired')
    } else if (!/^[\+]?[1-9][\d\s\-\(\)\.]{9,15}$/.test(reservationData.phone.trim())) {
      errors.phone = t('contact.reservation.validation.phoneInvalid')
    }
    
    if (!reservationData.email.trim()) {
      errors.email = t('contact.reservation.validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reservationData.email.trim())) {
      errors.email = t('contact.reservation.validation.emailInvalid')
    }
    
    if (!reservationData.reservationDate) {
      errors.reservationDate = t('contact.reservation.validation.dateRequired')
    } else {
      const selectedDate = new Date(reservationData.reservationDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        errors.reservationDate = t('contact.reservation.validation.datePast')
      }
    }
    
    if (!reservationData.reservationTime) {
      errors.reservationTime = t('contact.reservation.validation.timeRequired')
    }
    
    if (!reservationData.numberOfPeople || reservationData.numberOfPeople < 1) {
      errors.numberOfPeople = t('contact.reservation.validation.peopleRequired')
    }
    
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const errors = validateContactForm()
    if (Object.keys(errors).length > 0) {
      setContactErrors(errors)
      return
    }

    try {
      setContactLoading(true)
      setContactErrors({})
      
      const response = await fetch('http://localhost:4000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to send message')
      }

      const result = await response.json()
      
      if (result.success) {
        setContactSuccess(true)
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setContactSuccess(false)
        }, 5000)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setContactErrors({ general: error.message })
    } finally {
      setContactLoading(false)
    }
  }

  const handleReservationSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const errors = validateReservationForm()
    if (Object.keys(errors).length > 0) {
      setReservationErrors(errors)
      return
    }

    try {
      setReservationLoading(true)
      setReservationErrors({})
      
      const response = await fetch('http://localhost:4000/api/reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || t('contact.reservation.errors.submissionFailed'))
      }

      const result = await response.json()
      
      if (result.success) {
        setReservationSuccess(true)
        setReservationData({
          customerName: '',
          phone: '',
          email: '',
          reservationDate: '',
          reservationTime: '',
          numberOfPeople: 1,
          note: ''
        })
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setReservationSuccess(false)
        }, 5000)
      }
    } catch (error) {
      console.error('Reservation error:', error)
      setReservationErrors({
        general: error.message
      })
    } finally {
      setReservationLoading(false)
    }
  }

  // Generate available time slots based on business hours
  const generateTimeSlots = (selectedDate) => {
    if (!selectedDate) return []
    
    const date = new Date(selectedDate)
    const dayOfWeek = date.getDay()
    
    let startHour = 11 // 11:00 AM
    let endHour = 20 // 8:00 PM
    
    // Sunday: 11:00 AM - 5:00 PM
    if (dayOfWeek === 0) {
      endHour = 17 // 5:00 PM
    }
    
    const timeSlots = []
    for (let hour = startHour; hour < endHour; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    
    return timeSlots
  }

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Get business hours text for selected date
  const getBusinessHoursText = (selectedDate) => {
    if (!selectedDate) return ''
    
    const date = new Date(selectedDate)
    const dayOfWeek = date.getDay()
    
    if (dayOfWeek === 0) {
      return t('contact.reservation.businessHours.sunday')
    } else {
      return t('contact.reservation.businessHours.weekdays')
    }
  }

  // Update time slots when date changes
  const handleDateChange = (e) => {
    const { value } = e.target
    setReservationData(prev => ({
      ...prev,
      reservationDate: value,
      reservationTime: '' // Reset time when date changes
    }))
  }

  // Generate time slots for selected date
  const timeSlots = generateTimeSlots(reservationData.reservationDate)

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="hero-background">
          <img 
            src={
              HERO_IMAGES['../../assets/back8.jpg'] 
              ?? HERO_IMAGES['../../assets/header_img.png'] 
              ?? Object.values(HERO_IMAGES)[0]
            }
            alt="Menu background"
            className="hero-bg-image"
          />
        </div>
        <div className="hero-content">
          <h1>{t('contact.hero.title')}</h1>
          <p>{t('contact.hero.subtitle')}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <div className="container">
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveTab('contact')}
            >
              {t('contact.tabs.contactUs')}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reservation' ? 'active' : ''}`}
              onClick={() => setActiveTab('reservation')}
            >
              {t('contact.tabs.makeReservation')}
            </button>
          </div>
        </div>
      </div>

      {/* Contact Content */}
      <div className="contact-content">
        <div className="container">
          {activeTab === 'contact' ? (
            <div className="contact-grid">
              {/* Contact Information */}
              <div className="contact-info">
                <h2>{t('contact.getInTouch.title')}</h2>
                <p>{t('contact.getInTouch.subtitle')}</p>
                
                <div className="info-items">
                  <div className="info-item">
                    <div className="info-icon">📍</div>
                    <div className="info-content">
                      <h3>{t('contact.address.title')}</h3>
                      <p dangerouslySetInnerHTML={{ __html: t('contact.address.content') }}></p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon">📞</div>
                    <div className="info-content">
                      <h3>{t('contact.phone.title')}</h3>
                      <p dangerouslySetInnerHTML={{ __html: t('contact.phone.content') }}></p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon">✉️</div>
                    <div className="info-content">
                      <h3>{t('contact.email.title')}</h3>
                      <p>{t('contact.email.content')}</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon">🕒</div>
                    <div className="info-content">
                      <h3>{t('contact.openingHours')}</h3>
                      <p>{t('contact.weekdays')}<br />{t('contact.sunday')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="contact-form">
                <h2>{t('contact.form.title')}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">{t('contact.form.fullName')}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder={t('contact.form.fullNamePlaceholder')}
                      className={contactErrors.name ? 'error' : ''}
                    />
                    {contactErrors.name && (
                      <span className="error-text">{contactErrors.name}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">{t('contact.form.emailAddress')}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder={t('contact.form.emailPlaceholder')}
                      className={contactErrors.email ? 'error' : ''}
                    />
                    {contactErrors.email && (
                      <span className="error-text">{contactErrors.email}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">{t('contact.form.subject')}</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className={contactErrors.subject ? 'error' : ''}
                    >
                      <option value="">{t('contact.form.selectSubject')}</option>
                      <option value="general">{t('contact.form.generalInquiry')}</option>
                      <option value="reservation">{t('contact.form.reservation')}</option>
                      <option value="feedback">{t('contact.form.feedback')}</option>
                      <option value="complaint">{t('contact.form.complaint')}</option>
                      <option value="partnership">{t('contact.form.partnership')}</option>
                      <option value="other">{t('contact.form.other')}</option>
                    </select>
                    {contactErrors.subject && (
                      <span className="error-text">{contactErrors.subject}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message">{t('contact.form.message')}</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      placeholder={t('contact.form.messagePlaceholder')}
                      className={contactErrors.message ? 'error' : ''}
                    ></textarea>
                    {contactErrors.message && (
                      <span className="error-text">{contactErrors.message}</span>
                    )}
                  </div>
                  
                  <button type="submit" className="submit-btn" disabled={contactLoading}>
                    {contactLoading ? t('contact.form.sendingMessage') : t('contact.form.sendMessage')}
                  </button>

                  {/* Success Message */}
                  {contactSuccess && (
                    <div className="success-message">
                      <div className="success-icon">✅</div>
                      <div className="success-content">
                        <h3>{t('contact.form.success.title')}</h3>
                        <p>{t('contact.form.success.message')}</p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {contactErrors.general && (
                    <div className="error-message">
                      <div className="error-icon">❌</div>
                      <div className="error-content">
                        <p>{contactErrors.general}</p>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          ) : (
            /* Reservation Form */
            <div className="reservation-container">
              <div className="reservation-form">
                <h2>{t('contact.reservation.form.title')}</h2>
                
                {/* Success Message */}
                {reservationSuccess && (
                  <div className="success-message">
                    <div className="success-icon">✅</div>
                    <div className="success-content">
                      <h3>{t('contact.reservation.success.title')}</h3>
                      <p>{t('contact.reservation.success.message')}</p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {reservationErrors.general && (
                  <div className="error-message">
                    <div className="error-icon">❌</div>
                    <div className="error-content">
                      <p>{reservationErrors.general}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleReservationSubmit}>
                  <div className="form-group">
                    <label htmlFor="customerName">{t('contact.reservation.form.fullName')} *</label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      value={reservationData.customerName}
                      onChange={handleReservationChange}
                      required
                      placeholder={t('contact.reservation.form.fullNamePlaceholder')}
                      className={reservationErrors.customerName ? 'error' : ''}
                    />
                    {reservationErrors.customerName && (
                      <span className="error-text">{reservationErrors.customerName}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">{t('contact.reservation.form.phoneNumber')} *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={reservationData.phone}
                      onChange={handleReservationChange}
                      required
                      placeholder={t('contact.reservation.form.phonePlaceholder')}
                      className={reservationErrors.phone ? 'error' : ''}
                    />
                    {reservationErrors.phone && (
                      <span className="error-text">{reservationErrors.phone}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">{t('contact.reservation.form.emailAddress')} *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={reservationData.email}
                      onChange={handleReservationChange}
                      required
                      placeholder={t('contact.reservation.form.emailPlaceholder')}
                      className={reservationErrors.email ? 'error' : ''}
                    />
                    {reservationErrors.email && (
                      <span className="error-text">{reservationErrors.email}</span>
                    )}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="reservationDate">{t('contact.reservation.form.date')} *</label>
                      <input
                        type="date"
                        id="reservationDate"
                        name="reservationDate"
                        value={reservationData.reservationDate}
                        onChange={handleDateChange}
                        required
                        min={getMinDate()}
                        className={reservationErrors.reservationDate ? 'error' : ''}
                      />
                      {reservationErrors.reservationDate && (
                        <span className="error-text">{reservationErrors.reservationDate}</span>
                      )}
                      {reservationData.reservationDate && (
                        <div className="business-hours-info">
                          <small>📅 {getBusinessHoursText(reservationData.reservationDate)}</small>
                        </div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="reservationTime">{t('contact.reservation.form.time')} *</label>
                      <select
                        id="reservationTime"
                        name="reservationTime"
                        value={reservationData.reservationTime}
                        onChange={handleReservationChange}
                        required
                        className={reservationErrors.reservationTime ? 'error' : ''}
                        disabled={!reservationData.reservationDate}
                      >
                        <option value="">
                          {reservationData.reservationDate ? t('contact.reservation.form.selectTime') : t('contact.reservation.form.selectDateFirst')}
                        </option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      {reservationErrors.reservationTime && (
                        <span className="error-text">{reservationErrors.reservationTime}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="numberOfPeople">{t('contact.reservation.form.numberOfPeople')} *</label>
                    <select
                      id="numberOfPeople"
                      name="numberOfPeople"
                      value={reservationData.numberOfPeople}
                      onChange={handleReservationChange}
                      required
                      className={reservationErrors.numberOfPeople ? 'error' : ''}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>{num} {num === 1 ? t('contact.reservation.form.person') : t('contact.reservation.form.people')}</option>
                      ))}
                    </select>
                    {reservationErrors.numberOfPeople && (
                      <span className="error-text">{reservationErrors.numberOfPeople}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="note">{t('contact.reservation.form.specialRequests')}</label>
                    <textarea
                      id="note"
                      name="note"
                      value={reservationData.note}
                      onChange={handleReservationChange}
                      rows="4"
                      placeholder={t('contact.reservation.form.specialRequestsPlaceholder')}
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className={`submit-btn ${reservationLoading ? 'loading' : ''}`}
                    disabled={reservationLoading}
                  >
                    {reservationLoading ? t('contact.reservation.form.submitting') : t('contact.reservation.form.bookTable')}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Section */}
      <div className="map-section">
        <div className="container">
          <h2>{t('contact.map.title')}</h2>
          <div className="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7259.207931926322!2d17.8716162!3d48.1491049!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476b6d006b93bc13%3A0x625b631240812045!2sVIET%20BOWLS!5e1!3m2!1svi!2s!4v1754748088309!5m2!1svi!2s" 
              width="100%" 
              height="450" 
              style={{border:0}} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="VIET BOWLS Location"
            ></iframe>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <div className="container">
          <h2>{t('contact.faq.title')}</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>{t('contact.faq.delivery.question')}</h3>
              <p>{t('contact.faq.delivery.answer')}</p>
            </div>
            
            <div className="faq-item">
              <h3>{t('contact.faq.reservation.question')}</h3>
              <p>{t('contact.faq.reservation.answer')}</p>
            </div>
            
            <div className="faq-item">
              <h3>{t('contact.faq.dietary.question')}</h3>
              <p>{t('contact.faq.dietary.answer')}</p>
            </div>
            
            <div className="faq-item">
              <h3>{t('contact.faq.covid.question')}</h3>
              <p>{t('contact.faq.covid.answer')}</p>
            </div>
            
            <div className="faq-item">
              <h3>{t('contact.faq.catering.question')}</h3>
              <p>{t('contact.faq.catering.answer')}</p>
            </div>
            
            <div className="faq-item">
              <h3>{t('contact.faq.payment.question')}</h3>
              <p>{t('contact.faq.payment.answer')}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Floating Cart Button is now handled globally in App.jsx */}
    </div>
  )
}

export default ContactUs 