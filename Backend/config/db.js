import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL;
        if (!mongoUrl) {
            throw new Error("MONGODB_URL is not set in environment variables");
        }
        await mongoose.connect(mongoUrl);
        console.log("✅ DB Connected Successfully");
        return true;
    } catch (error) {
        console.error("❌ Database connection error:", error);
        
        // Don't exit on Vercel production
        if (process.env.NODE_ENV === "production") {
            console.error("Production mode: Continuing without DB connection");
            return false;
        }
        
        // Only exit on local development
        process.exit(1);
    }
}
