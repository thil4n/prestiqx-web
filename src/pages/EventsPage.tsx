import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Filter } from 'lucide-react';

const events = [
  {
    id: 1,
    title: "Royal Gala Evening",
    date: "2025-02-15",
    venue: "Grand Ballroom",
    price: "0.5 ETH",
    image: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800",
    category: "Gala"
  },
  {
    id: 2,
    title: "Exclusive Art Exhibition",
    date: "2025-02-20",
    venue: "Metropolitan Gallery",
    price: "0.3 ETH",
    image: "https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=800",
    category: "Art"
  },
  {
    id: 3,
    title: "VIP Concert Experience",
    date: "2025-02-25",
    venue: "Royal Opera House",
    price: "0.8 ETH",
    image: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800",
    category: "Music"
  },
  {
    id: 4,
    title: "Elite Wine Tasting",
    date: "2025-03-01",
    venue: "Château Premium",
    price: "0.4 ETH",
    image: "https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg?auto=compress&cs=tinysrgb&w=800",
    category: "Wine"
  },
  {
    id: 5,
    title: "Luxury Fashion Show",
    date: "2025-03-05",
    venue: "Couture Runway",
    price: "0.6 ETH",
    image: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800",
    category: "Fashion"
  },
  {
    id: 6,
    title: "Private Yacht Party",
    date: "2025-03-10",
    venue: "Marina Bay",
    price: "1.2 ETH",
    image: "https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?auto=compress&cs=tinysrgb&w=800",
    category: "Party"
  }
];

export const EventsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Gala', 'Art', 'Music', 'Wine', 'Fashion', 'Party'];

  const filteredEvents = selectedCategory === 'All' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  return (
    <div className="pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
              Exclusive Events
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover extraordinary experiences worthy of royalty
          </p>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          className="mb-12 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center space-x-3 text-gold">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filter by:</span>
          </div>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-gold to-yellow-400 text-black font-bold shadow-lg shadow-gold/25'
                  : 'bg-gray-800/50 text-gray-300 hover:text-gold hover:bg-gold/10 border border-gold/20'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Events Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          layout
        >
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              layout
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-gold via-yellow-400 to-gold rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Link to={`/event/${event.id}`} className="block relative">
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gold/20 overflow-hidden hover:border-gold/60 transition-all duration-300">
                  <div className="relative overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-gold/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-black font-bold text-sm">{event.category}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gold mb-3 group-hover:text-yellow-300 transition-colors duration-300">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="w-4 h-4 mr-3 text-gold" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <MapPin className="w-4 h-4 mr-3 text-gold" />
                        <span>{event.venue}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-gold">{event.price}</span>
                      <div className="bg-gradient-to-r from-gold/20 to-yellow-400/20 px-4 py-2 rounded-lg border border-gold/30">
                        <span className="text-gold font-medium">View Details</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};