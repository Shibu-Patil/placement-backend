import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import trainerRoutes from "./routes/trainer.js";
import groomingRoutes from "./routes/grooming.js";
import graphRoutes from "./routes/graphRoutes.js";

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware

app.use(cors({
  origin: "*", // allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/groomings", groomingRoutes);
app.use("/api/graph",graphRoutes );


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
