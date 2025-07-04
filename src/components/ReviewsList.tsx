import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, User, ThumbsUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  helpful_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

interface ReviewsListProps {
  packageId: string;
  packageType: 'package' | 'tour_package';
  refreshTrigger?: number;
}

export const ReviewsList = ({ packageId, packageType, refreshTrigger }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [packageId, packageType, refreshTrigger]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          comment,
          helpful_count,
          created_at,
          profiles:user_id (
            full_name
          )
        `)
        .eq(packageType === 'package' ? 'package_id' : 'tour_package_id', packageId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      
      // Calculate average rating
      if (data && data.length > 0) {
        const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } else {
        setAverageRating(0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <Star className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Reviews Yet</h3>
          <p className="text-gray-500">Be the first to share your experience!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card className="bg-gradient-to-r from-konkan-turquoise-50 to-konkan-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">{averageRating}</span>
                <div className="flex">{renderStars(Math.round(averageRating))}</div>
              </div>
              <p className="text-gray-600">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="text-right">
              <Badge className="bg-konkan-turquoise-500 text-white">
                {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-konkan-turquoise-500 to-konkan-orange-500 rounded-full flex items-center justify-center">
                      <User className="text-white" size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {review.profiles?.full_name || 'Anonymous User'}
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <button className="flex items-center gap-1 hover:text-konkan-turquoise-600 transition-colors">
                    <ThumbsUp size={14} />
                    Helpful ({review.helpful_count})
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};