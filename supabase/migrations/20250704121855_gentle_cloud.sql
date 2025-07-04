/*
  # Add Bookings and Reviews System

  1. New Tables
    - `bookings` - Track package bookings by users
    - `reviews` - User reviews and ratings for packages
    - `favorites` - User favorite packages
    - `package_images` - Multiple images per package
    - `destinations` - Separate destinations table for better organization

  2. Enhancements
    - Add more fields to existing tables
    - Improve relationships between tables
    - Add proper indexes for performance

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each table
*/

-- Create destinations table for better organization
CREATE TABLE IF NOT EXISTS destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  image_url text,
  category text DEFAULT 'general',
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package_id uuid,
  tour_package_id uuid,
  booking_date date NOT NULL,
  number_of_people integer NOT NULL DEFAULT 1,
  total_amount decimal(10,2),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests text,
  contact_phone text,
  contact_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT bookings_package_check CHECK (
    (package_id IS NOT NULL AND tour_package_id IS NULL) OR
    (package_id IS NULL AND tour_package_id IS NOT NULL)
  )
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package_id uuid,
  tour_package_id uuid,
  booking_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  images text[] DEFAULT '{}',
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT reviews_package_check CHECK (
    (package_id IS NOT NULL AND tour_package_id IS NULL) OR
    (package_id IS NULL AND tour_package_id IS NOT NULL)
  )
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package_id uuid,
  tour_package_id uuid,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT favorites_user_package_unique UNIQUE (user_id, package_id),
  CONSTRAINT favorites_user_tour_package_unique UNIQUE (user_id, tour_package_id),
  CONSTRAINT favorites_package_check CHECK (
    (package_id IS NOT NULL AND tour_package_id IS NULL) OR
    (package_id IS NULL AND tour_package_id IS NOT NULL)
  )
);

-- Create package images table for multiple images per package
CREATE TABLE IF NOT EXISTS package_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid,
  tour_package_id uuid,
  image_url text NOT NULL,
  caption text,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT package_images_package_check CHECK (
    (package_id IS NOT NULL AND tour_package_id IS NULL) OR
    (package_id IS NULL AND tour_package_id IS NOT NULL)
  )
);

-- Add foreign key constraints
ALTER TABLE bookings 
ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT bookings_package_id_fkey FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
ADD CONSTRAINT bookings_tour_package_id_fkey FOREIGN KEY (tour_package_id) REFERENCES tour_packages(id) ON DELETE CASCADE;

ALTER TABLE reviews 
ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT reviews_package_id_fkey FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
ADD CONSTRAINT reviews_tour_package_id_fkey FOREIGN KEY (tour_package_id) REFERENCES tour_packages(id) ON DELETE CASCADE,
ADD CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

ALTER TABLE favorites 
ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT favorites_package_id_fkey FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
ADD CONSTRAINT favorites_tour_package_id_fkey FOREIGN KEY (tour_package_id) REFERENCES tour_packages(id) ON DELETE CASCADE;

ALTER TABLE package_images 
ADD CONSTRAINT package_images_package_id_fkey FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
ADD CONSTRAINT package_images_tour_package_id_fkey FOREIGN KEY (tour_package_id) REFERENCES tour_packages(id) ON DELETE CASCADE;

-- Enable RLS on all new tables
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_images ENABLE ROW LEVEL SECURITY;

-- Destinations policies (public read, admin write)
CREATE POLICY "Anyone can view destinations"
  ON destinations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage destinations"
  ON destinations
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = uid() AND role = 'admin'
    )
  );

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings
  FOR SELECT
  TO public
  USING (uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO public
  USING (uid() = user_id);

CREATE POLICY "Admins can manage all bookings"
  ON bookings
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = uid() AND role = 'admin'
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON reviews
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create own reviews"
  ON reviews
  FOR INSERT
  TO public
  WITH CHECK (uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews
  FOR UPDATE
  TO public
  USING (uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews
  FOR DELETE
  TO public
  USING (uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites"
  ON favorites
  FOR SELECT
  TO public
  USING (uid() = user_id);

CREATE POLICY "Users can manage own favorites"
  ON favorites
  FOR ALL
  TO public
  USING (uid() = user_id);

-- Package images policies
CREATE POLICY "Anyone can view package images"
  ON package_images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage package images"
  ON package_images
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = uid() AND role = 'admin'
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_package_id ON bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tour_package_id ON bookings(tour_package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_package_id ON reviews(package_id);
CREATE INDEX IF NOT EXISTS idx_reviews_tour_package_id ON reviews(tour_package_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_package_id ON favorites(package_id);
CREATE INDEX IF NOT EXISTS idx_favorites_tour_package_id ON favorites(tour_package_id);

CREATE INDEX IF NOT EXISTS idx_package_images_package_id ON package_images(package_id);
CREATE INDEX IF NOT EXISTS idx_package_images_tour_package_id ON package_images(tour_package_id);
CREATE INDEX IF NOT EXISTS idx_package_images_is_primary ON package_images(is_primary);

CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(featured);

-- Insert sample destinations data
INSERT INTO destinations (name, description, latitude, longitude, category, featured, image_url) VALUES
('Tarkarli Beach', 'Crystal clear waters perfect for water sports and relaxation', 16.0167, 73.4667, 'beach', true, 'https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Sindhudurg Fort', 'Historic sea fort built by Chhatrapati Shivaji Maharaj', 16.0333, 73.5000, 'heritage', true, 'https://images.unsplash.com/photo-1466442929976-97f336a657be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Malvan Beach', 'Famous for scuba diving and authentic Malvani cuisine', 16.0667, 73.4667, 'beach', true, 'https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Amboli Waterfalls', 'Breathtaking waterfalls surrounded by lush greenery', 15.9500, 74.0000, 'nature', true, 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Vengurla Beach', 'Pristine beach with golden sand and coconut groves', 15.8667, 73.6333, 'beach', false, 'https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Devbagh Beach', 'Secluded beach perfect for peaceful getaways', 16.0000, 73.4500, 'beach', false, 'https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Sawantwadi Palace', 'Beautiful palace showcasing local art and culture', 15.9000, 73.8167, 'heritage', false, 'https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Redi Beach', 'Quiet beach with red sand and fishing village charm', 15.7500, 73.5833, 'beach', false, 'https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name) DO NOTHING;