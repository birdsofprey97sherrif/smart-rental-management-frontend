import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { List, X } from "react-bootstrap-icons"; // Icon set

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Framer Motion variants
  const navVariants = {
    hidden: { y: -80, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const linkVariants = {
    hover: { scale: 1.1, color: "#0d6efd", transition: { duration: 0.2 } }
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
        ${scrolled ? "bg-white/90 shadow-md backdrop-blur-sm" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        {/* Logo */}
        <Link
          to="/"
          className={`text-2xl font-bold tracking-tight ${scrolled ? "text-primary" : "text-white"}`}
        >
          Smart Rentals
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 text-sm font-medium">
          {["Home", "About Us", "Services", "Login", "Register"].map((item) => (
            <motion.div key={item} variants={linkVariants} whileHover="hover">
              <Link
                to={item === "Home" ? "/" : `/${item.replace(/\s+/g, "").toLowerCase()}`}
                className={`${scrolled ? "text-gray-800 hover:text-primary" : "text-white hover:text-yellow-300"} transition-colors`}
              >
                {item}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-200 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white/95 shadow-lg backdrop-blur-sm"
          >
            <div className="flex flex-col px-6 py-4 space-y-4">
              {["Home", "About Us", "Services", "Login", "Register"].map((item) => (
                <Link
                  key={item}
                  to={item === "Home" ? "/" : `/${item.replace(/\s+/g, "").toLowerCase()}`}
                  className="text-gray-800 hover:text-primary font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
