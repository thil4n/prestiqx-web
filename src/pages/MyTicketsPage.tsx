import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Calendar, MapPin, Sparkles, Trophy } from 'lucide-react';

const myTickets = [
  {
    id: 1,
    eventTitle: "Royal Gala Evening",
    date: "2025-02-15",
    venue: "Grand Ballroom",
    tier: "Imperial VIP",
    rarity: "Rare",
    image: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600",
    tokenId: "#001472",
    holographic: true
  },
  {
    id: 2,
    eventTitle: "Exclusive Art Exhibition",
    date: "2024-12-20",
    venue: "Metropolitan Gallery",
    tier: "Crown Royalty",
    rarity: "Legendary",
    image: "https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=600",
    tokenId: "#000891",
    holographic: true
  },
  {
    id: 3,
    eventTitle: "VIP Concert Experience",
    date: "2024-11-10",
    venue: "Royal Opera House",
    tier: "Royal Standard",
    rarity: "Common",
    image: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=600",
    tokenId: "#002156",
    holographic: false
  }
];

export const MyTicketsPage: React.FC = () => {
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
          <div className="flex items-center justify-center mb-6">
            <Crown className="w-12 h-12 text-gold mr-4" />
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
                Your Royal Collection
              </span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A treasury of your exclusive experiences and memories
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gold">{myTickets.length}</div>
                <div className="text-gray-300">Total Tickets</div>
              </div>
              <Trophy className="w-8 h-8 text-gold" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gold">{myTickets.filter(t => t.rarity === 'Legendary').length}</div>
                <div className="text-gray-300">Legendary Items</div>
              </div>
              <Sparkles className="w-8 h-8 text-gold" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gold">2.1</div>
                <div className="text-gray-300">Total Value (ETH)</div>
              </div>
              <Crown className="w-8 h-8 text-gold" />
            </div>
          </div>
        </motion.div>

        {/* Tickets Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Holographic effect for rare tickets */}
              {ticket.holographic && (
                <div className="absolute -inset-1 bg-gradient-to-br from-gold via-purple-500 to-pink-500 rounded-2xl blur-sm opacity-0 group-hover:opacity-60 transition duration-500 animate-pulse"></div>
              )}
              
              <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gold/30 overflow-hidden group-hover:border-gold/60 transition-all duration-300">
                {/* Rarity Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    ticket.rarity === 'Common' ? 'bg-gray-600 text-white' :
                    ticket.rarity === 'Rare' ? 'bg-gold text-black' :
                    'bg-purple-600 text-white'
                  }`}>
                    {ticket.rarity}
                  </div>
                </div>

                {/* Token ID */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-gold text-xs font-mono">{ticket.tokenId}</span>
                  </div>
                </div>

                <div className="relative overflow-hidden">
                  <img
                    src={ticket.image}
                    alt={ticket.eventTitle}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  
                  {/* Holographic overlay */}
                  {ticket.holographic && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gold mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                    {ticket.eventTitle}
                  </h3>
                  
                  <div className="text-gold/80 font-medium mb-4">{ticket.tier}</div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-gray-300 text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gold" />
                      <span>{new Date(ticket.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gold" />
                      <span>{ticket.venue}</span>
                    </div>
                  </div>

                  <button className="w-full relative group/btn">
                    <div className="absolute -inset-1 bg-gradient-to-r from-gold/50 to-yellow-400/50 rounded-lg blur-sm opacity-0 group-hover/btn:opacity-100 transition duration-300"></div>
                    <div className="relative bg-gradient-to-r from-gold/20 to-yellow-400/20 px-6 py-3 rounded-lg border border-gold/30 text-gold font-medium hover:bg-gold/30 transition-all duration-300">
                      View Details
                    </div>
                  </button>
                </div>

                {/* Premium border effect */}
                <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/50 rounded-2xl transition-all duration-300 pointer-events-none"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State Message */}
        {myTickets.length === 0 && (
          <motion.div
            className="text-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Crown className="w-24 h-24 text-gold/50 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-400 mb-4">Your Collection Awaits</h3>
            <p className="text-gray-500 mb-8">Start building your royal legacy by purchasing exclusive NFT tickets</p>
            <Link
              to="/events"
              className="inline-block relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-gold via-yellow-300 to-gold rounded-full blur-sm opacity-75 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-gradient-to-r from-gold via-yellow-400 to-gold px-8 py-3 rounded-full text-black font-bold hover:shadow-2xl hover:shadow-gold/50 transition-all duration-300">
                Explore Events
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};