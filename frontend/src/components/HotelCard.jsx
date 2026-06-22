// HotelCard: renders the AI-suggested hotels for the trip
const HotelCard = ({ hotels }) => {
  if (!hotels || hotels.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-white mb-4">Recommended Hotels</h2>
      <div className="space-y-3">
        {hotels.map((hotel, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl p-4"
          >
            <div>
              <p className="font-semibold text-white">{hotel.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{hotel.tier}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">
                ${hotel.estimatedCostPerNight ?? hotel.estimatedCostNightUSD}/night
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{hotel.rating}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelCard;
