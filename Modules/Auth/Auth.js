/**
 * @module Auth
 * @description Authentication routes for user signup, login, and logout
 */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../../model");
const bodyParser = require("body-parser");

// Add JSON body parser middleware explicitly
router.use(bodyParser.json());

/**
 * @route POST /signup
 * @description Register a new user
 * @param {Object} req.body - User registration data
 * @param {string} req.body.name - User's name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password (min 8 characters)
 * @param {string} req.body.role - User's role (must be 'student' or 'parent')
 * @returns {Object} Response object with success/error message
 * @throws {400} If role is invalid, password is too short, or user already exists
 * @throws {500} If server error occurs
 */
router.post("/signup", async (req, res) => {
  try {
    // Check if request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Request body is required" });
    }

    // Add validation for JSON content type
    if (!req.is("application/json")) {
      return res
        .status(400)
        .json({ error: "Content-Type must be application/json" });
    }

    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Name, email, password and role are required" });
    }

    // Trim and validate email
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email: trimmedEmail,
      password: hashedPassword,
      role: role,
    });

    // Save the user
    await newUser.save();

    // Remove the Table and Accuracy checks since they're now embedded
    console.log("New user created:", newUser);

    res.status(201).json({
      message: "User created successfully",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
});

/**
 * @route POST /login
 * @description Authenticate user and return JWT token
 * @param {Object} req.body - User login credentials
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @returns {Object} Response object with JWT token, user role, and user ID
 * @throws {400} If credentials are invalid
 * @throws {500} If server error occurs
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(
      `Login successful for user: ${email}, ID: ${user._id}, Role: ${user.role}, Name:${user.name}`
    );
    res.json({ token, info: user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/**
 * @route POST /logout
 * @description Logout endpoint (currently placeholder)
 * @returns {Object} Response object with success message
 */
router.post("/logout", (req, res) => {
  console.log("Logout request received");
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
