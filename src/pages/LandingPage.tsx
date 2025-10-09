import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Zap } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
          <motion.div
            className="absolute top-20 left-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 30, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
              Experience Events
            </span>
            <br />
            <span className="text-white">Like Royalty</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          >
            Own your memories forever with exclusive NFT tickets.<br />
            Premium access, royal treatment, unforgettable experiences.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          >
            <Link
              to="/events"
              className="inline-block relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-gold via-yellow-300 to-gold rounded-full blur-sm opacity-75 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-gradient-to-r from-gold via-yellow-400 to-gold px-12 py-4 rounded-full text-black font-bold text-lg hover:shadow-2xl hover:shadow-gold/50 transition-all duration-300 transform group-hover:scale-105">
                Explore Events
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="bg-gradient-to-r from-gold to-yellow-300 bg-clip-text text-transparent">
              Luxury Redefined
            </span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "NFT-based Tickets",
                description: "Each ticket is a unique digital collectible that proves your exclusive access forever."
              },
              {
                icon: Shield,
                title: "Own Your Memories",
                description: "Your ticket becomes a permanent memento of the incredible experience you had."
              },
              {
                icon: Zap,
                title: "VIP-Exclusive Access",
                description: "Unlock premium experiences and royal treatment at every event."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-br from-gold/20 to-transparent rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gold/20 hover:border-gold/40 transition-all duration-300">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-black" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gold mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};