const mongoose = require('mongoose');

// Sub-schema for a single activity inside a day
const ActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  estimatedCostUSD: { type: Number, default: 0 },
  timeOfDay: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening'], // only these 3 values allowed
    default: 'Morning',
  },
});

// Sub-schema for a single day in the itinerary
const DaySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  activities: [ActivitySchema], // array of activities
});

// Main Trip schema
const TripSchema = new mongoose.Schema(
  {
    // THIS IS THE KEY TO DATA ISOLATION
    // Every trip stores which user it belongs to
    // When we fetch trips, we always filter by this userId
    userId: {
      type: mongoose.Schema.Types.ObjectId, // MongoDB's ID type
      ref: 'User', // references the User model
      required: true,
    },
    destination: { type: String, required: true },
    durationDays: { type: Number, required: true },
    budgetTier: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    interests: [{ type: String }], // array of strings like ['Food', 'Culture']

    itinerary: [DaySchema], // array of days

    hotels: [
      {
        name: { type: String },
        tier: { type: String },        // 'Budget', 'Mid-range', 'Luxury'
        estimatedCostPerNight: { type: Number },
        rating: { type: String },
      },
    ],

    estimatedBudget: {
      flights: { type: Number, default: 0 },
      accommodation: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', TripSchema);