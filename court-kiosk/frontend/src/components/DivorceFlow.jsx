import React from 'react';

const DivorceFlow = ({ currentStep, steps, onNext }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar Progress */}
      <aside className="w-1/4 bg-gray-50 border-r p-6">
        <h2 className="text-lg font-semibold mb-6">Your Progress</h2>
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li
              key={index}
              className={`p-3 rounded-lg ${
                index + 1 === currentStep
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600'
              }`}
            >
              {step}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-gray-500">Progress: {currentStep} of {steps.length} steps</p>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-10">
        <div className="max-w-xl text-center">
          <h1 className="text-xl font-semibold mb-4">Uncontested Divorce</h1>
          <p className="text-gray-700 mb-8">
            This is the most straightforward option where both parties agree on all 
            major issues including property division, child custody, and support 
            arrangements. This typically results in a faster, less expensive process.
          </p>
          <button
            onClick={onNext}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Continue
          </button>
        </div>
      </main>
    </div>
  );
};

export default DivorceFlow;
