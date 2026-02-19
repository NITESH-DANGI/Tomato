import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import { ShoppingCart, User, Search, MapPin } from "lucide-react";
import logoText from "../assets/images/logo with text.png";

const Navbar = () => {
  const { isAuth, city } = useAppData();
  const currLocation = useLocation();

  const isHomePage = currLocation.pathname === "/";
  const isLoginPage = currLocation.pathname === "/login";
  const isSelectRolePage = currLocation.pathname === "/select-role";

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // If on login or select-role page, hide global navbar as they have their own integrated layouts
  if (isLoginPage || isSelectRolePage) return null;

  return (
    <div className={`w-full bg-white shadow-sm border-b border-gray-100 z-50 transition-all duration-300`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          to={"/"}
          className="flex items-center gap-2"
        >
          <img src={logoText} alt="Tomato" className="h-8 w-auto" />
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to={"/cart"}
            className="group relative flex items-center justify-center p-2 rounded-full hover:bg-gray-50 transition-colors"
          >
            <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-[#FF4D4D] transition-colors" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF4D4D] text-[10px] text-white font-bold ring-2 ring-white">
              0
            </span>
          </Link>

          {isAuth ? (
            <Link to="/account" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all font-semibold">
              <User size={18} />
              <span>Account</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2 rounded-xl bg-[#FF4D4D] text-white hover:bg-[#D62828] transform active:scale-95 transition-all font-bold shadow-lg shadow-red-500/20"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {isHomePage && (
        <div className="bg-white px-6 pb-4">
          <div className="mx-auto flex max-w-7xl items-center rounded-2xl bg-gray-50 border border-gray-100 shadow-inner px-4 focus-within:ring-2 focus-within:ring-[#FF4D4D]/20 transition-all">
            <div className="flex items-center gap-2 py-3 border-r border-gray-200 pr-4">
              <MapPin className="h-4 w-4 text-[#FF4D4D]" />
              <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{city || "Location"}</span>
            </div>
            <div className="flex flex-1 items-center gap-3 pl-4">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for restaurants, cuisines or a dish"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-3 text-sm font-medium outline-none text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
