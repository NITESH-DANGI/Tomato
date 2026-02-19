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
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { setIsAuth, setUser } = useAppData();

  const responseGoogle = async (authResult: any) => {
    setLoading(true);
    try {
      const result = await axios.post(`${authService}/api/auth/login/google`, {
        code: authResult["code"],
      });

      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setLoading(false);
      setUser(result.data.user);
      setIsAuth(true);

      if (!result.data.user.role) {
        navigate("/select-role");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Problem while login");
    }
  };

  const handleLocalAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login/local" : "/api/auth/sign";
      const payload = isLogin ? { email, password } : { name, email, password };

      const result = await axios.post(`${authService}${endpoint}`, payload);

      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setLoading(false);
      setUser(result.data.user);
      setIsAuth(true);

      if (!result.data.user.role) {
        navigate("/select-role");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.log(error);
      setLoading(false);
      toast.error(error.response?.data?.message || "Problem with local auth");
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
        className="w-full lg:w-1/2 flex items-center justify-center p-6 z-10"
      >
        <div className="w-full max-w-md space-y-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-0 text-center lg:text-left flex flex-col items-center lg:items-start"
          >
            <img
              src={logoText}
              alt="Tomato Logo"
              className="h-32 w-auto -mb-2 ml-[-16px] drop-shadow-[0_0_40px_rgba(255,77,77,0.4)] hover:scale-105 transition-transform duration-500"
            />
            <h1 className="text-5xl font-extrabold text-white tracking-tight leading-[0.85]">
              {isLogin ? "Welcome" : "Join"} <span className="text-[#FF4D4D]">{isLogin ? "Back" : "Us"}</span>
            </h1>
            <p className="text-gray-400 text-lg font-light mt-3">
              {isLogin ? "Deliciousness is just one click away." : "Start your culinary journey today."}
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-5"
          >
            <button
              onClick={() => googleLogin()}
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-4 rounded-xl border border-white/10 bg-white/5 py-3.5 text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98] disabled:opacity-50"
            >
              <FcGoogle size={22} className="group-hover:scale-110 transition-transform" />
              <span className="text-base font-bold tracking-wide">
                {loading ? "Preparing your table..." : "Continue with Google"}
              </span>
              <ChevronRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="mx-4 flex-shrink text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 text-nowrap">
                OR USE {isLogin ? "EMAIL" : "IDENTITY"}
              </span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <form onSubmit={handleLocalAuth} className="space-y-3.5">
              {!isLogin && (
                <div className="group relative">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm outline-none focus:border-[#FF4D4D]/50 focus:bg-white/[0.08] transition-all placeholder:text-gray-600 font-medium"
                  />
                </div>
              )}
              <div className="group relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm outline-none focus:border-[#FF4D4D]/50 focus:bg-white/[0.08] transition-all placeholder:text-gray-600 font-medium"
                />
              </div>
              <div className="group relative">
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm outline-none focus:border-[#FF4D4D]/50 focus:bg-white/[0.08] transition-all placeholder:text-gray-600 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF4D4D] text-white rounded-xl py-3.5 font-bold text-base hover:bg-[#FF3333] transition-all active:scale-[0.99] shadow-[0_10px_30px_rgba(255,77,77,0.2)] disabled:opacity-50"
              >
                {loading ? "Verifying..." : isLogin ? "Login" : "Create Account"}
              </button>
            </form>

            <div className="text-center pt-1">
              <p className="text-gray-500 text-sm font-medium">
                {isLogin ? "New to Tomato?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#FF4D4D] hover:underline transition-all font-bold"
                >
                  {isLogin ? "Sign Up" : "Login"}
                </button>
              </p>
            </div>
          </motion.div>

          <footer className="pt-2 text-center lg:text-left text-gray-500">
            <p className="text-[10px] font-medium uppercase tracking-wider">
              By joining, you agree to our{" "}
              <a href="#" className="text-[#FF4D4D] hover:underline transition-all">Terms</a> &{" "}
              <a href="#" className="text-[#FF4D4D] hover:underline transition-all">Privacy</a>
            </p>
          </footer>
        </div>
      </motion.div>

      {/* Right Section: Massive Card Showcase */}
      <div className="hidden lg:flex w-1/2 p-3 h-full items-center justify-center relative">
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
                y: [0, -10, 0],
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
                className="relative w-[480px] h-auto drop-shadow-[0_45px_90px_rgba(0,0,0,1)] max-h-[50vh] object-contain"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-4 space-y-3"
            >
              <h2 className="text-xl font-bold text-white tracking-tight leading-tight uppercase font-['Ubuntu',sans-serif]">Food Delivery <span className="text-[#FF4D4D]">reimagined</span></h2>
              <p className="text-gray-400 text-base max-w-sm mx-auto">Discover curated flavors and hidden gems near you with our premium platform.</p>

              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1A1A1A] bg-gray-800 flex items-center justify-center text-gray-400">
                      <User size={12} />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-[#1A1A1A] bg-[#FF4D4D] flex items-center justify-center text-[8px] text-white font-bold">
                    +2k
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">17k+ foodies joined</span>
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
