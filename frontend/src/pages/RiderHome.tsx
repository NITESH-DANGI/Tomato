import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketProvider";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService, riderService } from "../main";
import AddRider from "../components/AddRider";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bike,
    Navigation,
    Package,
    CheckCircle2,
    Clock,
    MapPin,
    TrendingUp,
    Activity,
    LogOut,
    Power,
    ShieldCheck,
    Zap,
    ChevronRight,
    User as UserIcon,
    Phone,
    ArrowRight,
} from "lucide-react";

interface IRiderProfile {
    _id: string;
    userId: string;
    picture: string;
    phoneNumber: string;
    aadharNumber: string;
    drivingLicenseNumber: string;
    isAvailble: boolean;
    isVerified: boolean;
    location: {
        coordinates: [number, number];
    };
    createdAt: string;
}

interface IActiveOrder {
    _id: string;
    userId: string;
    restaurantId: {
        _id: string;
        name: string;
        formattedAddress: string;
    };
    items: Array<{ name: string; price: number; quauntity: number }>;
    totalAmount: number;
    status: string;
    deliveryAddress: {
        fromattedAddress: string;
        mobile: number;
    };
}

const RiderHome = () => {
    const { user, setIsAuth, setUser } = useAppData();
    const { socket } = useSocket();
    const [profile, setProfile] = useState<IRiderProfile | null>(null);
    const [activeOrder, setActiveOrder] = useState<IActiveOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [pendingOrder, setPendingOrder] = useState<any>(null);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${riderService}/api/rider/myprofile`, { headers });
            if (data) {
                setProfile(data);
                setHasProfile(true);
                fetchActiveOrder(data._id);
            } else {
                setHasProfile(false);
            }
        } catch (error: any) {
            if (error.response?.status === 404 || !error.response?.data) {
                setHasProfile(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveOrder = async (riderId: string) => {
        try {
            const { data } = await axios.get(`${restaurantService}/api/order/current/rider`, {
                headers: { "x-internal-key": "internal" }, // This is an internal route
                params: { riderId },
            });
            setActiveOrder(data);
        } catch (error) {
            setActiveOrder(null);
        }
    };

    const toggleAvailability = async () => {
        if (!profile) return;
        setToggling(true);
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject)
            );
            const { data } = await axios.patch(
                `${riderService}/api/rider/.toggle`,
                {
                    isAvailble: !profile.isAvailble,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                },
                { headers }
            );
            setProfile((prev) => prev ? { ...prev, isAvailble: !prev.isAvailble } : null);
            toast.success(data.message);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error toggling availability");
        } finally {
            setToggling(false);
        }
    };

    const updateStatus = async (status: string) => {
        if (!activeOrder) return;
        try {
            await axios.put(
                `${restaurantService}/api/order/update/status/rider`,
                { orderId: activeOrder._id, status },
                { headers: { "x-internal-key": "internal" } }
            );
            toast.success(`Order ${status.replace(/_/g, " ")}`);
            if (profile?._id) fetchActiveOrder(profile._id);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error updating status");
        }
    };

    const logoutHandler = () => {
        localStorage.removeItem("token");
        setIsAuth(false);
        setUser(null);
        toast.success("Logged out");
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Socket — new order available
    useEffect(() => {
        if (!socket) return;
        const handleOrderAvailable = (payload: any) => {
            setPendingOrder(payload);
        };
        const handleOrderUpdate = () => {
            if (profile?._id) fetchActiveOrder(profile._id);
        };
        socket.on("order:available", handleOrderAvailable);
        socket.on("order:update", handleOrderUpdate);
        return () => {
            socket.off("order:available", handleOrderAvailable);
            socket.off("order:update", handleOrderUpdate);
        };
    }, [socket, profile?._id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-tomato-red" />
            </div>
        );
    }

    if (!hasProfile) {
        return (
            <div className="min-h-screen bg-surface">
                <AddRider />
            </div>
        );
    }

    const getNextRiderStatus = (status: string) => {
        const flow: Record<string, string> = {
            ready_for_rider: "picked_up",
            picked_up: "on_the_way",
            on_the_way: "delivered",
        };
        return flow[status] || null;
    };

    return (
        <div className="min-h-screen bg-surface">
            <main className="max-w-lg mx-auto px-4 py-6 space-y-6">

                {/* ─── Rider Profile Card ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-5"
                >
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                            {profile?.picture ? (
                                <img src={profile.picture} alt="Rider" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-tomato-red/20 flex items-center justify-center">
                                    <UserIcon size={20} className="text-tomato-red" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-white">{user?.name}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                {profile?.isVerified ? (
                                    <span className="badge-success flex items-center gap-1">
                                        <ShieldCheck size={10} /> Verified
                                    </span>
                                ) : (
                                    <span className="badge-warning flex items-center gap-1">
                                        <Clock size={10} /> Pending Verification
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={logoutHandler}
                            className="p-2 rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-colors"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>

                    {/* ─── Big Online/Offline Toggle ─── */}
                    <button
                        onClick={toggleAvailability}
                        disabled={toggling || !profile?.isVerified}
                        className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-500 relative overflow-hidden ${profile?.isAvailble
                                ? 'bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400'
                                : 'bg-white/5 border-2 border-white/10 text-white/40'
                            } ${!profile?.isVerified ? 'opacity-50 cursor-not-allowed' : ''} ${toggling ? 'animate-pulse' : ''}`}
                    >
                        {profile?.isAvailble && (
                            <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                        )}
                        <div className="relative flex items-center justify-center gap-3">
                            <Power size={22} className={profile?.isAvailble ? 'text-emerald-400' : 'text-white/30'} />
                            <span>{profile?.isAvailble ? "ONLINE" : "OFFLINE"}</span>
                        </div>
                        <span className="relative block text-xs font-normal mt-1 opacity-60">
                            {profile?.isAvailble ? "Tap to go offline" : "Tap to start accepting orders"}
                        </span>
                    </button>
                </motion.div>

                {/* ─── Pending Order Notification (Pulse) ─── */}
                <AnimatePresence>
                    {pendingOrder && !activeOrder && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="pulse-ring glass-card rounded-2xl p-5 border-tomato-red/30"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-tomato-red/20 rounded-xl flex items-center justify-center animate-pulse">
                                    <Zap size={20} className="text-tomato-red" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">New Order Available!</h3>
                                    <p className="text-xs text-white/40">A new delivery is waiting for you</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        toast.success("Order accepted — waiting for assignment");
                                        setPendingOrder(null);
                                    }}
                                    className="flex-1 btn-primary py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={16} /> Accept Order
                                </button>
                                <button
                                    onClick={() => setPendingOrder(null)}
                                    className="btn-secondary py-3 rounded-xl text-sm px-5"
                                >
                                    Skip
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── Active Order Card ─── */}
                {activeOrder ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-2xl p-5"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Package size={16} className="text-tomato-red" />
                            <h3 className="font-bold text-white text-sm">Active Delivery</h3>
                            <span className="badge-warning ml-auto">{activeOrder.status.replace(/_/g, " ")}</span>
                        </div>

                        {/* From / To */}
                        <div className="space-y-3 mb-5">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Navigation size={14} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider">Pickup</p>
                                    <p className="text-sm text-white/70">{activeOrder.restaurantId?.name || "Restaurant"}</p>
                                </div>
                            </div>

                            <div className="ml-4 border-l border-dashed border-white/10 h-4" />

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-tomato-red/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <MapPin size={14} className="text-tomato-red" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider">Drop-off</p>
                                    <p className="text-sm text-white/70">{activeOrder.deliveryAddress?.fromattedAddress || "Customer Location"}</p>
                                    {activeOrder.deliveryAddress?.mobile && (
                                        <div className="flex items-center gap-1 mt-1 text-xs text-white/40">
                                            <Phone size={10} /> {activeOrder.deliveryAddress.mobile}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="mb-4 p-3 bg-white/3 rounded-xl">
                            {activeOrder.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-1">
                                    <span className="text-xs text-white/50">{item.name} × {item.quauntity}</span>
                                    <span className="text-xs text-white/30">₹{item.price * item.quauntity}</span>
                                </div>
                            ))}
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                <span className="text-xs font-semibold text-white/60">Total</span>
                                <span className="text-sm font-bold text-tomato-red">₹{activeOrder.totalAmount}</span>
                            </div>
                        </div>

                        {/* Status Action */}
                        {(() => {
                            const next = getNextRiderStatus(activeOrder.status);
                            if (!next) return null;

                            const labels: Record<string, string> = {
                                picked_up: "Mark as Picked Up",
                                on_the_way: "On the Way",
                                delivered: "Mark as Delivered",
                            };

                            return (
                                <button
                                    onClick={() => updateStatus(next)}
                                    className="w-full btn-primary py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                                >
                                    {labels[next] || next} <ArrowRight size={16} />
                                </button>
                            );
                        })()}
                    </motion.div>
                ) : (
                    !pendingOrder && profile?.isAvailble && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center py-12"
                        >
                            <div className="w-16 h-16 glass-card rounded-full flex items-center justify-center mb-4">
                                <Bike size={24} className="text-white/20" />
                            </div>
                            <h3 className="text-base font-bold text-white/50 mb-1">Waiting for orders</h3>
                            <p className="text-xs text-white/30">You'll be notified when a delivery is available</p>
                        </motion.div>
                    )
                )}

                {!profile?.isAvailble && !activeOrder && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-12">
                        <div className="w-16 h-16 glass-card rounded-full flex items-center justify-center mb-4">
                            <Power size={24} className="text-white/20" />
                        </div>
                        <h3 className="text-base font-bold text-white/50 mb-1">You're offline</h3>
                        <p className="text-xs text-white/30">Go online to start receiving orders</p>
                    </motion.div>
                )}

                {/* ─── Quick Stats ─── */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Today", value: "₹0", icon: TrendingUp },
                        { label: "Deliveries", value: "0", icon: Package },
                        { label: "Rating", value: "5.0", icon: Activity },
                    ].map((stat) => (
                        <div key={stat.label} className="glass-card rounded-xl p-3 text-center">
                            <stat.icon size={14} className="text-tomato-red mx-auto mb-1" />
                            <p className="text-lg font-bold text-white">{stat.value}</p>
                            <p className="text-[10px] text-white/30">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default RiderHome;
