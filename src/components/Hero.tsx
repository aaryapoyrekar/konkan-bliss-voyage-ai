
import { Button } from "@/components/ui/button";
import { ArrowDown, Map, Star, Sparkles, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-konkan-turquoise-900/40"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-20 h-20 bg-konkan-orange-400/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 right-16 w-32 h-32 bg-konkan-turquoise-400/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 right-20 w-16 h-16 bg-konkan-forest-400/20 rounded-full blur-xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight font-display">
              Discover the Magic of{" "}
              <span className="text-gradient bg-gradient-to-r from-konkan-turquoise-400 via-konkan-orange-400 to-konkan-forest-400 bg-clip-text text-transparent">
                Konkan Coast
              </span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl mb-8 text-gray-200 max-w-4xl mx-auto leading-relaxed"
          >
            Experience pristine beaches, ancient forts, delicious seafood, and warm hospitality 
            in Maharashtra's most beautiful coastal region with AI-powered travel planning
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-8 mb-10"
          >
            <div className="flex items-center gap-3 glass-card px-6 py-3 rounded-2xl">
              <Star className="text-konkan-sand-400" size={24} />
              <span className="text-lg font-semibold">50+ Destinations</span>
            </div>
            <div className="flex items-center gap-3 glass-card px-6 py-3 rounded-2xl">
              <Sparkles className="text-konkan-turquoise-400" size={24} />
              <span className="text-lg font-semibold">AI-Powered Planning</span>
            </div>
            <div className="flex items-center gap-3 glass-card px-6 py-3 rounded-2xl">
              <Map className="text-konkan-forest-400" size={24} />
              <span className="text-lg font-semibold">Interactive Maps</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link to="/ai-planner">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-konkan-orange-500 to-konkan-orange-600 hover:from-konkan-orange-600 hover:to-konkan-orange-700 text-white border-0 px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover-lift group"
              >
                <Sparkles className="mr-2 group-hover:rotate-12 transition-transform" size={20} />
                Plan Your Journey
              </Button>
            </Link>
            
            <Link to="/explore">
              <Button 
                size="lg" 
                className="bg-yellow-500 hover:bg-yellow-600 text-black border-0 px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover-lift group"
              >
                <Map className="mr-2 group-hover:scale-110 transition-transform" size={20} />
                Explore Destinations
              </Button>
            </Link>

            <Link to="/chat">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-konkan-turquoise-500 to-konkan-turquoise-600 hover:from-konkan-turquoise-600 hover:to-konkan-turquoise-700 text-white border-0 px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover-lift group"
              >
                <MessageCircle className="mr-2 group-hover:bounce transition-transform" size={20} />
                Talk to AI Guide
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-sm text-white/70 font-medium">Scroll to explore</span>
            <ArrowDown size={24} className="text-white/70" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
