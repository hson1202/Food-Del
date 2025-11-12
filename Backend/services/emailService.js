import nodemailer from 'nodemailer'
import { Resend } from 'resend'

// Create transporter (supports Gmail, Resend, and custom SMTP)
export const createTransporter = () => {
  const resendKey = process.env.RESEND_API_KEY
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS
  const host = process.env.EMAIL_HOST
  const port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined
  const service = process.env.EMAIL_SERVICE || 'gmail'
  const secure = process.env.EMAIL_SECURE === 'true' || (port === 465)

  // Priority 1: Resend (recommended for production)
  if (resendKey) {
    try {
      const resend = new Resend(resendKey)
      console.log('✅ Email configured via Resend')
      console.log(`   API Key: ${resendKey.substring(0, 10)}...`)
      console.log(`   From: ${user || 'noreply@yourdomain.com'}`)
      
      // Return Resend instance with nodemailer-like interface
      return {
        isResend: true,
        resend,
        sendMail: async (mailOptions) => {
          const result = await resend.emails.send({
            from: mailOptions.from || user || 'noreply@yourdomain.com',
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html,
            text: mailOptions.text
          })
          return { messageId: result.data?.id || result.id }
        }
      }
    } catch (error) {
      console.error('❌ Error creating Resend client:', error.message)
      return null
    }
  }

  // Priority 2: Gmail/SMTP (for development or if Resend not available)
  if (!user || !pass) {
    console.log('⚠️ Email configuration not found. Emails will not be sent.')
    console.log('⚠️ Required: RESEND_API_KEY (recommended) or EMAIL_USER + EMAIL_PASSWORD')
    console.log('📋 Current config:')
    console.log('   - RESEND_API_KEY:', resendKey ? '✓ Set' : '✗ Missing')
    console.log('   - EMAIL_USER:', user ? '✓ Set' : '✗ Missing')
    console.log('   - EMAIL_PASSWORD:', pass ? '✓ Set' : '✗ Missing')
    console.log('   - ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? '✓ Set' : '✗ Missing')
    return null
  }

  try {
    let transporter
    if (host) {
      transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure,
        auth: { user, pass }
      })
      console.log('✅ Email transporter configured via SMTP')
      console.log(`   Host: ${host}:${port || 587}`)
    } else {
      transporter = nodemailer.createTransport({
        service,
        auth: { user, pass }
      })
      console.log(`✅ Email transporter configured via ${service}`)
      console.log(`   From: ${user}`)
    }
    return transporter
  } catch (error) {
    console.error('❌ Error creating email transporter:', error.message)
    console.error('   Full error:', error)
    return null
  }
}

// Test email service connection
export const testEmailService = async () => {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      return {
        success: false,
        configured: false,
        message: 'Email service not configured. Please set RESEND_API_KEY or EMAIL_USER + EMAIL_PASSWORD in environment variables.'
      }
    }

    // Resend doesn't need verify (API key is verified on first send)
    if (transporter.isResend) {
      console.log('✅ Resend email service ready!')
      return {
        success: true,
        configured: true,
        provider: 'Resend',
        message: 'Resend email service is configured correctly',
        from: process.env.EMAIL_USER || 'noreply@yourdomain.com',
        adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'admin@yourdomain.com'
      }
    }

    // Verify SMTP connection (for Gmail/custom SMTP)
    await transporter.verify()
    
    console.log('✅ Email service connection verified successfully!')
    return {
      success: true,
      configured: true,
      provider: process.env.EMAIL_SERVICE || 'SMTP',
      message: 'Email service is working correctly',
      from: process.env.EMAIL_USER,
      adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER
    }
  } catch (error) {
    console.error('❌ Email service verification failed:', error.message)
    console.error('   Error details:', error)
    return {
      success: false,
      configured: true,
      message: `Email service configured but verification failed: ${error.message}`,
      error: error.message,
      errorCode: error.code
    }
  }
}

