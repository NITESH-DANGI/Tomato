import { motion } from "framer-motion";
import { Star, Clock, MapPin } from "lucide-react";

interface RestaurantCardProps {
    name: string;
    image: string;
    rating: number;
    deliveryTime: string;
    distance: string;
    onClick: () => void;
}

const RestaurantCard = ({ name, image, rating, deliveryTime, distance, onClick }: RestaurantCardProps) => {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="glass-card-hover rounded-2xl overflow-hidden cursor-pointer group"
        >
            {/* Image */}
            <div className="relative h-44 overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Rating badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-white">{rating}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-white/90 text-base mb-2 group-hover:text-white transition-colors">{name}</h3>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-xs text-white/40">
                        <Clock size={12} /> {deliveryTime}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-white/40">
                        <MapPin size={12} /> {distance}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default RestaurantCard;
