import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { LandingPage } from "./pages/LandingPage";
import { EventsPage } from "./pages/EventsPage";
import { TicketBuyingPage } from "./pages/TicketBuyingPage";
import { MyTicketsPage } from "./pages/MyTicketsPage";
import { OrganizerDashboard } from "./pages/OrganizerDashboard";

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-black text-white overflow-x-hidden">
                <Navigation />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/event/:id" element={<TicketBuyingPage />} />
                    <Route path="/my-tickets" element={<MyTicketsPage />} />
                    <Route path="/dashboard" element={<OrganizerDashboard />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
