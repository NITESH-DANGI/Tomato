import React from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAppData } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ProfileQuickView: React.FC = () => {
    const { user, setIsAuth, setUser } = useAppData();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuth(false);
        setUser(null);
        toast.success("Logged out successfully");
        navigate("/login");
    };

    return (
        <div className="relative group">
            <button className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="w-7 h-7 rounded-lg bg-tomato-red/20 flex items-center justify-center text-tomato-red overflow-hidden">
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <User size={14} />
                    )}
                </div>
                <span className="text-xs font-bold text-white/80 leading-none hidden md:inline">{user?.name || 'Guest'}</span>
                <ChevronDown size={12} className="text-white/30 group-hover:text-tomato-red transition-colors" />
            </button>

            {/* Dropdown */}
            <div className="absolute top-full right-0 mt-2 w-48 glass-card rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                <div className="p-2">
                    <button
                        onClick={() => navigate('/account')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-tomato-red rounded-lg transition-colors"
                    >
                        <User size={14} />
                        <span>Profile</span>
                    </button>
                    <button
                        onClick={() => navigate('/settings')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-tomato-red rounded-lg transition-colors"
                    >
                        <Settings size={14} />
                        <span>Settings</span>
                    </button>
                    <hr className="my-1 border-white/10" />
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <LogOut size={14} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileQuickView;
