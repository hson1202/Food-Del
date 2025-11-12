import express from 'express'
import { testEmailService, sendTestEmail } from '../services/emailService.js'

const emailTestRouter = express.Router()

// Test email configuration (GET)
emailTestRouter.get('/test', async (req, res) => {
  try {
    const result = await testEmailService()
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(200).json(result) // Return 200 even if not configured, so client can handle it
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing email service',
      error: error.message
    })
  }
})

// Send test email (POST)
emailTestRouter.post('/send-test', async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      })
    }
    
    const result = await sendTestEmail(email)
    
    if (result.success) {
      res.json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        details: result
      })
    } else {
      res.status(200).json(result)
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    })
  }
})

// Get email configuration status (safe - doesn't expose credentials)
emailTestRouter.get('/status', (req, res) => {
  const hasEmailUser = !!process.env.EMAIL_USER
  const hasEmailPass = !!(process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS)
  const hasAdminEmail = !!process.env.ADMIN_EMAIL
  
  const isConfigured = hasEmailUser && hasEmailPass
  
  res.json({
    success: true,
    configured: isConfigured,
    config: {
      EMAIL_USER: hasEmailUser ? '✓ Set' : '✗ Missing',
      EMAIL_PASSWORD: hasEmailPass ? '✓ Set' : '✗ Missing',
      ADMIN_EMAIL: hasAdminEmail ? `✓ Set (${process.env.ADMIN_EMAIL})` : '✗ Missing (will use EMAIL_USER)',
      EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail (default)',
      EMAIL_HOST: process.env.EMAIL_HOST || 'Not set (using service)',
      EMAIL_PORT: process.env.EMAIL_PORT || 'Not set (using default)'
    },
    recommendations: !isConfigured ? [
      '1. Set EMAIL_USER in environment variables',
      '2. Set EMAIL_PASSWORD (or EMAIL_APP_PASSWORD) in environment variables',
      '3. For Gmail: Create App Password at https://myaccount.google.com/apppasswords',
      '4. Set ADMIN_EMAIL to receive admin notifications',
      '5. Restart server after setting environment variables'
    ] : []
  })
})

export default emailTestRouter

