import { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin } from "lucide-react";
import DoctorCard from "../components/DoctorCard";
import DoctorDetailModal from "../components/DoctorDetailModal";
import DashboardLayout from "../components/shared/DashboardLayout";

const DoctorDirectory = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchName, setSearchName] = useState("");
    const [searchSpecialty, setSearchSpecialty] = useState("");
    const [locationLoading, setLocationLoading] = useState(false);

    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const fetchDoctors = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/public/doctors");
            setDoctors(response.data.doctors);
        } catch (error) {
            console.error(error);
            setError("Failed to load doctors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDoctors();
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
            if (searchSpecialty) {
                params.append("specialty", searchSpecialty);
            }
            const response = await api.get(`/public/doctors/search?${params.toString()}`);
            setDoctors(response.data.doctors);
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
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await api.get(
                        `/public/doctors/nearby?lat=${latitude}&lng=${longitude}&radius=10`,
                    );
                    setDoctors(response.data.doctors);
                } catch (error) {
                    console.error(error);
                    setError("Failed to find nearby doctors");
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
        setSearchSpecialty("");
        fetchDoctors();
    };

    return (
        <DashboardLayout showFooter hideSidebar>
            <div className='max-w-6xl mx-auto'>
                    <h1 className='text-2xl font-bold text-teal-900 mb-6'>Find a Doctor</h1>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                            <input
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                placeholder="Search by doctor name"
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />

                            <input
                                value={searchSpecialty}
                                onChange={(e) => setSearchSpecialty(e.target.value)}
                                placeholder="Specialty (e.g. Cardiology)"
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
                                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                            >
                                <MapPin className="w-4 h-4" />
                                {locationLoading ? "Locating..." : "Near Me"}
                            </button>
                        </form>
                    </div>

                    <div className='bg-gray-50'>
                        {loading ? (
                            <p>Loading doctors...</p>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : doctors.length === 0 ? (
                            <p className="text-gray-400 text-center py-12">No doctors found</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {doctors.map((doc) => (
                                    <DoctorCard 
                                        key={doc._id} 
                                        doctor={doc} 
                                        onClick={setSelectedDoctor} 
                                    />
                                ))}
                            </div>
                        )}

                        <DoctorDetailModal
                            doctor={selectedDoctor}
                            isOpen={!!selectedDoctor}
                            onClose={() => setSelectedDoctor(null)}
                        />
                    </div>  
            </div>
        </DashboardLayout>
    );
};

export default DoctorDirectory;