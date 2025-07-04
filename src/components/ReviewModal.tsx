import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: {
    id: string;
    title: string;
    type: 'package' | 'tour_package';
  };
  onReviewSubmitted?: () => void;
}

export const ReviewModal = ({ isOpen, onClose, packageData, onReviewSubmitted }: ReviewModalProps) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !comment) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and comment.",
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
          description: "Please log in to submit a review.",
          variant: "destructive"
        });
        return;
      }

      const reviewData = {
        user_id: user.id,
        [packageData.type === 'package' ? 'package_id' : 'tour_package_id']: packageData.id,
        rating,
        title,
        comment
      };

      const { error } = await supabase
        .from('reviews')
        .insert([reviewData]);

      if (error) throw error;

      toast({
        title: "Review Submitted!",
        description: "Thank you for sharing your experience.",
      });

      onClose();
      onReviewSubmitted?.();
      
      // Reset form
      setRating(5);
      setTitle("");
      setComment("");

    } catch (error) {
      console.error('Review error:', error);
      toast({
        title: "Review Failed",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="text-yellow-500" size={20} />
            Write a Review
          </DialogTitle>
          <DialogDescription>
            Share your experience with "{packageData.title}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 transition-colors ${
                    star <= rating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                >
                  <Star size={24} fill="currentColor" />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="review-title">Review Title *</Label>
            <Input
              id="review-title"
              placeholder="Summarize your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="review-comment">Your Review *</Label>
            <Textarea
              id="review-comment"
              placeholder="Tell others about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="rounded-xl"
              rows={4}
            />
          </div>

          {/* Photo Upload Placeholder */}
          <div className="space-y-2">
            <Label>Photos (Coming Soon)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <Camera className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-500">Photo upload feature coming soon</p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-konkan-turquoise-500 to-konkan-orange-500 hover:from-konkan-turquoise-600 hover:to-konkan-orange-600 text-white rounded-xl"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};