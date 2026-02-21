import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
    Package,
    MapPin,
    LogOut,
    User as UserIcon,
    ChevronRight,
    Settings as SettingsIcon,
    CreditCard,
    Bell,
} from "lucide-react";

const Account = () => {
    const { user, setUser, setIsAuth } = useAppData();
    const firstLetter = user?.name?.charAt(0).toUpperCase() || "?";
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setIsAuth(false);
        navigate("/login");
        toast.success("Logged out successfully");
    };

    const navItems = [
        { label: "Your Orders", icon: <Package size={18} />, path: "/orders" },
        { label: "Saved Addresses", icon: <MapPin size={18} />, path: "/address" },
        { label: "Payment Methods", icon: <CreditCard size={18} />, path: "/payments" },
        { label: "Notifications", icon: <Bell size={18} />, path: "/notifications" },
        { label: "Settings", icon: <SettingsIcon size={18} />, path: "/settings" },
    ];

    return (
        <div className="min-h-screen bg-surface">
            <main className="max-w-3xl mx-auto px-4 md:px-8 py-8">
                <h1 className="text-2xl font-bold text-white mb-1">Account</h1>
                <p className="text-xs text-white/40 mb-8">Personal Dashboard</p>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-6 flex items-center gap-5 mb-8"
                >
                    <div className="w-16 h-16 rounded-2xl bg-tomato-red/20 border border-tomato-red/30 flex items-center justify-center text-2xl font-bold text-tomato-red flex-shrink-0">
                        {firstLetter}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-white truncate">{user?.name}</h2>
                        <p className="text-sm text-white/40 truncate">{user?.email}</p>
                    </div>
                </motion.div>

                {/* Nav Items */}
                <div className="space-y-3 mb-8">
                    {navItems.map((item, idx) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => navigate(item.path)}
                            className="glass-card-hover rounded-xl p-4 flex items-center justify-between cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-tomato-red/10 group-hover:text-tomato-red transition-all">
                                    {item.icon}
                                </div>
                                <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">{item.label}</span>
                            </div>
                            <ChevronRight size={16} className="text-white/15 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                        </motion.div>
                    ))}
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full glass-card rounded-xl p-4 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 transition-all text-sm font-semibold"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </main>
        </div>
    );
};

export default Account;
