import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/protectedRoute.tsx";
import PublicRoute from "./components/publicRoute.tsx";
import SelectRole from "./pages/SelectRole.tsx";
import Navbar from "./components/navbar.tsx";
import Account from "./pages/Account.tsx";
import { useAppData } from "./context/AppContext.tsx";
import Restaurant from "./pages/Restaurant.tsx";
import RiderHome from "./pages/RiderHome.tsx";
import Orders from "./pages/Orders.tsx";
import Addresses from "./pages/Addresses.tsx";
import Payments from "./pages/Payments.tsx";
import Notifications from "./pages/Notifications.tsx";
import Settings from "./pages/Settings.tsx";
import Menu from "./pages/Menu.tsx";
import { SocketProvider } from "./context/SocketProvider.tsx";

const App = () => {
  const { user, loading } = useAppData()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-tomato-red"></div>
            <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border border-tomato-red/20"></div>
          </div>
          <p className="font-semibold text-white/40 text-sm tracking-wider uppercase">Loading Tomato</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <SocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              fontSize: "14px",
            },
          }}
        />
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', color: '#e2e2e8' }}>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/"
                element={
                  user?.role === "seller" ? <Restaurant /> :
                    user?.role === "rider" ? <RiderHome /> :
                      <Home />
                }
              />
              <Route path="/select-role" element={<SelectRole />} />
              <Route path="/account" element={<Account />} />
              <Route path="/menu/:id" element={<Menu />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/address" element={<Addresses />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Global Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </SocketProvider>
    </BrowserRouter>
  );
};

export default App;
