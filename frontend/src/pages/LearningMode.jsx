import { useState } from 'react';

// Hardcoded data based on requirements
const categories = {
  Alphabet: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  Greetings: ['Hello', 'Thank You', 'Yes', 'No', 'Please'],
  Animals: ['Dog', 'Cat', 'Bird', 'Fish', 'Cow'],
  Birds: ['Eagle', 'Parrot', 'Pigeon', 'Owl', 'Duck'],
  Occupations: ['Doctor', 'Teacher', 'Police', 'Chef', 'Pilot'],
};

export default function LearningMode() {
  const [activeTab, setActiveTab] = useState('Alphabet');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Mode</h1>
        <p className="text-gray-600">Study the gestures below before heading into Practice Mode.</p>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {Object.keys(categories).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === cat 
                ? 'bg-primary text-white' 
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories[activeTab].map(item => (
          <div key={item} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center hover:shadow-sm transition-shadow">
            {/* Placeholder for actual gesture image */}
            <div className="w-full aspect-square bg-gray-50 rounded-md mb-3 flex flex-col items-center justify-center border border-gray-200">
               <span className="text-2xl font-bold text-gray-300">{item[0]}</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-center">{item}</h3>
            <p className="text-xs text-gray-500 mt-1 text-center">Practice this gesture</p>
          </div>
        ))}
      </div>
    </div>
  );
}
