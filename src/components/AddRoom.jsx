import { useState } from 'react';
import { supabase } from '../supabase/client';

const AddRoom = ({ hostelId, onRoomAdded }) => {
    const [roomNumber, setRoomNumber] = useState('');
    const [capacity, setCapacity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAddRoom = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from('rooms')
                .insert([{ room_number: roomNumber, capacity: parseInt(capacity), hostel_id: hostelId, status: 'available' }])
                .select();

            if (error) throw error;

            if (onRoomAdded) {
                onRoomAdded(data[0]);
            }
            setRoomNumber('');
            setCapacity('');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Add New Room</h2>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleAddRoom}>
                <div className="mb-4">
                    <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">Room Number</label>
                    <input
                        type="text"
                        id="roomNumber"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity</label>
                    <input
                        type="number"
                        id="capacity"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                    {loading ? 'Adding...' : 'Add Room'}
                </button>
            </form>
        </div>
    );
};

export default AddRoom;