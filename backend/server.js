const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', require('./routes/authRoutes'));

// Trip routes — this line is what was missing
app.use('/api/trips', require('./routes/tripRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Trao API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});