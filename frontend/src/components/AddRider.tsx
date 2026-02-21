import { useState } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import { riderService } from "../main";
import axios from "axios";
import { motion } from "framer-motion";
import {
    Bike,
    Phone,
    CreditCard,
    FileBadge,
    Upload,
    MapPin,
    CheckCircle2,
    ArrowRight,
    ShieldCheck,
    Zap
} from "lucide-react";

interface props {
    onComplete: () => Promise<void>;
}

const AddRider = ({ onComplete }: props) => {
    const [phone, setPhone] = useState("");
    const [aadhar, setAadhar] = useState("");
    const [license, setLicense] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { loadingLocation, location } = useAppData();

    const handleSubmit = async () => {
        if (!phone || !aadhar || !license || !image || !location) {
            toast.error("Credentials, visual identification, and coordinates are mandatory.");
            return;
        }

        const formData = new FormData();
        formData.append("phoneNumber", phone);
        formData.append("aadharNumber", aadhar);
        formData.append("drivingLicenseNumber", license);
        formData.append("latitude", String(location.latitude));
        formData.append("longitude", String(location.longitude));
        formData.append("file", image);

        try {
            setSubmitting(true);
            const token = localStorage.getItem("token");
            await axios.post(`${riderService}/api/rider/new`, formData, {
                headers: token ? {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                } : {},
            });

            toast.success("Rider Protocol Initialized Successfully");
            onComplete();
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || "Tactical Error: Deployment Failed";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0D0D0D] font-outfit px-6 md:px-12 py-12 flex items-center justify-center relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-tomato-red/5 blur-[100px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-4xl bg-[#161616] rounded-[4rem] p-12 md:p-20 border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-24 opacity-[0.03] pointer-events-none">
                    <Bike size={400} strokeWidth={0.5} className="text-white" />
                </div>

                <header className="mb-16">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div className="h-[1px] w-12 bg-white/10"></div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Logistics Enrollment</span>
                    </div>
                    <h1 className="text-6xl md:text-7xl font-luxury text-white mb-4 italic tracking-tight leading-none">Join the <br /> <span className="font-outfit font-black not-italic text-tomato-red uppercase lg:text-8xl">Vanguard</span></h1>
                    <p className="text-lg text-gray-500 font-medium max-w-xl mt-6 italic">Initialize your rider profile. Access the high-speed Tomato dispatch mainframe.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-4">Direct Secure Line</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    placeholder="+91 0000 0000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-white/5 rounded-[2rem] border border-white/5 focus:border-blue-500/30 focus:bg-white/[0.07] px-8 py-5 outline-none text-white font-black transition-all shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-4">Identification Badge (Aadhar)</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    placeholder="0000 0000 0000"
                                    value={aadhar}
                                    onChange={(e) => setAadhar(e.target.value)}
                                    className="w-full bg-white/5 rounded-[2rem] border border-white/5 focus:border-blue-500/30 focus:bg-white/[0.07] px-8 py-5 outline-none text-white font-black transition-all shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-4">Pilot Credentials (License)</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="DL-00-0000000"
                                    value={license}
                                    onChange={(e) => setLicense(e.target.value)}
                                    className="w-full bg-white/5 rounded-[2rem] border border-white/5 focus:border-blue-500/30 focus:bg-white/[0.07] px-8 py-5 outline-none text-white font-black transition-all shadow-inner uppercase"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10 flex flex-col justify-between">
                        <div className="space-y-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-4">Biometric Identification</label>
                                <label className="flex flex-col cursor-pointer group">
                                    <div className="flex items-center gap-6 bg-white/5 hover:bg-white/[0.07] border border-white/5 hover:border-blue-500/20 rounded-[2.5rem] p-6 transition-all relative overflow-hidden">
                                        <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                            {image ? <CheckCircle2 size={32} /> : <Upload size={32} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white truncate tracking-tight uppercase leading-none mb-2">{image ? image.name : "Upload Media"}</p>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Clear Facial Visibility Required</p>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                                    />
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-4">Deployment Origin (Location)</label>
                                <div className="flex items-center gap-6 bg-white/5 rounded-[2.5rem] p-6 border border-white/5 relative overflow-hidden group">
                                    <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center text-gray-600">
                                        <MapPin size={32} className={loadingLocation ? "animate-pulse text-tomato-red" : ""} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-2">{loadingLocation ? "Syncing GPS..." : "Coordinate Locked"}</p>
                                        <p className="text-xs font-black text-white/50 truncate italic pr-4">
                                            {location?.formattedAddress || "Authorizing Geospatial Data..."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                            <button
                                disabled={submitting}
                                onClick={handleSubmit}
                                className="w-full bg-white hover:bg-tomato-red hover:text-white text-black py-8 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-6 transition-all shadow-[0_20px_50px_-10px_rgba(255,255,255,0.05)] active:scale-[0.98] disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-5 h-5 border-[3px] border-black/20 border-t-black rounded-full animate-spin"></div>
                                        Establishing...
                                    </>
                                ) : (
                                    <>
                                        Initialize Protocol
                                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                            <div className="flex items-center justify-center gap-3 mt-8 text-gray-600">
                                <ShieldCheck size={14} />
                                <p className="text-[9px] font-black uppercase tracking-widest">Secured Rider Protocol v1.9</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AddRider;
