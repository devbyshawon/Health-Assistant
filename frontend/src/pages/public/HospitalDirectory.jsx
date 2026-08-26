import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardLayout from "../../components/shared/DashboardLayout";
import { MapPin } from "lucide-react";
import HospitalCard from "../../components/HospitalCard";

const HospitalDirectory = () => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchName, setSearchName] = useState("");
    const [locationLoading, setLocationLoading] = useState(false);

    const { user } = useAuth();

    const fetchHospitals = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/public/hospitals");
            setHospitals(response.data.hospitals);
        } catch (error) {
            console.error(error);
            setError("Failed to load hospitals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchHospitals();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchName) {
                params.append("name", searchName);
            }
            const response = await api.get(`/public/hospitals/search?${params.toString()}`);
            setHospitals(response.data.hospitals);
        } catch (error) {
            console.error(error);
            setError("Search failed");
        } finally {
            setLoading(false);
        }
    };

    const findNearby = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }
        setSearchName('');
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await api.get(
                        `/public/hospitals/nearby?lat=${latitude}&lng=${longitude}&radius=10`,
                    );
                    setHospitals(response.data.hospitals);
                } catch (error) {
                    console.error(error);
                    setError("Failed to find nearby hospitals");
                } finally {
                    setLocationLoading(false);
                }
            },
            (error) => {
                console.error(error);
                setError("Location permission denied. Please enable location access.");
                setLocationLoading(false);
            }
        );
    };

    const handleClear = () => {
        setSearchName("");
        fetchHospitals();
    };

    return (
        <DashboardLayout showFooter={!user} hideSidebar={!user}>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>Verified Hospitals</h1>
                    <p className='text-sm text-gray-500 mt-1'>Browse admin-verified hospitals and clinics, or find ones near you.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                        <input
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            placeholder="Search by hospital name"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />

                        <button
                            type="submit"
                            className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
                        >
                            Search
                        </button>

                        <button
                            type="button"
                            onClick={handleClear}
                            className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
                        >
                            Clear
                        </button>

                        <button
                            type="button"
                            onClick={findNearby}
                            disabled={locationLoading}
                            className="border border-gray-300 text-teal-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                        >
                            <MapPin className="w-4 h-4" />
                            {locationLoading ? "Locating..." : "Near Me"}
                        </button>
                    </form>
                </div>

                {loading ? (
                    <p>Loading hospitals...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : hospitals.length === 0 ? (
                    <p className="text-gray-400 text-center py-12">No hospitals found</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hospitals.map((hospital) => (
                            <HospitalCard key={hospital._id} hospital={hospital} />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default HospitalDirectory;