const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  generateTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  regenerateDay,
} = require('../controllers/tripController');

// All routes below are protected — must have valid JWT

router.post('/generate', protect, generateTrip);       // Generate new trip
router.get('/', protect, getMyTrips);                  // Get all my trips
router.get('/:id', protect, getTripById);              // Get one trip
router.put('/:id', protect, updateTrip);               // Update trip
router.delete('/:id', protect, deleteTrip);            // Delete trip
router.post('/:id/regenerate-day', protect, regenerateDay); // Creative feature

module.exports = router;