import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    ShieldCheck,
    Lock,
    ShoppingBag,
    CheckCircle2,
    Loader2,
    MapPin,
    CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAppData } from "../context/AppContext";
import { toast } from "react-hot-toast";
import axios from "axios";
import { restaurantService, utilsService } from "../main";

// Razorpay type
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface IAddress {
    _id: string;
    mobile: number;
    formattedAddress: string;
    location: {
        type: string;
        coordinates: [number, number];
    };
}

const Payments = () => {
    const navigate = useNavigate();
    const { cart, cartSubtotal, clearCart, fetchCart } = useAppData();
    const [addresses, setAddresses] = useState<IAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch user addresses
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const { data } = await axios.get(`${restaurantService}/api/address/all`, { headers });
                const addrs = data.addresses || data || [];
                setAddresses(addrs);
                if (addrs.length > 0) setSelectedAddressId(addrs[0]._id);
            } catch (error) {
                console.error("Error fetching addresses:", error);
            } finally {
                setLoadingAddresses(false);
            }
        };
        fetchAddresses();
    }, []);

    // Load Razorpay script
    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Full payment flow: create order → razorpay checkout → verify
    const handlePayment = async () => {
        if (!selectedAddressId) {
            toast.error("Please select a delivery address");
            return;
        }
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        setIsProcessing(true);

        try {
            // Step 1: Create order on backend
            const { data: orderData } = await axios.post(
                `${restaurantService}/api/order/new`,
                { paymentMethod: "razorpay", addressId: selectedAddressId },
                { headers }
            );

            const orderId = orderData.order?._id || orderData.orderId || orderData._id;
            if (!orderId) throw new Error("Order creation failed");

            // Step 2: Create Razorpay order
            const { data: paymentData } = await axios.post(
                `${utilsService}/api/payment/create`,
                { orderId },
                { headers }
            );

            // Step 3: Load Razorpay
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                toast.error("Payment gateway failed to load");
                setIsProcessing(false);
                return;
            }

            // Step 4: Open Razorpay checkout
            const options = {
                key: paymentData.key,
                amount: paymentData.amount,
                currency: "INR",
                name: "Tomato",
                description: "Food Order Payment",
                order_id: paymentData.razorpayOrderId,
                handler: async (response: any) => {
                    try {
                        // Step 5: Verify payment
                        await axios.post(
                            `${utilsService}/api/payment/verify`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId,
                            },
                            { headers }
                        );
                        toast.success("Payment successful! Order placed.");
                        clearCart();
                        navigate("/orders");
                    } catch {
                        toast.error("Payment verification failed");
                    }
                    setIsProcessing(false);
                },
                prefill: {},
                theme: { color: "#FF4433" },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                        toast.error("Payment cancelled");
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Order creation failed");
            setIsProcessing(false);
        }
    };

    // Calculate from backend subtotal
    const deliveryFee = cartSubtotal < 250 ? 49 : 0;
    const platformFee = 7;
    const total = cartSubtotal + deliveryFee + platformFee;

    if (cart.length === 0 && !isProcessing) {
        return (
            <div style={{
                minHeight: '100vh', backgroundColor: '#0a0a0f',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '24px', textAlign: 'center',
            }}>
                <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                }}>
                    <ShoppingBag size={28} style={{ color: 'rgba(255,255,255,0.2)' }} />
                </div>
                <h2 style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                    Cart is <span style={{ color: '#FF4433' }}>Empty</span>
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', maxWidth: 280, marginBottom: 24 }}>
                    Add some items before checking out.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="shimmer-btn"
                    style={{ padding: '10px 20px', borderRadius: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    <ChevronLeft size={16} /> Back to Menu
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px' }}>
                {/* Header */}
                <header style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: 12, borderRadius: 12,
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                            display: 'flex',
                        }}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <h1 style={{ fontSize: '1.8rem' }}>
                                <span style={{ color: '#FF4433' }}>Checkout</span>
                            </h1>
                            <ShieldCheck size={18} style={{ color: '#34d399' }} />
                        </div>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Secure Razorpay payment</p>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
                    {/* Address Selection */}
                    <div>
                        <h2 style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>
                            Select Delivery <span style={{ color: '#FF4433' }}>Address</span>
                        </h2>

                        {loadingAddresses ? (
                            <div style={{ display: 'flex', gap: 12 }}>
                                {[1, 2].map(i => (
                                    <div key={i} style={{
                                        height: 80, flex: 1, borderRadius: 12,
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                        animation: 'pulse 2s infinite',
                                    }} />
                                ))}
                            </div>
                        ) : addresses.length === 0 ? (
                            <div style={{
                                padding: 24, borderRadius: 12,
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                textAlign: 'center',
                            }}>
                                <MapPin size={24} style={{ color: 'rgba(255,255,255,0.2)', margin: '0 auto 8px' }} />
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>No addresses found</p>
                                <button
                                    onClick={() => navigate("/address")}
                                    className="shimmer-btn"
                                    style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12 }}
                                >
                                    Add Address
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                                {addresses.map(addr => {
                                    const isSelected = selectedAddressId === addr._id;
                                    return (
                                        <motion.button
                                            key={addr._id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedAddressId(addr._id)}
                                            style={{
                                                padding: 16, borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                                                background: isSelected ? 'rgba(255,68,51,0.06)' : 'rgba(255,255,255,0.03)',
                                                border: isSelected ? '1px solid rgba(255,68,51,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                                transition: 'all 0.2s',
                                                display: 'flex', gap: 12, alignItems: 'flex-start',
                                            }}
                                        >
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                                background: isSelected ? 'rgba(255,68,51,0.15)' : 'rgba(255,255,255,0.04)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {isSelected ? (
                                                    <CheckCircle2 size={14} style={{ color: '#FF4433' }} />
                                                ) : (
                                                    <MapPin size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                                                )}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{
                                                    fontSize: 12, fontWeight: 600,
                                                    color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.65)',
                                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                    margin: 0, marginBottom: 4, lineHeight: 1.4,
                                                }}>
                                                    {addr.formattedAddress}
                                                </p>
                                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                                                    📞 {addr.mobile}
                                                </p>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Order Summary + Pay Button */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 16, padding: 24,
                    }}>
                        <h2 style={{ fontSize: '1rem', color: '#fff', marginBottom: 20 }}>
                            Order <span style={{ color: '#FF4433' }}>Summary</span>
                        </h2>

                        {/* Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, maxHeight: 240, overflowY: 'auto' }}>
                            {cart.map(item => (
                                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 8, overflow: 'hidden',
                                            border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
                                        }}>
                                            <img
                                                src={item.itemId?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80"}
                                                alt={item.itemId?.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                                                {item.itemId?.name}
                                            </p>
                                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                                                {item.quauntity} × ₹{item.itemId?.price}
                                            </p>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                                        ₹{item.itemId?.price * item.quauntity}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Price Breakdown */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Subtotal</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>₹{cartSubtotal}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Delivery Fee</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: deliveryFee === 0 ? '#34d399' : 'rgba(255,255,255,0.7)' }}>
                                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Platform Fee</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>₹{platformFee}</span>
                            </div>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Total</span>
                                <span style={{ fontSize: 20, fontWeight: 700, color: '#FF4433' }}>₹{total}</span>
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div style={{
                            display: 'flex', gap: 12, padding: 16, borderRadius: 10,
                            background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.1)',
                            marginBottom: 20,
                        }}>
                            <Lock size={16} style={{ color: '#34d399', flexShrink: 0, marginTop: 2 }} />
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
                                Secured by Razorpay. 256-bit encrypted payment processing.
                            </p>
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing || !selectedAddressId || addresses.length === 0}
                            className={!isProcessing && selectedAddressId ? "shimmer-btn" : ""}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: 12,
                                fontSize: 14,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                cursor: isProcessing || !selectedAddressId ? 'not-allowed' : 'pointer',
                                background: isProcessing || !selectedAddressId ? 'rgba(255,255,255,0.05)' : undefined,
                                color: isProcessing || !selectedAddressId ? 'rgba(255,255,255,0.3)' : undefined,
                                border: isProcessing || !selectedAddressId ? '1px solid rgba(255,255,255,0.06)' : undefined,
                            }}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard size={16} />
                                    Pay ₹{total} with Razorpay
                                </>
                            )}
                        </button>

                        <p style={{ fontSize: 9, textAlign: 'center', marginTop: 12, color: 'rgba(255,255,255,0.2)', lineHeight: 1.4 }}>
                            By completing this transaction you agree to our terms of service.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments;
