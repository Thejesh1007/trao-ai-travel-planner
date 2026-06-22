import { useState } from 'react';

// List of interests the user can pick from (matches what Gemini prompt expects)
const INTEREST_OPTIONS = ['Food', 'Culture', 'Adventure', 'Shopping', 'Nature', 'Nightlife'];

// TripForm: collects destination, duration, budget tier, interests
// Calls onSubmit (passed from Dashboard) with the form data
const TripForm = ({ onSubmit, loading }) => {
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(3);
  const [budgetTier, setBudgetTier] = useState('Medium');
  const [interests, setInterests] = useState([]);

  // Toggle an interest tag on/off
  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!destination.trim() || interests.length === 0) {
      return; // basic guard — button is also disabled in this case
    }

    onSubmit({
      destination: destination.trim(),
      durationDays: Number(durationDays),
      budgetTier,
      interests,
    });
  };

  const isValid = destination.trim() && interests.length > 0;

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
      <h2 className="text-lg font-bold text-white">Plan a New Trip</h2>

      {/* Destination */}
      <div>
        <label className="block text-sm text-slate-400 mb-1.5">Destination</label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Tokyo, Japan"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm text-slate-400 mb-1.5">Number of Days</label>
        <input
          type="number"
          min={1}
          max={14}
          value={durationDays}
          onChange={(e) => setDurationDays(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Budget Tier */}
      <div>
        <label className="block text-sm text-slate-400 mb-1.5">Budget</label>
        <div className="grid grid-cols-3 gap-2">
          {['Low', 'Medium', 'High'].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setBudgetTier(tier)}
              className={`py-2 rounded-lg text-sm font-medium transition border ${
                budgetTier === tier
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-sm text-slate-400 mb-1.5">Interests</label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                interests.includes(interest)
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
      >
        {loading ? 'Generating itinerary...' : 'Generate Trip'}
      </button>
    </form>
  );
};

export default TripForm;
