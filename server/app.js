const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sequelize = require("./config/iService");
const pool = require("./config/db");
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8080;
const serverIp = "127.0.0.1";

// Middleware
app.use(bodyParser.json()); // Parses incoming requests with JSON payloads
app.use(cookieParser()); // Parses cookies attached to the client request

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    req.dbClient = await pool.connect();
    next();
  } catch (error) {
    console.error("Error connecting to the database:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Sync database models
sequelize
  .sync()
  .then(() => {
    console.log("Database & tables synced");
  })
  .catch((err) => {
    console.error("Failed to sync database & tables", err);
  });

// CORS configuration
const corsOptions = {
  origin: "http://127.0.0.1:3000", // Replace with your front-end URL
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Register routes
app.use("/auth", authRoutes); 
app.use("/protected", protectedRoutes); 

// ----------------------------------------------------------------------------------------------------------------

app.get("/sku_class", async (req, res) => {
  try {
    const sku_class = await req.dbClient.query("SELECT * FROM sku_class");
    res.json(sku_class.rows);
  } catch (error) {
    console.error("Error fetching sku class:", error);
    res.status(500).send("Internal server error");
  } finally {
    req.dbClient.release();
  }
});

app.post("/sku_class", async (req, res) => {
  try {
    const { class_id, class_name } = req.body;

    const insertQuery =
      "INSERT INTO sku_class (class_id, class_name) VALUES ($1, $2)";
    await req.dbClient.query(insertQuery, [class_id, class_name]);
  } catch (error) {
    console.error("Error adding new class:", error);
    res.status(500).send("Internal server error");
  } finally {
    req.dbClient.release();
  }
});

app.listen(port, () => {
  console.log(`This app is running on http://localhost:${port}`);
});
