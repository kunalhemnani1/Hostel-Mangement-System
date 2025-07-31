import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

const AddStudent = ({ hostelId, onStudentAdded }) => {
    const [name, setName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [roomId, setRoomId] = useState('');
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAvailableRooms = async () => {
            try {
                const { data, error } = await supabase
                    .from('rooms')
                    .select('id, room_number, capacity, current_occupancy')
                    .eq('hostel_id', hostelId)
                    .eq('status', 'available');

                if (error) throw error;

                const roomsWithSpace = data.filter(room => room.current_occupancy < room.capacity);
                setAvailableRooms(roomsWithSpace);
            } catch (error) {
                setError(error.message);
            }
        };

        if (hostelId) {
            fetchAvailableRooms();
        }
    }, [hostelId]);

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Add student
            const { data: studentData, error: studentError } = await supabase
                .from('students')
                .insert([{ name, student_id: studentId, room_id: roomId || null, hostel_id: hostelId }])
                .select();

            if (studentError) throw studentError;

            // Update room occupancy
            if (roomId) {
                const room = availableRooms.find(r => r.id === roomId);
                if (room) {
                    const newOccupancy = room.current_occupancy + 1;
                    const newStatus = newOccupancy >= room.capacity ? 'full' : 'available';

                    const { error: roomError } = await supabase
                        .from('rooms')
                        .update({ current_occupancy: newOccupancy, status: newStatus })
                        .eq('id', roomId);

                    if (roomError) throw roomError;
                }
            }

            if (onStudentAdded) {
                onStudentAdded(studentData[0]);
            }
            setName('');
            setStudentId('');
            setRoomId('');

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Add New Student</h2>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleAddStudent}>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student ID</label>
                    <input
                        type="text"
                        id="studentId"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="room" className="block text-sm font-medium text-gray-700">Assign Room (Optional)</label>
                    <select
                        id="room"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="">No Room</option>
                        {availableRooms.map(room => (
                            <option key={room.id} value={room.id}>
                                Room {room.room_number} ({room.current_occupancy}/{room.capacity})
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                    {loading ? 'Adding...' : 'Add Student'}
                </button>
            </form>
        </div>
    );
};

export default AddStudent;