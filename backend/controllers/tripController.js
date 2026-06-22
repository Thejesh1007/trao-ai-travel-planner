const Trip = require('../models/Trip');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Google AI client with your API key
// The SDK handles both AIzaSy... and AQ. key formats automatically
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper: Call Gemini using the official SDK with exponential backoff
const callGemini = async (prompt, retries = 4, delay = 1000) => {
  try {
    // Get the gemini-2.5-flash model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json', // force JSON output
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) throw new Error('Empty response from Gemini');

    // Parse the JSON string into a JavaScript object
    return JSON.parse(text);
  } catch (error) {
    // If rate limited and retries remain, wait and retry
    if (retries > 0) {
      console.log(`Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return callGemini(prompt, retries - 1, delay * 2);
    }
    throw error;
  }
};

// ─────────────────────────────────────────────
// POST /api/trips/generate
// Generate a new trip itinerary using Gemini
// ─────────────────────────────────────────────
const generateTrip = async (req, res) => {
  try {
    const { destination, durationDays, budgetTier, interests } = req.body;

    // Validate inputs
    if (!destination || !durationDays || !budgetTier || !interests) {
      return res.status(400).json({ message: 'All trip details are required' });
    }

    // req.user.id comes from our auth middleware (decoded from JWT)
    // This is how we know which user is making the request
    const userId = req.user.id;

    // ── Build the prompt ──
    // This is prompt engineering: we tell Gemini EXACTLY what format we want
    // Being specific about JSON structure = reliable, parseable responses
    const prompt = `
You are an expert travel planner. Create a detailed ${durationDays}-day travel itinerary for ${destination}.

User preferences:
- Budget: ${budgetTier} (Low = budget backpacker, Medium = comfortable, High = luxury)
- Interests: ${interests.join(', ')}

Return ONLY a valid JSON object with this EXACT structure (no extra text, no markdown):
{
  "itinerary": [
    {
      "dayNumber": 1,
      "activities": [
        {
          "title": "Activity name",
          "description": "2-3 sentence description of what to do and why it's worth visiting",
          "estimatedCostUSD": 20,
          "timeOfDay": "Morning"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "Hotel name",
      "tier": "Budget",
      "estimatedCostPerNight": 50,
      "rating": "4.2/5"
    }
  ],
  "estimatedBudget": {
    "flights": 400,
    "accommodation": 300,
    "food": 150,
    "activities": 100,
    "total": 950
  }
}

Rules:
- Include exactly ${durationDays} days in the itinerary
- Each day should have 3-4 activities spread across Morning, Afternoon, Evening
- Include 3 hotels: one Budget, one Mid-range, one Luxury
- Budget estimates must be realistic for ${destination} at ${budgetTier} level
- timeOfDay must be exactly "Morning", "Afternoon", or "Evening"
- All costs in USD
`;

    // Call Gemini and get the structured response
    const aiResponse = await callGemini(prompt);

    // Save the trip to MongoDB
    // userId ensures this trip belongs to ONLY this user
    const trip = await Trip.create({
      userId,
      destination,
      durationDays,
      budgetTier,
      interests,
      itinerary: aiResponse.itinerary,
      hotels: aiResponse.hotels,
      estimatedBudget: aiResponse.estimatedBudget,
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error('Generate trip error:', error.message);
    res.status(500).json({ message: 'Failed to generate trip. Please try again.' });
  }
};

// ─────────────────────────────────────────────
// GET /api/trips
// Get ALL trips belonging to the logged-in user
// ─────────────────────────────────────────────
const getMyTrips = async (req, res) => {
  try {
    // KEY SECURITY POINT: we filter by userId from the JWT (req.user.id)
    // NOT from the request body or query params
    // This means a user can NEVER see another user's trips
    // Even if they send someone else's userId, req.user.id overrides it
    const trips = await Trip.find({ userId: req.user.id })
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(trips);
  } catch (error) {
    console.error('Get trips error:', error.message);
    res.status(500).json({ message: 'Failed to fetch trips' });
  }
};

// ─────────────────────────────────────────────
// GET /api/trips/:id
// Get a single trip by ID
// ─────────────────────────────────────────────
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Ownership check: even if someone guesses a trip ID,
    // we verify it belongs to the logged-in user
    // trip.userId is ObjectId, req.user.id is string → .toString() to compare
    if (trip.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(trip);
  } catch (error) {
    console.error('Get trip error:', error.message);
    res.status(500).json({ message: 'Failed to fetch trip' });
  }
};

// ─────────────────────────────────────────────
// PUT /api/trips/:id
// Update a trip (add/remove activities)
// ─────────────────────────────────────────────
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Ownership check before allowing any modification
    if (trip.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update only the fields sent in the request body
    // { new: true } returns the updated document instead of the old one
    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error('Update trip error:', error.message);
    res.status(500).json({ message: 'Failed to update trip' });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/trips/:id
// Delete a trip
// ─────────────────────────────────────────────
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Ownership check before deletion
    if (trip.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Trip.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error.message);
    res.status(500).json({ message: 'Failed to delete trip' });
  }
};

// ─────────────────────────────────────────────
// POST /api/trips/:id/regenerate-day
// CREATIVE FEATURE: Regenerate a specific day with user feedback
// ─────────────────────────────────────────────
// Why this is special: instead of blindly regenerating,
// the user tells us WHY they don't like the day
// ("too many museums", "I want outdoor activities")
// We pass that feedback directly into the Gemini prompt
// Result: the new day is actually relevant, not just random
const regenerateDay = async (req, res) => {
  try {
    const { dayNumber, feedback } = req.body;
    // feedback = user's reason e.g. "too many museums, want street food instead"

    if (!dayNumber || !feedback) {
      return res.status(400).json({ message: 'dayNumber and feedback are required' });
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Ownership check
    if (trip.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find what Day N currently looks like
    const currentDay = trip.itinerary.find((d) => d.dayNumber === dayNumber);
    if (!currentDay) {
      return res.status(404).json({ message: `Day ${dayNumber} not found` });
    }

    // Build a context-aware prompt
    // We tell Gemini:
    // 1. What the trip is about (destination, interests, budget)
    // 2. What Day N currently has
    // 3. What the user doesn't like about it (the feedback)
    const prompt = `
You are an expert travel planner. A traveler is visiting ${trip.destination} for ${trip.durationDays} days.
Their interests are: ${trip.interests.join(', ')}. Budget level: ${trip.budgetTier}.

The current Day ${dayNumber} activities are:
${currentDay.activities.map((a) => `- ${a.title}: ${a.description}`).join('\n')}

The traveler wants to change Day ${dayNumber}. Their feedback is:
"${feedback}"

Please regenerate ONLY Day ${dayNumber} based on this feedback while keeping it relevant to ${trip.destination}.

Return ONLY a valid JSON object with this EXACT structure:
{
  "activities": [
    {
      "title": "Activity name",
      "description": "2-3 sentence description",
      "estimatedCostUSD": 20,
      "timeOfDay": "Morning"
    }
  ]
}

Rules:
- Include 3-4 activities
- timeOfDay must be exactly "Morning", "Afternoon", or "Evening"
- Directly address the traveler's feedback: "${feedback}"
- All costs in USD
`;

    const aiResponse = await callGemini(prompt);

    // Replace just the activities for that specific day in our itinerary
    // map() goes through each day, finds the matching dayNumber, replaces activities
    const updatedItinerary = trip.itinerary.map((day) => {
      if (day.dayNumber === dayNumber) {
        return { ...day.toObject(), activities: aiResponse.activities };
      }
      return day;
    });

    // Save the updated itinerary back to MongoDB
    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      { $set: { itinerary: updatedItinerary } },
      { new: true }
    );

    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error('Regenerate day error:', error.message);
    res.status(500).json({ message: 'Failed to regenerate day' });
  }
};

module.exports = {
  generateTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  regenerateDay,
};