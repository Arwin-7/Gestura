import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img src="/logo.svg" alt="Gestura Logo" className="h-9 w-auto" />
        </Link>
        <div className="flex gap-6 items-center">
          <Link to="/learn" className="text-gray-600 hover:text-primary transition-colors font-medium">Learn</Link>
          <Link to="/practice" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium">Practice</Link>
        </div>
      </div>
    </nav>
  );
}
