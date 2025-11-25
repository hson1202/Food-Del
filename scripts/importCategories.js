import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import categoryModel from '../models/categoryModel.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read categories from JSON file (go up 2 levels to reach root)
const categoriesPath = path.join(__dirname, '../../categories.json');

async function importCategories() {
    try {
        // MongoDB connection
        const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;
        
        if (!mongoUrl) {
            console.error('❌ MONGODB_URL or MONGODB_URI is not set in environment variables');
            console.log('\n💡 Usage: Set MONGODB_URL in your .env file');
            process.exit(1);
        }

        console.log('🔌 Connecting to MongoDB...');
        console.log('📝 Connection string length:', mongoUrl.length);
        
        // Clean connection string - remove appName parameter
        const cleanMongoUrl = mongoUrl.replace(/[?&]appName=[^&]*/g, '').replace(/[?&]$/, '');
        
        console.log('🔧 Cleaned connection string');
        
        await mongoose.connect(cleanMongoUrl, {
            retryWrites: true,
            w: 'majority'
        });
        console.log('✅ Connected to MongoDB\n');

        // Read categories from JSON file
        console.log('📂 Reading categories.json...');
        const jsonData = fs.readFileSync(categoriesPath, 'utf8');
        const { data: categories } = JSON.parse(jsonData);
        
        console.log(`📋 Found ${categories.length} categories to import\n`);

        // Check if categories already exist
        const existingCount = await categoryModel.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️  WARNING: Database already has ${existingCount} categories!`);
            console.log('🗑️  Deleting existing categories...');
            await categoryModel.deleteMany({});
            console.log('✅ Existing categories deleted\n');
        }
        
        await performImport(categories);
        
    } catch (error) {
        console.error('❌ Error importing categories:', error.message);
        
        if (error.code === 11000) {
            console.log('\n💡 Duplicate key error - some categories may already exist');
            console.log('💡 Try deleting existing categories first\n');
        }
        
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

async function performImport(categories) {
    console.log('📥 Importing categories...\n');
    
    // Clean data - remove _id and __v fields
    const cleanCategories = categories.map(cat => {
        const { _id, __v, ...rest } = cat;
        return rest;
    });
    
    // Insert categories
    const result = await categoryModel.insertMany(cleanCategories, { ordered: false });
    console.log(`✅ Successfully imported ${result.length} categories!\n`);
    
    // Display summary
    console.log('📊 IMPORT SUMMARY:');
    console.log('=================');
    categories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name}`);
    });
    console.log(`\n✅ Total: ${result.length} categories imported successfully!`);
}

// Run import
importCategories();

