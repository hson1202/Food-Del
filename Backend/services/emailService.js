import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import foodModel from '../models/foodModel.js'
import restaurantLocationModel from '../models/restaurantLocationModel.js'

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
          try {
            const result = await resend.emails.send({
              from: mailOptions.from || user || 'noreply@yourdomain.com',
              to: mailOptions.to,
              subject: mailOptions.subject,
              html: mailOptions.html,
              text: mailOptions.text
            })
            
            // Check for errors in Resend response
            if (result.error) {
              const errorMessage = result.error.message || 'Unknown Resend API error'
              console.error('❌ Resend API error:', errorMessage)
              throw new Error(`Resend API error: ${errorMessage}`)
            }
            
            // Check if we got a valid message ID
            const messageId = result.data?.id || result.id
            if (!messageId) {
              console.error('❌ Resend API returned no message ID:', result)
              throw new Error('Resend API returned no message ID')
            }
            
            return { messageId }
          } catch (error) {
            // Re-throw the error so it can be caught by the calling function
            console.error('❌ Error in Resend sendMail:', error.message)
            throw error
          }
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
      subject: `📬 Message #${contactMessage.messageNumber || contactMessage._id.toString().slice(-6)} - ${contactMessage.subject.toUpperCase()} - VIET BOWLS`,
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

    // Fetch global box fee from restaurant settings
    let globalBoxFee = 0.3; // Default
    try {
      const restaurant = await restaurantLocationModel.findOne({ isActive: true, isPrimary: true });
      if (restaurant && restaurant.boxFee !== undefined) {
        globalBoxFee = restaurant.boxFee;
      }
    } catch (err) {
      console.warn('⚠️ Could not fetch box fee, using default 0.3:', err.message);
    }
    
    // Store box fee in order for email calculation
    order._globalBoxFee = globalBoxFee;

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
    
    const lang = order.language || 'vi';
    const t = getEmailTranslations(lang);
    const subjectMap = {
      vi: `Cảm ơn bạn đã đặt hàng #${order.trackingCode} - VIET BOWLS`,
      en: `Thanks for your order #${order.trackingCode} - VIET BOWLS`,
      sk: `Ďakujeme za objednávku #${order.trackingCode} - VIET BOWLS`
    };
    const langCode = lang?.split('-')[0] || 'vi';
    const subject = subjectMap[langCode] || subjectMap['vi'];
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.customerInfo.email,
      subject: subject,
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
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER
    
    // Kiểm tra xem có email admin không
    if (!adminEmail) {
      console.error('❌ Admin order notification not sent: ADMIN_EMAIL not configured');
      console.error('   Please set ADMIN_EMAIL in .env file');
      return { 
        success: false, 
        messageId: 'no_admin_email',
        message: 'Admin order notification not sent (ADMIN_EMAIL not configured)'
      }
    }
    
    console.log(`📧 Preparing to send admin order notification to: ${adminEmail}`);
    console.log(`   Order ID: ${order._id}, Tracking Code: ${order.trackingCode}`);
    
    const transporter = createTransporter()
    
    // If no transporter available, return success but log warning
    if (!transporter) {
      console.error('❌ Admin order notification not sent: Email service not configured');
      console.error('   Please set RESEND_API_KEY or EMAIL_USER + EMAIL_PASSWORD in .env file');
      return { 
        success: false, 
        messageId: 'email_not_configured',
        message: 'Admin order notification not sent (email service not configured)'
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `Đơn hàng mới #${order.trackingCode} - ${order.customerInfo.name}`,
      html: await generateAdminOrderNotificationEmailHTML(order),
      text: await generateAdminOrderNotificationEmailText(order)
    }
    
    console.log(`📤 Sending admin order notification email to: ${adminEmail}`);
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Admin order notification email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   To: ${adminEmail}`);
    console.log(`   Order: #${order.trackingCode}`);
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('❌ Error sending admin order notification email:', error)
    console.error('   Error details:', error.message)
    if (error.response) {
      console.error('   Error response:', error.response)
    }
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
      <title>Message #${contactMessage.messageNumber || 'N/A'} - ${contactMessage.subject.toUpperCase()}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0 0 10px 0; font-size: 28px; }
        .header p { margin: 0; font-size: 16px; opacity: 0.9; }
        .message-number { background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-top: 10px; }
        .content { padding: 30px; }
        .alert-box { background: #fff3cd; border-left: 4px solid #f39c12; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
        .alert-box strong { color: #856404; }
        .customer-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #dee2e6; }
        .customer-info h3 { margin: 0 0 15px 0; color: #495057; font-size: 16px; border-bottom: 2px solid #e74c3c; padding-bottom: 8px; }
        .detail-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 10px; background: white; border-radius: 6px; }
        .label { font-weight: bold; color: #6c757d; font-size: 14px; }
        .value { color: #212529; font-size: 14px; text-align: right; }
        .message-content { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #e74c3c; min-height: 100px; }
        .message-content h3 { margin: 0 0 15px 0; color: #e74c3c; font-size: 18px; }
        .message-text { color: #212529; font-size: 15px; line-height: 1.8; white-space: pre-wrap; word-wrap: break-word; }
        .footer { text-align: center; padding: 20px; background: #f8f9fa; color: #6c757d; font-size: 13px; }
        .priority-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .action-button { display: inline-block; background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍜 VIET BOWLS</h1>
          <p>Admin Notification - New Contact Message</p>
          <div class="message-number">MESSAGE #${contactMessage.messageNumber || 'N/A'}</div>
        </div>
        
        <div class="content">
          <div class="alert-box">
            <strong>⚡ Action Required:</strong> A new contact message has been received and requires your attention.
          </div>
          
          <div class="customer-info">
            <h3>📋 Customer Information</h3>
            <div class="detail-row">
              <span class="label">Message #:</span>
              <span class="value" style="font-weight: bold; color: #e74c3c;">#${contactMessage.messageNumber || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value"><strong>${contactMessage.name}</strong></span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value"><a href="mailto:${contactMessage.email}" style="color: #0071e3; text-decoration: none;">${contactMessage.email}</a></span>
            </div>
            <div class="detail-row">
              <span class="label">Subject:</span>
              <span class="value">${getSubjectText(contactMessage.subject)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Priority:</span>
              <span class="value">
                <span class="priority-badge" style="background-color: ${getPriorityColor(contactMessage.priority)};">
                  ${contactMessage.priority}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Received:</span>
              <span class="value">${formatDate(contactMessage.createdAt)}</span>
            </div>
          </div>
          
          <div class="message-content">
            <h3>💬 Message Content</h3>
            <div class="message-text">${contactMessage.message}</div>
          </div>
          
          <p style="margin: 20px 0; color: #6c757d; font-size: 14px;">
            <strong>📌 Next Steps:</strong><br>
            1. Review the message content above<br>
            2. Respond via email: <a href="mailto:${contactMessage.email}" style="color: #0071e3;">${contactMessage.email}</a><br>
            3. Update status in the admin panel
          </p>
        </div>
        
        <div class="footer">
          <p><strong>VIET BOWLS - Admin Panel</strong></p>
          <p>This is an automated notification email for Message #${contactMessage.messageNumber || 'N/A'}</p>
          <p style="margin: 10px 0 0 0; font-size: 12px;">© ${new Date().getFullYear()} VIET BOWLS. All rights reserved.</p>
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
========================================
🍜 VIET BOWLS - ADMIN NOTIFICATION
========================================

📬 NEW CONTACT MESSAGE #${contactMessage.messageNumber || 'N/A'}

⚡ PRIORITY: ${contactMessage.priority.toUpperCase()}

========================================

👤 CUSTOMER INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:     ${contactMessage.name}
Email:    ${contactMessage.email}
Subject:  ${getSubjectText(contactMessage.subject)}
Received: ${formatDate(contactMessage.createdAt)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 MESSAGE CONTENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${contactMessage.message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

========================================
📌 ACTION REQUIRED:
1. Review the message above
2. Reply to: ${contactMessage.email}
3. Update status in admin panel
========================================

This is an automated notification for Message #${contactMessage.messageNumber || 'N/A'}
© ${new Date().getFullYear()} VIET BOWLS. All rights reserved.
  `
}

// Email translations for customer order confirmation
const getEmailTranslations = (lang) => {
  const langCode = lang?.split('-')[0] || 'vi'; // Extract base language code (vi, en, sk)
  
  const translations = {
    vi: {
      title: 'Xác nhận đơn hàng',
      greeting: 'Chào bạn',
      thankYou: 'Cảm ơn bạn đã đặt hàng tại VIET BOWLS! Chúng tôi đã nhận được đơn hàng và đang chuẩn bị món ăn tươi ngon cho bạn.',
      trackingCode: 'Mã theo dõi đơn hàng',
      orderDetails: 'Thông tin đơn hàng',
      orderDate: 'Ngày đặt',
      orderType: 'Loại đơn',
      orderTypeRegistered: 'Thành viên',
      orderTypeGuest: 'Khách vãng lai',
      paymentMethod: 'Thanh toán',
      paymentCOD: 'Tiền mặt khi nhận hàng',
      orderItems: 'Món đã đặt',
      subtotal: 'Tạm tính',
      deliveryFee: 'Phí giao hàng',
      total: 'Tổng cộng',
      deliveryAddress: 'Địa chỉ nhận hàng',
      phone: 'Số điện thoại',
      contactInfo: 'Liên hệ với chúng tôi',
      importantNotes: 'Một vài lưu ý nhỏ',
      note1: 'Bạn có thể theo dõi đơn hàng bằng mã',
      note2: 'Thanh toán bằng tiền mặt khi nhận hàng nhé',
      note3: 'Đơn hàng sẽ được giao trong vòng 30-60 phút',
      note4: 'Nếu có thắc mắc gì, đừng ngại liên hệ với chúng tôi nhé!',
      closing: 'Cảm ơn bạn đã tin tưởng VIET BOWLS. Chúc bạn ngon miệng! 🍜',
      regards: 'Thân mến,',
      team: 'Đội ngũ VIET BOWLS',
      footer1: 'Email này được gửi tự động. Nếu cần hỗ trợ, vui lòng liên hệ trực tiếp với chúng tôi.',
      footer2: '© 2024 VIET BOWLS'
    },
    en: {
      title: 'Order Confirmation',
      greeting: 'Hi there',
      thankYou: 'Thank you for ordering from VIET BOWLS! We\'ve received your order and our kitchen is already preparing your delicious meal.',
      trackingCode: 'Your Order Tracking Code',
      orderDetails: 'Order Information',
      orderDate: 'Order Date',
      orderType: 'Order Type',
      orderTypeRegistered: 'Member',
      orderTypeGuest: 'Guest',
      paymentMethod: 'Payment',
      paymentCOD: 'Cash on Delivery',
      orderItems: 'Your Order',
      subtotal: 'Subtotal',
      deliveryFee: 'Delivery Fee',
      total: 'Total',
      deliveryAddress: 'Delivery Address',
      phone: 'Phone',
      contactInfo: 'Get in Touch',
      importantNotes: 'A Few Quick Notes',
      note1: 'You can track your order using code',
      note2: 'Please have cash ready for payment upon delivery',
      note3: 'Your order will arrive within 30-60 minutes',
      note4: 'If you have any questions, feel free to reach out to us anytime!',
      closing: 'Thanks for choosing VIET BOWLS. Enjoy your meal! 🍜',
      regards: 'Warm regards,',
      team: 'The VIET BOWLS Team',
      footer1: 'This is an automated email. For support, please contact us directly.',
      footer2: '© 2024 VIET BOWLS'
    },
    sk: {
      title: 'Potvrdenie objednávky',
      greeting: 'Ahoj',
      thankYou: 'Ďakujeme, že ste si objednali z VIET BOWLS! Vašu objednávku sme prijali a naša kuchyňa už pripravuje vaše chutné jedlo.',
      trackingCode: 'Váš sledovací kód',
      orderDetails: 'Informácie o objednávke',
      orderDate: 'Dátum objednávky',
      orderType: 'Typ objednávky',
      orderTypeRegistered: 'Člen',
      orderTypeGuest: 'Hosť',
      paymentMethod: 'Platba',
      paymentCOD: 'Platba na dobierku',
      orderItems: 'Vaša objednávka',
      subtotal: 'Medzisúčet',
      deliveryFee: 'Poplatok za doručenie',
      total: 'Celkom',
      deliveryAddress: 'Dodacia adresa',
      phone: 'Telefón',
      contactInfo: 'Kontakt',
      importantNotes: 'Niekoľko rýchlych poznámok',
      note1: 'Svoju objednávku môžete sledovať pomocou kódu',
      note2: 'Prosím, pripravte hotovosť na platbu pri doručení',
      note3: 'Vaša objednávka dorazí do 30-60 minút',
      note4: 'Ak máte akékoľvek otázky, neváhajte nás kontaktovať!',
      closing: 'Ďakujeme, že ste si vybrali VIET BOWLS. Dobrú chuť! 🍜',
      regards: 'S pozdravom,',
      team: 'Tím VIET BOWLS',
      footer1: 'Toto je automatický email. Pre podporu nás prosím kontaktujte priamo.',
      footer2: '© 2024 VIET BOWLS'
    }
  };
  
  return translations[langCode] || translations['vi']; // Default to Vietnamese
};

// Build a human-friendly "house number + street" line for orders.
// Avoid duplicating if street already contains a leading number or includes the house number.
const formatOrderStreetLine = (address = {}) => {
  const street = (address.street || '').toString().trim();
  const house = (address.houseNumber || '').toString().trim();
  if (!street && !house) return '';
  if (!house) return street;
  const streetAlreadyHasNumber = /^\d+/.test(street);
  const streetHasHouse = street && street.toLowerCase().includes(house.toLowerCase());
  if (streetAlreadyHasNumber || streetHasHouse) return street || house;
  return `${house} ${street}`.trim();
};

// Calculate item price including box fee and options (same logic as frontend)
const calculateItemPrice = async (item, globalBoxFee = 0.3) => {
  // Tính giá gốc (chưa bao gồm box fee)
  let basePrice = 0;
  
  // Nếu có options và selectedOptions
  if (item.options && item.options.length > 0 && item.selectedOptions) {
    basePrice = item.price || 0;
    
    Object.entries(item.selectedOptions).forEach(([optionName, choiceCode]) => {
      const option = item.options.find(opt => opt.name === optionName);
      if (option) {
        const choice = option.choices.find(c => c.code === choiceCode);
        if (choice) {
          if (option.pricingMode === 'override') {
            basePrice = choice.price;
          } else if (option.pricingMode === 'add') {
            basePrice += choice.price;
          }
        }
      }
    });
  } else {
    // Nếu không có options, dùng promotion price hoặc regular price
    basePrice = item.isPromotion && item.promotionPrice ? item.promotionPrice : (item.price || 0);
  }
  
  // Kiểm tra giá có hợp lệ không
  if (isNaN(Number(basePrice)) || Number(basePrice) < 0) {
    basePrice = 0;
  }
  
  // Thêm tiền hộp nếu không tắt (dùng globalBoxFee từ settings)
  const isBoxFeeDisabled = item.disableBoxFee === true || 
                         item.disableBoxFee === "true" || 
                         item.disableBoxFee === 1 || 
                         item.disableBoxFee === "1" ||
                         (typeof item.disableBoxFee === 'string' && item.disableBoxFee.toLowerCase() === 'true');
  const boxFee = isBoxFeeDisabled ? 0 : globalBoxFee;
  const finalPrice = Number(basePrice) + boxFee;
  
  return finalPrice;
};

// Generate HTML email content for order confirmation
const generateOrderConfirmationEmailHTML = (order) => {
  const lang = order.language || 'vi';
  const t = getEmailTranslations(lang);
  
  const formatDate = (date) => {
    const localeMap = { vi: 'vi-VN', en: 'en-US', sk: 'sk-SK' };
    const locale = localeMap[lang?.split('-')[0]] || 'vi-VN';
    return new Date(date).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatCurrency = (amount) => {
    const n = Number(amount);
    if (isNaN(n) || n < 0) return '€0';
    
    // Luôn dùng EUR và format giống frontend
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(n);
    
    return formatted.replace(/\.00$/, '');
  }
  
  // Get delivery fee from order.deliveryInfo, fallback to 0 if not available
  const deliveryFee = order.deliveryInfo?.deliveryFee ?? 0;
  const subtotal = order.amount - deliveryFee;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${t.title} - VIET BOWLS</title>
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
          <h2>${t.title}</h2>
        </div>
        
        <div class="content">
          <p>${t.greeting} <strong>${order.customerInfo.name}</strong>,</p>
          
          <p>${t.thankYou}</p>
          
          <div class="tracking-code">
            ${t.trackingCode}: ${order.trackingCode}
          </div>
          
          <div class="order-details">
            <h3>📦 ${t.orderDetails}</h3>
            <div class="detail-row">
              <span class="label">${t.orderDate}:</span>
              <span class="value">${formatDate(order.createdAt || order.date)}</span>
            </div>
            <div class="detail-row">
              <span class="label">${t.orderType}:</span>
              <span class="value">${order.orderType === 'registered' ? t.orderTypeRegistered : t.orderTypeGuest}</span>
            </div>
            <div class="detail-row">
              <span class="label">${t.paymentMethod}:</span>
              <span class="value">${t.paymentCOD}</span>
            </div>
          </div>
          
          <div class="items-list">
            ${order.items.map(item => `
              <div class="item-row">
                <div>
                  <span class="item-name">${item.name}</span>
                  <span class="item-quantity"> x ${item.quantity || 1}</span>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="total-section">
            <div class="total-row">
              <span>${t.subtotal}:</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="total-row">
              <span>${t.deliveryFee}:</span>
              <span>${formatCurrency(deliveryFee)}</span>
            </div>
            <div class="total-row total-final">
              <span>${t.total}:</span>
              <span>${formatCurrency(order.amount)}</span>
            </div>
          </div>
          
          <div class="address-section">
            <h3>📍 ${t.deliveryAddress}</h3>
            <p>
              <strong>${formatOrderStreetLine(order.address) || order.address.street}</strong><br>
              ${order.address.city}, ${order.address.state}<br>
              ${order.address.zipcode}, ${order.address.country}
            </p>
            <p><strong>${t.phone}:</strong> ${order.customerInfo.phone}</p>
          </div>
          
          <div class="contact-info">
            <h4>📞 ${t.contactInfo}</h4>
            <p><strong>Email:</strong> vietbowlssala666@gmail.com</p>
            <p><strong>${t.deliveryAddress}:</strong> Hlavná 33/36, 927 01 Šaľa, Slovakia</p>
          </div>
          
          <p><strong>${t.importantNotes}:</strong></p>
          <ul>
            <li>${t.note1}: <strong>${order.trackingCode}</strong></li>
            <li>${t.note2}</li>
            <li>${t.note3}</li>
            <li>${t.note4}</li>
          </ul>
          
          <p>${t.closing}</p>
          
          <p>${t.regards}<br>
          <strong>${t.team}</strong></p>
        </div>
        
        <div class="footer">
          <p>${t.footer1}</p>
          <p>${t.footer2}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for order confirmation
const generateOrderConfirmationEmailText = (order) => {
  const lang = order.language || 'vi';
  const t = getEmailTranslations(lang);
  
  const formatDate = (date) => {
    const localeMap = { vi: 'vi-VN', en: 'en-US', sk: 'sk-SK' };
    const locale = localeMap[lang?.split('-')[0]] || 'vi-VN';
    return new Date(date).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatCurrency = (amount) => {
    const n = Number(amount);
    if (isNaN(n) || n < 0) return '€0';
    
    // Luôn dùng EUR và format giống frontend
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(n);
    
    return formatted.replace(/\.00$/, '');
  }
  
  // Get delivery fee from order.deliveryInfo, fallback to 0 if not available
  const deliveryFee = order.deliveryInfo?.deliveryFee ?? 0;
  const subtotal = order.amount - deliveryFee;
  
  return `
VIET BOWLS - ${t.title}

${t.greeting} ${order.customerInfo.name},

${t.thankYou}

${t.trackingCode.toUpperCase()}: ${order.trackingCode}

${t.orderDetails.toUpperCase()}:
${t.orderDate}: ${formatDate(order.createdAt || order.date)}
${t.orderType}: ${order.orderType === 'registered' ? t.orderTypeRegistered : t.orderTypeGuest}
${t.paymentMethod}: ${t.paymentCOD}

${t.orderItems.toUpperCase()}:
${order.items.map(item => `- ${item.name} x ${item.quantity || 1}`).join('\n')}

${t.orderDetails.toUpperCase()}:
${t.subtotal}: ${formatCurrency(subtotal)}
${t.deliveryFee}: ${formatCurrency(deliveryFee)}
${t.total}: ${formatCurrency(order.amount)}

${t.deliveryAddress.toUpperCase()}:
${formatOrderStreetLine(order.address) || order.address.street}
${order.address.city}, ${order.address.state}
${order.address.zipcode}, ${order.address.country}
${t.phone}: ${order.customerInfo.phone}

${t.contactInfo.toUpperCase()}:
Email: vietbowlssala666@gmail.com
${t.deliveryAddress}: Hlavná 33/36, 927 01 Šaľa, Slovakia

${t.importantNotes.toUpperCase()}:
- ${t.note1}: ${order.trackingCode}
- ${t.note2}
- ${t.note3}
- ${t.note4}

${t.closing}

${t.regards}
${t.team}

---
${t.footer1}
${t.footer2}
  `
}

// Helper function to get Vietnamese product name (for admin emails)
// Tự động query từ database nếu không có nameVI trong item
const getVietnameseProductName = async (item) => {
  // Ưu tiên nameVI nếu có
  if (item.nameVI) {
    return item.nameVI;
  }
  
  // Nếu không có nameVI, thử query từ database bằng _id hoặc sku
  try {
    if (item._id || item.id) {
      const product = await foodModel.findById(item._id || item.id);
      if (product && product.nameVI) {
        return product.nameVI;
      }
    }
    
    if (item.sku) {
      const product = await foodModel.findOne({ sku: item.sku });
      if (product && product.nameVI) {
        return product.nameVI;
      }
    }
  } catch (error) {
    console.log('⚠️ Could not query product for Vietnamese name:', error.message);
  }
  
  // Fallback về name nếu không tìm thấy
  return item.name || 'Sản phẩm';
};

// Helper function to format selected options for display (for admin emails - always Vietnamese)
// Luôn query từ database để lấy đầy đủ thông tin đa ngôn ngữ
const formatSelectedOptionsForAdmin = async (item) => {
  if (!item.selectedOptions || Object.keys(item.selectedOptions).length === 0) {
    return '';
  }
  
  // Luôn query từ database để đảm bảo có đầy đủ thông tin đa ngôn ngữ
  let options = null;
  try {
    if (item._id || item.id) {
      const product = await foodModel.findById(item._id || item.id);
      if (product && product.options) {
        options = product.options;
      }
    } else if (item.sku) {
      const product = await foodModel.findOne({ sku: item.sku });
      if (product && product.options) {
        options = product.options;
      }
    }
    
    // Nếu không query được, thử dùng options từ item
    if (!options && item.options && Array.isArray(item.options) && item.options.length > 0) {
      options = item.options;
    }
  } catch (error) {
    console.log('⚠️ Could not query product options:', error.message);
    // Fallback về options từ item nếu có
    if (item.options && Array.isArray(item.options) && item.options.length > 0) {
      options = item.options;
    } else {
      return '';
    }
  }
  
  if (!options || !Array.isArray(options) || options.length === 0) {
    return '';
  }
  
  const optionTexts = [];
  
  for (const [optionName, choiceCode] of Object.entries(item.selectedOptions)) {
    // Tìm option theo name (có thể là name gốc, nameVI, nameEN, hoặc nameSK)
    // optionName trong selectedOptions thường là name gốc của option
    const option = options.find(opt => 
      opt.name === optionName || 
      opt.nameVI === optionName || 
      opt.nameEN === optionName || 
      opt.nameSK === optionName
    );
    
    if (option) {
      const choice = option.choices.find(c => c.code === choiceCode);
      if (choice) {
        // Luôn ưu tiên nameVI và labelVI cho admin email
        const optionNameVI = option.nameVI || option.name || optionName;
        const choiceLabelVI = choice.labelVI || choice.label || choice.code;
        optionTexts.push(`${optionNameVI}: ${choiceLabelVI}`);
      }
    } else {
      // Nếu không tìm thấy option, vẫn hiển thị với optionName và choiceCode
      // (trường hợp này hiếm khi xảy ra)
      optionTexts.push(`${optionName}: ${choiceCode}`);
    }
  }
  
  return optionTexts.length > 0 ? ` (${optionTexts.join(', ')})` : '';
};

// Helper function to format selected options for display (for customer emails - uses customer language)
const formatSelectedOptions = (item) => {
  if (!item.selectedOptions || Object.keys(item.selectedOptions).length === 0) {
    return '';
  }
  
  if (!item.options || !Array.isArray(item.options) || item.options.length === 0) {
    return '';
  }
  
  const optionTexts = [];
  Object.entries(item.selectedOptions).forEach(([optionName, choiceCode]) => {
    const option = item.options.find(opt => opt.name === optionName);
    if (option) {
      const choice = option.choices.find(c => c.code === choiceCode);
      if (choice) {
        optionTexts.push(`${optionName}: ${choice.label || choice.code}`);
      }
    }
  });
  
  return optionTexts.length > 0 ? ` (${optionTexts.join(', ')})` : '';
};

// Generate HTML email content for admin order notification
// LUÔN LUÔN BẰNG TIẾNG VIỆT, không phụ thuộc vào ngôn ngữ của khách hàng
const generateAdminOrderNotificationEmailHTML = async (order) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatCurrency = (amount) => {
    const n = Number(amount);
    if (isNaN(n) || n < 0) return '€0';
    
    // Format EUR giống customer email
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(n);
    
    return formatted.replace(/\.00$/, '');
  }
  
  // Get delivery fee from order.deliveryInfo, fallback to 0 if not available
  const deliveryFee = order.deliveryInfo?.deliveryFee ?? 0;
  const subtotal = order.amount - deliveryFee;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Đơn hàng mới #${order.trackingCode}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #2c3e50; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
        .content { padding: 24px; }
        .order-code { background: #f8f9fa; padding: 12px; border-radius: 6px; text-align: center; margin-bottom: 20px; }
        .order-code strong { font-size: 18px; color: #e74c3c; }
        .section { margin: 20px 0; }
        .section-title { font-size: 14px; font-weight: 600; color: #7f8c8d; text-transform: uppercase; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #ecf0f1; }
        .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
        .info-label { width: 100px; color: #7f8c8d; font-size: 14px; }
        .info-value { flex: 1; color: #2c3e50; font-weight: 500; font-size: 14px; }
        .items-list { margin: 12px 0; }
        .item-row { padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
        .item-name { color: #2c3e50; font-weight: 500; }
        .item-qty { color: #7f8c8d; margin-left: 8px; }
        .item-options { font-size: 12px; color: #7f8c8d; margin-left: 20px; font-style: italic; }
        .total-section { background: #f8f9fa; padding: 16px; border-radius: 6px; margin: 16px 0; }
        .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .total-row.final { border-top: 2px solid #2c3e50; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: 600; color: #e74c3c; }
        .address-box { background: #e8f4f8; padding: 14px; border-left: 4px solid #3498db; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #2c3e50; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍜 Đơn hàng mới - VIET BOWLS</h1>
        </div>
        
        <div class="content">
          <div class="order-code">
            <strong>Đơn hàng #${order.trackingCode}</strong>
          </div>
          
          <div class="section">
            <div class="section-title">Thông tin khách hàng</div>
            <div class="info-row">
              <div class="info-label">Tên:</div>
              <div class="info-value">${order.customerInfo.name}</div>
            </div>
            <div class="info-row">
              <div class="info-label">SĐT:</div>
              <div class="info-value">${order.customerInfo.phone}</div>
            </div>
            ${order.customerInfo.email ? `
            <div class="info-row">
              <div class="info-label">Email:</div>
              <div class="info-value">${order.customerInfo.email}</div>
            </div>
            ` : ''}
            <div class="info-row">
              <div class="info-label">Địa chỉ:</div>
              <div class="info-value">
                ${formatOrderStreetLine(order.address) || order.address.street}${order.address.city ? `, ${order.address.city}` : ''}${order.address.state ? `, ${order.address.state}` : ''}${order.address.zipcode ? ` ${order.address.zipcode}` : ''}
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Món ăn đã đặt</div>
            <div class="items-list">
              ${(await Promise.all(order.items.map(async (item) => {
                // Luôn dùng tiếng Việt cho admin email
                const productNameVI = await getVietnameseProductName(item);
                const optionsText = await formatSelectedOptionsForAdmin(item);
                const cleanOptionsText = optionsText ? optionsText.replace(/^ \(/, '').replace(/\)$/, '') : '';
                return `
                <div class="item-row">
                  <div class="item-name">
                    ${productNameVI}<span class="item-qty"> x${item.quantity || 1}</span>
                  </div>
                  ${cleanOptionsText ? `<div class="item-options">${cleanOptionsText}</div>` : ''}
                </div>
              `;
              }))).join('')}
            </div>
            
            <div class="total-section">
              <div class="total-row">
                <span>Tạm tính:</span>
                <span>${formatCurrency(subtotal)}</span>
              </div>
              <div class="total-row">
                <span>Phí giao hàng:</span>
                <span>${formatCurrency(deliveryFee)}</span>
              </div>
              <div class="total-row final">
                <span>Tổng cộng:</span>
                <span>${formatCurrency(order.amount)}</span>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Thông tin đơn hàng</div>
            <div class="info-row">
              <div class="info-label">Thời gian:</div>
              <div class="info-value">${formatDate(order.createdAt || order.date)}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Thanh toán:</div>
              <div class="info-value">COD (Tiền mặt khi nhận)</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content for admin order notification
// LUÔN LUÔN BẰNG TIẾNG VIỆT, không phụ thuộc vào ngôn ngữ của khách hàng
const generateAdminOrderNotificationEmailText = async (order) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatCurrency = (amount) => {
    const n = Number(amount);
    if (isNaN(n) || n < 0) return '€0';
    
    // Format EUR giống customer email
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(n);
    
    return formatted.replace(/\.00$/, '');
  }
  
  // Get delivery fee from order.deliveryInfo, fallback to 0 if not available
  const deliveryFee = order.deliveryInfo?.deliveryFee ?? 0;
  const subtotal = order.amount - deliveryFee;
  
  return `
🍜 ĐƠN HÀNG MỚI - VIET BOWLS

Đơn hàng #${order.trackingCode}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THÔNG TIN KHÁCH HÀNG:
Tên: ${order.customerInfo.name}
SĐT: ${order.customerInfo.phone}
 ${order.customerInfo.email ? `Email: ${order.customerInfo.email}\n` : ''}Địa chỉ: ${formatOrderStreetLine(order.address) || order.address.street}${order.address.city ? `, ${order.address.city}` : ''}${order.address.state ? `, ${order.address.state}` : ''}${order.address.zipcode ? ` ${order.address.zipcode}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MÓN ĂN ĐÃ ĐẶT:
${(await Promise.all(order.items.map(async (item) => {
    // Luôn dùng tiếng Việt cho admin email
    const productNameVI = await getVietnameseProductName(item);
    const optionsText = await formatSelectedOptionsForAdmin(item);
    return `- ${productNameVI}${optionsText ? optionsText : ''} x${item.quantity || 1}`;
  }))).join('\n')}

Tạm tính: ${formatCurrency(subtotal)}
Phí giao hàng: ${formatCurrency(deliveryFee)}
TỔNG CỘNG: ${formatCurrency(order.amount)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thời gian: ${formatDate(order.createdAt || order.date)}
Thanh toán: COD (Tiền mặt khi nhận)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email tự động từ hệ thống VIET BOWLS
  `
}