// Send test email
export const sendTestEmail = async (toEmail) => {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      return {
        success: false,
        message: 'Email service not configured'
      }
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: '✅ VIET BOWLS - Email Service Test',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email Test</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 8px;">
            <h1>✅ Email Service Working!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; margin-top: 20px; border-radius: 8px;">
            <h2>🎉 Success!</h2>
            <p>This is a test email from <strong>VIET BOWLS Backend</strong>.</p>
            <p>If you're receiving this email, it means the email service is configured correctly and working.</p>
            
            <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #27ae60;">
              <h3>Email Configuration:</h3>
              <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
              <p><strong>To:</strong> ${toEmail}</p>
              <p><strong>Service:</strong> ${process.env.EMAIL_SERVICE || 'gmail'}</p>
              <p><strong>Admin Email:</strong> ${process.env.ADMIN_EMAIL || process.env.EMAIL_USER}</p>
            </div>
            
            <p><strong>What this means:</strong></p>
            <ul>
              <li>✅ Email credentials are valid</li>
              <li>✅ SMTP connection is working</li>
              <li>✅ Order confirmation emails will be sent</li>
              <li>✅ Admin notification emails will be sent</li>
            </ul>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              <em>This is an automated test email from VIET BOWLS Backend.<br>
              Timestamp: ${new Date().toLocaleString()}</em>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
✅ VIET BOWLS - Email Service Test

Success! This is a test email from VIET BOWLS Backend.

If you're receiving this email, it means the email service is configured correctly and working.

Email Configuration:
- From: ${process.env.EMAIL_USER}
- To: ${toEmail}
- Service: ${process.env.EMAIL_SERVICE || 'gmail'}
- Admin Email: ${process.env.ADMIN_EMAIL || process.env.EMAIL_USER}

What this means:
✅ Email credentials are valid
✅ SMTP connection is working
✅ Order confirmation emails will be sent
✅ Admin notification emails will be sent

---
This is an automated test email from VIET BOWLS Backend.
Timestamp: ${new Date().toLocaleString()}
      `
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Test email sent successfully:', result.messageId)
    
    return {
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      to: toEmail
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error)
    return {
      success: false,
      message: `Failed to send test email: ${error.message}`,
      error: error.message,
      errorCode: error.code
    }
  }
}

// Send reservation confirmation email
export const sendReservationConfirmation = async (reservation) => {
  try {
    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.log('⚠️ Email not sent: Email service not configured');
      return { 
        success: true, 
        messageId: 'email_not_configured',
        message: 'Reservation saved but email not sent (email service not configured)'
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: reservation.email,
      subject: 'Reservation Confirmation - VIET BOWLS',
      html: generateConfirmationEmailHTML(reservation),
      text: generateConfirmationEmailText(reservation)
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Confirmation email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error)
    return { success: false, error: error.message }
  }
}

// Send reservation status update email
export const sendStatusUpdateEmail = async (reservation, oldStatus, newStatus) => {
  try {
    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.log('⚠️ Email not sent: Email service not configured');
      return { 
        success: true, 
        messageId: 'email_not_configured',
        message: 'Status updated but email not sent (email service not configured)'
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: reservation.email,
      subject: `Reservation Status Updated - VIET BOWLS`,
      html: generateStatusUpdateEmailHTML(reservation, oldStatus, newStatus),
      text: generateStatusUpdateEmailText(reservation, oldStatus, newStatus)
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Status update email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending status update email:', error)
    return { success: false, error: error.message }
  }
}

// Send contact message confirmation email
export const sendContactConfirmation = async (contactMessage, adminResponse = null) => {
  try {
    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.log('⚠️ Email not sent: Email service not configured');
      return { 
        success: true, 
        messageId: 'email_not_configured',
        message: 'Contact message saved but email not sent (email service not configured)'
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contactMessage.email,
      subject: adminResponse ? 'Response to Your Message - VIET BOWLS' : 'Message Received - VIET BOWLS',
      html: generateContactConfirmationEmailHTML(contactMessage, adminResponse),
      text: generateContactConfirmationEmailText(contactMessage, adminResponse)
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Contact confirmation email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending contact confirmation email:', error)
    return { success: false, error: error.message }
  }
}

// Send admin notification for new contact message
export const sendAdminNotification = async (contactMessage) => {
  try {
    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.log('⚠️ Email not sent: Email service not configured');
      return { 
        success: true, 
        messageId: 'email_not_configured',
        message: 'Admin notification not sent (email service not configured)'
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Message - ${contactMessage.subject.toUpperCase()} - VIET BOWLS`,
      html: generateAdminNotificationEmailHTML(contactMessage),
      text: generateAdminNotificationEmailText(contactMessage)
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Admin notification email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending admin notification email:', error)
    return { success: false, error: error.message }
  }
}

