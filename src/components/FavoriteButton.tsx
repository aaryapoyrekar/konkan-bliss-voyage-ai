import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FavoriteButtonProps {
  packageId: string;
  packageType: 'package' | 'tour_package';
  className?: string;
}

export const FavoriteButton = ({ packageId, packageType, className }: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkFavoriteStatus();
  }, [packageId, packageType]);

  const checkFavoriteStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq(packageType === 'package' ? 'package_id' : 'tour_package_id', packageId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking favorite status:', error);
        return;
      }

      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save favorites.",
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq(packageType === 'package' ? 'package_id' : 'tour_package_id', packageId);

        if (error) throw error;

        setIsFavorite(false);
        toast({
          title: "Removed from Favorites",
          description: "Package removed from your favorites.",
        });
      } else {
        // Add to favorites
        const favoriteData = {
          user_id: user.id,
          [packageType === 'package' ? 'package_id' : 'tour_package_id']: packageId
        };

        const { error } = await supabase
          .from('favorites')
          .insert([favoriteData]);

        if (error) throw error;

        setIsFavorite(true);
        toast({
          title: "Added to Favorites",
          description: "Package saved to your favorites.",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`rounded-xl transition-all duration-200 ${
        isFavorite 
          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
          : 'hover:bg-gray-50'
      } ${className}`}
    >
      <Heart 
        size={16} 
        className={isFavorite ? 'fill-current' : ''} 
      />
    </Button>
  );
};