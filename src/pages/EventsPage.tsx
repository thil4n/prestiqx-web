import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Filter } from "lucide-react";
import { getEventManagerContract } from "../ethereum/EventManager";
import { useWallet } from "../ethereum/useWallet";
import { ethers } from "ethers";

export const EventsPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [events, setEvents] = useState([]);
    const { provider } = useWallet();

    const categories = [
        "All",
        "Gala",
        "Art",
        "Music",
        "Wine",
        "Fashion",
        "Party",
    ];

    // const filteredEvents =
    //     selectedCategory === "All"
    //         ? events
    //         : events.filter((event) => event.category === selectedCategory);

    const loadEvents = async () => {
        if (!provider) return;

        const contract = await getEventManagerContract(provider);
        const idsRaw: bigint[] = await contract.getAllEvents();
        const ids: number[] = idsRaw.map((id) => Number(id));

        console.log(ids);

        const fetchedEvents = await Promise.all(
            ids.map(async (id) => {
                const e = await contract.getFunction("getEvent")(id);

                return {
                    id: Number(e.id),
                    title: e.title,
                    date: e.date,
                    venue: e.venue,
                    description: e.description,
                    image: e.image,
                    category: e.category,
                    ticketsSold: Number(e.ticketsSold),
                    totalTickets: Number(e.totalTickets),
                    revenue: `${ethers.formatEther(
                        BigInt(e.ticketsSold) * BigInt(e.ticketPrice)
                    )} ETH`,
                    status: e.ended
                        ? "ended"
                        : e.published
                        ? "published"
                        : "draft",
                };
            })
        );

        setEvents(fetchedEvents);
    };

    useEffect(() => {
        loadEvents();
    }, []);

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
                                    ? "bg-gradient-to-r from-gold to-yellow-400 text-black font-bold shadow-lg shadow-gold/25"
                                    : "bg-gray-800/50 text-gray-300 hover:text-gold hover:bg-gold/10 border border-gold/20"
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
                    {events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            className="group relative"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            layout
                        >
                            <div className="absolute -inset-1 bg-gradient-to-br from-gold via-yellow-400 to-gold rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <Link
                                to={`/event/${event.id}`}
                                className="block relative"
                            >
                                <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gold/20 overflow-hidden hover:border-gold/60 transition-all duration-300">
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                        <div className="absolute top-4 right-4 bg-gold/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                            <span className="text-black font-bold text-sm">
                                                {event.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-2xl font-bold text-gold mb-3 group-hover:text-yellow-300 transition-colors duration-300">
                                            {event.title}
                                        </h3>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center text-gray-300">
                                                <Calendar className="w-4 h-4 mr-3 text-gold" />
                                                <span>
                                                    {new Date(
                                                        event.date
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            weekday: "long",
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-gray-300">
                                                <MapPin className="w-4 h-4 mr-3 text-gold" />
                                                <span>{event.venue}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-bold text-gold">
                                                {event.price}
                                            </span>
                                            <div className="bg-gradient-to-r from-gold/20 to-yellow-400/20 px-4 py-2 rounded-lg border border-gold/30">
                                                <span className="text-gold font-medium">
                                                    View Details
                                                </span>
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
