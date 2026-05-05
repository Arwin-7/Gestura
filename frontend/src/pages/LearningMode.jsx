import { useState } from 'react';

// ASL alphabet images from Wikimedia Commons (public domain)
const ASL_IMG = (letter) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/Sign_language_${letter}.svg`;

const categories = {
  Alphabet: [
    { name: 'A', img: ASL_IMG('A'), tip: 'Make a fist with thumb resting on the side.' },
    { name: 'B', img: ASL_IMG('B'), tip: 'Hold four fingers straight up, thumb tucked in.' },
    { name: 'C', img: ASL_IMG('C'), tip: 'Curve fingers and thumb into a C shape.' },
    { name: 'D', img: ASL_IMG('D'), tip: 'Index finger points up, other fingers touch thumb.' },
    { name: 'E', img: ASL_IMG('E'), tip: 'Curl all fingers down toward the palm.' },
    { name: 'F', img: ASL_IMG('F'), tip: 'Index finger and thumb form an O, others spread up.' },
    { name: 'G', img: ASL_IMG('G'), tip: 'Index finger and thumb point horizontally.' },
    { name: 'H', img: ASL_IMG('H'), tip: 'Index and middle fingers point out horizontally.' },
    { name: 'I', img: ASL_IMG('I'), tip: 'Pinky finger points up, others make a fist.' },
    { name: 'J', img: ASL_IMG('J'), tip: 'Pinky up, then trace a J in the air.' },
    { name: 'K', img: ASL_IMG('K'), tip: 'Index points up, middle points out, thumb between them.' },
    { name: 'L', img: ASL_IMG('L'), tip: 'Index finger points up, thumb points out — makes an L.' },
    { name: 'M', img: ASL_IMG('M'), tip: 'Three fingers folded over the thumb.' },
    { name: 'N', img: ASL_IMG('N'), tip: 'Two fingers folded over the thumb.' },
    { name: 'O', img: ASL_IMG('O'), tip: 'All fingers curve to touch the thumb, forming an O.' },
    { name: 'P', img: ASL_IMG('P'), tip: 'Like K but pointed downward.' },
    { name: 'Q', img: ASL_IMG('Q'), tip: 'Like G but pointed downward.' },
    { name: 'R', img: ASL_IMG('R'), tip: 'Cross your index and middle fingers.' },
    { name: 'S', img: ASL_IMG('S'), tip: 'Fist with thumb over fingers.' },
    { name: 'T', img: ASL_IMG('T'), tip: 'Thumb between index and middle fingers.' },
    { name: 'U', img: ASL_IMG('U'), tip: 'Index and middle fingers point up together.' },
    { name: 'V', img: ASL_IMG('V'), tip: 'Index and middle fingers form a V.' },
    { name: 'W', img: ASL_IMG('W'), tip: 'Three fingers spread apart.' },
    { name: 'X', img: ASL_IMG('X'), tip: 'Index finger hooks slightly.' },
    { name: 'Y', img: ASL_IMG('Y'), tip: 'Pinky and thumb extend out.' },
    { name: 'Z', img: ASL_IMG('Z'), tip: 'Index finger traces a Z in the air.' },
  ],
  Greetings: [
    { name: 'Hello',     emoji: '👋', tip: 'Flat hand salute from forehead, moving outward.' },
    { name: 'Thank You', emoji: '🤲', tip: 'Flat hand from chin moving outward.' },
    { name: 'Yes',       emoji: '✅', tip: 'Fist nods up and down like a head nodding.' },
    { name: 'No',        emoji: '🚫', tip: 'Index and middle finger snap to thumb.' },
    { name: 'Please',    emoji: '🙏', tip: 'Flat hand rubs circles on chest.' },
  ],
  Animals: [
    { name: 'Dog',   emoji: '🐕', tip: 'Snap fingers and pat leg.' },
    { name: 'Cat',   emoji: '🐈', tip: 'Pinch thumb and index finger near cheek and pull out.' },
    { name: 'Bird',  emoji: '🐦', tip: 'Index and thumb near mouth open and close.' },
    { name: 'Fish',  emoji: '🐟', tip: 'Flat hand moves forward in a wavy motion.' },
    { name: 'Cow',   emoji: '🐄', tip: 'Pinky at temple, twist forward.' },
  ],
  Birds: [
    { name: 'Eagle',  emoji: '🦅', tip: 'Hooked index finger at nose.' },
    { name: 'Parrot', emoji: '🦜', tip: 'Hand near mouth mimics a beak opening/closing.' },
    { name: 'Pigeon', emoji: '🕊️', tip: 'Flat hand flaps at the wrist.' },
    { name: 'Owl',    emoji: '🦉', tip: 'Both O hands around eyes like glasses.' },
    { name: 'Duck',   emoji: '🦆', tip: 'Three fingers near mouth open and close.' },
  ],
  Occupations: [
    { name: 'Doctor',  emoji: '👨‍⚕️', tip: 'Tap fingers on inside of opposite wrist.' },
    { name: 'Teacher', emoji: '👩‍🏫', tip: 'Both flat hands near temples, move outward.' },
    { name: 'Police',  emoji: '👮', tip: 'C hand taps the left chest.' },
    { name: 'Chef',    emoji: '👨‍🍳', tip: 'Flat hand flips over on palm like flipping food.' },
    { name: 'Pilot',   emoji: '✈️',  tip: 'Y hand with index up moves forward.' },
  ],
};

export default function LearningMode() {
  const [activeTab, setActiveTab] = useState('Alphabet');
  const [selected, setSelected] = useState(null);

  const items = categories[activeTab];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Mode</h1>
        <p className="text-gray-600">Study the gestures below before heading into Practice Mode.</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {Object.keys(categories).map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveTab(cat); setSelected(null); }}
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

      {/* Detail panel */}
      {selected && (
        <div className="mb-6 p-5 bg-blue-50 border border-blue-100 rounded-xl flex gap-6 items-center">
          <div className="w-24 h-24 flex-shrink-0 bg-white rounded-lg border border-blue-100 flex items-center justify-center overflow-hidden">
            {selected.img
              ? <img src={selected.img} alt={selected.name} className="w-full h-full object-contain p-1" />
              : <span className="text-5xl">{selected.emoji}</span>
            }
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{selected.name}</h2>
            <p className="text-gray-600 text-sm">💡 <span className="font-medium">Tip:</span> {selected.tip}</p>
          </div>
          <button onClick={() => setSelected(null)} className="ml-auto text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map(item => (
          <button
            key={item.name}
            onClick={() => setSelected(item)}
            className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center hover:border-primary hover:shadow-sm transition-all text-left"
          >
            <div className="w-full aspect-square bg-gray-50 rounded-md mb-3 flex items-center justify-center border border-gray-100 overflow-hidden">
              {item.img
                ? <img
                    src={item.img}
                    alt={`ASL ${item.name}`}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                  />
                : null
              }
              <span
                className="text-4xl items-center justify-center"
                style={{ display: item.img ? 'none' : 'flex' }}
              >
                {item.emoji}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 text-center text-sm">{item.name}</h3>
            <p className="text-xs text-primary mt-1">Tap for tip →</p>
          </button>
        ))}
      </div>
    </div>
  );
}
