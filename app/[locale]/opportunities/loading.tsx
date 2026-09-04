export default function OpportunitiesLoading() {
  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-white animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-16">
          <div className="h-12 bg-gray-200 rounded-lg w-64 mb-4" />
          <div className="h-4 bg-gray-100 rounded w-full max-w-2xl" />
        </div>
        <div className="mb-8 h-14 bg-gray-100 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div className="h-48 bg-gray-200 rounded-lg" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
