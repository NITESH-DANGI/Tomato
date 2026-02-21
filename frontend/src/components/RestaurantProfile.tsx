// import { useState } from "react";
// import type { IRestaurant } from "../types";
// import axios from "axios";
// import { restaurantService } from "../main";
// import toast from "react-hot-toast";
// import { BiEdit, BiMapPin, BiSave } from "react-icons/bi";

// interface props {
//   restaurant: IRestaurant;
//   isSeller: boolean;
//   onUpdate: (restaurant: IRestaurant) => void;
// }
// const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: props) => {
//   const [editMode, setEditMode] = useState(false);
//   const [name, setName] = useState(restaurant.name);
//   const [description, setDescription] = useState(restaurant.description);
//   const [isOpen, setIsOpen] = useState(restaurant.isOpen);
//   const [loading, setLoading] = useState(false);

//   const tooggleOpenStatus = async () => {
//     try {
//       const { data } = await axios.put(
//         `${restaurantService}/api/restaurant/status`,
//         {
//           status: !open,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         },
//       );
//       toast.success(data.message);
//       setIsOpen(data.restaurant.isOpen);
//     } catch (error: any) {
//       console.log(error);
//       toast.error(error.restaurant.data.message);
//     }
//   };
//   const saveChanges = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.put(
//         `${restaurantService}/api/restaurant/edit`,
//         { name, description },
//         {
//           headers: {
//             Authorization: `Bearer${localStorage.getItem("token")}`,
//           },
//         },
//       );
//       onUpdate(data.restaurant);
//       toast.success(data.message);
//     } catch (error) {
//       console.log(error);
//       toast.error("Failed to update");
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <div className="mx-auto max-w-xl rounded-xl bg-white shadow-sm overflow-hidden">
//       {restaurant.image && (
//         <img
//           src={restaurant.image}
//           alt=""
//           className="h-48 w-full object-cover"
//         />
//       )}
//       <div className="p-5 space-y-4">
//         {isSeller && (
//           <div className="flex items-center justify-center">
//             <div>
//               {editMode ? (
//                 <input
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="w-full rounded border px-3 py-1 text-lg font-semibold"
//                 />
//               ) : (
//                 <h2 className="text-xl font-semibold">{restaurant.name}</h2>
//               )}
//               <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
//                 <BiMapPin className="h-4 w-4 text-red-500" />
//                 {restaurant.autoLocation.formattedAddress ||
//                   "Location unavalable"}
//               </div>
//             </div>
//             <button
//               onClick={() => setEditMode(!editMode)}
//               className="text-gray-500 hover:text-black"
//             >
//               <BiEdit size={1} />
//             </button>
//           </div>
//         )}
//         {editMode ? (
//           <textarea
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             className="w-full rounded px-3 py-2 text-sm"
//           />
//         ) : (
//           <p className="text-sm text-gray-600">
//             {restaurant.description || "No description added"}
//           </p>
//         )}
//         <div className="flex items-center justify-center pt-3 border-t">
//           <span
//             className={`text-sm font-medium ${isOpen ? "text-green-600" : "text-red-500"}`}
//           >
//             {isOpen ? "OPEN" : "CLOSE"}
//           </span>
//           <div className="flex gap-3">
//             {editMode && (
import { useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Edit3,
  MapPin,
  Save,
  Power,
  LogOut,
  Calendar,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { useAppData } from "../context/AppContext";

interface props {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}

const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);
  const { setIsAuth, setUser } = useAppData();

  const toggleOpenStatus = async () => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: !isOpen },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success(data.message);
      setIsOpen(data.restaurant.isOpen);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/edit`,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success(data.message);
      onUpdate(data.restaurant);
      setEditMode(false);
    } catch (error) {
      toast.error("Failed to update credentials");
    } finally {
      setLoading(false);
    }
  };

  const logoutHandler = async () => {
    try {
      await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: false },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
    } catch (e) { }

    localStorage.removeItem("token");
    setIsAuth(false);
    setUser(null);
    toast.success("Session terminated");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.04)] overflow-hidden"
    >
      {restaurant.image && (
        <div className="relative h-56 w-full group overflow-hidden">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
          <div className="absolute bottom-6 left-6 flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{isOpen ? 'System Live' : 'Maintenance Mode'}</span>
          </div>
        </div>
      )}

      <div className="p-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {editMode ? (
              <div className="relative group">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 rounded-xl border border-tomato-red/20 px-4 py-2 text-lg font-black text-gray-900 outline-none"
                  autoFocus
                />
              </div>
            ) : (
              <h2 className="text-3xl font-luxury text-gray-900 tracking-tight italic">{restaurant.name}</h2>
            )}

            <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
              <MapPin className="h-4 w-4 text-tomato-red opacity-80" />
              <span className="truncate max-w-[200px]">{restaurant.autoLocation.formattedAddress || "Location unavalable"}</span>
            </div>
          </div>

          {isSeller && (
            <button
              onClick={() => setEditMode(!editMode)}
              className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-tomato-red/10 hover:text-tomato-red transition-all shadow-sm"
            >
              <Edit3 size={18} />
            </button>
          )}
        </div>

        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100/50">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={14} className="text-gray-400" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description & Ethos</span>
          </div>
          {editMode ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-white rounded-xl border border-tomato-red/20 px-4 py-3 text-sm font-medium text-gray-700 outline-none resize-none shadow-sm"
            />
          ) : (
            <p className="text-sm text-gray-600 font-medium leading-relaxed italic">
              {restaurant.description || "Establishment mission statement pending..."}
            </p>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-50">
          <div className="flex flex-wrap gap-3">
            {editMode && (
              <button
                onClick={saveChanges}
                disabled={loading}
                className="flex-1 bg-gray-900 text-white !rounded-2xl px-6 py-4 text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
              >
                {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                Lock Credentials
              </button>
            )}

            {isSeller && (
              <button
                onClick={toggleOpenStatus}
                className={`flex-1 !rounded-2xl px-6 py-4 text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 border ${isOpen
                  ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                  : "bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
                  }`}
              >
                <Power size={16} />
                {isOpen ? "Suspend Store" : "Activate System"}
              </button>
            )}
          </div>

          <button
            onClick={logoutHandler}
            className="w-full bg-white text-gray-400 border border-gray-100 !rounded-2xl px-6 py-4 text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-gray-50 hover:text-tomato-red transition-all active:scale-95"
          >
            <LogOut size={16} />
            Terminate Session
          </button>
        </div>

        <div className="flex items-center justify-between pt-4 opacity-50">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Enrolled {new Date(restaurant.createdAt).toLocaleDateString()}</span>
          </div>
          <CheckCircle2 size={16} className="text-tomato-red" />
        </div>
      </div>
    </motion.div>
  );
};

export default RestaurantProfile;
