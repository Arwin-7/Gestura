import { Link } from 'react-router-dom';
import { BookOpen, Gamepad2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-2xl mx-auto">
      <img src="/logo.svg" alt="Gestura" className="h-20 w-auto mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Interactive Sign Language Learning</h1>
      <p className="text-lg text-gray-600 mb-10">
        The interactive web-based sign language learning and recognition game. 
        Learn the ASL alphabet and test your skills in real-time.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <Link to="/learn" className="flex flex-col items-center p-8 bg-white border border-gray-200 rounded-xl hover:border-primary hover:shadow-md transition-all group">
          <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Learning Mode</h2>
          <p className="text-gray-500 text-sm">Study the alphabet, greetings, and basic words at your own pace.</p>
        </Link>

        <Link to="/practice" className="flex flex-col items-center p-8 bg-white border border-gray-200 rounded-xl hover:border-primary hover:shadow-md transition-all group">
          <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
            <Gamepad2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Practice Mode</h2>
          <p className="text-gray-500 text-sm">Test your knowledge with our real-time AI gesture recognition.</p>
        </Link>
      </div>
    </div>
  );
}
