import { useNavigate } from "react-router-dom";
import { ChevronLeft, User, Shield, Moon, Eye } from "lucide-react";
import { motion } from "framer-motion";

const Settings = () => {
    const navigate = useNavigate();

    const settingsGroups = [
        {
            title: "Personal Information",
            items: [
                { label: "Profile Details", icon: <User size={18} />, desc: "Change your name or display picture" },
                { label: "Security & Privacy", icon: <Shield size={18} />, desc: "Update password and secure your session" },
            ]
        },
        {
            title: "Preferences",
            items: [
                { label: "Display Mode", icon: <Moon size={18} />, desc: "Toggle dark mode and theme preferences" },
                { label: "Data Usage", icon: <Eye size={18} />, desc: "Manage how your data is used" },
            ]
        }
    ];

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
                        <h1 className="text-2xl font-bold text-white">Settings</h1>
                        <p className="text-xs text-white/40">Account Preferences & Security</p>
                    </div>
                </header>

                <section className="space-y-8 pb-12">
                    {settingsGroups.map((group, idx) => (
                        <motion.div
                            key={group.title}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="space-y-3"
                        >
                            <h2 className="text-[11px] text-white/30 font-bold uppercase tracking-widest pl-1">{group.title}</h2>
                            <div className="space-y-3">
                                {group.items.map((item) => (
                                    <div
                                        key={item.label}
                                        className="glass-card-hover rounded-xl p-5 flex items-center justify-between group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:bg-tomato-red/10 group-hover:text-tomato-red transition-all">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-white/80">{item.label}</h3>
                                                <p className="text-[10px] text-white/30 mt-0.5">{item.desc}</p>
                                            </div>
                                        </div>
                                        <div className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-tomato-red group-hover:border-tomato-red/30 transition-all">
                                            <Eye size={12} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}

                    <div className="glass-card rounded-xl p-6 border-red-500/20">
                        <h3 className="text-sm font-bold text-red-400 mb-1">Danger Zone</h3>
                        <p className="text-xs text-white/30 mb-4">Terminating your account is irreversible.</p>
                        <button className="px-6 py-2.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-bold hover:bg-red-500/25 transition-all">
                            Terminate Account
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Settings;
