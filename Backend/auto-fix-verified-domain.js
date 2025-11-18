import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('\n🔧 AUTO-FIX: Update Email to Verified Domain\n')
console.log('=' .repeat(70))

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function main() {
  const envPath = path.join(__dirname, '.env')
  
  if (!fs.existsSync(envPath)) {
    console.error('\n❌ File .env không tồn tại!')
    rl.close()
    process.exit(1)
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8')
  const currentEmail = envContent.match(/^EMAIL_USER=(.*)$/m)?.[1]?.trim()
  
  console.log('\n📋 Current Configuration:')
  console.log(`   EMAIL_USER: ${currentEmail || '(not set)'}`)
  
  if (!currentEmail) {
    console.error('\n❌ EMAIL_USER chưa được set!')
    rl.close()
    process.exit(1)
  }
  
  const currentDomain = currentEmail.split('@')[1]
  console.log(`   Current Domain: ${currentDomain}`)
  
  if (currentDomain !== 'resend.dev' && currentDomain !== 'gmail.com') {
    console.log('\n✅ Đã dùng custom domain rồi!')
    console.log(`   Email: ${currentEmail}`)
    console.log('\nNếu vẫn không gửi được mail, có thể:')
    console.log('   1. Domain chưa verify hoàn tất (check Resend Dashboard)')
    console.log('   2. DNS chưa propagate (đợi 24-48h)')
    console.log('   3. Server chưa restart')
    rl.close()
    return
  }
  
  console.log('\n⚠️  Đang dùng testing email → Chỉ gửi được đến owner')
  console.log('\n💡 Cần đổi sang domain đã verify\n')
  
  // Suggest fastshiphu.com as default (since owner email is support@fastshiphu.com)
  console.log('Gợi ý domain: fastshiphu.com (dựa vào owner email)')
  console.log('')
  
  const verifiedDomain = await question('Nhập domain đã verify trên Resend (VD: fastshiphu.com): ')
  
  if (!verifiedDomain || !verifiedDomain.includes('.')) {
    console.error('\n❌ Domain không hợp lệ!')
    rl.close()
    process.exit(1)
  }
  
  const emailPrefix = await question('Nhập email prefix (VD: orders, noreply, info): ') || 'orders'
  
  const newEmail = `${emailPrefix}@${verifiedDomain.trim()}`
  
  console.log('\n🔄 Preparing to update...')
  console.log(`   FROM: ${currentEmail}`)
  console.log(`   TO: ${newEmail}`)
  console.log('')
  
  const confirm = await question('Confirm update? (y/n): ')
  
  if (confirm.toLowerCase() !== 'y') {
    console.log('\n❌ Cancelled by user')
    rl.close()
    return
  }
  
  // Backup
  const backupPath = path.join(__dirname, '.env.backup')
  fs.copyFileSync(envPath, backupPath)
  console.log(`\n💾 Backup created: ${backupPath}`)
  
  // Update
  const newEnvContent = envContent.replace(
    /^EMAIL_USER=.*$/m,
    `EMAIL_USER=${newEmail}`
  )
  
  fs.writeFileSync(envPath, newEnvContent, 'utf8')
  
  console.log('\n✅ Updated .env file!')
  console.log(`   EMAIL_USER=${newEmail}`)
  
  console.log('\n' + '=' .repeat(70))
  console.log('\n📝 NEXT STEPS:\n')
  console.log('1. ✅ File .env đã được update')
  console.log('2. 🔄 Restart server:')
  console.log('      Ctrl + C (stop server)')
  console.log('      npm start (start again)')
  console.log('3. 🧪 Test:')
  console.log('      node debug-production-email.js customer@example.com')
  console.log('4. 📬 Place order và check customer inbox')
  
  console.log('\n💡 NẾU VẪN LỖI "domain not verified":')
  console.log('   → Domain chưa verify hoàn tất')
  console.log('   → Check: https://resend.com/domains')
  console.log(`   → Tìm: ${verifiedDomain}`)
  console.log('   → Status phải là: ✅ Verified')
  console.log('   → Nếu chưa: Đợi DNS propagate (24-48h)')
  
  console.log('\n🔙 Rollback (nếu cần):')
  console.log(`   cp ${backupPath} ${envPath}`)
  
  console.log('\n' + '=' .repeat(70))
  console.log('\n✅ DONE! 🎉\n')
  
  rl.close()
}

main().catch(error => {
  console.error('\n❌ Error:', error.message)
  rl.close()
  process.exit(1)
})

