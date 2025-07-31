import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

const Dashboard = ({ hostelId }) => {
    const [stats, setStats] = useState({ rooms: 0, students: 0, occupancy: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!hostelId) return;
            setLoading(true);
            setError(null);

            try {
                const { data: roomsData, error: roomsError } = await supabase
                    .from('rooms')
                    .select('id, capacity, current_occupancy')
                    .eq('hostel_id', hostelId);

                if (roomsError) throw roomsError;

                const { count: studentsCount, error: studentsError } = await supabase
                    .from('students')
                    .select('*', { count: 'exact', head: true })
                    .eq('hostel_id', hostelId);

                if (studentsError) throw studentsError;

                const totalCapacity = roomsData.reduce((acc, room) => acc + room.capacity, 0);
                const totalOccupancy = roomsData.reduce((acc, room) => acc + room.current_occupancy, 0);
                const occupancyPercentage = totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0;

                setStats({
                    rooms: roomsData.length,
                    students: studentsCount,
                    occupancy: occupancyPercentage.toFixed(2),
                });
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [hostelId]);

    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    if (error) {
        return <p className="text-red-500">Error loading dashboard: {error}</p>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Hostel Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-medium text-gray-700">Total Rooms</h3>
                    <p className="text-3xl font-bold text-indigo-600">{stats.rooms}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-medium text-gray-700">Total Students</h3>
                    <p className="text-3xl font-bold text-indigo-600">{stats.students}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-medium text-gray-700">Occupancy Rate</h3>
                    <p className="text-3xl font-bold text-indigo-600">{stats.occupancy}%</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;