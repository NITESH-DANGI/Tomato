import { useState, useEffect } from "react";
import axios from "axios";
import { restaurantService } from "../main";
import type { IRestaurant } from "../types";
import { useAppData } from "../context/AppContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Star, MapPin, Zap, TrendingUp, Clock } from "lucide-react";
import mascot from "../assets/images/mascot transparent bg.png";
import logo from "../assets/images/logo with text.png";

const CUISINES = [
  "All", "Japanese", "Italian", "Mexican", "American",
  "Indian", "Chinese", "French", "Healthy",
];

const Home = () => {
  const { location } = useAppData();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCuisine, setActiveCuisine] = useState("All");

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const lat = location?.latitude || 28.6139;
      const lng = location?.longitude || 77.2090;
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/all?latitude=${lat}&longitude=${lng}&radius=100000`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setRestaurants(data.restaurants || []);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [location]);

  const filteredRestaurants = restaurants.filter(res =>
    res.name.toLowerCase().includes(search.toLowerCase())
  );

  const topRated = [...restaurants].slice(0, 3);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f' }}>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* ─── Hero Banner — Tomato Branded ─── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 rounded-2xl overflow-hidden relative min-h-[300px] md:min-h-[340px]"
          style={{
            background: 'linear-gradient(135deg, #1a0a0a 0%, #0a0a0f 40%, #150808 100%)',
            border: '1px solid rgba(255,68,51,0.12)',
          }}
        >
          {/* Glow */}
          <div className="absolute top-0 right-0 w-[60%] h-full pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(255,68,51,0.07) 0%, transparent 70%)' }} />

          {/* Mascot */}
          <div className="absolute right-4 md:right-16 bottom-0 h-full flex items-end pointer-events-none">
            <motion.img
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              src={mascot}
              alt="Tomato Mascot"
              className="h-[80%] w-auto object-contain drop-shadow-[0_20px_60px_rgba(255,68,51,0.25)] hidden md:block"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full p-8 md:p-12 max-w-[60%] md:max-w-[50%]">
            <motion.img
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              src={logo}
              alt="Tomato"
              className="h-12 w-auto mb-4 -ml-1 object-contain object-left"
            />
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight">
              Delivering <span style={{ color: '#FF4433' }}>Happiness</span>,<br />
              One Bite at a Time
            </h1>
            <p className="text-sm mb-6 max-w-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Premium restaurants. Lightning-fast delivery. Curated just for you.
            </p>
            <button
              onClick={() => document.getElementById('restaurant-grid')?.scrollIntoView({ behavior: 'smooth' })}
              className="shimmer-btn px-7 py-3 rounded-xl text-sm w-fit flex items-center gap-2"
            >
              Explore Restaurants <ArrowRight size={16} />
            </button>
          </div>
        </motion.section>

        {/* ─── Search + Filters Row ─── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center"
        >
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full py-3 rounded-xl text-sm"
              style={{ paddingLeft: '40px', paddingRight: '16px' }}
            />
          </div>

          {/* Cuisine Pills */}
          <div className="flex flex-wrap gap-2">
            {CUISINES.map(cuisine => (
              <button
                key={cuisine}
                onClick={() => setActiveCuisine(cuisine)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                style={{
                  background: activeCuisine === cuisine ? '#FF4433' : 'rgba(255,255,255,0.04)',
                  color: activeCuisine === cuisine ? '#fff' : 'rgba(255,255,255,0.5)',
                  border: activeCuisine === cuisine ? '1px solid #FF4433' : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </motion.section>

        {/* ─── Stats Strip ─── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex items-center gap-6"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={14} style={{ color: '#FF4433' }} />
            <span className="text-xs font-bold text-white">{restaurants.length}+</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>restaurants</span>
          </div>
          {topRated.length > 0 && (
            <div className="flex items-center gap-2">
              <Star size={14} style={{ color: '#fbbf24' }} />
              <span className="text-xs font-bold text-white">4.8</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>avg rating</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Zap size={14} style={{ color: '#FF4433' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>30 min avg delivery</span>
          </div>
        </motion.section>

        {/* ─── Restaurant Grid ─── */}
        <section id="restaurant-grid">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Nearby Restaurants</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className="rounded-2xl animate-pulse"
                  style={{ height: '260px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRestaurants.map((res, i) => (
                <motion.div
                  key={res._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/menu/${res._id}`)}
                  className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={res.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800"}
                      alt={res.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />

                    {/* Open Badge */}
                    {res.isOpen !== false && (
                      <span
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[11px] font-bold text-white"
                        style={{ background: '#22c55e', boxShadow: '0 2px 8px rgba(34,197,94,0.3)' }}
                      >
                        Open
                      </span>
                    )}

                    {/* Rating */}
                    <div
                      className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <Star size={11} className="fill-amber-400" style={{ color: '#fbbf24' }} />
                      <span className="text-[11px] font-bold text-white">4.8</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3
                      className="font-semibold text-base mb-2 group-hover:text-white transition-colors"
                      style={{ color: 'rgba(255,255,255,0.85)' }}
                    >
                      {res.name}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        <Clock size={11} /> 25-35 min
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        <MapPin size={11} /> 2.4 km
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Empty State */}
              {filteredRestaurants.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center text-center">
                  <div
                    className="w-16 h-16 glass-card rounded-full flex items-center justify-center mb-4"
                  >
                    <Search size={24} style={{ color: 'rgba(255,255,255,0.15)' }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    No restaurants found
                  </h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Try adjusting your search
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
