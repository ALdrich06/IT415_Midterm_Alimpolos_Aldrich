export default function StatCard({ label, value, accent = false }) {
  return (
    <div className={`rounded-2xl p-6 shadow-card ${accent ? "bg-maroon-600 text-cream-50" : "bg-white text-maroon-900"}`}>
      <p className={`text-sm font-semibold ${accent ? "text-cream-100/80" : "text-maroon-700/70"}`}>{label}</p>
      <p className="mt-1 text-3xl font-extrabold">{value}</p>
    </div>
  );
}
