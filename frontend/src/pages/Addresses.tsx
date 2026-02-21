import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { restaurantService } from "../main";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
    MapPin,
    Plus,
    Trash2,
    Navigation,
    X,
    Phone,
    Crosshair,
    Loader2,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface IAddress {
    _id: string;
    mobile: number;
    formattedAddress: string;
    location: {
        type: string;
        coordinates: [number, number]; // [lng, lat]
    };
    createdAt: string;
}

// Map click handler component
const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Fly-to component
const FlyToLocation = ({ lat, lng }: { lat: number; lng: number }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 16, { duration: 1 });
        }
    }, [lat, lng, map]);
    return null;
};

const Addresses = () => {
    const [addresses, setAddresses] = useState<IAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [locating, setLocating] = useState(false);
    const [mobile, setMobile] = useState("");
    const [formattedAddress, setFormattedAddress] = useState("");
    const [latitude, setLatitude] = useState(20.5937); // Default: India center
    const [longitude, setLongitude] = useState(78.9629);
    const [markerSet, setMarkerSet] = useState(false);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${restaurantService}/api/address/all`, { headers });
            setAddresses(data.addresses || data || []);
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    // Reverse geocode via Nominatim
    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await res.json();
            if (data.display_name) {
                setFormattedAddress(data.display_name);
            }
        } catch {
            // silently fail
        }
    };

    const handleLocationSelect = (lat: number, lng: number) => {
        setLatitude(lat);
        setLongitude(lng);
        setMarkerSet(true);
        reverseGeocode(lat, lng);
    };

    const useMyLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation not supported");
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                handleLocationSelect(pos.coords.latitude, pos.coords.longitude);
                setLocating(false);
            },
            () => {
                toast.error("Unable to get location");
                setLocating(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!markerSet) {
            toast.error("Please select a location on the map");
            return;
        }
        if (!mobile || mobile.length < 10) {
            toast.error("Please enter a valid mobile number");
            return;
        }
        if (!formattedAddress.trim()) {
            toast.error("Please enter or auto-fill an address");
            return;
        }

        setSaving(true);
        try {
            await axios.post(
                `${restaurantService}/api/address/new`,
                { mobile: Number(mobile), formattedAddress, latitude, longitude },
                { headers }
            );
            toast.success("Address added!");
            setShowForm(false);
            setMobile("");
            setFormattedAddress("");
            setMarkerSet(false);
            fetchAddresses();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error adding address");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${restaurantService}/api/address/${id}`, { headers });
            toast.success("Address removed");
            fetchAddresses();
        } catch {
            toast.error("Error deleting address");
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f' }}>
            <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div
                            style={{
                                width: 40, height: 40, borderRadius: 12,
                                background: 'rgba(255,68,51,0.1)', border: '1px solid rgba(255,68,51,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <MapPin size={18} style={{ color: '#FF4433' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.8rem' }}>Saved <span style={{ color: '#FF4433' }}>Addresses</span></h1>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                                {addresses.length} locations saved
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="shimmer-btn"
                        style={{ padding: '8px 16px', borderRadius: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <Plus size={16} /> Add New
                    </button>
                </div>

                {/* Add Form with Map */}
                <AnimatePresence>
                    {showForm && (
                        <motion.form
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-6"
                            onSubmit={handleAdd}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 16,
                                padding: 24,
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h2 style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)' }}>
                                    New <span style={{ color: '#FF4433' }}>Address</span>
                                </h2>
                                <button type="button" onClick={() => setShowForm(false)} style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Map */}
                            <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16, border: '1px solid rgba(255,255,255,0.08)', height: 300 }}>
                                <MapContainer
                                    center={[latitude, longitude]}
                                    zoom={markerSet ? 16 : 5}
                                    style={{ height: '100%', width: '100%' }}
                                    scrollWheelZoom={true}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <MapClickHandler onLocationSelect={handleLocationSelect} />
                                    {markerSet && <FlyToLocation lat={latitude} lng={longitude} />}
                                    {markerSet && <Marker position={[latitude, longitude]} icon={defaultIcon} />}
                                </MapContainer>
                            </div>

                            {/* Use My Location Button */}
                            <button
                                type="button"
                                onClick={useMyLocation}
                                disabled={locating}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '10px 16px', borderRadius: 10, marginBottom: 16,
                                    background: 'rgba(255,68,51,0.08)', border: '1px solid rgba(255,68,51,0.2)',
                                    color: '#FF4433', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    width: '100%', justifyContent: 'center',
                                }}
                            >
                                {locating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
                                {locating ? "Getting your location..." : "Use My Location"}
                            </button>

                            {/* Form Fields */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>
                                        Address
                                    </label>
                                    <textarea
                                        value={formattedAddress}
                                        onChange={(e) => setFormattedAddress(e.target.value)}
                                        placeholder="Click on map or use location to auto-fill"
                                        required
                                        rows={2}
                                        className="glass-input"
                                        style={{ width: '100%', fontSize: 13, resize: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>
                                        Mobile Number
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                        <input
                                            type="tel"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                            placeholder="10-digit mobile"
                                            required
                                            className="glass-input"
                                            style={{ width: '100%', paddingLeft: 36, fontSize: 13 }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>
                                        Coordinates
                                    </label>
                                    <div className="glass-input" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Navigation size={12} />
                                        {markerSet ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : "Click map to set"}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="shimmer-btn"
                                    style={{ padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600 }}
                                >
                                    {saving ? "Saving..." : "Save Address"}
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Address Cards */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                style={{
                                    height: 120, borderRadius: 16,
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    animation: 'pulse 2s infinite',
                                }}
                            />
                        ))}
                    </div>
                ) : addresses.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', textAlign: 'center' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                        }}>
                            <MapPin size={24} style={{ color: 'rgba(255,255,255,0.15)' }} />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>No addresses saved</h2>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Add your first delivery address</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                        {addresses.map((addr, i) => (
                            <motion.div
                                key={addr._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 16,
                                    padding: 20,
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                }}
                            >
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                        background: 'rgba(255,68,51,0.1)', border: '1px solid rgba(255,68,51,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <MapPin size={18} style={{ color: '#FF4433' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
                                            marginBottom: 4, lineHeight: 1.4,
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}>
                                            {addr.formattedAddress}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Phone size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
                                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                                                {addr.mobile}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(addr._id)}
                                        style={{
                                            padding: 8, borderRadius: 8,
                                            background: 'transparent', border: 'none',
                                            color: 'rgba(255,255,255,0.15)', cursor: 'pointer',
                                            transition: 'all 0.2s', flexShrink: 0,
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.color = '#ef4444';
                                            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.color = 'rgba(255,255,255,0.15)';
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Addresses;
