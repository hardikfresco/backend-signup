const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User'); // Adjust path as per your folder structure
require('dotenv').config(); // For environment variables

const router = express.Router();

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/',
  [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    // Format validation errors as an array
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array() 
      });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ 
          errors: [{ msg: 'User already exists', param: null }] 
        });
      }

      // Create a new user
      user = new User({
        name,
        email,
        password,
      });

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save the user in the database
      await user.save();

      // Create JWT payload
      const payload = {
        user: {
          id: user.id,
        },
      };

      // Generate JWT
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' });

      // Respond with token and user data
      res.status(201).json({ 
        token, 
        user: { name: user.name, email: user.email }, 
        status: 1 
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ 
        errors: [{ msg: 'Server error', param: null }] 
      });
    }
  }
);

module.exports = router;
