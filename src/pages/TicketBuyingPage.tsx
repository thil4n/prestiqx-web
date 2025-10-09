import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Star, Crown, ArrowLeft, Wallet } from 'lucide-react';

const eventData = {
  1: {
    title: "Royal Gala Evening",
    date: "2025-02-15",
    venue: "Grand Ballroom",
    image: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "An evening of unparalleled elegance and sophistication. Join the elite for a night of royal entertainment, gourmet dining, and exclusive networking.",
    highlights: ["Red carpet arrival", "5-course gourmet dinner", "Live orchestra", "Exclusive networking"]
  }
};

const ticketTiers = [
  {
    id: 1,
    name: "Royal Standard",
    price: "0.3 ETH",
    features: ["General admission", "Welcome drink", "Digital program", "NFT certificate"],
    rarity: "Common",
    gradient: "from-gray-600 to-gray-800"
  },
  {
    id: 2,
    name: "Imperial VIP",
    price: "0.5 ETH",
    features: ["VIP seating", "Premium bar access", "Meet & greet", "Exclusive NFT variant", "Gift bag"],
    rarity: "Rare",
    gradient: "from-gold/80 to-yellow-600",
    popular: true
  },
  {
    id: 3,
    name: "Crown Royalty",
    price: "1.0 ETH",
    features: ["Front row access", "Private lounge", "Personal concierge", "Ultra-rare NFT", "Luxury amenities", "After-party access"],
    rarity: "Legendary",
    gradient: "from-purple-600 to-pink-600"
  }
];

export const TicketBuyingPage: React.FC = () => {
  const { id } = useParams();
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const event = eventData[id as keyof typeof eventData];

  if (!event) {
    return <div className="pt-24 text-center">Event not found</div>;
  }

  const handlePurchase = async (tier: typeof ticketTiers[0]) => {
    setIsPurchasing(true);
    // Simulate purchase process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPurchasing(false);
    alert(`Congratulations! You've purchased a ${tier.name} ticket NFT!`);
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to="/events"
            className="inline-flex items-center space-x-2 text-gold hover:text-yellow-300 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Events</span>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Event Details */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative rounded-2xl overflow-hidden mb-8">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
                {event.title}
              </span>
            </h1>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-gray-300">
                <Calendar className="w-5 h-5 mr-3 text-gold" />
                <span className="text-lg">{new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-5 h-5 mr-3 text-gold" />
                <span className="text-lg">{event.venue}</span>
              </div>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              {event.description}
            </p>

            <div>
              <h3 className="text-2xl font-bold text-gold mb-4">Event Highlights</h3>
              <ul className="space-y-2">
                {event.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <Star className="w-4 h-4 mr-3 text-gold" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Ticket Selection */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-8">
              <span className="bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
                Select Your Experience
              </span>
            </h2>

            <div className="space-y-6">
              {ticketTiers.map((tier, index) => (
                <motion.div
                  key={tier.id}
                  className={`group relative cursor-pointer ${
                    selectedTier === tier.id ? 'scale-105' : ''
                  }`}
                  onClick={() => setSelectedTier(tier.id)}
                  whileHover={{ scale: selectedTier === tier.id ? 1.05 : 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-gold to-yellow-400 px-4 py-1 rounded-full">
                        <span className="text-black font-bold text-sm">Most Popular</span>
                      </div>
                    </div>
                  )}

                  <div className={`absolute -inset-1 bg-gradient-to-br ${tier.gradient} rounded-2xl blur-sm opacity-${selectedTier === tier.id ? '100' : '0'} group-hover:opacity-100 transition duration-500`}></div>
                  
                  <div className={`relative bg-gray-900/90 backdrop-blur-sm p-8 rounded-2xl border-2 transition-all duration-300 ${
                    selectedTier === tier.id 
                      ? 'border-gold shadow-2xl shadow-gold/25' 
                      : 'border-gold/20 hover:border-gold/40'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gold">{tier.name}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        tier.rarity === 'Common' ? 'bg-gray-600 text-white' :
                        tier.rarity === 'Rare' ? 'bg-gold text-black' :
                        'bg-purple-600 text-white'
                      }`}>
                        {tier.rarity}
                      </div>
                    </div>

                    <div className="text-4xl font-bold text-gold mb-6">{tier.price}</div>

                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-300">
                          <Crown className="w-4 h-4 mr-3 text-gold" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(tier);
                      }}
                      disabled={isPurchasing}
                      className="w-full relative group"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-gold via-yellow-300 to-gold rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition duration-300"></div>
                      <div className="relative bg-gradient-to-r from-gold via-yellow-400 to-gold px-8 py-4 rounded-xl text-black font-bold text-lg hover:shadow-2xl hover:shadow-gold/50 transition-all duration-300 flex items-center justify-center space-x-2">
                        <Wallet className="w-5 h-5" />
                        <span>{isPurchasing ? 'Processing...' : 'Purchase NFT Ticket'}</span>
                      </div>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* NFT Benefits */}
            <motion.div
              className="mt-12 bg-gradient-to-br from-gold/10 to-transparent p-8 rounded-2xl border border-gold/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-gold mb-4">NFT Ticket Benefits</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Permanent proof of attendance stored on blockchain</li>
                <li>• Collectible digital artwork unique to this event</li>
                <li>• Future access to exclusive holder-only events</li>
                <li>• Tradeable on NFT marketplaces</li>
                <li>• Part of your digital legacy collection</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};