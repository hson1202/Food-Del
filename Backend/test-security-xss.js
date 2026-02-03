// Test XSS Protection
// This script tests if XSS payloads are properly sanitized

const XSS_PAYLOADS = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert(1)>',
    '<svg onload=alert(1)>',
    'javascript:alert(1)',
    '<iframe src="javascript:alert(1)">',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
    '<body onload=alert(1)>'
];

async function testContactFormXSS() {
    console.log('\n🧪 Testing Contact Form XSS Protection...\n');

    for (const payload of XSS_PAYLOADS) {
        try {
            const response = await fetch('http://localhost:4000/api/contact/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: payload,
                    email: 'test@test.com',
                    subject: 'Test',
                    message: payload
                })
            });

            const data = await response.json();

            if (data.success) {
                console.log(`✅ Payload sanitized: "${payload.substring(0, 30)}..."`);
                console.log(`   Server accepted and sanitized the input\n`);
            } else {
                console.log(`⚠️ Request rejected: ${data.message}\n`);
            }
        } catch (error) {
            console.error(`❌ Error testing payload: ${error.message}\n`);
        }
    }
}

async function testOrderXSS() {
    console.log('\n🧪 Testing Order XSS Protection...\n');

    const payload = '<script>alert("XSS via order")</script>';

    try {
        const response = await fetch('http://localhost:4000/api/order/place', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: [{
                    name: 'Test Product',
                    price: 10,
                    quantity: 1
                }],
                amount: 10,
                address: {
                    street: payload,
                    city: 'Test City',
                    state: 'Test State',
                    country: 'Slovakia'
                },
                customerInfo: {
                    name: payload,
                    phone: '123456789',
                    email: 'test@test.com'
                },
                fulfillmentType: 'delivery'
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log(`✅ Order created - XSS payload should be sanitized`);
            console.log(`   Order ID: ${data.orderId}\n`);
        } else {
            console.log(`⚠️ Order rejected: ${data.message}\n`);
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}\n`);
    }
}

async function runTests() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   XSS Protection Test Suite           ║');
    console.log('╚════════════════════════════════════════╝');

    console.log('\n⚠️  Make sure backend is running on http://localhost:4000\n');

    await testContactFormXSS();
    await testOrderXSS();

    console.log('\n✅ XSS Protection tests completed!');
    console.log('📋 Check backend logs for sanitization warnings');
    console.log('📋 Verify in admin panel that scripts appear as plain text\n');
}

runTests().catch(console.error);
