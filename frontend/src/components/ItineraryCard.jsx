import { useState } from 'react';

// ItineraryCard: renders a single day's activities, plus the
// "regenerate with feedback" input — this is the creative feature
// hooked up to backend's /api/trips/:id/regenerate-day
const ItineraryCard = ({ day, onRegenerate, regenerating }) => {
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleRegenerateSubmit = () => {
    if (!feedback.trim()) return;
    onRegenerate(day.dayNumber, feedback.trim());
    setShowFeedbackInput(false);
    setFeedback('');
  };

  return (
    <div className="border-l-2 border-indigo-500 pl-6 relative">
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

      {/* Inline feedback input — replaces window.prompt(), which browsers/embedded previews can block */}
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

      <div className="space-y-3">
        {day.activities.map((act, index) => (
          <div key={index} className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <div className="flex justify-between items-start">
              <span className="font-semibold text-white">{act.title}</span>
              <span className="text-xs bg-indigo-900/40 text-indigo-300 px-2 py-0.5 rounded-full ml-2 shrink-0">
                {act.timeOfDay}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{act.description}</p>
            <p className="text-xs text-slate-500 mt-1">${act.estimatedCostUSD}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryCard;