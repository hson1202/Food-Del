// Test NoSQL Injection Protection
// This script tests if MongoDB operator injection is blocked

const NOSQL_INJECTION_PAYLOADS = [
    { email: { $gt: "" }, password: { $gt: "" } },
    { email: { $ne: null }, password: { $ne: null } },
    { email: { $regex: ".*" }, password: { $regex: ".*" } },
    { email: { $where: "1==1" }, password: "test" },
    { email: "admin@test.com", password: { $ne: "" } }
];

async function testLoginInjection() {
    console.log('\n🧪 Testing Login NoSQL Injection Protection...\n');

    for (const payload of NOSQL_INJECTION_PAYLOADS) {
        try {
            const response = await fetch('http://localhost:4000/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                console.log(`❌ SECURITY BREACH! Login succeeded with injection payload!`);
                console.log(`   Payload: ${JSON.stringify(payload)}\n`);
            } else {
                console.log(`✅ Injection blocked: ${data.message}`);
                console.log(`   Payload: ${JSON.stringify(payload).substring(0, 50)}...\n`);
            }
        } catch (error) {
            console.error(`❌ Error testing payload: ${error.message}\n`);
        }
    }
}

async function testAdminLoginInjection() {
    console.log('\n🧪 Testing Admin Login NoSQL Injection Protection...\n');

    const payload = {
        email: { $gt: "" },
        password: { $gt: "" }
    };

    try {
        const response = await fetch('http://localhost:4000/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            console.log(`❌ CRITICAL SECURITY BREACH! Admin login bypassed!\n`);
        } else {
            console.log(`✅ Admin login injection blocked: ${data.message}\n`);
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}\n`);
    }
}

async function testOrderTrackingInjection() {
    console.log('\n🧪 Testing Order Tracking NoSQL Injection Protection...\n');

    const payload = {
        trackingCode: { $ne: null },
        phone: "123456789"
    };

    try {
        const response = await fetch('http://localhost:4000/api/order/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success && data.data) {
            console.log(`❌ SECURITY ISSUE! Retrieved orders with injection payload!`);
            console.log(`   Found ${Array.isArray(data.data) ? data.data.length : 1} order(s)\n`);
        } else {
            console.log(`✅ Order tracking injection blocked\n`);
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}\n`);
    }
}

async function runTests() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║  NoSQL Injection Test Suite           ║');
    console.log('╚════════════════════════════════════════╝');

    console.log('\n⚠️  Make sure backend is running on http://localhost:4000');
    console.log('📋 Check backend console for sanitization warnings\n');

    await testLoginInjection();
    await testAdminLoginInjection();
    await testOrderTrackingInjection();

    console.log('\n✅ NoSQL Injection tests completed!');
    console.log('🔍 All injection attempts should be blocked');
    console.log('⚠️  If any test shows "SECURITY BREACH", review the security middleware!\n');
}

runTests().catch(console.error);
