import dotenv from 'dotenv'
import { Resend } from 'resend'

dotenv.config()

console.log('\n📧 TEST GỬI EMAIL ĐẾN OWNER EMAIL\n')
console.log('=' .repeat(70))

const resendKey = process.env.RESEND_API_KEY
const fromEmail = 'onboarding@resend.dev'
const toEmail = 'support@fastshiphu.com'  // ← Email owner của Resend account

console.log('📋 Configuration:')
console.log(`   From: ${fromEmail}`)
console.log(`   To: ${toEmail} (Resend account owner)`)
console.log('   Subject: 🧪 Test Email from VIET BOWLS')

if (!resendKey) {
  console.error('\n❌ RESEND_API_KEY không tồn tại!')
  process.exit(1)
}

console.log('\n' + '=' .repeat(70))
console.log('\n⏳ Đang gửi email...\n')

try {
  const resend = new Resend(resendKey)
  
  const result = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: '🧪 Test Email from VIET BOWLS - Resend API',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #e74c3c; color: white; padding: 30px; text-align: center; border-radius: 8px;">
          <h1>🍜 VIET BOWLS</h1>
          <h2>Email Service Test</h2>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 8px;">
          <h2 style="color: #27ae60;">✅ Email Service đang hoạt động!</h2>
          
          <p>Chúc mừng! Nếu bạn nhận được email này, có nghĩa là:</p>
          
          <ul>
            <li>✅ Resend API đã được config đúng</li>
            <li>✅ Email templates hoạt động</li>
            <li>✅ Gửi email thành công</li>
            <li>✅ HTML rendering đúng</li>
          </ul>
          
          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e74c3c;">
            <h3>📊 Test Information:</h3>
            <p><strong>From:</strong> ${fromEmail}</p>
            <p><strong>To:</strong> ${toEmail}</p>
            <p><strong>Provider:</strong> Resend API</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 2px solid #ffc107; margin: 20px 0;">
            <h3>⚠️ Lưu ý:</h3>
            <p>Hiện tại đang dùng <code>onboarding@resend.dev</code> - chỉ gửi được đến email owner của Resend account.</p>
            <p><strong>Để gửi đến mọi email (customers):</strong></p>
            <ul>
              <li>Verify domain tại: <a href="https://resend.com/domains">resend.com/domains</a></li>
              <li>Sau đó dùng email như: <code>orders@vietbowls.com</code></li>
            </ul>
          </div>
          
          <h3>🎯 Next Steps:</h3>
          <ol>
            <li>Verify custom domain (nếu có)</li>
            <li>Update EMAIL_USER trong .env</li>
            <li>Test với customer emails</li>
            <li>Deploy to production</li>
          </ol>
          
          <p style="margin-top: 30px; color: #666;">
            <em>This is a test email from VIET BOWLS Backend.<br>
            Powered by Resend API.</em>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 14px;">
          <p>© 2024 VIET BOWLS. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `
🍜 VIET BOWLS - Email Service Test

✅ Email Service đang hoạt động!

Chúc mừng! Nếu bạn nhận được email này, có nghĩa là:
- ✅ Resend API đã được config đúng
- ✅ Email templates hoạt động
- ✅ Gửi email thành công
- ✅ HTML rendering đúng

Test Information:
- From: ${fromEmail}
- To: ${toEmail}
- Provider: Resend API
- Timestamp: ${new Date().toLocaleString()}

⚠️ Lưu ý:
Hiện tại đang dùng onboarding@resend.dev - chỉ gửi được đến email owner.

Để gửi đến mọi email (customers):
1. Verify domain tại: resend.com/domains
2. Sau đó dùng email như: orders@vietbowls.com

© 2024 VIET BOWLS. Powered by Resend API.
    `
  })
  
  console.log('📊 Resend API Response:')
  console.log(JSON.stringify(result, null, 2))
  console.log('\n' + '=' .repeat(70))
  
  if (result.error) {
    console.error('\n❌ GỬI EMAIL THẤT BẠI:')
    console.error('   Error:', result.error.message)
    console.error('\n💡 Troubleshooting:')
    console.error('   1. Check Resend API key')
    console.error('   2. Check network connection')
    console.error('   3. Verify domain nếu cần gửi đến email khác')
  } else if (result.data?.id || result.id) {
    const emailId = result.data?.id || result.id
    console.log('\n✅ EMAIL GỬI THÀNH CÔNG!')
    console.log(`   Email ID: ${emailId}`)
    console.log(`   Từ: ${fromEmail}`)
    console.log(`   Đến: ${toEmail}`)
    console.log('\n📬 CHECK INBOX:')
    console.log(`   1. Login email: ${toEmail}`)
    console.log('   2. Check inbox (và spam folder)')
    console.log('   3. Xem email với template HTML đẹp')
    console.log('\n📊 RESEND DASHBOARD:')
    console.log(`   https://resend.com/emails/${emailId}`)
    console.log('   Xem chi tiết delivery status')
    console.log('\n💡 NEXT STEP:')
    console.log('   → Verify custom domain để gửi đến mọi email')
    console.log('   → https://resend.com/domains')
  }
  
  console.log('\n' + '=' .repeat(70))
  
} catch (error) {
  console.error('\n❌ LỖI:')
  console.error('   Message:', error.message)
  console.error('   Stack:', error.stack)
}

console.log('\n')

