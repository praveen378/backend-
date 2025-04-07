import mongoose from "mongoose";

export const connect = async () => { 
    try {
        const MONGODB_URL = process.env.MONGODB_URL;
        console.log(`Connecting to MongoDB at ${MONGODB_URL}`);
        const instance = await mongoose.connect(MONGODB_URL);
        console.log(`MongoDB connected: ${instance.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}; 