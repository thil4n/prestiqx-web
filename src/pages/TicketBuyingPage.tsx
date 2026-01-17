// TicketBuyingPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Star, ArrowLeft } from "lucide-react";
import { ethers } from "ethers";
import { getEventManagerContract } from "../ethereum/EventManager";
import { useWallet } from "../ethereum/useWallet";

interface Event {
    id: number;
    title: string;
    date: string;
    venue: string;
    description: string;
    category: string;
    image: string;
    ticketsSold: number;
    ticketPrice: number;
    totalTickets: number;
    revenue: string;
    status: "draft" | "published" | "ended";
    highlights: string[];
}

export const TicketBuyingPage: React.FC = () => {
    const { provider, account } = useWallet();
    const { id } = useParams<{ id: string }>();

    const [isLoading, setIsLoading] = useState(false);
    const [event, setEvent] = useState<Event | null>(null);

    const [buying, setBuying] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    const loadEvent = async () => {
        if (!provider || !account || !id) return;

        setIsLoading(true);

        try {
            const contract = await getEventManagerContract(provider);

            // Convert string ID from route to number
            const eventId = Number(id);
            if (isNaN(eventId)) throw new Error("Invalid event ID");

            // Call the contract
            const e = await contract.getFunction("getEvent")(id);

            // Destructure returned struct
            const {
                id: eventIdOnChain,
                title,
                date,
                venue,
                description,
                category,
                image,
                ticketPrice,
                totalTickets,
                ticketsSold,
                published,
                ended,
            } = e;

            console.log(ticketPrice);

            const eventObj: Event = {
                id: Number(eventIdOnChain),
                title,
                date,
                venue,
                description,
                ticketPrice,
                image,
                category,
                ticketsSold: Number(ticketsSold),
                totalTickets: Number(totalTickets),
                revenue: `${ethers.formatEther(
                    BigInt(ticketsSold) * BigInt(ticketPrice)
                )} ETH`,
                status: ended ? "ended" : published ? "published" : "draft",
                highlights: [], // optional for now
            };

            setEvent(eventObj);
        } catch (err) {
            console.error("Failed to load event:", err);
            setEvent(null);
        }

        setIsLoading(false);
    };

    const buyTicket = async () => {
        if (!provider || !account || !event) return;

        setBuying(true);
        setTxHash(null);

        try {
            const signer = await provider.getSigner();
            const contract = await getEventManagerContract(signer);

            console.log(BigInt(event.ticketPrice));

            const tx = await contract.buyTicket(id, "test", {
                value: BigInt(event.ticketPrice), // already WEI
            });

            const receipt = await tx.wait();
            setTxHash(receipt.hash);

            await loadEvent();
        } catch (err) {
            console.error("Ticket purchase failed:", err);
        }

        setBuying(false);
    };

    useEffect(() => {
        loadEvent();
    }, [provider, account, id]);

    if (isLoading) {
        return <div className="pt-24 text-center">Loading event...</div>;
    }

    if (!event) {
        return <div className="pt-24 text-center">Event not found</div>;
    }

    return (
        <div className="pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-6">
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
                                <span className="text-lg">
                                    {new Date(event.date).toLocaleDateString(
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
                                <MapPin className="w-5 h-5 mr-3 text-gold" />
                                <span className="text-lg">{event.venue}</span>
                            </div>
                        </div>

                        <p className="text-gray-300 text-lg leading-relaxed mb-8">
                            {event.description}
                        </p>

                        {event.highlights.length > 0 && (
                            <div>
                                <h3 className="text-2xl font-bold text-gold mb-4">
                                    Event Highlights
                                </h3>
                                <ul className="space-y-2">
                                    {event.highlights.map(
                                        (highlight, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center text-gray-300"
                                            >
                                                <Star className="w-4 h-4 mr-3 text-gold" />
                                                <span>{highlight}</span>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <button
                            onClick={buyTicket}
                            disabled={
                                buying ||
                                event.ticketsSold >= event.totalTickets
                            }
                            className={`px-6 py-3 font-bold rounded-lg text-black ${
                                buying
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-yellow-400 hover:bg-gold"
                            }`}
                        >
                            {buying
                                ? "Processing..."
                                : event.ticketsSold >= event.totalTickets
                                ? "Sold Out"
                                : `Buy Ticket - ${ethers.formatEther(
                                      event.ticketPrice
                                  )} ETH`}
                        </button>

                        {txHash && (
                            <p className="mt-2 text-green-400">
                                Purchased! TX:{" "}
                                <a
                                    href={`https://etherscan.io/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                >
                                    {txHash.slice(0, 10)}...
                                </a>
                            </p>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
