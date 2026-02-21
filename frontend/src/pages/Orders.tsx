import { useState, useEffect } from "react";
import axios from "axios";
import { restaurantService } from "../main";
import { useSocket } from "../context/SocketProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package,
    CheckCircle2,
    Clock,
    ChefHat,
    Bike,
    MapPin,
    ArrowRight,
    ShoppingBag,
    Eye,
    X,
} from "lucide-react";

interface IOrderItem {
    itemId: string;
    name: string;
    price: number;
    quauntity: number;
}

interface IOrder {
    _id: string;
    restaurantName: string;
    items: IOrderItem[];
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    deliveryAddress: {
        fromattedAddress: string;
        mobile: number;
    };
}

const STATUS_STEPS = [
    { key: "placed", label: "Order Placed", icon: ShoppingBag, color: "text-blue-400" },
    { key: "accepted", label: "Accepted", icon: CheckCircle2, color: "text-emerald-400" },
    { key: "preparing", label: "Preparing", icon: ChefHat, color: "text-amber-400" },
    { key: "ready_for_rider", label: "Ready for Pickup", icon: Package, color: "text-purple-400" },
    { key: "picked_up", label: "Picked Up", icon: Bike, color: "text-cyan-400" },
    { key: "delivered", label: "Delivered", icon: MapPin, color: "text-emerald-400" },
];

const Orders = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
    const { socket } = useSocket();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${restaurantService}/api/order/myorder`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setOrders(data.orders || data || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Live order updates
    useEffect(() => {
        if (!socket) return;
        const handler = () => fetchOrders();
        socket.on("order:update", handler);
        return () => { socket.off("order:update", handler); };
    }, [socket]);

    const getStatusIndex = (status: string) => {
        return STATUS_STEPS.findIndex((s) => s.key === status);
    };

    return (
        <div className="min-h-screen bg-surface">
            <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center">
                        <ShoppingBag size={18} className="text-tomato-red" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">My Orders</h1>
                        <p className="text-xs text-white/40">{orders.length} orders</p>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass-card rounded-xl h-28 animate-pulse" />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center py-20">
                        <div className="w-16 h-16 glass-card rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag size={24} className="text-white/30" />
                        </div>
                        <h3 className="text-lg font-bold text-white/60 mb-1">No orders yet</h3>
                        <p className="text-sm text-white/30">Your orders will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order, i) => {
                            const statusIdx = getStatusIndex(order.status);
                            const isActive = order.status !== "delivered";

                            return (
                                <motion.div
                                    key={order._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`glass-card rounded-xl p-5 ${isActive ? 'border-tomato-red/20' : ''}`}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-bold text-white/90 text-sm">{order.restaurantName || "Restaurant"}</h3>
                                            <p className="text-[11px] text-white/30 mt-0.5">
                                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`badge ${order.status === "delivered" ? "badge-success" :
                                                    order.status === "placed" ? "badge-info" : "badge-warning"
                                                }`}>
                                                {order.status.replace(/_/g, " ")}
                                            </span>
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="flex items-center gap-1 mb-4">
                                        {STATUS_STEPS.map((step, idx) => {
                                            const isCompleted = idx <= statusIdx;
                                            const isCurrent = idx === statusIdx;
                                            const StepIcon = step.icon;

                                            return (
                                                <div key={step.key} className="flex items-center flex-1">
                                                    <div className="flex flex-col items-center">
                                                        <div
                                                            className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${isCompleted
                                                                    ? `bg-tomato-red/20 border-tomato-red/40 ${isCurrent ? 'ring-2 ring-tomato-red/20' : ''}`
                                                                    : 'bg-white/5 border-white/10'
                                                                }`}
                                                        >
                                                            <StepIcon size={12} className={isCompleted ? 'text-tomato-red' : 'text-white/20'} />
                                                        </div>
                                                        <span className={`text-[9px] mt-1 text-center leading-tight ${isCompleted ? 'text-white/50' : 'text-white/20'}`}>
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                    {idx < STATUS_STEPS.length - 1 && (
                                                        <div className={`flex-1 h-px mx-1 ${idx < statusIdx ? 'bg-tomato-red/40' : 'bg-white/10'}`} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Items summary */}
                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                        <p className="text-xs text-white/40">
                                            {order.items.map(i => `${i.name} x${i.quauntity}`).join(", ")}
                                        </p>
                                        <span className="text-sm font-bold text-tomato-red">₹{order.totalAmount}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Order Detail Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Order Details</h3>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/40"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-white/40 mb-1">Restaurant</p>
                                    <p className="text-sm font-semibold text-white/80">{selectedOrder.restaurantName || "Restaurant"}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-white/40 mb-2">Items</p>
                                    {selectedOrder.items.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                                            <span className="text-sm text-white/70">{item.name} × {item.quauntity}</span>
                                            <span className="text-sm text-white/50">₹{item.price * item.quauntity}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between pt-3">
                                        <span className="text-sm font-bold text-white">Total</span>
                                        <span className="text-base font-bold text-tomato-red">₹{selectedOrder.totalAmount}</span>
                                    </div>
                                </div>

                                {selectedOrder.deliveryAddress && (
                                    <div>
                                        <p className="text-xs text-white/40 mb-1">Delivery Address</p>
                                        <p className="text-sm text-white/60">{selectedOrder.deliveryAddress.fromattedAddress}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs text-white/40 mb-1">Payment</p>
                                    <span className={`badge ${selectedOrder.paymentStatus === "paid" ? "badge-success" : "badge-warning"}`}>
                                        {selectedOrder.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Orders;
