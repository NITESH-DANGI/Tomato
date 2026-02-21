import { useNavigate } from "react-router-dom";
import { Bell, ChevronLeft, BellOff } from "lucide-react";
import { motion } from "framer-motion";

const Notifications = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-surface">
            <main className="max-w-3xl mx-auto px-4 md:px-8 py-8">
                <header className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate("/account")}
                        className="p-3 rounded-xl glass-card text-white/50 hover:text-white transition-all"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Notifications</h1>
                        <p className="text-xs text-white/40">Updates & Communications</p>
                    </div>
                </header>

                <section className="flex flex-col items-center justify-center py-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-20 h-20 glass-card rounded-2xl flex items-center justify-center mb-6"
                    >
                        <Bell size={32} className="text-white/15" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-white/60 mb-2">All quiet for now</h2>
                    <p className="text-sm text-white/30 max-w-xs mb-6">
                        We'll notify you about order updates and exclusive offers.
                    </p>
                    <button className="glass-card px-6 py-3 rounded-xl flex items-center gap-2 text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all">
                        <BellOff size={16} />
                        Mute All Alerts
                    </button>
                </section>
            </main>
        </div>
    );
};

export default Notifications;
