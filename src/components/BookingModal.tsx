import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, Phone, Mail, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: {
    id: string;
    title: string;
    price: number;
    duration: string;
    type: 'package' | 'tour_package';
  };
}

export const BookingModal = ({ isOpen, onClose, packageData }: BookingModalProps) => {
  const [bookingDate, setBookingDate] = useState<Date>();
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const totalAmount = packageData.price * numberOfPeople;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingDate || !contactPhone || !contactEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to make a booking.",
          variant: "destructive"
        });
        return;
      }

      const bookingData = {
        user_id: user.id,
        [packageData.type === 'package' ? 'package_id' : 'tour_package_id']: packageData.id,
        booking_date: format(bookingDate, 'yyyy-MM-dd'),
        number_of_people: numberOfPeople,
        total_amount: totalAmount,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        special_requests: specialRequests || null,
        status: 'pending'
      };

      const { error } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (error) throw error;

      toast({
        title: "Booking Submitted!",
        description: "Your booking request has been submitted. We'll contact you soon to confirm.",
      });

      onClose();
      
      // Reset form
      setBookingDate(undefined);
      setNumberOfPeople(1);
      setContactPhone("");
      setContactEmail("");
      setSpecialRequests("");

    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error submitting your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="text-konkan-turquoise-600" size={20} />
            Book Your Trip
          </DialogTitle>
          <DialogDescription>
            Book "{packageData.title}" for an amazing Konkan experience
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Package Summary */}
          <div className="bg-konkan-turquoise-50 p-4 rounded-xl">
            <h3 className="font-semibold text-konkan-turquoise-800">{packageData.title}</h3>
            <p className="text-sm text-konkan-turquoise-600">Duration: {packageData.duration}</p>
            <p className="text-sm text-konkan-turquoise-600">Price per person: ₹{packageData.price.toLocaleString()}</p>
          </div>

          {/* Booking Date */}
          <div className="space-y-2">
            <Label htmlFor="booking-date">Preferred Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal rounded-xl"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {bookingDate ? format(bookingDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={bookingDate}
                  onSelect={setBookingDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Number of People */}
          <div className="space-y-2">
            <Label htmlFor="people">Number of People *</Label>
            <div className="flex items-center gap-3">
              <Users className="text-gray-400" size={16} />
              <Input
                id="people"
                type="number"
                min="1"
                max="20"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <Label htmlFor="phone">Contact Phone *</Label>
            <div className="flex items-center gap-3">
              <Phone className="text-gray-400" size={16} />
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Contact Email *</Label>
            <div className="flex items-center gap-3">
              <Mail className="text-gray-400" size={16} />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="requests">Special Requests (Optional)</Label>
            <Textarea
              id="requests"
              placeholder="Any special requirements, dietary restrictions, etc."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="rounded-xl"
              rows={3}
            />
          </div>

          {/* Total Amount */}
          <div className="bg-konkan-orange-50 p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-konkan-orange-800">Total Amount:</span>
              <span className="text-xl font-bold text-konkan-orange-800">
                ₹{totalAmount.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-konkan-orange-600 mt-1">
              {numberOfPeople} person(s) × ₹{packageData.price.toLocaleString()}
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-konkan-turquoise-500 to-konkan-orange-500 hover:from-konkan-turquoise-600 hover:to-konkan-orange-600 text-white rounded-xl"
          >
            {isSubmitting ? "Submitting..." : "Submit Booking Request"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Your booking request will be reviewed and confirmed within 24 hours.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};