import dotenv from 'dotenv'
import { Resend } from 'resend'

dotenv.config()

console.log('\n🔍 CHECK VERIFIED DOMAINS ON RESEND\n')
console.log('=' .repeat(70))

const resendKey = process.env.RESEND_API_KEY

if (!resendKey) {
  console.error('❌ RESEND_API_KEY không tồn tại!')
  process.exit(1)
}

console.log('📋 Resend Account Information:\n')
console.log(`   API Key: ${resendKey.substring(0, 20)}...`)

console.log('\n' + '=' .repeat(70))
console.log('\n💡 ĐỂ XEM DOMAINS ĐÃ VERIFY:\n')

console.log('1. Login Resend Dashboard:')
console.log('   https://resend.com/login')

console.log('\n2. Go to Domains:')
console.log('   https://resend.com/domains')

console.log('\n3. Tìm domain có status:')
console.log('   ✅ Verified (màu xanh)')

console.log('\n4. Copy domain name')
console.log('   VD: fastshiphu.com')

console.log('\n' + '=' .repeat(70))
console.log('\n📝 SAU KHI BIẾT DOMAIN, UPDATE .env:\n')

console.log('File: Backend/.env')
console.log('\nĐỔI TỪ:')
console.log('   EMAIL_USER=onboarding@resend.dev')

console.log('\nĐỔI SANG:')
console.log('   EMAIL_USER=orders@YOUR-VERIFIED-DOMAIN.com')
console.log('   hoặc')
console.log('   EMAIL_USER=noreply@YOUR-VERIFIED-DOMAIN.com')

console.log('\nVÍ DỤ:')
console.log('   Nếu domain verified là "fastshiphu.com":')
console.log('   EMAIL_USER=orders@fastshiphu.com')

console.log('\n' + '=' .repeat(70))
console.log('\n🧪 TEST API CALL TO LIST DOMAINS:\n')

try {
  const resend = new Resend(resendKey)
  
  console.log('⏳ Fetching domains from Resend API...\n')
  
  // Try to get domains via API (might not work with free tier)
  try {
    const domains = await resend.domains.list()
    
    if (domains.data && domains.data.length > 0) {
      console.log('✅ DOMAINS FOUND:\n')
      domains.data.forEach((domain, index) => {
        console.log(`${index + 1}. Domain: ${domain.name}`)
        console.log(`   Status: ${domain.status}`)
        console.log(`   Region: ${domain.region || 'N/A'}`)
        console.log(`   Created: ${domain.created_at || 'N/A'}`)
        
        if (domain.status === 'verified') {
          console.log(`   ✅ → SỬ DỤNG: EMAIL_USER=orders@${domain.name}`)
        } else {
          console.log(`   ⚠️  → Status: ${domain.status} (chưa verified)`)
        }
        console.log('')
      })
    } else {
      console.log('⚠️  Không tìm thấy domains (hoặc API không trả về)')
      console.log('   → Check manually tại: https://resend.com/domains')
    }
  } catch (apiError) {
    console.log('⚠️  API call không thành công (có thể do API key permissions)')
    console.log('   Error:', apiError.message)
    console.log('\n💡 Giải pháp:')
    console.log('   → Check domains manually: https://resend.com/domains')
  }
  
} catch (error) {
  console.error('❌ Error:', error.message)
}

console.log('\n' + '=' .repeat(70))
console.log('\n🚀 QUICK FIX:\n')

console.log('Nếu domain verified là: fastshiphu.com')
console.log('\n1. Mở Backend/.env')
console.log('2. Tìm dòng: EMAIL_USER=onboarding@resend.dev')
console.log('3. Đổi thành: EMAIL_USER=orders@fastshiphu.com')
console.log('4. Save file')
console.log('5. Restart server')
console.log('6. Test: node debug-production-email.js')
console.log('\n→ Sẽ gửi được đến MỌI CUSTOMER! ✅')

console.log('\n' + '=' .repeat(70) + '\n')

