import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

const RoomList = ({ hostelId }) => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRooms = async () => {
            if (!hostelId) return;
            setLoading(true);
            setError(null);

            try {
                const { data, error } = await supabase
                    .from('rooms')
                    .select('*')
                    .eq('hostel_id', hostelId)
                    .order('room_number', { ascending: true });

                if (error) throw error;
                setRooms(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();

        const roomSubscription = supabase
            .channel('public:rooms')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `hostel_id=eq.${hostelId}` }, payload => {
                fetchRooms();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(roomSubscription);
        };

    }, [hostelId]);

    if (loading) {
        return <p>Loading rooms...</p>;
    }

    if (error) {
        return <p className="text-red-500">Error loading rooms: {error}</p>;
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Room List</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Number</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rooms.map(room => (
                            <tr key={room.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.room_number}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.capacity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.current_occupancy}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${room.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {room.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {rooms.length === 0 && <p className="mt-4 text-center text-gray-500">No rooms found. Add a room to get started.</p>}
        </div>
    );
};

export default RoomList;