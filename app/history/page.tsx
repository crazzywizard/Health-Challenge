'use client';

export default function HistoryPage() {
  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold mb-6">History</h1>
      
      <div className="card text-center py-12">
        <div className="w-20 h-20 rounded-full gradient-secondary mx-auto mb-4 flex items-center justify-center opacity-50">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h4 className="text-xl font-semibold mb-2">No history yet</h4>
        <p className="text-text-secondary">
          Your completed challenges will appear here
        </p>
      </div>
    </div>
  );
}
