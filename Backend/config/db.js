import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL;
        if (!mongoUrl) {
            throw new Error("MONGODB_URL is not set in environment variables");
        }
        await mongoose.connect(mongoUrl);
        console.log("DB Connected");
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
}
