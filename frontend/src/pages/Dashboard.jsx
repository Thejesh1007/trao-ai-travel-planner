import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TripForm from '../components/TripForm';
import ItineraryCard from '../components/ItineraryCard';
import HotelCard from '../components/HotelCard';

const Dashboard = () => {
  const { logout } = useAuth();

  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [regeneratingDay, setRegeneratingDay] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  // Load all of the logged-in user's trips on mount
  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data } = await API.get('/api/trips');
      setTrips(data);
      if (data.length > 0) setSelectedTrip(data[0]);
    } catch (err) {
      console.error('Failed to fetch trips', err);
    } finally {
      setLoadingTrips(false);
    }
  };

  // Submit the TripForm -> POST /api/trips/generate
  const handleGenerateTrip = async (formData) => {
    setGenerating(true);
    setError('');
    try {
      const { data } = await API.post('/api/trips/generate', formData);
      setTrips((prev) => [data, ...prev]);
      setSelectedTrip(data);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate trip. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Creative feature: regenerate one day with user feedback
  // POST /api/trips/:id/regenerate-day  { dayNumber, feedback }
  const handleRegenerateDay = async (dayNumber, feedback) => {
    if (!selectedTrip) return;
    setRegeneratingDay(dayNumber);
    setError('');
    try {
      const { data } = await API.post(`/api/trips/${selectedTrip._id}/regenerate-day`, {
        dayNumber,
        feedback,
      });
      setSelectedTrip(data);
      setTrips((prev) => prev.map((t) => (t._id === data._id ? data : t)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to regenerate day.');
    } finally {
      setRegeneratingDay(null);
    }
  };

  if (loadingTrips) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-950 text-white">
        <p className="text-lg animate-pulse">Loading your trips...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="max-w-7xl mx-auto flex justify-between items-center border-b border-slate-800 pb-5 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Trao</h1>
          <p className="text-sm text-slate-400">AI Travel Planner</p>
        </div>
        <button
          onClick={logout}
          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm transition"
        >
          Sign Out
        </button>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: trip list + budget + form */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Your Trips</h2>
              <button
                onClick={() => setShowForm((s) => !s)}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition"
              >
                {showForm ? 'Cancel' : '+ New Trip'}
              </button>
            </div>

            {trips.length === 0 ? (
              <p className="text-slate-500 text-sm">No trips yet. Create one to get started!</p>
            ) : (
              <div className="space-y-3">
                {trips.map((trip) => (
                  <button
                    key={trip._id}
                    onClick={() => setSelectedTrip(trip)}
                    className={`w-full text-left p-4 rounded-xl transition ${
                      selectedTrip?._id === trip._id
                        ? 'bg-blue-600 border border-blue-500 text-white'
                        : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <p className="font-bold">{trip.destination}</p>
                    <p className="text-xs opacity-80">{trip.durationDays} Days • {trip.budgetTier} Budget</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {showForm && <TripForm onSubmit={handleGenerateTrip} loading={generating} />}

          {selectedTrip && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Estimated Budget</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Flights</span>
                  <span className="font-semibold text-white">${selectedTrip.estimatedBudget?.flights ?? selectedTrip.estimatedBudget?.transport ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Accommodation</span>
                  <span className="font-semibold text-white">${selectedTrip.estimatedBudget?.accommodation ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Food</span>
                  <span className="font-semibold text-white">${selectedTrip.estimatedBudget?.food ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Activities</span>
                  <span className="font-semibold text-white">${selectedTrip.estimatedBudget?.activities ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-800 pt-3 text-white font-bold">
                  <span>Total</span>
                  <span>${selectedTrip.estimatedBudget?.total ?? 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: itinerary + hotels */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTrip ? (
            <>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3 mb-6">
                  {selectedTrip.destination} — {selectedTrip.durationDays} Days
                </h2>
                <div className="space-y-6">
                  {selectedTrip.itinerary.map((day) => (
                    <ItineraryCard
                      key={day.dayNumber}
                      day={day}
                      onRegenerate={handleRegenerateDay}
                      regenerating={regeneratingDay === day.dayNumber}
                    />
                  ))}
                </div>
              </div>

              <HotelCard hotels={selectedTrip.hotels} />
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-96 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-6xl mb-4">✈️</span>
              <p className="text-slate-400">Create your first trip to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
