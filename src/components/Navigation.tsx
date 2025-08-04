import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Map, Heart, MessageCircle, User, Sparkles, Compass, Calendar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: null },
    { path: "/explore", label: "Explore", icon: Compass },
    { path: "/ai-planner", label: "AI Planner", icon: Sparkles },
    { path: "/maps", label: "Maps", icon: Map },
    { path: "/about", label: "About", icon: null },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 shadow-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Link to="/" className="group">
              <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-konkan-turquoise-600 via-konkan-orange-500 to-konkan-forest-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                KonkanBliss
              </h1>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Link
                      to={item.path}
                      className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 flex items-center gap-2 ${
                        isActive(item.path)
                          ? "bg-gradient-to-r from-konkan-turquoise-500 to-konkan-orange-500 text-white shadow-lg"
                          : "text-gray-700 hover:text-konkan-turquoise-600 hover:bg-konkan-turquoise-50"
                      }`}
                    >
                      {Icon && <Icon size={16} />}
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden md:flex items-center space-x-3"
          >
            <Link to="/chat">
              <Button variant="ghost" size="sm" className="hover:bg-konkan-turquoise-50 hover:text-konkan-turquoise-600 rounded-xl">
                <MessageCircle size={16} className="mr-2" />
                Chat AI
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="hover:bg-konkan-orange-50 hover:text-konkan-orange-600 rounded-xl">
                <Calendar size={16} className="mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/auth">
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-konkan-turquoise-500 to-konkan-orange-500 hover:from-konkan-turquoise-600 hover:to-konkan-orange-600 text-white rounded-xl shadow-lg hover-lift"
              >
                <User size={16} className="mr-2" />
                Login
              </Button>
            </Link>
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-konkan-turquoise-600 p-2 rounded-xl hover:bg-konkan-turquoise-50 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-white/20"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 text-sm font-medium rounded-xl transition-all flex items-center gap-3 ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-konkan-turquoise-500 to-konkan-orange-500 text-white"
                        : "text-gray-700 hover:text-konkan-turquoise-600 hover:bg-konkan-turquoise-50"
                    }`}
                  >
                    {Icon && <Icon size={18} />}
                    {item.label}
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link to="/chat" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-konkan-turquoise-50 rounded-xl">
                    <MessageCircle size={16} className="mr-2" />
                    Chat AI
                  </Button>
                </Link>
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-konkan-orange-50 rounded-xl">
                    <Calendar size={16} className="mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-to-r from-konkan-turquoise-500 to-konkan-orange-500 text-white rounded-xl"
                  >
                    <User size={16} className="mr-2" />
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};