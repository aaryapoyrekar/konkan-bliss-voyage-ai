import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, Search, MapPin, Clock, DollarSign, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ExploreSectionProps {
  title?: string;
  showMoreButton?: boolean;
  limit?: number;
}

type Category = {
  id: string;
  name: string;
  icon?: string;
};

type Package = {
  id: string;
  title: string;
  image_url?: string | null;
  description: string;
  highlights?: string[];
  price?: number;
  duration?: string;
  category?: string;
  rating?: number;
  latitude?: number;
  longitude?: number;
};

const categories: Category[] = [
  { id: "all", name: "All", icon: "🌊" },
  { id: "seasonal", name: "Seasonal Escapes", icon: "🌺" },
  { id: "festival", name: "Festival Specials", icon: "🎉" },
  { id: "historical", name: "Historical Places", icon: "🏰" },
  { id: "beach", name: "Beach Getaways", icon: "🏖️" },
  { id: "temple", name: "Temple Trails", icon: "🛕" },
  { id: "hidden", name: "Hidden Gems", icon: "💎" },
  { id: "nature", name: "Nature Retreats", icon: "🌿" },
  { id: "waterfall", name: "Waterfall Wonders", icon: "💧" },
  { id: "cultural", name: "Cultural Experiences", icon: "🎭" }
];

const staticPackages: Package[] = [
  {
    id: "1",
    title: "Tarkarli Beach Paradise",
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Crystal clear waters perfect for water sports and relaxation",
    highlights: ["Water Sports", "Scuba Diving", "Beach Activities"],
    price: 4500,
    duration: "3 Days, 2 Nights",
    category: "beach",
    rating: 4.8,
    latitude: 16.0167,
    longitude: 73.4667
  },
  {
    id: "2",
    title: "Sindhudurg Fort Heritage Tour",
    image_url: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Historic sea fort built by Chhatrapati Shivaji Maharaj",
    highlights: ["Historical", "Architecture", "Photography"],
    price: 2500,
    duration: "2 Days, 1 Night",
    category: "historical",
    rating: 4.7,
    latitude: 16.0333,
    longitude: 73.5000
  },
  {
    id: "3",
    title: "Amboli Monsoon Magic",
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Breathtaking waterfalls surrounded by lush greenery",
    highlights: ["Waterfalls", "Trekking", "Nature Photography"],
    price: 3200,
    duration: "2 Days, 1 Night",
    category: "waterfall",
    rating: 4.9,
    latitude: 15.9500,
    longitude: 74.0000
  },
  {
    id: "4",
    title: "Malvani Food Festival Experience",
    image_url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Authentic Malvani cuisine and cultural experiences",
    highlights: ["Local Cuisine", "Cultural Shows", "Cooking Classes"],
    price: 1800,
    duration: "1 Day",
    category: "cultural",
    rating: 4.6
  },
  {
    id: "5",
    title: "Ganesh Chaturthi Celebration",
    image_url: "https://images.unsplash.com/photo-1567241893770-9c428a7bc6c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Experience the grand Ganesh festival celebrations",
    highlights: ["Festival", "Processions", "Traditional Music"],
    price: 2200,
    duration: "3 Days, 2 Nights",
    category: "festival",
    rating: 4.8
  },
  {
    id: "6",
    title: "Vengurla Hidden Beach Retreat",
    image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Pristine beach with golden sand and coconut groves",
    highlights: ["Secluded Beach", "Sunset Views", "Peaceful"],
    price: 3800,
    duration: "4 Days, 3 Nights",
    category: "hidden",
    rating: 4.5,
    latitude: 15.8667,
    longitude: 73.6333
  },
  {
    id: "7",
    title: "Kunkeshwar Temple Trail",
    image_url: "https://images.unsplash.com/photo-1605538883669-825200433431?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Sacred temples and spiritual experiences",
    highlights: ["Ancient Temples", "Spiritual Journey", "Architecture"],
    price: 1500,
    duration: "2 Days, 1 Night",
    category: "temple",
    rating: 4.4
  },
  {
    id: "8",
    title: "Winter Konkan Escape",
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Perfect winter getaway with pleasant weather",
    highlights: ["Pleasant Weather", "Beach Activities", "Sightseeing"],
    price: 5200,
    duration: "5 Days, 4 Nights",
    category: "seasonal",
    rating: 4.7
  },
  {
    id: "9",
    title: "Konkan Nature Photography Tour",
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Capture the natural beauty of Konkan coast",
    highlights: ["Photography", "Wildlife", "Landscapes"],
    price: 4200,
    duration: "4 Days, 3 Nights",
    category: "nature",
    rating: 4.6
  }
];

