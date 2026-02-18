import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useAppData } from "../context/AppContext";
import { motion } from "framer-motion";
import { ChevronRight, User } from "lucide-react";
import logoText from "../assets/images/logo with text.png";
import mascotTransparent from "../assets/images/mascot transparent bg.png";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { setIsAuth, setUser } = useAppData();

  const responseGoogle = async (authResult: any) => {
    setLoading(true);
    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult["code"],
      });

      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setLoading(false);
      setUser(result.data.user);
      setIsAuth(true);
      navigate("/");
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Problem while login");
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    ux_mode: "popup",
    scope: "openid profile email",
    onSuccess: async (tokenResponse) => {
      responseGoogle(tokenResponse);
    },
    onError: () => toast.error("Google Login Failed"),
  });

  return (
    <div className="flex h-screen w-full bg-[#0D0D0D] overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Left Section: Login Form */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10"
      >
        <div className="w-full max-w-md space-y-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-0 text-center lg:text-left flex flex-col items-center lg:items-start"
          >
            <img
              src={logoText}
              alt="Tomato Logo"
              className="h-56 w-auto -mb-4 ml-[-28px] drop-shadow-[0_0_40px_rgba(255,77,77,0.4)] hover:scale-105 transition-transform duration-500"
            />
            <h1 className="text-6xl font-extrabold text-white tracking-tight leading-[0.85]">
              Welcome <span className="text-[#FF4D4D]">Back</span>
            </h1>
            <p className="text-gray-400 text-xl font-light mt-4">Deliciousness is just one click away.</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            <button
              onClick={() => googleLogin()}
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 py-5 text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98] disabled:opacity-50"
            >
              <FcGoogle size={28} className="group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold tracking-wide">
                {loading ? "Preparing your table..." : "Continue with Google"}
              </span>
              <ChevronRight className="ml-2 h-6 w-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="mx-6 flex-shrink text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                Alternative Entry
              </span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <div className="space-y-4">
              <div className="group relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-[#FF4D4D]/50 focus:bg-white/[0.08] transition-all placeholder:text-gray-600 font-medium"
                />
                <motion.button
                  whileHover={{ x: 5 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-[#FF4D4D] opacity-50 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight size={24} />
                </motion.button>
              </div>
            </div>
          </motion.div>

          <footer className="pt-6 text-center sm:text-left text-gray-400">
            <p className="text-sm font-medium">
              By joining, you agree to our{" "}
              <a href="#" className="text-[#FF4D4D] hover:underline transition-all">Terms</a> &{" "}
              <a href="#" className="text-[#FF4D4D] hover:underline transition-all border-b border-white/5 pb-0.5">Privacy</a>
            </p>
          </footer>
        </div>
      </motion.div>

      {/* Right Section: Massive Card Showcase */}
      <div className="hidden lg:flex w-1/2 p-1.5 h-full items-center justify-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-full h-full bg-[#1A1A1A] rounded-[1rem] overflow-hidden flex flex-col items-center justify-center shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/5"
        >
          {/* Background Decor */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-[#FF4D4D]/10 rounded-full blur-[120px]"></div>
            <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[100px]"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center px-12 text-center h-full justify-center">
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 1, -1, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-[#FF4D4D]/20 blur-[80px] rounded-full scale-75"></div>
              <img
                src={mascotTransparent}
                alt="Tomato Mascot"
                className="relative w-[560px] h-auto drop-shadow-[0_45px_90px_rgba(0,0,0,1)] max-h-[62vh] object-contain"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6 space-y-4"
            >
              <h2 className="text-2xl font-bold text-white tracking-tight leading-tight uppercase font-['Ubuntu',sans-serif]">Food Delivery <span className="text-[#FF4D4D]">reimagined</span></h2>
              <p className="text-gray-400 text-lg max-w-sm mx-auto">Discover curated flavors and hidden gems near you with our premium platform.</p>

              <div className="flex items-center justify-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-[#1A1A1A] bg-gray-800 flex items-center justify-center text-gray-400">
                      <User size={14} />
                    </div>
                  ))}
                  <div className="w-9 h-9 rounded-full border-2 border-[#1A1A1A] bg-[#FF4D4D] flex items-center justify-center text-[9px] text-white font-bold">
                    +2k
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">17k+ foodies joined</span>
              </div>
            </motion.div>
          </div>

          {/* Sparkles */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 bg-[#FF4D4D] rounded-full opacity-30"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
