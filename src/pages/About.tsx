
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Leaf, Users, Award, Mail, Phone, MapPin, Globe } from "lucide-react";
import { motion } from "framer-motion";

const About = () => {
  const teamMembers = [
    {
      name: "Priya Sharma",
      role: "Founder & Travel Expert",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      description: "Born and raised in Konkan, Priya has 15+ years of experience in sustainable tourism."
    },
    {
      name: "Arjun Patil",
      role: "Local Culture Specialist",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      description: "Heritage enthusiast and storyteller, connecting travelers with authentic Konkan culture."
    },
    {
      name: "Sneha Desai",
      role: "AI Technology Lead",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      description: "Tech innovator making travel planning smarter with AI-powered recommendations."
    }
  ];

  const values = [
    {
      icon: Leaf,
      title: "Sustainable Tourism",
      description: "Promoting eco-friendly travel that preserves Konkan's natural beauty for future generations.",
      color: "konkan-turquoise"
    },
    {
      icon: Heart,
      title: "Authentic Experiences",
      description: "Connecting travelers with genuine local culture, traditions, and hidden gems.",
      color: "konkan-turquoise"
    },
    {
      icon: Users,
      title: "Community First",
      description: "Supporting local communities and businesses through responsible tourism practices.",
      color: "konkan-turquoise"
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Delivering exceptional travel experiences through innovation and attention to detail.",
      color: "konkan-turquoise"
    }
  ];

  const achievements = [
    { number: "10,000+", label: "Happy Travelers" },
    { number: "50+", label: "Local Partners" },
    { number: "25+", label: "Destinations Covered" },
    { number: "4.9/5", label: "Average Rating" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-konkan-turquoise-50 via-white to-konkan-orange-50">
      <Navigation />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-konkan-turquoise-600 via-konkan-orange-500 to-konkan-forest-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
                About KonkanBliss
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Passionate about showcasing the pristine beauty and rich culture of the Konkan coast 
                through sustainable and authentic travel experiences
              </p>
              <div className="flex justify-center gap-4">
                <Badge className="bg-white/20 text-white border-0 px-4 py-2">
                  <Heart className="mr-2" size={16} />
                  Made with Love
                </Badge>
                <Badge className="bg-white/20 text-white border-0 px-4 py-2">
                  <Leaf className="mr-2" size={16} />
                  Eco-Friendly
                </Badge>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Our Story */}
          <section className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-6 text-gray-900">
                Our Story
              </h2>
              <div className="max-w-4xl mx-auto">
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  KonkanBliss was born from a deep love for the Konkan coast and a vision to share its magic 
                  with the world. Growing up in this beautiful region, we witnessed the incredible diversity 
                  of landscapes, from pristine beaches to lush Western Ghats, ancient forts to vibrant local markets.
                </p>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  We realized that many travelers were missing out on the authentic Konkan experience due to 
                  lack of local knowledge and personalized guidance. That's when we decided to combine our 
                  passion for travel with cutting-edge AI technology to create a platform that makes exploring 
                  Konkan accessible, sustainable, and unforgettable.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Today, KonkanBliss is more than just a travel platform – it's a bridge between curious 
                  travelers and the heart of Konkan culture, ensuring that every journey contributes positively 
                  to local communities while preserving the region's natural beauty.
                </p>
              </div>
            </motion.div>
          </section>

          {/* Our Values */}
          <section className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-6 text-gray-900">
                Our Values
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 0.6 }}
                  >
                    <Card className="glass-card border-0 shadow-xl text-center h-full floating-card">
                      <CardHeader>
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${value.color}-400 to-${value.color}-600 flex items-center justify-center mx-auto mb-4`}>
                          <IconComponent className="text-white" size={32} />
                        </div>
                        <CardTitle className="text-xl font-semibold text-gray-900">
                          {value.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-gray-600 leading-relaxed">
                          {value.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Achievements */}
          <section className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-gradient-to-br from-konkan-turquoise-600 via-konkan-orange-500 to-konkan-forest-600 rounded-3xl p-12 text-white text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-8">
                Our Impact
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.8, duration: 0.6 }}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold mb-2">
                      {achievement.number}
                    </div>
                    <div className="text-sm md:text-base opacity-90">
                      {achievement.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Team */}
          <section className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-6 text-gray-900">
                Meet Our Team
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Passionate locals dedicated to sharing the beauty of Konkan
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 1, duration: 0.6 }}
                >
                  <Card className="glass-card border-0 shadow-xl text-center floating-card">
                    <CardHeader>
                      <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                        <img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {member.name}
                      </CardTitle>
                      <CardDescription className="text-konkan-orange-600 font-medium">
                        {member.role}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">
                        {member.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <Card className="glass-card border-0 shadow-2xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold font-display text-gray-900 mb-4">
                    Get in Touch
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    Have questions or want to collaborate? We'd love to hear from you!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-konkan-turquoise-100 rounded-xl flex items-center justify-center">
                          <Mail className="text-konkan-turquoise-600" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <p className="text-gray-600">hello@konkanbliss.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-konkan-orange-100 rounded-xl flex items-center justify-center">
                          <Phone className="text-konkan-orange-600" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <p className="text-gray-600">+91 98765 43210</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-konkan-forest-100 rounded-xl flex items-center justify-center">
                          <MapPin className="text-konkan-forest-600" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Address</p>
                          <p className="text-gray-600">Malvan, Sindhudurg, Maharashtra</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-konkan-sand-100 rounded-xl flex items-center justify-center">
                          <Globe className="text-konkan-sand-600" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Website</p>
                          <p className="text-gray-600">www.konkanbliss.com</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-konkan-turquoise-50 to-konkan-orange-50 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Join Our Mission
                      </h3>
                      <p className="text-gray-700 mb-6">
                        Help us promote sustainable tourism and preserve the beauty of Konkan for future generations.
                      </p>
                      <Button className="w-full bg-gradient-to-r from-konkan-turquoise-500 to-konkan-orange-500 text-white rounded-xl hover-lift">
                        Partner With Us
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
