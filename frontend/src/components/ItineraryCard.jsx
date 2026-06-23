import { useState } from 'react';
import API from '../api/axios';

// ItineraryCard: renders a single day's activities, plus:
// 1. Delete button on each activity
// 2. "Regenerate with feedback" — the creative feature
const ItineraryCard = ({ day, tripId, onTripUpdate, onRegenerate, regenerating }) => {
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [deletingIndex, setDeletingIndex] = useState(null);

  const handleRegenerateSubmit = () => {
    if (!feedback.trim()) return;
    onRegenerate(day.dayNumber, feedback.trim());
    setShowFeedbackInput(false);
    setFeedback('');
  };

  // Delete a single activity by its index within this day
  // We filter it out locally, then send the full updated trip to the backend
  const handleDeleteActivity = async (activityIndex) => {
    setDeletingIndex(activityIndex);
    try {
      // Get the full trip first so we can modify just this day's activities
      const { data: currentTrip } = await API.get(`/api/trips/${tripId}`);

      // Build updated itinerary: same as before but remove the activity at activityIndex
      const updatedItinerary = currentTrip.itinerary.map((d) => {
        if (d.dayNumber === day.dayNumber) {
          return {
            ...d,
            // filter() creates a new array excluding the item at activityIndex
            activities: d.activities.filter((_, i) => i !== activityIndex),
          };
        }
        return d;
      });

      // Send the updated itinerary to the backend
      const { data: updatedTrip } = await API.put(`/api/trips/${tripId}`, {
        itinerary: updatedItinerary,
      });

      // Tell Dashboard to update its state with the new trip data
      onTripUpdate(updatedTrip);
    } catch (err) {
      console.error('Failed to delete activity', err);
    } finally {
      setDeletingIndex(null);
    }
  };

  return (
    <div className="border-l-2 border-indigo-500 pl-6 relative">
      {/* Timeline dot */}
      <div className="absolute -left-[9px] top-1 w-4 h-4 bg-indigo-500 rounded-full border-4 border-slate-900" />

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-200">Day {day.dayNumber}</h3>
        <button
          onClick={() => setShowFeedbackInput((s) => !s)}
          disabled={regenerating}
          className="text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-indigo-300 px-3 py-1 rounded-full border border-slate-700 transition"
        >
          {regenerating ? 'Regenerating...' : '↻ Regenerate with feedback'}
        </button>
      </div>

      {/* Feedback input for creative feature */}
      {showFeedbackInput && (
        <div className="flex items-center gap-2 mb-4 bg-slate-800 border border-slate-700 rounded-lg p-2">
          <input
            type="text"
            autoFocus
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRegenerateSubmit();
            }}
            placeholder="e.g. less museums, more street food"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleRegenerateSubmit}
            disabled={!feedback.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition"
          >
            Go
          </button>
        </div>
      )}

      {/* Activities list */}
      <div className="space-y-3">
        {day.activities.map((act, index) => (
          <div key={index} className="bg-slate-800 p-3 rounded-lg border border-slate-700 group">
            <div className="flex justify-between items-start">
              <span className="font-semibold text-white">{act.title}</span>

              <div className="flex items-center gap-2 ml-2 shrink-0">
                {/* Time of day badge */}
                <span className="text-xs bg-indigo-900/40 text-indigo-300 px-2 py-0.5 rounded-full">
                  {act.timeOfDay}
                </span>

                {/* Delete button — shows on hover */}
                <button
                  onClick={() => handleDeleteActivity(index)}
                  disabled={deletingIndex === index}
                  title="Remove activity"
                  className="text-slate-600 hover:text-red-400 disabled:opacity-50 transition text-sm"
                >
                  {deletingIndex === index ? '...' : '✕'}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-1">{act.description}</p>
            <p className="text-xs text-slate-500 mt-1">${act.estimatedCostUSD}</p>
          </div>
        ))}

        {/* Empty state if all activities deleted */}
        {day.activities.length === 0 && (
          <p className="text-xs text-slate-500 italic">
            No activities for this day. Regenerate to add some.
          </p>
        )}
      </div>
    </div>
  );
};

export default ItineraryCard;