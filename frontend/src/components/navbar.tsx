import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import {
  ShoppingCart,
  LayoutDashboard,
  ClipboardList,
  Settings,
  Bike,
  Home,
  MapPinned,
} from "lucide-react";
import ProfileQuickView from "./ProfileQuickView";
import CartDrawer from "./CartDrawer";
import { motion } from "framer-motion";
import logoImg from "../assets/images/logo without text.png";

const Navbar = () => {
  const { user, isAuth, cart } = useAppData();
  const currLocation = useLocation();
  const [cartOpen, setCartOpen] = useState(false);

  const isLoginPage = currLocation.pathname === "/login";
  const isSelectRolePage = currLocation.pathname === "/select-role";

  if (isLoginPage || isSelectRolePage) return null;

  const role = user?.role;

  const customerLinks = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/orders", icon: ClipboardList, label: "Orders" },
    { to: "/address", icon: MapPinned, label: "Addresses" },
  ];

  const restaurantLinks = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/orders", icon: ClipboardList, label: "Orders" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const riderLinks = [
    { to: "/", icon: Bike, label: "Console" },
  ];

  const navLinks = role === "seller" ? restaurantLinks : role === "rider" ? riderLinks : customerLinks;


  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: 'rgba(10,10,15,0.92)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: '56px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
          }}
        >
          {/* ─── Left: Logo ─── */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img src={logoImg} alt="Tomato" style={{ height: '26px', width: 'auto' }} />
            <span style={{ fontWeight: 700, fontSize: '17px', color: '#fff', letterSpacing: '-0.02em' }}>
              Tomato
            </span>
          </Link>

          {/* ─── Center: Nav Links ─── */}
          {isAuth && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {navLinks.map(link => (
                <NavItem key={link.to} to={link.to} Icon={link.icon} label={link.label} />
              ))}
            </div>
          )}

          {/* ─── Right: Actions ─── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
            {!isAuth ? (
              <Link to="/login" className="shimmer-btn" style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '10px', textDecoration: 'none' }}>
                Login
              </Link>
            ) : (
              <>
                {/* Role Badges */}
                {role === "seller" && (
                  <div className="badge-success" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }} />
                    Restaurant
                  </div>
                )}
                {role === "rider" && (
                  <div className="badge-info" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Bike size={11} /> Rider
                  </div>
                )}

                {/* Cart Button (Customer only) */}
                {(!role || role === "customer") && (
                  <button
                    onClick={() => setCartOpen(true)}
                    style={{
                      position: 'relative',
                      padding: '8px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.color = '#FF4433';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    }}
                  >
                    <ShoppingCart size={17} />
                    {cart.length > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        height: '16px',
                        width: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        background: '#FF4433',
                        color: '#fff',
                        fontSize: '9px',
                        fontWeight: 900,
                        boxShadow: '0 0 0 2px #0a0a0f',
                      }}>
                        {cart.length}
                      </span>
                    )}
                  </button>
                )}

                <ProfileQuickView />
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

// ─── NavItem ───
const NavItem = ({ to, Icon, label }: { to: string; Icon: React.ComponentType<{ size?: number }>; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'all 0.2s',
        background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
        border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <Icon size={15} />
      <span>{label}</span>
    </Link>
  );
};

export default Navbar;
