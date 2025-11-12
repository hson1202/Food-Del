import dotenv from 'dotenv'
import { Resend } from 'resend'

dotenv.config()

console.log('\n🔍 DEBUG RESEND API - KIỂM TRA CHI TIẾT\n')
console.log('=' .repeat(70))

// Check environment variables
const resendKey = process.env.RESEND_API_KEY
const fromEmail = process.env.EMAIL_USER || 'noreply@resend.dev'
const toEmail = process.env.ADMIN_EMAIL || 'vietbowlssala666@gmail.com'

console.log('\n📋 Environment Variables:')
console.log(`   RESEND_API_KEY: ${resendKey ? '✅ ' + resendKey.substring(0, 20) + '...' : '❌ Missing'}`)
console.log(`   From Email: ${fromEmail}`)
console.log(`   To Email: ${toEmail}`)

if (!resendKey) {
  console.error('\n❌ RESEND_API_KEY không tồn tại!')
  console.error('   Cần set RESEND_API_KEY trong .env file')
  process.exit(1)
}

console.log('\n' + '=' .repeat(70))
console.log('\n🔧 Khởi tạo Resend client...\n')

try {
  const resend = new Resend(resendKey)
  console.log('✅ Resend client created successfully')
  
  console.log('\n' + '=' .repeat(70))
  console.log('\n📧 Gửi test email...\n')
  console.log(`   From: ${fromEmail}`)
  console.log(`   To: ${toEmail}`)
  console.log('   Subject: 🧪 Test Email from Resend API')
  console.log('\n   ⏳ Đang gửi...\n')
  
  // Test với email đơn giản trước
  const result = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: '🧪 Test Email from Resend API',
    html: '<h1>Test Email</h1><p>This is a test email from Resend API.</p>',
    text: 'Test Email - This is a test email from Resend API.'
  })
  
  console.log('📊 Resend API Response:')
  console.log(JSON.stringify(result, null, 2))
  console.log('\n' + '=' .repeat(70))
  
  // Check response
  if (result.error) {
    console.error('\n❌ RESEND API TRẢ VỀ LỖI:')
    console.error('   Error:', result.error)
    console.error('   Message:', result.error.message || 'No message')
    console.error('   Name:', result.error.name || 'No name')
    
    console.log('\n💡 NGUYÊN NHÂN CÓ THỂ:')
    
    if (result.error.message?.includes('API key')) {
      console.log('   ❌ API Key không hợp lệ')
      console.log('      → Tạo API key mới: https://resend.com/api-keys')
    }
    
    if (result.error.message?.includes('domain')) {
      console.log('   ❌ Domain chưa được verify')
      console.log('      → Option 1: Dùng "onboarding@resend.dev" làm from email')
      console.log('      → Option 2: Verify domain: https://resend.com/domains')
    }
    
    if (result.error.message?.includes('email')) {
      console.log('   ❌ Email format không hợp lệ')
      console.log(`      → From: ${fromEmail}`)
      console.log(`      → To: ${toEmail}`)
    }
    
    if (result.error.message?.includes('quota')) {
      console.log('   ❌ Vượt quota (>100 emails/day)')
      console.log('      → Check usage: https://resend.com/dashboard')
    }
    
  } else if (result.data?.id || result.id) {
    const emailId = result.data?.id || result.id
    console.log('\n✅ EMAIL GỬI THÀNH CÔNG!')
    console.log(`   Email ID: ${emailId}`)
    console.log(`   Gửi đến: ${toEmail}`)
    console.log('\n   📬 CHECK INBOX:')
    console.log(`      1. Check inbox: ${toEmail}`)
    console.log('      2. Check spam folder (lần đầu có thể vào spam)')
    console.log('      3. Đợi 1-2 phút')
    console.log('\n   📊 CHECK RESEND DASHBOARD:')
    console.log(`      https://resend.com/emails/${emailId}`)
    console.log('      Xem status: delivered/bounced/failed')
    
  } else {
    console.warn('\n⚠️ RESPONSE KHÔNG RÕ RÀNG:')
    console.warn('   Không có error nhưng cũng không có email ID')
    console.warn('   Response:', result)
  }
  
  console.log('\n' + '=' .repeat(70))
  
} catch (error) {
  console.error('\n❌ LỖI KHI GỬI EMAIL:')
  console.error('   Type:', error.constructor.name)
  console.error('   Message:', error.message)
  console.error('   Stack:', error.stack)
  
  console.log('\n💡 TROUBLESHOOTING:')
  
  if (error.message.includes('API key')) {
    console.log('\n1. ❌ API Key không hợp lệ')
    console.log('   → Check RESEND_API_KEY trong .env')
    console.log('   → Tạo key mới: https://resend.com/api-keys')
    console.log('   → Key phải bắt đầu với "re_"')
  }
  
  if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
    console.log('\n2. ❌ Network Error')
    console.log('   → Check internet connection')
    console.log('   → Check firewall settings')
    console.log('   → Try again')
  }
  
  if (error.message.includes('domain')) {
    console.log('\n3. ❌ Domain không được verify')
    console.log('   → Đổi FROM email thành: "onboarding@resend.dev"')
    console.log('   → Hoặc verify domain tại: https://resend.com/domains')
  }
  
  console.log('\n' + '=' .repeat(70))
}

console.log('\n📝 NEXT STEPS:')
console.log('   1. Check inbox và spam folder')
console.log('   2. Nếu không thấy email → Check Resend Dashboard')
console.log('   3. Dashboard: https://resend.com/emails')
console.log('   4. Nếu có lỗi "domain not verified":')
console.log('      → Đổi EMAIL_USER thành: onboarding@resend.dev')
console.log('      → Restart server')
console.log('\n')

