import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('\n🔧 AUTO-FIX: Resend Domain Error\n')
console.log('=' .repeat(70))

const envPath = path.join(__dirname, '.env')

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.error('\n❌ File .env không tồn tại!')
  console.error(`   Expected path: ${envPath}`)
  console.error('\n💡 Tạo file .env từ env.example:')
  console.error('   cp Backend/env.example Backend/.env')
  process.exit(1)
}

console.log(`\n📄 Reading .env file: ${envPath}\n`)

// Read .env file
let envContent = fs.readFileSync(envPath, 'utf8')

// Check current EMAIL_USER
const currentEmailMatch = envContent.match(/^EMAIL_USER=(.*)$/m)
const currentEmail = currentEmailMatch ? currentEmailMatch[1].trim() : null

console.log('📋 Current Configuration:')
console.log(`   EMAIL_USER: ${currentEmail || '(not set)'}`)

if (!currentEmail) {
  console.error('\n❌ EMAIL_USER chưa được set trong .env')
  console.error('   Thêm dòng: EMAIL_USER=onboarding@resend.dev')
  process.exit(1)
}

// Check if already using resend.dev
if (currentEmail.includes('@resend.dev')) {
  console.log('\n✅ Đã đúng rồi! EMAIL_USER đang dùng Resend domain.')
  console.log(`   Current: ${currentEmail}`)
  console.log('\n   Không cần fix gì thêm. ✨')
  process.exit(0)
}

// Check if using gmail.com or other unverified domain
if (currentEmail.includes('@gmail.com') || !currentEmail.includes('@resend.dev')) {
  console.log(`\n⚠️ Phát hiện: EMAIL_USER đang dùng domain chưa verify`)
  console.log(`   Current: ${currentEmail}`)
  console.log(`   → Domain "${currentEmail.split('@')[1]}" chưa được verify trên Resend`)
  
  console.log('\n🔄 Auto-fixing...')
  console.log('   Đổi từ: ' + currentEmail)
  console.log('   Đổi sang: onboarding@resend.dev')
  
  // Backup original .env
  const backupPath = path.join(__dirname, '.env.backup')
  fs.copyFileSync(envPath, backupPath)
  console.log(`\n💾 Backup created: ${backupPath}`)
  
  // Replace EMAIL_USER
  const newEnvContent = envContent.replace(
    /^EMAIL_USER=.*$/m,
    'EMAIL_USER=onboarding@resend.dev'
  )
  
  // Write back to .env
  fs.writeFileSync(envPath, newEnvContent, 'utf8')
  
  console.log('\n✅ Fixed! Updated .env file:')
  console.log('   EMAIL_USER=onboarding@resend.dev')
  
  console.log('\n' + '=' .repeat(70))
  console.log('\n📝 NEXT STEPS:')
  console.log('   1. ✅ File .env đã được update')
  console.log('   2. 🔄 Restart server:')
  console.log('      Ctrl + C (stop current server)')
  console.log('      npm start (start again)')
  console.log('   3. 🧪 Test lại:')
  console.log('      node test-resend-debug.js')
  console.log('   4. 📬 Check inbox:')
  console.log('      Email sẽ gửi FROM: onboarding@resend.dev')
  console.log('      Email sẽ gửi TO: (email của customer)')
  
  console.log('\n💡 LƯU Ý:')
  console.log('   - Email FROM: onboarding@resend.dev (Resend testing email)')
  console.log('   - Email TO: Vẫn là email của customer/admin')
  console.log('   - Template HTML vẫn giữ nguyên (đẹp như cũ)')
  console.log('   - Nếu muốn dùng custom domain (VD: orders@vietbowls.com):')
  console.log('     → Verify domain tại: https://resend.com/domains')
  
  console.log('\n🔙 Rollback (nếu muốn):')
  console.log(`   cp ${backupPath} ${envPath}`)
  
  console.log('\n' + '=' .repeat(70))
  console.log('\n✅ AUTO-FIX COMPLETED! 🎉\n')
}

