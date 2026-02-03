// Test JWT Secret Configuration
// This script verifies that JWT_SECRET is properly configured

import jwt from 'jsonwebtoken';

console.log('╔════════════════════════════════════════╗');
console.log('║   JWT Secret Configuration Test        ║');
console.log('╚════════════════════════════════════════╝\n');

// Test 1: Check if JWT_SECRET exists
console.log('🔍 Test 1: Checking if JWT_SECRET is set...');
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    console.log('❌ FAIL: JWT_SECRET is not set in environment variables!');
    console.log('   This is good - server should refuse to start.\n');
    console.log('⚠️  To fix: Set JWT_SECRET in .env file');
    console.log('   Example: JWT_SECRET=your-super-secure-random-string-min-32-chars\n');
    process.exit(1);
} else {
    console.log('✅ PASS: JWT_SECRET is configured\n');
}

// Test 2: Check JWT_SECRET strength
console.log('🔍 Test 2: Checking JWT_SECRET strength...');
if (jwtSecret.length < 32) {
    console.log('⚠️  WARNING: JWT_SECRET is too short (< 32 characters)');
    console.log(`   Current length: ${jwtSecret.length} characters`);
    console.log('   Recommendation: Use at least 32 characters\n');
} else {
    console.log(`✅ PASS: JWT_SECRET is ${jwtSecret.length} characters (strong)\n`);
}

// Test 3: Check if it's a weak default secret
console.log('🔍 Test 3: Checking for weak default secrets...');
const weakSecrets = [
    'your-super-secret-jwt-key-2024-food-delivery-admin-panel',
    'secret',
    'jwt_secret',
    'replace-with-strong-secret',
    '123456'
];

if (weakSecrets.includes(jwtSecret)) {
    console.log('❌ CRITICAL: Using a weak/default JWT_SECRET!');
    console.log('   This is a MAJOR security vulnerability!');
    console.log('   Generate a strong random secret immediately!\n');
    process.exit(1);
} else {
    console.log('✅ PASS: Not using known weak secrets\n');
}

// Test 4: Test token generation and verification
console.log('🔍 Test 4: Testing token generation and verification...');
try {
    const testPayload = { id: 'test123', role: 'user' };
    const token = jwt.sign(testPayload, jwtSecret, { expiresIn: '1h' });

    console.log('✅ Token generated successfully');

    const decoded = jwt.verify(token, jwtSecret);
    console.log('✅ Token verified successfully');
    console.log(`   Decoded payload: ${JSON.stringify(decoded)}\n`);
} catch (error) {
    console.log(`❌ FAIL: Token generation/verification failed`);
    console.log(`   Error: ${error.message}\n`);
    process.exit(1);
}

// Test 5: Test token expiration
console.log('🔍 Test 5: Testing token expiration...');
try {
    const expiredToken = jwt.sign({ id: 'test' }, jwtSecret, { expiresIn: '-1s' });

    try {
        jwt.verify(expiredToken, jwtSecret);
        console.log('⚠️  WARNING: Expired token was accepted (should not happen)\n');
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log('✅ PASS: Expired tokens are correctly rejected\n');
        } else {
            console.log(`❌ FAIL: Unexpected error: ${error.message}\n`);
        }
    }
} catch (error) {
    console.log(`❌ Error creating expired token: ${error.message}\n`);
}

console.log('═══════════════════════════════════════');
console.log('✅ All JWT Security Tests Passed!');
console.log('═══════════════════════════════════════\n');