// Send order confirmation email
export const sendOrderConfirmation = async (order) => {
  try {
    // Kiểm tra xem có email không
    if (!order.customerInfo?.email) {
      console.log('⚠️ Order confirmation email not sent: No email address provided');
      return { 
        success: true, 
        messageId: 'no_email',
        message: 'Order confirmation not sent (no email address provided)'
      }
    }

    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.log('⚠️ Email not sent: Email service not configured');
      return { 
        success: true, 
        messageId: 'email_not_configured',
        message: 'Order confirmation not sent (email service not configured)'
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.customerInfo.email,
      subject: `Order Confirmation #${order.trackingCode} - VIET BOWLS`,
      html: generateOrderConfirmationEmailHTML(order),
      text: generateOrderConfirmationEmailText(order)
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Order confirmation email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error)
    return { success: false, error: error.message }
  }
}

// Send admin notification for new order
export const sendAdminOrderNotification = async (order) => {
  try {
    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.log('⚠️ Admin order notification not sent: Email service not configured');
      return { 
        success: true, 
        messageId: 'email_not_configured',
        message: 'Admin order notification not sent (email service not configured)'
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `🚨 New Order #${order.trackingCode} - ${order.customerInfo.name} - VIET BOWLS`,
      html: generateAdminOrderNotificationEmailHTML(order),
      text: generateAdminOrderNotificationEmailText(order)
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Admin order notification email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending admin order notification email:', error)
    return { success: false, error: error.message }
  }
}

// Generate HTML email content for confirmation
const generateConfirmationEmailHTML = (reservation) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const formatTime = (time) => {
    return time
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reservation Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .reservation-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .contact-info { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍜 VIET BOWLS</h1>
          <h2>Reservation Confirmation</h2>
        </div>
        
        <div class="content">
          <p>Dear <strong>${reservation.customerName}</strong>,</p>
          
          <p>Thank you for choosing VIET BOWLS! Your reservation has been received and is currently being reviewed.</p>
          
          <div class="reservation-details">
            <h3>📅 Reservation Details</h3>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formatDate(reservation.reservationDate)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${formatTime(reservation.reservationTime)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Number of Guests:</span>
              <span class="value">${reservation.numberOfPeople} ${reservation.numberOfPeople === 1 ? 'person' : 'people'}</span>
            </div>
            ${reservation.note ? `
            <div class="detail-row">
              <span class="label">Special Requests:</span>
              <span class="value">${reservation.note}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="contact-info">
            <h4>📍 Restaurant Information</h4>
            <p><strong>Address:</strong> Hlavná 33/36, 927 01 Šaľa, Slovakia</p>
            <p><strong>Email:</strong> vietbowlssala666@gmail.com</p>
          </div>
          
          <p><strong>Important Notes:</strong></p>
          <ul>
            <li>Please arrive 5-10 minutes before your reservation time</li>
            <li>We will confirm your booking within 2 hours</li>
            <li>For any changes, please contact us at least 24 hours in advance</li>
            <li>Dress code: Smart casual</li>
          </ul>
          
          <p>We look forward to serving you!</p>
          
          <p>Best regards,<br>
          <strong>The VIET BOWLS Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>© 2024 VIET BOWLS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for confirmation
const generateConfirmationEmailText = (reservation) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  return `
VIET BOWLS - Reservation Confirmation

Dear ${reservation.customerName},

Thank you for choosing VIET BOWLS! Your reservation has been received and is currently being reviewed.

RESERVATION DETAILS:
Date: ${formatDate(reservation.reservationDate)}
Time: ${reservation.reservationTime}
Number of Guests: ${reservation.numberOfPeople} ${reservation.numberOfPeople === 1 ? 'person' : 'people'}
${reservation.note ? `Special Requests: ${reservation.note}` : ''}

RESTAURANT INFORMATION:
Address: Hlavná 33/36, 927 01 Šaľa, Slovakia
Email: vietbowlssala666@gmail.com

IMPORTANT NOTES:
- Please arrive 5-10 minutes before your reservation time
- We will confirm your booking within 2 hours
- For any changes, please contact us at least 24 hours in advance
- Dress code: Smart casual

We look forward to serving you!

Best regards,
The VIET BOWLS Team

---
This is an automated email. Please do not reply directly to this message.
© 2024 VIET BOWLS. All rights reserved.
  `
}

// Generate HTML email content for status updates
const generateStatusUpdateEmailHTML = (reservation, oldStatus, newStatus) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed'
      case 'cancelled': return 'Cancelled'
      case 'completed': return 'Completed'
      default: return 'Pending'
    }
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reservation Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .reservation-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍜 VIET BOWLS</h1>
          <h2>Reservation Status Update</h2>
        </div>
        
        <div class="content">
          <p>Dear <strong>${reservation.customerName}</strong>,</p>
          
          <p>Your reservation has been updated.</p>
          
          <div class="reservation-details">
            <h3>📅 Reservation Details</h3>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formatDate(reservation.reservationDate)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${reservation.reservationTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">Number of Guests:</span>
              <span class="value">${reservation.numberOfPeople} ${reservation.numberOfPeople === 1 ? 'person' : 'people'}</span>
            </div>
            ${reservation.adminNote ? `
            <div class="detail-row">
              <span class="label">Admin Note:</span>
              <span class="value">${reservation.adminNote}</span>
            </div>
            ` : ''}
          </div>
          
          ${newStatus === 'confirmed' ? `
          <p><strong>Your reservation is confirmed! 🎉</strong></p>
          <p>Please arrive 5-10 minutes before your reservation time. We look forward to serving you!</p>
          ` : newStatus === 'cancelled' ? `
          <p><strong>Your reservation has been cancelled.</strong></p>
          <p>If you have any questions, please contact us directly.</p>
          ` : newStatus === 'completed' ? `
          <p><strong>Thank you for dining with us!</strong></p>
          <p>We hope you enjoyed your meal. Please visit us again soon!</p>
          ` : ''}
          
          <p>If you have any questions, please contact us:</p>
          <p><strong>Email:</strong> vietbowlssala666@gmail.com<br>
          <strong>Address:</strong> Hlavná 33/36, 927 01 Šaľa, Slovakia</p>
          
          <p>Best regards,<br>
          <strong>The VIET BOWLS Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>© 2024 VIET BOWLS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for status updates
const generateStatusUpdateEmailText = (reservation, oldStatus, newStatus) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed'
      case 'cancelled': return 'Cancelled'
      case 'completed': return 'Completed'
      default: return 'Pending'
    }
  }
  
  return `
VIET BOWLS - Reservation Status Update

Dear ${reservation.customerName},

Your reservation has been updated.

RESERVATION DETAILS:
Date: ${formatDate(reservation.reservationDate)}
Time: ${reservation.reservationTime}
Number of Guests: ${reservation.numberOfPeople} ${reservation.numberOfPeople === 1 ? 'person' : 'people'}
${reservation.adminNote ? `Admin Note: ${reservation.adminNote}` : ''}

${newStatus === 'confirmed' ? `
Your reservation is confirmed! 🎉

Please arrive 5-10 minutes before your reservation time. We look forward to serving you!
` : newStatus === 'cancelled' ? `
Your reservation has been cancelled.

If you have any questions, please contact us directly.
` : newStatus === 'completed' ? `
Thank you for dining with us!

We hope you enjoyed your meal. Please visit us again soon!
` : ''}

If you have any questions, please contact us:
Email: vietbowlssala666@gmail.com
Address: Hlavná 33/36, 927 01 Šaľa, Slovakia

Best regards,
The VIET BOWLS Team

---
This is an automated email. Please do not reply directly to this message.
© 2024 VIET BOWLS. All rights reserved.
  `
}

// Generate HTML email content for contact confirmation
const generateContactConfirmationEmailHTML = (contactMessage, adminResponse = null) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getSubjectText = (subject) => {
    switch (subject) {
      case 'general': return 'General Inquiry'
      case 'reservation': return 'Reservation'
      case 'feedback': return 'Feedback'
      case 'complaint': return 'Complaint'
      case 'partnership': return 'Partnership'
      case 'other': return 'Other'
      default: return subject
    }
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${adminResponse ? 'Response to Your Message' : 'Message Received'}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .message-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .contact-info { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .admin-response { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍜 VIET BOWLS</h1>
          <p>${adminResponse ? 'Response to Your Message' : 'Message Received'}</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${contactMessage.name}</strong>,</p>
          
          ${adminResponse ? `
          <p>Thank you for contacting us. We have received your message and would like to provide you with a response:</p>
          
          <div class="admin-response">
            <h3>Our Response:</h3>
            <p>${adminResponse}</p>
          </div>
          
          <p>If you have any further questions or need additional assistance, please don't hesitate to contact us again.</p>
          ` : `
          <p>Thank you for contacting VIET BOWLS. We have received your message and will get back to you as soon as possible.</p>
          
          <p>Here are the details of your message:</p>
          `}
          
          <div class="message-details">
            <div class="detail-row">
              <span class="label">Subject:</span>
              <span class="value">${getSubjectText(contactMessage.subject)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Message:</span>
              <span class="value">${contactMessage.message}</span>
            </div>
            <div class="detail-row">
              <span class="label">Sent:</span>
              <span class="value">${formatDate(contactMessage.createdAt)}</span>
            </div>
          </div>
          
          <div class="contact-info">
            <h3>Contact Information</h3>
            <p><strong>Email:</strong> vietbowlssala666@gmail.com<br>
            <strong>Address:</strong> Hlavná 33/36, 927 01 Šaľa, Slovakia</p>
          </div>
          
          <p>Best regards,<br>
          <strong>The VIET BOWLS Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>© 2024 VIET BOWLS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for contact confirmation
const generateContactConfirmationEmailText = (contactMessage, adminResponse = null) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getSubjectText = (subject) => {
    switch (subject) {
      case 'general': return 'General Inquiry'
      case 'reservation': return 'Reservation'
      case 'feedback': return 'Feedback'
      case 'complaint': return 'Complaint'
      case 'partnership': return 'Partnership'
      case 'other': return 'Other'
      default: return subject
    }
  }
  
  return `
VIET BOWLS - ${adminResponse ? 'Response to Your Message' : 'Message Received'}

Dear ${contactMessage.name},

${adminResponse ? `
Thank you for contacting us. We have received your message and would like to provide you with a response:

OUR RESPONSE:
${adminResponse}

If you have any further questions or need additional assistance, please don't hesitate to contact us again.
` : `
Thank you for contacting VIET BOWLS. We have received your message and will get back to you as soon as possible.

Here are the details of your message:
`}

MESSAGE DETAILS:
Subject: ${getSubjectText(contactMessage.subject)}
Message: ${contactMessage.message}
Sent: ${formatDate(contactMessage.createdAt)}

CONTACT INFORMATION:
Email: vietbowlssala666@gmail.com
Address: Hlavná 33/36, 927 01 Šaľa, Slovakia

Best regards,
The VIET BOWLS Team

---
This is an automated email. Please do not reply directly to this message.
© 2024 VIET BOWLS. All rights reserved.
  `
}

// Generate HTML email content for admin notification
const generateAdminNotificationEmailHTML = (contactMessage) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getSubjectText = (subject) => {
    switch (subject) {
      case 'general': return 'General Inquiry'
      case 'reservation': return 'Reservation'
      case 'feedback': return 'Feedback'
      case 'complaint': return 'Complaint'
      case 'partnership': return 'Partnership'
      case 'other': return 'Other'
      default: return subject
    }
  }
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#e74c3c'
      case 'high': return '#f39c12'
      case 'medium': return '#3498db'
      case 'low': return '#27ae60'
      default: return '#3498db'
    }
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Contact Message - ${contactMessage.subject.toUpperCase()}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .message-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; }
        .customer-info { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍜 VIET BOWLS</h1>
          <p>New Contact Message - ${contactMessage.subject.toUpperCase()}</p>
        </div>
        
        <div class="content">
          <p>A new contact message has been received from the website.</p>
          
          <div class="customer-info">
            <h3>Customer Information</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">${contactMessage.name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${contactMessage.email}</span>
            </div>
            <div class="detail-row">
              <span class="label">Subject:</span>
              <span class="value">${getSubjectText(contactMessage.subject)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Priority:</span>
              <span class="value">
                <span class="priority-badge" style="background-color: ${getPriorityColor(contactMessage.priority)};">
                  ${contactMessage.priority.toUpperCase()}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Received:</span>
              <span class="value">${formatDate(contactMessage.createdAt)}</span>
            </div>
          </div>
          
          <div class="message-details">
            <h3>Message Content</h3>
            <p>${contactMessage.message}</p>
          </div>
          
          <p><strong>Action Required:</strong> Please review this message and respond appropriately.</p>
          
          <p>You can manage this message through the admin panel.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated notification email.</p>
          <p>© 2024 VIET BOWLS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for admin notification
const generateAdminNotificationEmailText = (contactMessage) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getSubjectText = (subject) => {
    switch (subject) {
      case 'general': return 'General Inquiry'
      case 'reservation': return 'Reservation'
      case 'feedback': return 'Feedback'
      case 'complaint': return 'Complaint'
      case 'partnership': return 'Partnership'
      case 'other': return 'Other'
      default: return subject
    }
  }
  
  return `
VIET BOWLS - New Contact Message

A new contact message has been received from the website.

CUSTOMER INFORMATION:
Name: ${contactMessage.name}
Email: ${contactMessage.email}
Subject: ${getSubjectText(contactMessage.subject)}
Priority: ${contactMessage.priority.toUpperCase()}
Received: ${formatDate(contactMessage.createdAt)}

MESSAGE CONTENT:
${contactMessage.message}

ACTION REQUIRED: Please review this message and respond appropriately.

You can manage this message through the admin panel.

---
This is an automated notification email.
© 2024 VIET BOWLS. All rights reserved.
  `
}

// Generate HTML email content for order confirmation
const generateOrderConfirmationEmailHTML = (order) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - VIET BOWLS</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .tracking-code { background: #e74c3c; color: white; padding: 15px; text-align: center; border-radius: 8px; font-size: 24px; font-weight: bold; margin: 20px 0; }
        .items-list { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .item-name { font-weight: bold; }
        .item-quantity { color: #666; }
        .item-price { color: #333; }
        .total-section { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 16px; }
        .total-final { font-size: 20px; font-weight: bold; color: #e74c3c; }
        .address-section { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .contact-info { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍜 VIET BOWLS</h1>
          <h2>Order Confirmation</h2>
        </div>
        
        <div class="content">
          <p>Dear <strong>${order.customerInfo.name}</strong>,</p>
          
          <p>Thank you for your order! We have received your order and are preparing it for you.</p>
          
          <div class="tracking-code">
            Tracking Code: ${order.trackingCode}
          </div>
          
          <div class="order-details">
            <h3>📦 Order Details</h3>
            <div class="detail-row">
              <span class="label">Order Date:</span>
              <span class="value">${formatDate(order.createdAt || order.date)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Order Type:</span>
              <span class="value">${order.orderType === 'registered' ? 'Registered User' : 'Guest Order'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Method:</span>
              <span class="value">Cash on Delivery (COD)</span>
            </div>
          </div>
          
          <div class="items-list">
            <h3>🍽️ Order Items</h3>
            ${order.items.map(item => `
              <div class="item-row">
                <div>
                  <span class="item-name">${item.name}</span>
                  <span class="item-quantity"> x ${item.quantity}</span>
                </div>
                <span class="item-price">${formatCurrency(item.price * item.quantity)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(order.amount - 2)}</span>
            </div>
            <div class="total-row">
              <span>Delivery Fee:</span>
              <span>${formatCurrency(2)}</span>
            </div>
            <div class="total-row total-final">
              <span>Total:</span>
              <span>${formatCurrency(order.amount)}</span>
            </div>
          </div>
          
          <div class="address-section">
            <h3>📍 Delivery Address</h3>
            <p>
              <strong>${order.address.street}</strong><br>
              ${order.address.city}, ${order.address.state}<br>
              ${order.address.zipcode}, ${order.address.country}
            </p>
            <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
          </div>
          
          <div class="contact-info">
            <h4>📞 Contact Information</h4>
            <p><strong>Email:</strong> vietbowlssala666@gmail.com</p>
            <p><strong>Address:</strong> Hlavná 33/36, 927 01 Šaľa, Slovakia</p>
          </div>
          
          <p><strong>Important Notes:</strong></p>
          <ul>
            <li>You can track your order using the tracking code: <strong>${order.trackingCode}</strong></li>
            <li>Payment will be collected upon delivery</li>
            <li>Estimated delivery time: 30-60 minutes</li>
            <li>If you have any questions, please contact us using the information above</li>
          </ul>
          
          <p>We appreciate your business and look forward to serving you!</p>
          
          <p>Best regards,<br>
          <strong>The VIET BOWLS Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>© 2024 VIET BOWLS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for order confirmation
const generateOrderConfirmationEmailText = (order) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }
  
  return `
VIET BOWLS - Order Confirmation

Dear ${order.customerInfo.name},

Thank you for your order! We have received your order and are preparing it for you.

TRACKING CODE: ${order.trackingCode}

ORDER DETAILS:
Order Date: ${formatDate(order.createdAt || order.date)}
Order Type: ${order.orderType === 'registered' ? 'Registered User' : 'Guest Order'}
Payment Method: Cash on Delivery (COD)

ORDER ITEMS:
${order.items.map(item => `- ${item.name} x ${item.quantity}: ${formatCurrency(item.price * item.quantity)}`).join('\n')}

ORDER SUMMARY:
Subtotal: ${formatCurrency(order.amount - 2)}
Delivery Fee: ${formatCurrency(2)}
Total: ${formatCurrency(order.amount)}

DELIVERY ADDRESS:
${order.address.street}
${order.address.city}, ${order.address.state}
${order.address.zipcode}, ${order.address.country}
Phone: ${order.customerInfo.phone}

CONTACT INFORMATION:
Email: vietbowlssala666@gmail.com
Address: Hlavná 33/36, 927 01 Šaľa, Slovakia

IMPORTANT NOTES:
- You can track your order using the tracking code: ${order.trackingCode}
- Payment will be collected upon delivery
- Estimated delivery time: 30-60 minutes
- If you have any questions, please contact us using the information above

We appreciate your business and look forward to serving you!

Best regards,
The VIET BOWLS Team

---
This is an automated email. Please do not reply directly to this message.
© 2024 VIET BOWLS. All rights reserved.
  `
}

// Generate HTML email content for admin order notification
const generateAdminOrderNotificationEmailHTML = (order) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }
  
  const getOrderTypeColor = (orderType) => {
    return orderType === 'registered' ? '#27ae60' : '#3498db'
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Notification - VIET BOWLS</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .tracking-code { background: #e74c3c; color: white; padding: 15px; text-align: center; border-radius: 8px; font-size: 24px; font-weight: bold; margin: 20px 0; }
        .items-list { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .item-name { font-weight: bold; }
        .item-quantity { color: #666; }
        .item-price { color: #333; }
        .total-section { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 2px solid #ffc107; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 16px; }
        .total-final { font-size: 22px; font-weight: bold; color: #e74c3c; }
        .address-section { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .customer-section { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; }
        .urgent-notice { background: #fff3cd; border: 2px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 NEW ORDER ALERT</h1>
          <h2>VIET BOWLS</h2>
        </div>
        
        <div class="content">
          <div class="urgent-notice">
            <h2 style="margin: 0; color: #e74c3c;">⚡ ACTION REQUIRED - NEW ORDER RECEIVED</h2>
            <p style="margin: 10px 0 0 0;">Please prepare this order immediately!</p>
          </div>
          
          <div class="tracking-code">
            Order #${order.trackingCode}
          </div>
          
          <div class="customer-section">
            <h3>👤 Customer Information</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">${order.customerInfo.name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span class="value">${order.customerInfo.phone}</span>
            </div>
            ${order.customerInfo.email ? `
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${order.customerInfo.email}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="label">Customer Type:</span>
              <span class="value">
                <span class="badge" style="background-color: ${getOrderTypeColor(order.orderType)};">
                  ${order.orderType === 'registered' ? '✓ REGISTERED USER' : '👤 GUEST ORDER'}
                </span>
              </span>
            </div>
          </div>
          
          <div class="order-details">
            <h3>📦 Order Details</h3>
            <div class="detail-row">
              <span class="label">Order Date:</span>
              <span class="value">${formatDate(order.createdAt || order.date)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Method:</span>
              <span class="value">💵 Cash on Delivery (COD)</span>
            </div>
          </div>
          
          <div class="items-list">
            <h3>🍽️ Order Items</h3>
            ${order.items.map(item => `
              <div class="item-row">
                <div>
                  <span class="item-name">${item.name}</span>
                  <span class="item-quantity"> x ${item.quantity}</span>
                </div>
                <span class="item-price">${formatCurrency(item.price * item.quantity)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(order.amount - 2)}</span>
            </div>
            <div class="total-row">
              <span>Delivery Fee:</span>
              <span>${formatCurrency(2)}</span>
            </div>
            <div class="total-row total-final">
              <span>TOTAL AMOUNT:</span>
              <span>${formatCurrency(order.amount)}</span>
            </div>
          </div>
          
          <div class="address-section">
            <h3>📍 Delivery Address</h3>
            <p>
              <strong>${order.address.street}</strong><br>
              ${order.address.city}, ${order.address.state}<br>
              ${order.address.zipcode}, ${order.address.country}
            </p>
            <p><strong>📞 Contact:</strong> ${order.customerInfo.phone}</p>
          </div>
          
          <div class="urgent-notice">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">
              ⏰ Estimated Delivery: 30-60 minutes<br>
              💰 Payment: Cash on Delivery (COD)
            </p>
          </div>
          
          <p style="text-align: center; font-size: 14px; color: #666; margin-top: 20px;">
            Please log in to the Admin Panel to manage this order and update its status.
          </p>
        </div>
        
        <div class="footer">
          <p>This is an automated admin notification email.</p>
          <p>© 2024 VIET BOWLS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for admin order notification
const generateAdminOrderNotificationEmailText = (order) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }
  
  return `
🚨 NEW ORDER ALERT - VIET BOWLS

⚡ ACTION REQUIRED - NEW ORDER RECEIVED
Please prepare this order immediately!

==================================================
ORDER #${order.trackingCode}
==================================================

CUSTOMER INFORMATION:
Name: ${order.customerInfo.name}
Phone: ${order.customerInfo.phone}
${order.customerInfo.email ? `Email: ${order.customerInfo.email}` : ''}
Customer Type: ${order.orderType === 'registered' ? '✓ REGISTERED USER' : '👤 GUEST ORDER'}

ORDER DETAILS:
Order Date: ${formatDate(order.createdAt || order.date)}
Payment Method: 💵 Cash on Delivery (COD)

ORDER ITEMS:
${order.items.map(item => `- ${item.name} x ${item.quantity}: ${formatCurrency(item.price * item.quantity)}`).join('\n')}

ORDER SUMMARY:
Subtotal: ${formatCurrency(order.amount - 2)}
Delivery Fee: ${formatCurrency(2)}
==================================================
TOTAL AMOUNT: ${formatCurrency(order.amount)}
==================================================

DELIVERY ADDRESS:
${order.address.street}
${order.address.city}, ${order.address.state}
${order.address.zipcode}, ${order.address.country}
📞 Contact: ${order.customerInfo.phone}

IMPORTANT:
⏰ Estimated Delivery: 30-60 minutes
💰 Payment: Cash on Delivery (COD)

Please log in to the Admin Panel to manage this order and update its status.

---
This is an automated admin notification email.
© 2024 VIET BOWLS. All rights reserved.
  `
}
