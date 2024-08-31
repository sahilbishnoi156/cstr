const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetcher");

const JWT_SECRET = process.env.JWT_SECRET || "";

// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required

router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), success });
    }
    try {
      // Check whether the user with this email exists already
      let user = await User.findOne({ email: req.body.email });

      // if user already exists
      if (user) {
        success = false;
        return res.status(400).json({
          error: "Sorry a user with this email already exists",
          success,
        });
      }

      // creating hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // Create a new user
      user = await User.create({
        name: req.body.name,
        password: hashedPassword,
        email: req.body.email,
      });

      // Creating data for authentication token
      const data = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };

      // Creating authentication token
      const authtoken = jwt.sign(data, JWT_SECRET);

      res.json({ success: true, authtoken, name: user.name });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);
// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    let userExists;
    let passwordMatch;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      success = false;
      return res.status(400).json({ errors: errors.array(), success });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        userExists = false;
        return res.status(404).json({
          success,
          userExists,
          error: "Email not found",
        });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        userExists = true;
        passwordMatch = false;
        return res.status(400).json({
          success,
          passwordMatch,
          userExists,
          error: "Please try to login with correct password",
        });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({
        success: true,
        authtoken,
        passwordMatch: true,
        userExists: true,
        email: req.body.email,
        firstName: user.firstName,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 3: Get logged in User Details using: POST "/api/auth/getuser". Login required
router.get("/getuser", fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;

router.get("/authenticate", async (req, res) => {
  const token = req.query.token;
  if (!token) {
    res.status(401).send("Error: Please authenticate using a valid token");
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    res.status(200).send(data);
  } catch (error) {
    console.log(error);
    res.status(401).send("Error: Something went wrong");
  }
});
