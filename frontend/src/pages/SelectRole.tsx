import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, Bike, Store, ChevronRight, Check } from "lucide-react";
import logoText from "../assets/images/logo with text.png";
import toast from "react-hot-toast";

type Role = "customer" | "rider" | "seller" | null;

interface RoleOption {
    id: "customer" | "rider" | "seller";
    title: string;
    description: string;
    icon: any;
}

const SelectRole = () => {
    const [role, setRole] = useState<Role>(null);
    const [loading, setLoading] = useState(false);
    const { setUser } = useAppData();
    const navigate = useNavigate();

    const roleOptions: RoleOption[] = [
        {
            id: "customer",
            title: "Foodie",
            description: "Discover and order the best local flavors near you.",
            icon: Utensils,
        },
        {
            id: "rider",
            title: "Rider",
            description: "Join our fleet and earn on your own schedule.",
            icon: Bike,
        },
        {
            id: "seller",
            title: "Restaurant",
            description: "Grow your business and reach more customers.",
            icon: Store,
        },
    ];

    const addRole = async () => {
        if (!role) return;
        setLoading(true);
        try {
            const { data } = await axios.put(
                `${authService}/api/auth/add/role`,
                { role },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            localStorage.setItem("token", data.token);
            setUser(data.user);
            toast.success("Role selected successfully!");
            navigate("/", { replace: true });
        } catch (error) {
            toast.error("Error updating role. Please try again.");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#0D0D0D] overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] items-center justify-center relative">
            {/* Background Decor */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-[#FF4D4D]/10 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[100px]"></div>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-2xl px-6 z-10"
            >
                <div className="flex flex-col items-center text-center space-y-6">
                    <motion.img
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        src={logoText}
                        alt="Tomato Logo"
                        className="h-24 w-auto mb-2 drop-shadow-[0_0_30px_rgba(255,77,77,0.3)]"
                    />

                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">
                            Choose your <span className="text-[#FF4D4D]">Role</span>
                        </h1>
                        <p className="text-gray-400 text-lg font-light">
                            How would you like to use Tomato today?
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-4">
                        {roleOptions.map((option, index) => (
                            <motion.button
                                key={option.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                onClick={() => setRole(option.id)}
                                className={`relative group flex flex-col items-center p-8 rounded-[1.5rem] border transition-all duration-300 ${role === option.id
                                        ? "bg-[#FF4D4D]/10 border-[#FF4D4D] shadow-[0_0_40px_rgba(255,77,77,0.15)]"
                                        : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.08]"
                                    }`}
                            >
                                <div
                                    className={`p-4 rounded-2xl mb-5 transition-all duration-300 ${role === option.id
                                            ? "bg-[#FF4D4D] text-white"
                                            : "bg-white/5 text-gray-400 group-hover:text-white"
                                        }`}
                                >
                                    <option.icon size={28} />
                                </div>

                                <div className="space-y-2">
                                    <h3
                                        className={`text-xl font-bold transition-colors ${role === option.id ? "text-white" : "text-gray-300"
                                            }`}
                                    >
                                        {option.title}
                                    </h3>
                                    <p className="text-gray-500 text-xs leading-relaxed font-medium">
                                        {option.description}
                                    </p>
                                </div>

                                <AnimatePresence>
                                    {role === option.id && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            className="absolute top-4 right-4 bg-[#FF4D4D] rounded-full p-1"
                                        >
                                            <Check size={12} className="text-white" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        ))}
                    </div>

                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        disabled={!role || loading}
                        onClick={addRole}
                        className={`group mt-8 flex items-center justify-center gap-3 w-full max-w-sm rounded-xl py-4 font-bold text-lg transition-all active:scale-[0.98] ${role && !loading
                                ? "bg-[#FF4D4D] text-white hover:bg-[#FF3333] shadow-[0_10px_30px_rgba(255,77,77,0.2)]"
                                : "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
                            }`}
                    >
                        {loading ? (
                            "Setting up your experience..."
                        ) : (
                            <>
                                Continue as {role ? roleOptions.find((r) => r.id === role)?.title : "..."}
                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default SelectRole;
