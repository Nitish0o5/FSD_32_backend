import mongoose from "mongoose";
import dns from "node:dns";

const connectDB = async () => {
    try {
        const dnsServers = (process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1")
            .split(",")
            .map((server) => server.trim())
            .filter(Boolean);

        if (dnsServers.length > 0) {
            dns.setServers(dnsServers);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

export default connectDB;
