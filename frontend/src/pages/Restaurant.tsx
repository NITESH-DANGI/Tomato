import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import AddRestaurant from "../components/AddRestaurant";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  UtensilsCrossed,
  PlusSquare,
  TrendingUp,
  Activity,
  PackageCheck,
  LayoutDashboard,
  Upload,
  Settings,
  MoreVertical,
  CheckCircle2,
  ChefHat,
  Bike,
  Package,
  DollarSign,
  Power,
  Eye,
  EyeOff,
  Trash2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

type SellerTab = "orders" | "menu" | "settings";

interface IOrderItem {
  itemId: string;
  name: string;
  price: number;
  quauntity: number;
}

interface IOrder {
  _id: string;
  userId: string;
  restaurantId: string;
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

interface IMenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
}

const Restaurant = () => {
  const { user } = useAppData();
  const { socket } = useSocket();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SellerTab>("orders");
  const [hasRestaurant, setHasRestaurant] = useState(true);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchMyRestaurant = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${restaurantService}/api/restaurant/my`, { headers });
      setRestaurant(data);
      setHasRestaurant(true);
      if (data?._id) {
        fetchDashboardData(data._id);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setHasRestaurant(false);
      }
      console.error("Error fetching restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (restaurantId: string) => {
    try {
      const [ordersRes, itemsRes] = await Promise.all([
        axios.get(`${restaurantService}/api/order/restaurant/${restaurantId}`, { headers }),
        axios.get(`${restaurantService}/api/item/all/${restaurantId}`, { headers }),
      ]);
      setOrders(ordersRes.data.orders || ordersRes.data || []);
      setMenuItems(itemsRes.data.items || itemsRes.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  // Live updates
  useEffect(() => {
    if (!socket || !restaurant?._id) return;
    const handleUpdate = () => fetchDashboardData(restaurant._id);
    socket.on("order:update", handleUpdate);
    socket.on("order:rider_assigned", handleUpdate);
    return () => {
      socket.off("order:update", handleUpdate);
      socket.off("order:rider_assigned", handleUpdate);
    };
  }, [socket, restaurant?._id]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await axios.put(`${restaurantService}/api/order/${orderId}`, { status }, { headers });
      toast.success(`Order ${status.replace(/_/g, " ")}`);
      if (restaurant?._id) fetchDashboardData(restaurant._id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error updating order");
    }
  };

  const toggleItemStatus = async (itemId: string) => {
    try {
      await axios.put(`${restaurantService}/api/item/status/${itemId}`, {}, { headers });
      toast.success("Item status toggled");
      if (restaurant?._id) fetchDashboardData(restaurant._id);
    } catch (error) {
      toast.error("Error toggling item");
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await axios.delete(`${restaurantService}/api/item/${itemId}`, { headers });
      toast.success("Item deleted");
      if (restaurant?._id) fetchDashboardData(restaurant._id);
    } catch (error) {
      toast.error("Error deleting item");
    }
  };

  const toggleRestaurantStatus = async () => {
    try {
      await axios.put(`${restaurantService}/api/restaurant/status`, {}, { headers });
      toast.success(restaurant?.isOpen ? "Restaurant closed" : "Restaurant opened");
      fetchMyRestaurant();
    } catch (error) {
      toast.error("Error toggling status");
    }
  };

  // Stats
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.status));
  const completedOrders = orders.filter(o => o.status === "delivered");

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-tomato-red" />
      </div>
    );
  }

  if (!hasRestaurant) {
    return (
      <div className="min-h-screen bg-surface">
        <AddRestaurant />
      </div>
    );
  }

  const getNextStatus = (status: string) => {
    const flow: Record<string, string> = {
      placed: "accepted",
      accepted: "preparing",
      preparing: "ready_for_rider",
    };
    return flow[status] || null;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      placed: <AlertCircle size={14} />,
      accepted: <CheckCircle2 size={14} />,
      preparing: <ChefHat size={14} />,
      ready_for_rider: <Package size={14} />,
      picked_up: <Bike size={14} />,
      delivered: <PackageCheck size={14} />,
    };
    return icons[status] || <Activity size={14} />;
  };

  return (
    <div className="min-h-screen bg-surface">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">

        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <LayoutDashboard size={22} className="text-tomato-red" />
              {restaurant?.name}
            </h1>
            <p className="text-sm text-white/40 mt-1">Restaurant Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleRestaurantStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${restaurant?.isOpen
                  ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25'
                  : 'bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500/25'
                }`}
            >
              <Power size={14} />
              {restaurant?.isOpen ? "Open" : "Closed"}
            </button>
          </div>
        </div>

        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-400" },
            { label: "Active Orders", value: activeOrders.length, icon: Activity, color: "text-amber-400" },
            { label: "Completed", value: completedOrders.length, icon: PackageCheck, color: "text-blue-400" },
            { label: "Menu Items", value: menuItems.length, icon: UtensilsCrossed, color: "text-purple-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={14} className={stat.color} />
                <span className="text-[11px] text-white/40 uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ─── Tab Bar ─── */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { key: "orders" as SellerTab, label: "Live Orders", icon: ClipboardList },
            { key: "menu" as SellerTab, label: "Menu", icon: UtensilsCrossed },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Tab Content ─── */}
        <AnimatePresence mode="wait">
          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {activeOrders.length === 0 && completedOrders.length === 0 ? (
                <div className="flex flex-col items-center py-20">
                  <ClipboardList size={32} className="text-white/15 mb-3" />
                  <p className="text-white/40 text-sm">No orders yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Active orders first, then completed */}
                  {[...activeOrders, ...completedOrders.slice(0, 5)].map((order, i) => {
                    const nextStatus = getNextStatus(order.status);
                    const isActive = !["delivered", "cancelled"].includes(order.status);

                    return (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`glass-card p-5 rounded-xl ${isActive ? 'border-l-2 border-l-tomato-red/60' : ''}`}
                      >
                        {/* Order Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="text-[10px] text-white/30 font-mono">#{order._id.slice(-6).toUpperCase()}</span>
                            <p className="text-xs text-white/40 mt-0.5">
                              {new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <span className={`badge ${order.status === "delivered" ? "badge-success" :
                              order.status === "placed" ? "badge-info" :
                                "badge-warning"
                            } flex items-center gap-1`}>
                            {getStatusIcon(order.status)}
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </div>

                        {/* Items */}
                        <div className="mb-3 space-y-1">
                          {order.items.map((item, j) => (
                            <div key={j} className="flex items-center justify-between">
                              <span className="text-sm text-white/60">{item.name} × {item.quauntity}</span>
                              <span className="text-xs text-white/30">₹{item.price * item.quauntity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <span className="text-sm font-bold text-white">₹{order.totalAmount}</span>
                          {nextStatus && (
                            <button
                              onClick={() => updateOrderStatus(order._id, nextStatus)}
                              className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1"
                            >
                              {nextStatus === "accepted" ? "Accept" :
                                nextStatus === "preparing" ? "Start Cooking" :
                                  "Ready for Rider"}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {menuItems.length === 0 ? (
                <div className="flex flex-col items-center py-20">
                  <UtensilsCrossed size={32} className="text-white/15 mb-3" />
                  <p className="text-white/40 text-sm">No menu items yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItems.map((item, i) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`glass-card rounded-xl overflow-hidden ${!item.isAvailable ? 'opacity-60' : ''}`}
                    >
                      <div className="h-32 relative overflow-hidden">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-white/90 text-sm">{item.name}</h3>
                            <p className="text-tomato-red font-bold text-sm">₹{item.price}</p>
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-xs text-white/30 line-clamp-2 mb-3">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          {/* Toggle */}
                          <button
                            onClick={() => toggleItemStatus(item._id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${item.isAvailable
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/15 text-red-400 border border-red-500/20'
                              }`}
                          >
                            {item.isAvailable ? <Eye size={12} /> : <EyeOff size={12} />}
                            {item.isAvailable ? "Available" : "Hidden"}
                          </button>
                          <button
                            onClick={() => deleteItem(item._id)}
                            className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Restaurant;
