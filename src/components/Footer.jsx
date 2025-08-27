// components/Footer.jsx
export default function Footer({ children }) {
  return (
    <footer className="bg-gray-100 py-6 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Brand */}
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <h4 className="font-bold text-lg">Smart Rentals</h4>
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>

        {/* Socials / Other Content */}
        <div className="flex gap-6 text-xl text-gray-600">
          {children}
        </div>
      </div>
    </footer>
  );
}
