import type React from "react";

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  avatar?: string;
  role: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export interface CartItem {
  _id: string;
  itemId: {
    _id: string;
    name: string;
    price: number;
    image: string;
    description?: string;
    isAvailable?: boolean;
  };
  restaurantId: {
    _id: string;
    name: string;
  };
  quauntity: number;
}

export interface AppContextType {
  user: User | null;
  isAuth: boolean;
  loading: boolean;
  location: LocationData | null;
  loadingLocation: boolean;
  city: string;
  cart: CartItem[];
  cartSubtotal: number;
  addToCart: (restaurantId: string, itemId: string) => void;
  incrementCart: (itemId: string) => void;
  decrementCart: (itemId: string) => void;
  clearCart: () => void;
  fetchCart: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IRestaurant {
  _id: string,
  name: string;
  description?: string;
  image: string;
  ownerId: string;
  phone: number;
  isVerified: boolean;

  autoLocation: {
    type: "Point";
    coordinates: [number, number];
    formattedAddress: string;
  };

  isOpen: boolean;
  createdAt: Date;
}