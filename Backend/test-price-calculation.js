/**
 * Test Price Calculation Logic
 * 
 * Manual test script để verify price calculation hoạt động đúng
 * Run: node Backend/test-price-calculation.js
 */

import mongoose from 'mongoose';
import 'dotenv/config';
import { calculateOrderTotal, validatePrice, getBoxFeeFromDB } from './utils/priceCalculator.js';
import foodModel from './models/foodModel.js';

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

// Test cases
const runTests = async () => {
    console.log('\n🧪 ========== PRICE CALCULATION TESTS ==========\n');

    // Test 1: Get box fee from database
    console.log('📦 Test 1: Fetch Box Fee from Database');
    const boxFee = await getBoxFeeFromDB();
    console.log(`   Result: €${boxFee}`);
    console.log(`   ${boxFee > 0 ? '✅ PASS' : '⚠️ WARNING: Box fee is 0'}\n`);

    // Test 2: Find a basic product (no options, no promotion)
    console.log('🍜 Test 2: Basic Product (no options, no promotion)');
    const basicProduct = await foodModel.findOne({
        options: { $size: 0 },
        isPromotion: false
    }).limit(1);

    if (basicProduct) {
        const mockItem = {
            _id: basicProduct._id,
            quantity: 2
        };

        const result = await calculateOrderTotal([mockItem], 0);
        const expectedPrice = (Number(basicProduct.price) + (basicProduct.disableBoxFee ? 0 : boxFee)) * 2;

        console.log(`   Product: ${basicProduct.name}`);
        console.log(`   Price: €${basicProduct.price}`);
        console.log(`   Quantity: 2`);
        console.log(`   Box fee: €${basicProduct.disableBoxFee ? 0 : boxFee} per item`);
        console.log(`   Expected: €${expectedPrice.toFixed(2)}`);
        console.log(`   Calculated: €${result.total.toFixed(2)}`);
        console.log(`   ${Math.abs(result.total - expectedPrice) < 0.01 ? '✅ PASS' : '❌ FAIL'}\n`);
    } else {
        console.log('   ⚠️ No basic product found\n');
    }

    // Test 3: Product with promotion
    console.log('💸 Test 3: Product with Promotion');
    const promoProduct = await foodModel.findOne({
        isPromotion: true,
        promotionPrice: { $exists: true }
    }).limit(1);

    if (promoProduct) {
        const mockItem = {
            _id: promoProduct._id,
            quantity: 1
        };

        const result = await calculateOrderTotal([mockItem], 0);
        const expectedPrice = Number(promoProduct.promotionPrice) + (promoProduct.disableBoxFee ? 0 : boxFee);

        console.log(`   Product: ${promoProduct.name}`);
        console.log(`   Regular price: €${promoProduct.price}`);
        console.log(`   Promotion price: €${promoProduct.promotionPrice}`);
        console.log(`   Box fee: €${promoProduct.disableBoxFee ? 0 : boxFee}`);
        console.log(`   Expected: €${expectedPrice.toFixed(2)}`);
        console.log(`   Calculated: €${result.total.toFixed(2)}`);
        console.log(`   ${Math.abs(result.total - expectedPrice) < 0.01 ? '✅ PASS' : '❌ FAIL'}\n`);
    } else {
        console.log('   ⚠️ No promotion product found\n');
    }

    // Test 4: Product with options
    console.log('🎛️ Test 4: Product with Options');
    const optionsProduct = await foodModel.findOne({
        'options.0': { $exists: true }
    }).limit(1);

    if (optionsProduct) {
        // Select default options
        const selectedOptions = {};
        let expectedPrice = Number(optionsProduct.price);

        optionsProduct.options.forEach(option => {
            const defaultCode = option.defaultChoiceCode;
            selectedOptions[option.name] = defaultCode;

            const choice = option.choices.find(c => c.code === defaultCode);
            if (choice) {
                if (option.pricingMode === 'override') {
                    expectedPrice = Number(choice.price);
                } else if (option.pricingMode === 'add') {
                    expectedPrice += Number(choice.price);
                }
            }
        });

        expectedPrice += (optionsProduct.disableBoxFee ? 0 : boxFee);

        const mockItem = {
            _id: optionsProduct._id,
            quantity: 1,
            selectedOptions: selectedOptions
        };

        const result = await calculateOrderTotal([mockItem], 0);

        console.log(`   Product: ${optionsProduct.name}`);
        console.log(`   Base price: €${optionsProduct.price}`);
        console.log(`   Options: ${JSON.stringify(selectedOptions)}`);
        console.log(`   Expected: €${expectedPrice.toFixed(2)}`);
        console.log(`   Calculated: €${result.total.toFixed(2)}`);
        console.log(`   ${Math.abs(result.total - expectedPrice) < 0.01 ? '✅ PASS' : '❌ FAIL'}\n`);
    } else {
        console.log('   ⚠️ No product with options found\n');
    }

    // Test 5: Product with box fee disabled
    console.log('📦 Test 5: Product with Box Fee Disabled');
    const noBoxFeeProduct = await foodModel.findOne({
        disableBoxFee: true
    }).limit(1);

    if (noBoxFeeProduct) {
        const mockItem = {
            _id: noBoxFeeProduct._id,
            quantity: 1
        };

        const result = await calculateOrderTotal([mockItem], 0);
        const expectedPrice = Number(noBoxFeeProduct.price); // No box fee

        console.log(`   Product: ${noBoxFeeProduct.name}`);
        console.log(`   Price: €${noBoxFeeProduct.price}`);
        console.log(`   Box fee: €0 (disabled)`);
        console.log(`   Expected: €${expectedPrice.toFixed(2)}`);
        console.log(`   Calculated: €${result.total.toFixed(2)}`);
        console.log(`   ${Math.abs(result.total - expectedPrice) < 0.01 ? '✅ PASS' : '❌ FAIL'}\n`);
    } else {
        console.log('   ⚠️ No product with disabled box fee found\n');
    }

    // Test 6: Order with delivery fee
    console.log('🚚 Test 6: Order with Delivery Fee');
    if (basicProduct) {
        const mockItem = {
            _id: basicProduct._id,
            quantity: 1
        };

        const deliveryFee = 2.5;
        const result = await calculateOrderTotal([mockItem], deliveryFee);
        const itemPrice = Number(basicProduct.price) + (basicProduct.disableBoxFee ? 0 : boxFee);
        const expectedTotal = itemPrice + deliveryFee;

        console.log(`   Product: ${basicProduct.name}`);
        console.log(`   Item total: €${itemPrice.toFixed(2)}`);
        console.log(`   Delivery fee: €${deliveryFee.toFixed(2)}`);
        console.log(`   Expected total: €${expectedTotal.toFixed(2)}`);
        console.log(`   Calculated: €${result.total.toFixed(2)}`);
        console.log(`   ${Math.abs(result.total - expectedTotal) < 0.01 ? '✅ PASS' : '❌ FAIL'}\n`);
    }

    // Test 7: Price validation (mismatch detection)
    console.log('🔴 Test 7: Price Mismatch Detection');
    const clientAmount = 10.0;
    const serverAmount = 15.0;
    const validation = validatePrice(clientAmount, serverAmount, 1);

    console.log(`   Client amount: €${clientAmount.toFixed(2)}`);
    console.log(`   Server amount: €${serverAmount.toFixed(2)}`);
    console.log(`   Difference: €${validation.difference.toFixed(2)}`);
    console.log(`   Tolerance: €${validation.tolerance}`);
    console.log(`   Is valid: ${validation.isValid}`);
    console.log(`   ${!validation.isValid ? '✅ PASS (correctly rejected)' : '❌ FAIL (should reject)'}\n`);

    console.log('🧪 ========== TESTS COMPLETED ==========\n');
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        await runTests();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
};

main();
