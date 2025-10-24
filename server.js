import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import os from "os";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import trainerRoutes from "./routes/trainer.js";
import groomingRoutes from "./routes/grooming.js";
import graphRoutes from "./routes/graphRoutes.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
app.use(
  cors({
    origin: "*", // allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/groomings", groomingRoutes);
app.use("/api/graph", graphRoutes);

// ===== Dynamic IP route =====
app.get("/api/ip", (req, res) => {
  try {
    const networkInterfaces = os.networkInterfaces();
    let serverIp = null;

    // Find the first non-internal IPv4 address
    for (const iface of Object.values(networkInterfaces)) {
      for (const config of iface) {
        if (config.family === "IPv4" && !config.internal) {
          serverIp = config.address;
          break;
        }
      }
      if (serverIp) break;
    }

    if (!serverIp) serverIp = "127.0.0.1";

    res.json({
      ip: serverIp,
      port: PORT,
      fullUrl: `http://${serverIp}:${PORT}`,
    });
  } catch (err) {
    console.error("Error getting server IP:", err);
    res.status(500).json({ error: "Failed to detect server IP" });
  }
});

// ===== Start Server =====
app.listen(PORT, () => {
  // detect IP for console log
  const networkInterfaces = os.networkInterfaces();
  let localIp = "127.0.0.1";
  for (const iface of Object.values(networkInterfaces)) {
    for (const config of iface) {
      if (config.family === "IPv4" && !config.internal) {
        localIp = config.address;
        break;
      }
    }
  }

  console.log("=======================================");
  console.log(`✅ Server running on:`);
  console.log(`➡ Local:     http://localhost:${PORT}`);
  console.log(`➡ Network:   http://${localIp}:${PORT}`);
  console.log("=======================================");
});
