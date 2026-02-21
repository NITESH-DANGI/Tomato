import { useState, useEffect } from "react";
import axios from "axios";
import { restaurantService } from "../main";
import { useAppData } from "../context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Minus, Star, ArrowLeft, Clock, Utensils } from "lucide-react";

interface IMenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    isAvailable: boolean;
}

interface IRestaurantDetail {
    _id: string;
    name: string;
    description?: string;
    image: string;
    isOpen: boolean;
}

const Menu = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { cart, cartSubtotal, addToCart, incrementCart, decrementCart } = useAppData();
    const [restaurant, setRestaurant] = useState<IRestaurantDetail | null>(null);
    const [items, setItems] = useState<IMenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [restRes, itemsRes] = await Promise.all([
                axios.get(`${restaurantService}/api/restaurant/${id}`, { headers }),
                axios.get(`${restaurantService}/api/item/all/${id}`, { headers }),
            ]);

            setRestaurant(restRes.data);
            setItems(itemsRes.data.items || itemsRes.data || []);
        } catch (error) {
            console.error("Error fetching menu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const getCartQuantity = (itemId: string) => {
        return cart.find((c) => c.itemId?._id === itemId)?.quauntity || 0;
    };

    const handleAdd = (item: IMenuItem) => {
        addToCart(id!, item._id);
    };

    const handleIncrement = (itemId: string) => {
        incrementCart(itemId);
    };

    const handleDecrement = (itemId: string) => {
        decrementCart(itemId);
    };

    const cartTotal = cartSubtotal;

    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-tomato-red" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface">
            {/* Restaurant Header */}
            <div className="relative h-56 md:h-64 overflow-hidden">
                <img
                    src={restaurant?.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600"}
                    alt={restaurant?.name}
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{restaurant?.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-white/50">
                        <span className="flex items-center gap-1">
                            <Star size={14} className="text-amber-400 fill-amber-400" /> 4.8
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={14} /> 25-35 min
                        </span>
                        <span className={`badge ${restaurant?.isOpen ? 'badge-success' : 'badge-danger'}`}>
                            {restaurant?.isOpen ? 'Open' : 'Closed'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                <div className="flex items-center gap-2 mb-6">
                    <Utensils size={18} className="text-tomato-red" />
                    <h2 className="text-lg font-bold text-white/80">Menu</h2>
                    <span className="text-xs text-white/30 ml-1">({items.length} items)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item, i) => {
                        const qty = getCartQuantity(item._id);
                        return (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className={`glass-card p-4 rounded-xl flex gap-4 ${!item.isAvailable ? 'opacity-50' : ''}`}
                            >
                                {/* Item Image */}
                                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                                    <img
                                        src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200"}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                    <div>
                                        <h3 className="font-bold text-white/90 text-sm mb-1 truncate">{item.name}</h3>
                                        {item.description && (
                                            <p className="text-xs text-white/40 line-clamp-2 mb-2">{item.description}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-tomato-red font-bold text-base">₹{item.price}</span>

                                        {item.isAvailable ? (
                                            <AnimatePresence mode="wait">
                                                {qty === 0 ? (
                                                    <motion.button
                                                        key="add"
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.8, opacity: 0 }}
                                                        onClick={() => handleAdd(item)}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-tomato-red/10 border border-tomato-red/20 text-tomato-red text-xs font-bold hover:bg-tomato-red/20 transition-all"
                                                    >
                                                        <Plus size={14} /> Add
                                                    </motion.button>
                                                ) : (
                                                    <motion.div
                                                        key="counter"
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.8, opacity: 0 }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <motion.button
                                                            whileTap={{ scale: 0.85 }}
                                                            onClick={() => handleDecrement(item._id)}
                                                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors"
                                                        >
                                                            <Minus size={12} />
                                                        </motion.button>
                                                        <motion.span
                                                            key={qty}
                                                            initial={{ y: -8, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            className="text-sm font-bold text-white w-5 text-center"
                                                        >
                                                            {qty}
                                                        </motion.span>
                                                        <motion.button
                                                            whileTap={{ scale: 0.85 }}
                                                            onClick={() => handleIncrement(item._id)}
                                                            className="w-7 h-7 rounded-lg bg-tomato-red/20 border border-tomato-red/30 flex items-center justify-center text-tomato-red hover:bg-tomato-red/30 transition-colors"
                                                        >
                                                            <Plus size={12} />
                                                        </motion.button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        ) : (
                                            <span className="badge-neutral text-[10px]">Unavailable</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Floating Cart Bar */}
                <AnimatePresence>
                    {cart.length > 0 && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg glass-card rounded-2xl p-4 flex items-center justify-between z-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-tomato-red/20 rounded-xl flex items-center justify-center">
                                    <ShoppingCart size={18} className="text-tomato-red" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{cart.length} items</p>
                                    <p className="text-xs text-white/50">₹{cartTotal}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate("/orders")}
                                className="shimmer-btn px-5 py-2 rounded-xl text-sm"
                            >
                                Checkout
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Menu;
