const express = require('express');
const connectDB = require('./db/db');
const path = require('path');
const cors = require('cors'); // Import CORS

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());

// Enable CORS with more specific options (optional)
app.use(cors());

// Define Routes
app.use('/api/users', require('./routes/api/users'));

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
