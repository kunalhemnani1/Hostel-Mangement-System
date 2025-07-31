import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

const StudentList = ({ hostelId }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStudents = async () => {
        if (!hostelId) return;
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from('students')
                .select(`
                    *,
                    rooms ( room_number )
                `)
                .eq('hostel_id', hostelId)
                .order('name', { ascending: true });

            if (error) throw error;
            setStudents(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();

        const studentSubscription = supabase
            .channel('public:students')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'students', filter: `hostel_id=eq.${hostelId}` }, payload => {
                fetchStudents();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(studentSubscription);
        };
    }, [hostelId]);

    const handleDeallocate = async (student) => {
        if (!student.room_id) return;

        try {
            // Deallocate student
            const { error: studentUpdateError } = await supabase
                .from('students')
                .update({ room_id: null })
                .eq('id', student.id);
            if (studentUpdateError) throw studentUpdateError;

            // Update room occupancy
            const { data: roomData, error: roomError } = await supabase
                .from('rooms')
                .select('current_occupancy, capacity')
                .eq('id', student.room_id)
                .single();

            if (roomError) throw roomError;

            const newOccupancy = roomData.current_occupancy - 1;
            const newStatus = newOccupancy < roomData.capacity ? 'available' : 'full';

            const { error: roomUpdateError } = await supabase
                .from('rooms')
                .update({ current_occupancy: newOccupancy, status: newStatus })
                .eq('id', student.room_id);

            if (roomUpdateError) throw roomUpdateError;

        } catch (error) {
            setError(error.message);
        }
    }

    if (loading) {
        return <p>Loading students...</p>;
    }

    if (error) {
        return <p className="text-red-500">Error loading students: {error}</p>;
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Student List</h2>
            {error && <p className="text-red-500">{error}</p>}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Number</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map(student => (
                            <tr key={student.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.student_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rooms ? student.rooms.room_number : 'Not Assigned'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {student.room_id && (
                                        <button
                                            onClick={() => handleDeallocate(student)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Deallocate
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {students.length === 0 && <p className="mt-4 text-center text-gray-500">No students found. Add a student to get started.</p>}
        </div>
    );
};

export default StudentList;