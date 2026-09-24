const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");

const connectDB = require("./src/config/db");

dotenv.config();

const app = express();

// Connect MongoDB
connectDB();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "IntellMeet API is running",
    });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});