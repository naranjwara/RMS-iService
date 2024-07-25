const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { users, roles } = require("../models/associations");
const customers = require("../models/customers");
const queue = require('../models/queue')

const router = express.Router();

router.get("/roles", async (req, res) => {
  try {
    const role = await roles.findAll();
    res.json({ role });
  } catch (error) {
    res.status(500).json({ message: "Cannot connect to table roles", error });
  }
});

router.get("/users", async (req, res) => {
  try {
    const user = await users.findAll();
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Cannot connect to table users", error });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await users.findOne({
      where: { user_id: userId },
      include: {
        model: roles,
        attributes: ["role_name"],
      },
    });

    console.log("User:", JSON.stringify(user, null, 2));

    if (user) {
      console.log("Role Data:", JSON.stringify(user.role, null, 2));
      const roleName = user.role ? user.role.role_name : null;

      res.json({
        user_id: user.user_id,
        role_id: user.role_id,
        full_name: user.full_name,
        role_name: roleName,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/roles", async (req, res) => {
  const { role_name, descriptions } = req.body;

  try {
    const role = await roles.create({ role_name, descriptions });
    res.status(200).json({ role });
  } catch (error) {
    console.error("Error during create role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const customerList = await customers.findAll();
    res.json({ customerList });
  } catch (error) {
    console.error('Database error:', error); 
    res.status(500).json({ message: "Cannot connect to table customers", error });
  }
});

router.get('/queue', async (req, res) => {
  try {
    const queueList = await queue.findAll();
    res.json({ queueList });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Cannot connect to table queue', error});
  }
});

router.post('/queue', async (req, res) => {
  const { surname } = req.body;

  try {
    const lastQueue = await queue.findOne({ order: [['queue', 'DESC']] });
    const nextQueueNumber = lastQueue ? lastQueue.queue + 1 : 1;

    const lastQueueEntry = await queue.findOne({ order: [['createdAt', 'DESC']] });
    const lastTechnicianDesk = lastQueueEntry ? lastQueueEntry.technician_desk : 0;
    const nextTechnicianDesk = (lastTechnicianDesk % 5) + 1;

    const newQueue = await queue.create({
      queue: nextQueueNumber,
      name: surname,
      technician_desk: nextTechnicianDesk,
      status: 'waiting',
    });

    res.status(201).json(newQueue);
  } catch (error) {
    console.error('Error creating queue entry:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/customers', async (req, res) => {
  const { full_name, surname, phone_number, email, nik, address } = req.body;

  try {
      // Validate input data (basic validation example)
      if (!full_name || !surname || !phone_number || !email || !nik) {
          return res.status(400).json({ error: 'All fields are required' });
      }

      // Create a new customer record
      const newCustomer = await customers.create({
          full_name,
          surname,
          phone_number,
          email,
          nik,
          address,
      });

      res.status(201).json(newCustomer);
  } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

router.post("/signup", async (req, res) => {
  const { email, password, role_id, full_name, phone_number } = req.body;

  try {
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await users.create({
      email,
      password: hashPassword,
      role_id,
      full_name,
      phone_number,
    });

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error during signup:", error); // Log the error
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await users.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    try {
      await users.update(
        { last_login: new Date() },
        { where: { user_id: user.user_id } }
      );
    } catch (error) {
      console.error("Failed to update last login:", error);
    }

    const token = jwt.sign({ id: user.user_id }, "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3600000,
    });

    res.status(200).json({ message: "Login successfully", token, user });
  } catch (error) {
    console.error("Error during login", error);
    res.status(500).json({ message: "User log in failed" });
  }
});

router.get("/profile", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, "your_jwt_secret", async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate token" });
    }

    try {
      const user = await users.findOne({
        where: { user_id: decoded.id },
        include: [{ model: roles, attributes: ["role_name"] }],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userProfile = {
        user_id: user.user_id,
        email: user.email,
        role: user.role.role_name,
      };

      return res.status(200).json(userProfile);
    } catch (error) {
      console.error("Error fetching user profile", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });
});

router.post("/logout", async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.status(200).send("Logout successfully");
});

module.exports = router;
