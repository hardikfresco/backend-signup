const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User'); // Adjust path as per your folder structure
require('dotenv').config(); // For environment variables
const auth = require('../../middleware/auth')

const router = express.Router();

// @route    POST api/auth
// @desc     login user
// @access   public
router.post(
  '/',
  [
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

    const { email, password } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials',param:null }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials',param:null }] });
      }
      

      
      

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