export const ExploreSection = ({
  title = "Explore",
  showMoreButton = false,
  limit
}: ExploreSectionProps) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Reusable function for Google Maps directions
  const handleNavigate = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("packages")
          .select("id,title,description,image_url,highlights,price,duration");
        
        if (error || !data || data.length === 0) {
          setPackages(staticPackages);
        } else {
          // Map Supabase data to include categories (you might want to add a category field to your Supabase table)
          const mappedData = data.map((pkg, index) => ({
            ...pkg,
            category: staticPackages[index % staticPackages.length]?.category || "beach",
            rating: 4.5 + Math.random() * 0.5
          }));
          setPackages([...mappedData, ...staticPackages]);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
        setPackages(staticPackages);
      }
      setLoading(false);
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    let filtered = packages;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(pkg => pkg.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(pkg =>
        pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.highlights?.some(highlight => 
          highlight.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply limit if specified
    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    setFilteredPackages(filtered);
  }, [packages, selectedCategory, searchQuery, limit]);

  return (
    <section id="explore-section" className="py-16 bg-gradient-to-br from-konkan-turquoise-50 via-white to-konkan-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing packages and experiences across the beautiful Konkan coast
            </p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search destinations, activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-2xl border-konkan-turquoise-200 focus:border-konkan-turquoise-400 bg-white/90 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="mb-10">
          <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-4">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-konkan-turquoise-500 to-konkan-orange-500 text-white shadow-lg"
                    : "bg-white/80 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200"
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="whitespace-nowrap">{category.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? "Loading..." : `${filteredPackages.length} ${filteredPackages.length === 1 ? 'package' : 'packages'} found`}
            {selectedCategory !== "all" && (
              <span className="ml-2 text-konkan-turquoise-600 font-medium">
                in {categories.find(c => c.id === selectedCategory)?.name}
              </span>
            )}
          </p>
        </div>

        {/* Packages Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory + searchQuery}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {loading
              ? Array.from({ length: limit || 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse h-96 bg-gray-200 rounded-2xl" />
                ))
              : filteredPackages.map((pkg, idx) => {
                  const hasCoords = typeof pkg.latitude === "number" && typeof pkg.longitude === "number";

                  return (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      className="cursor-pointer group"
                      onClick={() => navigate(`/package/${pkg.id}`)}
                    >
                      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white/90 backdrop-blur-lg rounded-2xl hover:scale-105">
                        <div className="relative overflow-hidden">
                          <img
                            src={pkg.image_url || "https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                            alt={pkg.title}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {pkg.rating && (
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                              <Star className="text-yellow-500 fill-current" size={14} />
                              <span className="text-sm font-medium">{pkg.rating.toFixed(1)}</span>
                            </div>
                          )}

                          {pkg.price && (
                            <div className="absolute top-4 left-4 bg-konkan-orange-500 text-white rounded-full px-3 py-1 shadow-lg">
                              <span className="text-sm font-bold">₹{pkg.price.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-gray-900 group-hover:text-konkan-turquoise-600 transition-colors">
                            {pkg.title}
                          </CardTitle>
                          <CardDescription className="text-gray-600 line-clamp-2">
                            {pkg.description}
                          </CardDescription>
                          
                          {pkg.duration && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                              <Clock size={14} />
                              <span>{pkg.duration}</span>
                            </div>
                          )}
                        </CardHeader>

                        <CardContent className="pt-0">
                          {pkg.highlights && pkg.highlights.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {pkg.highlights.slice(0, 3).map((highlight, hIdx) => (
                                <Badge 
                                  key={hIdx} 
                                  variant="secondary" 
                                  className="text-xs bg-konkan-turquoise-100 text-konkan-turquoise-700 hover:bg-konkan-turquoise-200 transition-colors"
                                >
                                  {highlight}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-col gap-2">
                            <Button className="w-full bg-gradient-to-r from-konkan-turquoise-500 to-konkan-orange-500 hover:from-konkan-turquoise-600 hover:to-konkan-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                              <Calendar className="mr-2" size={16} />
                              View Details
                            </Button>
                            
                            {hasCoords && (
                              <Button
                                variant="outline"
                                className="w-full border-konkan-turquoise-200 text-konkan-turquoise-600 hover:bg-konkan-turquoise-50 rounded-xl transition-all duration-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNavigate(pkg.latitude!, pkg.longitude!);
                                }}
                              >
                                <MapPin className="mr-2" size={16} />
                                Navigate
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
          </motion.div>
        </AnimatePresence>

        {/* No Results */}
        {!loading && filteredPackages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No packages found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or selecting a different category
            </p>
            <Button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="bg-gradient-to-r from-konkan-turquoise-500 to-konkan-orange-500 text-white rounded-xl"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Show More Button */}
        {showMoreButton && !limit && (
          <div className="text-center mt-12">
            <Link to="/explore">
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-4 border-2 border-konkan-turquoise-500 text-konkan-turquoise-600 hover:bg-konkan-turquoise-500 hover:text-white rounded-2xl transition-all duration-300 hover:scale-105"
              >
                View All Destinations
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
