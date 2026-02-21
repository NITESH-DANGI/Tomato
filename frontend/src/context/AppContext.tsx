import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authService } from "../main";
import type { AppContextType, LocationData, User, CartItem } from "../types";
import { Toaster } from "react-hot-toast";
import { restaurantService } from "../main";
import { toast } from "react-hot-toast";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [city, setCity] = useState("Fetching location...");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartSubtotal, setCartSubtotal] = useState(0);

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // ─── Cart Functions (matching backend exactly) ───

  const fetchCart = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/cart/all`, {
        headers: headers(),
      });
      setCart(data.cart || []);
      setCartSubtotal(data.subtotal || 0);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const addToCart = async (restaurantId: string, itemId: string) => {
    try {
      await axios.post(
        `${restaurantService}/api/cart/add`,
        { restaurantId, itemId },
        { headers: headers() }
      );
      toast.success("Added to cart");
      fetchCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error adding to cart");
    }
  };

  const incrementCart = async (itemId: string) => {
    try {
      await axios.put(
        `${restaurantService}/api/cart/inc`,
        { itemId },
        { headers: headers() }
      );
      fetchCart();
    } catch (error) {
      console.error("Error incrementing:", error);
    }
  };

  const decrementCart = async (itemId: string) => {
    try {
      await axios.put(
        `${restaurantService}/api/cart/dec`,
        { itemId },
        { headers: headers() }
      );
      fetchCart();
    } catch (error) {
      console.error("Error decrementing:", error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${restaurantService}/api/cart/clear`, {
        headers: headers(),
      });
      setCart([]);
      setCartSubtotal(0);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // ─── Auth ───

  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(`${authService}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(data);
      setIsAuth(true);
      fetchCart();
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  // ─── Location ───

  useEffect(() => {
    if (!navigator.geolocation)
      return alert("Please Allow Location to continue");
    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        );
        const data = await res.json();
        setLocation({
          latitude,
          longitude,
          formattedAddress: data.display_name || "current location",
        });
        setCity(
          data.address.city ||
          data.address.town ||
          data.address.village ||
          "Your location",
        );
        setLoadingLocation(false);
      } catch (error) {
        setLocation({
          latitude,
          longitude,
          formattedAddress: "current location",
        });
        setCity("Failed to fetch location");
        setLoadingLocation(false);
      }
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuth,
        loading,
        location,
        loadingLocation,
        city,
        cart,
        cartSubtotal,
        addToCart,
        incrementCart,
        decrementCart,
        clearCart,
        fetchCart,
        setUser,
        setIsAuth,
        setLoading,
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppProvider");
  }
  return context;
};
