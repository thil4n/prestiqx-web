import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Crown,
    Plus,
    Calendar,
    MapPin,
    DollarSign,
    Eye,
    Edit3,
    BarChart3,
    TrendingUp,
    Ticket,
} from "lucide-react";
import { ethers } from "ethers";
import { getEventManagerContract } from "../ethereum/EventManager";
import { useWallet } from "../ethereum/useWallet";

interface Event {
    id: number;
    title: string;
    date: string;
    venue: string;
    description: string;
    image: string;
    category: string;
    ticketsSold: number;
    totalTickets: number;
    revenue: string;
    status: "draft" | "published" | "ended";
}

export const OrganizerDashboard: React.FC = () => {
    const { provider, account } = useWallet();

    const [activeTab, setActiveTab] = useState<
        "overview" | "events" | "create"
    >("overview");
    const [events, setEvents] = useState<Event[]>([]);

    const [newEvent, setNewEvent] = useState({
        title: "",
        date: "",
        venue: "",
        description: "",
        category: "Gala",
        image: "",
        price: 1,
        count: 1,
    });

    const totalRevenue = events.reduce(
        (sum, event) => sum + parseFloat(event.revenue),
        0
    );
    const totalTicketsSold = events.reduce(
        (sum, event) => sum + event.ticketsSold,
        0
    );

    const handleCreateEvent = async () => {
        if (!provider) return;

        const signer = await provider.getSigner();
        const contractWithSigner = await getEventManagerContract(signer);

        const tx = await contractWithSigner.createEvent(
            newEvent.title,
            newEvent.date,
            newEvent.venue,
            newEvent.description,
            newEvent.category,
            newEvent.image,
            ethers.parseEther(newEvent.price.toString()),
            newEvent.count
        );

        await tx.wait();
        await loadEvents();
        setActiveTab("events");
    };

    const loadEvents = async () => {
        if (!provider || !account) return;

        const contract = await getEventManagerContract(provider);
        const idsRaw: bigint[] = await contract.getOrganizerEvents(account);
        const ids: number[] = idsRaw.map((id) => Number(id)); // convert

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
    }, [activeTab]);

    return (
        <div className="pt-24 pb-16 px-6 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
                                    Organizer Dashboard
                                </span>
                            </h1>
                            <p className="text-xl text-gray-300">
                                Manage your exclusive events and NFT tickets
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Crown className="w-8 h-8 text-gold" />
                            <span className="text-gold font-bold">
                                Elite Organizer
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="flex space-x-1 bg-gray-900/50 p-2 rounded-2xl border border-gold/20">
                        {[
                            {
                                id: "overview",
                                label: "Overview",
                                icon: BarChart3,
                            },
                            {
                                id: "events",
                                label: "My Events",
                                icon: Calendar,
                            },
                            { id: "create", label: "Create Event", icon: Plus },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? "bg-gradient-to-r from-gold to-yellow-400 text-black font-bold shadow-lg shadow-gold/25"
                                        : "text-gray-300 hover:text-gold hover:bg-gold/10"
                                }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Stats Cards */}
                        <div className="grid md:grid-cols-4 gap-6 mb-12">
                            {[
                                {
                                    label: "Total Revenue",
                                    value: `${totalRevenue.toFixed(1)} ETH`,
                                    icon: DollarSign,
                                    color: "from-green-500 to-emerald-600",
                                },
                                {
                                    label: "Tickets Sold",
                                    value: totalTicketsSold.toString(),
                                    icon: Ticket,
                                    color: "from-gold to-yellow-400",
                                },
                                {
                                    label: "Active Events",
                                    value: events
                                        .filter((e) => e.status === "published")
                                        .length.toString(),
                                    icon: Calendar,
                                    color: "from-blue-500 to-cyan-500",
                                },
                                {
                                    label: "Total Events",
                                    value: events.length.toString(),
                                    icon: Crown,
                                    color: "from-purple-500 to-pink-500",
                                },
                            ].map((stat, index) => (
                                <motion.div
                                    key={index}
                                    className="group relative"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <div
                                        className={`absolute -inset-1 bg-gradient-to-br ${stat.color} rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500`}
                                    ></div>
                                    <div className="relative bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-gold/20">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-3xl font-bold text-gold">
                                                    {stat.value}
                                                </div>
                                                <div className="text-gray-300">
                                                    {stat.label}
                                                </div>
                                            </div>
                                            <stat.icon className="w-8 h-8 text-gold" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gold/20">
                            <h3 className="text-2xl font-bold text-gold mb-6 flex items-center">
                                <TrendingUp className="w-6 h-6 mr-3" />
                                Recent Activity
                            </h3>
                            <div className="space-y-4">
                                {[
                                    {
                                        action: "New ticket purchase",
                                        event: "Royal Gala Evening",
                                        time: "2 minutes ago",
                                    },
                                    {
                                        action: "Event published",
                                        event: "Exclusive Art Exhibition",
                                        time: "1 hour ago",
                                    },
                                    {
                                        action: "Ticket tier updated",
                                        event: "VIP Concert Experience",
                                        time: "3 hours ago",
                                    },
                                ].map((activity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-gold/10"
                                    >
                                        <div>
                                            <div className="text-white font-medium">
                                                {activity.action}
                                            </div>
                                            <div className="text-gold text-sm">
                                                {activity.event}
                                            </div>
                                        </div>
                                        <div className="text-gray-400 text-sm">
                                            {activity.time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Events Tab */}
                {activeTab === "events" && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-gold">
                                Your Events
                            </h2>
                            <button
                                onClick={() => setActiveTab("create")}
                                className="relative group"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-gold via-yellow-300 to-gold rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                <div className="relative bg-gradient-to-r from-gold via-yellow-400 to-gold px-6 py-3 rounded-xl text-black font-bold flex items-center space-x-2">
                                    <Plus className="w-5 h-5" />
                                    <span>Create Event</span>
                                </div>
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    className="group relative"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-br from-gold/20 to-transparent rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                    <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gold/20 overflow-hidden">
                                        <div className="relative">
                                            <img
                                                src={event.image}
                                                alt={event.title}
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                            <div className="absolute top-4 right-4">
                                                <div
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        event.status ===
                                                        "published"
                                                            ? "bg-green-600 text-white"
                                                            : event.status ===
                                                              "draft"
                                                            ? "bg-yellow-600 text-black"
                                                            : "bg-gray-600 text-white"
                                                    }`}
                                                >
                                                    {event.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        event.status.slice(1)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gold mb-2">
                                                {event.title}
                                            </h3>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center text-gray-300 text-sm">
                                                    <Calendar className="w-4 h-4 mr-2 text-gold" />
                                                    <span>
                                                        {new Date(
                                                            event.date
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-gray-300 text-sm">
                                                    <MapPin className="w-4 h-4 mr-2 text-gold" />
                                                    <span>{event.venue}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gold">
                                                        {event.ticketsSold}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        Sold
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gold">
                                                        {event.revenue}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        Revenue
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                <button className="flex-1 bg-gold/20 hover:bg-gold/30 text-gold px-4 py-2 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2">
                                                    <Eye className="w-4 h-4" />
                                                    <span>View</span>
                                                </button>
                                                <button className="flex-1 bg-gold/20 hover:bg-gold/30 text-gold px-4 py-2 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2">
                                                    <Edit3 className="w-4 h-4" />
                                                    <span>Edit</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Create Event Tab */}
                {activeTab === "create" && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold text-gold mb-8">
                                Create New Event
                            </h2>

                            <div className="grid lg:grid-cols-2 gap-12">
                                {/* Event Details Form */}
                                <div className="space-y-6">
                                    <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gold/20">
                                        <h3 className="text-2xl font-bold text-gold mb-6">
                                            Event Details
                                        </h3>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-gold font-medium mb-2">
                                                    Event Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newEvent.title}
                                                    onChange={(e) =>
                                                        setNewEvent({
                                                            ...newEvent,
                                                            title: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="w-full bg-black/50 border border-gold/30 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors duration-300"
                                                    placeholder="Enter event title"
                                                />
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-gold font-medium mb-2">
                                                        Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={newEvent.date}
                                                        onChange={(e) =>
                                                            setNewEvent({
                                                                ...newEvent,
                                                                date: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="w-full bg-black/50 border border-gold/30 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors duration-300"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-gold font-medium mb-2">
                                                        Category
                                                    </label>
                                                    <select
                                                        value={
                                                            newEvent.category
                                                        }
                                                        onChange={(e) =>
                                                            setNewEvent({
                                                                ...newEvent,
                                                                category:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="w-full bg-black/50 border border-gold/30 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors duration-300"
                                                    >
                                                        <option value="Gala">
                                                            Gala
                                                        </option>
                                                        <option value="Art">
                                                            Art
                                                        </option>
                                                        <option value="Music">
                                                            Music
                                                        </option>
                                                        <option value="Wine">
                                                            Wine
                                                        </option>
                                                        <option value="Fashion">
                                                            Fashion
                                                        </option>
                                                        <option value="Party">
                                                            Party
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-gold font-medium mb-2">
                                                    Venue
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newEvent.venue}
                                                    onChange={(e) =>
                                                        setNewEvent({
                                                            ...newEvent,
                                                            venue: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="w-full bg-black/50 border border-gold/30 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors duration-300"
                                                    placeholder="Enter venue name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gold font-medium mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={newEvent.description}
                                                    onChange={(e) =>
                                                        setNewEvent({
                                                            ...newEvent,
                                                            description:
                                                                e.target.value,
                                                        })
                                                    }
                                                    rows={4}
                                                    className="w-full bg-black/50 border border-gold/30 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors duration-300 resize-none"
                                                    placeholder="Describe your exclusive event"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gold font-medium mb-2">
                                                    Event Image URL
                                                </label>
                                                <input
                                                    type="url"
                                                    value={newEvent.image}
                                                    onChange={(e) =>
                                                        setNewEvent({
                                                            ...newEvent,
                                                            image: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="w-full bg-black/50 border border-gold/30 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors duration-300"
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ticket Tiers */}
                                <div className="space-y-6">
                                    <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gold/20">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-2xl font-bold text-gold">
                                                Ticket Details
                                            </h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-black/30 p-6 rounded-xl border border-gold/10">
                                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label className="block text-gold font-medium mb-2 text-sm">
                                                            Price (ETH)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={
                                                                newEvent.price
                                                            }
                                                            onChange={(e) =>
                                                                setNewEvent({
                                                                    ...newEvent,
                                                                    price: Number(
                                                                        e.target
                                                                            .value
                                                                    ),
                                                                })
                                                            }
                                                            className="w-full bg-black/50 border border-gold/20 rounded-lg px-3 py-2 text-white text-sm focus:border-gold focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-gold font-medium mb-2 text-sm">
                                                            Quantity
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={
                                                                newEvent.count
                                                            }
                                                            onChange={(e) =>
                                                                setNewEvent({
                                                                    ...newEvent,
                                                                    count: Number(
                                                                        e.target
                                                                            .value
                                                                    ),
                                                                })
                                                            }
                                                            className="w-full bg-black/50 border border-gold/20 rounded-lg px-3 py-2 text-white text-sm focus:border-gold focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCreateEvent}
                                        disabled={
                                            !newEvent.title ||
                                            !newEvent.date ||
                                            !newEvent.venue
                                        }
                                        className="w-full relative group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="absolute -inset-1 bg-gradient-to-r from-gold via-yellow-300 to-gold rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition duration-500"></div>
                                        <div className="relative bg-gradient-to-r from-gold via-yellow-400 to-gold px-8 py-4 rounded-2xl text-black font-bold text-lg hover:shadow-2xl hover:shadow-gold/50 transition-all duration-300 flex items-center justify-center space-x-3">
                                            <Crown className="w-6 h-6" />
                                            <span>Create Royal Event</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
