import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
    const { cart, cartSubtotal, incrementCart, decrementCart, clearCart } = useAppData();
    const navigate = useNavigate();

    const deliveryFee = cart.length > 0 && cartSubtotal < 250 ? 49 : 0;
    const platformFee = cart.length > 0 ? 7 : 0;
    const total = cartSubtotal + deliveryFee + platformFee;

    const handleCheckout = () => {
        onClose();
        navigate("/payments");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 60,
                        }}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            height: '100vh',
                            width: '100%',
                            maxWidth: '400px',
                            zIndex: 70,
                            background: '#111118',
                            borderLeft: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '20px 24px',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShoppingBag size={18} style={{ color: '#FF4433' }} />
                                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0, fontStyle: 'normal', fontFamily: 'Outfit, sans-serif' }}>
                                    Your Cart
                                </h2>
                                {cart.length > 0 && (
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: 'rgba(255,255,255,0.4)',
                                        background: 'rgba(255,255,255,0.06)',
                                        padding: '2px 8px',
                                        borderRadius: '100px',
                                    }}>
                                        {cart.length} {cart.length === 1 ? 'item' : 'items'}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '6px',
                                    borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                            {cart.length === 0 ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    textAlign: 'center',
                                    gap: '12px',
                                }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <ShoppingBag size={24} style={{ color: 'rgba(255,255,255,0.15)' }} />
                                    </div>
                                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                                        Your cart is empty
                                    </p>
                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                                        Browse restaurants to add items
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {/* Restaurant Name */}
                                    {cart[0] && (
                                        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                            From {cart[0].restaurantId?.name || "Restaurant"}
                                        </p>
                                    )}

                                    {cart.map(item => (
                                        <motion.div
                                            key={item._id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: 50 }}
                                            style={{
                                                display: 'flex',
                                                gap: '12px',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                            }}
                                        >
                                            {/* Item Image */}
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '10px',
                                                overflow: 'hidden',
                                                flexShrink: 0,
                                                border: '1px solid rgba(255,255,255,0.08)',
                                            }}>
                                                <img
                                                    src={item.itemId?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=100"}
                                                    alt={item.itemId?.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>

                                            {/* Item Details */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    color: 'rgba(255,255,255,0.85)',
                                                    margin: '0 0 4px 0',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}>
                                                    {item.itemId?.name}
                                                </p>
                                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#FF4433', margin: 0 }}>
                                                    ₹{item.itemId?.price}
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                                <button
                                                    onClick={() => decrementCart(item.itemId._id)}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(255,255,255,0.04)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: 'rgba(255,255,255,0.6)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    {item.quauntity === 1 ? <Trash2 size={12} style={{ color: '#ef4444' }} /> : <Minus size={12} />}
                                                </button>
                                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', minWidth: '20px', textAlign: 'center' }}>
                                                    {item.quauntity}
                                                </span>
                                                <button
                                                    onClick={() => incrementCart(item.itemId._id)}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(255,68,51,0.1)',
                                                        border: '1px solid rgba(255,68,51,0.2)',
                                                        color: '#FF4433',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Clear Cart */}
                                    <button
                                        onClick={clearCart}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            background: 'transparent',
                                            border: '1px solid rgba(239,68,68,0.15)',
                                            color: 'rgba(239,68,68,0.7)',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            marginTop: '4px',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                                            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)';
                                        }}
                                    >
                                        <Trash2 size={12} /> Clear Cart
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer / Checkout */}
                        {cart.length > 0 && (
                            <div style={{
                                padding: '20px 24px',
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                background: 'rgba(255,255,255,0.02)',
                            }}>
                                {/* Summary — matches backend order creation logic */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Subtotal</span>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>₹{cartSubtotal}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Delivery Fee</span>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: deliveryFee === 0 ? '#34d399' : 'rgba(255,255,255,0.7)' }}>
                                            {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Platform Fee</span>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>₹{platformFee}</span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        paddingTop: '8px',
                                        borderTop: '1px solid rgba(255,255,255,0.06)',
                                    }}>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Total</span>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#FF4433' }}>₹{total}</span>
                                    </div>
                                </div>

                                {/* Checkout Button */}
                                <button
                                    onClick={handleCheckout}
                                    className="shimmer-btn"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Proceed to Checkout <ArrowRight size={16} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
