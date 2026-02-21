import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { realtimeService } from "../main";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const socket = io(realtimeService, {
            auth: { token },
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 2000,
            reconnectionAttempts: 10,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("[Socket] Connected:", socket.id);
            setIsConnected(true);
        });

        socket.on("disconnect", () => {
            console.log("[Socket] Disconnected");
            setIsConnected(false);
        });

        // ─── Global event listeners for toasts ───
        socket.on("order:update", (payload: any) => {
            const statusMap: Record<string, string> = {
                accepted: "🟢 Your order has been accepted!",
                preparing: "👨‍🍳 Your order is being prepared",
                ready_for_rider: "📦 Order is ready for pickup",
                picked_up: "🚴 Rider has picked up your order",
                on_the_way: "🛵 Your order is on the way!",
                delivered: "✅ Order delivered!",
            };
            const message = statusMap[payload?.status] || `Order updated: ${payload?.status}`;
            toast(message, {
                style: {
                    background: "#111",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                },
                duration: 4000,
            });
        });

        socket.on("order:available", (payload: any) => {
            toast("🔔 New order available for delivery!", {
                style: {
                    background: "#FF4433",
                    color: "#fff",
                    fontWeight: "bold",
                },
                duration: 8000,
            });
        });

        socket.on("order:rider_assigned", (payload: any) => {
            toast("🚴 A rider has been assigned to the order", {
                style: {
                    background: "#111",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                },
                duration: 4000,
            });
        });

        socket.on("connect_error", (err) => {
            console.warn("[Socket] Connection error:", err.message);
        });

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = (): SocketContextType => {
    return useContext(SocketContext);
};
