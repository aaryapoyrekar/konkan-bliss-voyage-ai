import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Phone, Mail, Clock, DollarSign, Edit, X } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Booking {
  id: string;
  booking_date: string;
  number_of_people: number;
  total_amount: number;
  status: string;
  contact_phone: string;
  contact_email: string;
  special_requests?: string;
  created_at: string;
  packages?: {
    title: string;
    duration: string;
    image_url?: string;
  };
  tour_packages?: {
    title: string;
    duration: string;
    images?: string[];
  };
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your bookings.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          packages (title, duration, image_url),
          tour_packages (title, duration, images)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });

      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filterBookingsByStatus = (status: string) => {
    if (status === 'all') return bookings;
    return bookings.filter(booking => booking.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-konkan-turquoise-50 via-white to-konkan-orange-50">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-12 h-12 border-4 border-konkan-turquoise-400 border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-konkan-turquoise-50 via-white to-konkan-orange-50">
      <Navigation />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-konkan-turquoise-600 via-konkan-orange-500 to-konkan-forest-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
                My Bookings
              </h1>
              <p className="text-xl mb-6 max-w-2xl mx-auto">
                Manage your Konkan travel bookings and track your upcoming adventures
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs defaultValue="all" className="space-y-8">
            <TabsList className="grid w-full grid-cols-5 lg:w-[600px] mx-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <TabsContent key={status} value={status} className="space-y-6">
                {filterBookingsByStatus(status).length === 0 ? (
                  <Card className="glass-card border-0 shadow-xl">
                    <CardContent className="text-center py-12">
                      <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No {status === 'all' ? '' : status} bookings found
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {status === 'all' 
                          ? "You haven't made any bookings yet. Start exploring our packages!"
                          : `You don't have any ${status} bookings.`
                        }
                      </p>
                      <Button className="bg-gradient-to-r from-konkan-turquoise-500 to-konkan-orange-500 text-white rounded-xl">
                        Explore Packages
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filterBookingsByStatus(status).map((booking, index) => {
                      const packageData = booking.packages || booking.tour_packages;
                      const packageImage = booking.packages?.image_url || 
                                         (booking.tour_packages?.images && booking.tour_packages.images[0]) ||
                                         "https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="glass-card border-0 shadow-xl hover:shadow-2xl transition-all duration-300 floating-card">
                            <div className="relative overflow-hidden">
                              <img
                                src={packageImage}
                                alt={packageData?.title}
                                className="w-full h-48 object-cover"
                              />
                              <div className="absolute top-4 right-4">
                                <Badge className={`${getStatusColor(booking.status)} text-white border-0`}>
                                  {getStatusText(booking.status)}
                                </Badge>
                              </div>
                            </div>

                            <CardHeader>
                              <CardTitle className="text-lg font-semibold">
                                {packageData?.title}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2">
                                <Calendar size={14} />
                                {new Date(booking.booking_date).toLocaleDateString()}
                              </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Users size={14} className="text-gray-500" />
                                  <span>{booking.number_of_people} people</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock size={14} className="text-gray-500" />
                                  <span>{packageData?.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign size={14} className="text-gray-500" />
                                  <span>₹{booking.total_amount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone size={14} className="text-gray-500" />
                                  <span className="truncate">{booking.contact_phone}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <Mail size={14} className="text-gray-500" />
                                <span className="truncate">{booking.contact_email}</span>
                              </div>

                              {booking.special_requests && (
                                <div className="text-sm">
                                  <p className="font-medium text-gray-700">Special Requests:</p>
                                  <p className="text-gray-600 text-xs">{booking.special_requests}</p>
                                </div>
                              )}

                              <div className="flex gap-2 pt-2">
                                {booking.status === 'pending' && (
                                  <>
                                    <Button variant="outline" size="sm" className="flex-1 rounded-xl">
                                      <Edit size={14} className="mr-1" />
                                      Edit
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => cancelBooking(booking.id)}
                                      className="text-red-600 hover:bg-red-50 rounded-xl"
                                    >
                                      <X size={14} />
                                    </Button>
                                  </>
                                )}
                                {booking.status === 'confirmed' && (
                                  <Button variant="outline" size="sm" className="w-full rounded-xl">
                                    View Details
                                  </Button>
                                )}
                                {booking.status === 'completed' && (
                                  <Button variant="outline" size="sm" className="w-full rounded-xl">
                                    Write Review
                                  </Button>
                                )}
                              </div>

                              <div className="text-xs text-gray-500 pt-2 border-t">
                                Booked on {new Date(booking.created_at).toLocaleDateString()}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Booking Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-konkan-sand-50 border border-konkan-sand-200 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-konkan-sand-800 mb-2">
              📋 Booking Management
            </h3>
            <p className="text-konkan-sand-700 mb-3">
              This booking system integrates with your Supabase database to provide:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-konkan-sand-700">
              <li>• Real-time booking status updates</li>
              <li>• Secure payment processing integration</li>
              <li>• Email and SMS notifications</li>
              <li>• Booking modification and cancellation</li>
              <li>• Review system for completed trips</li>
              <li>• Admin dashboard for booking management</li>
            </ul>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookingsPage;