import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Trash2, X } from 'lucide-react';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentContact, setNewStudentContact] = useState('');
  const [assignedRoomId, setAssignedRoomId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchStudents(), fetchRooms()]);
    setLoading(false);
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase.from('students').select('id, name, contact_info, rooms(room_number)');
    if (error) console.error('Error fetching students:', error);
    else setStudents(data);
  };

  const fetchRooms = async () => {
    const { data, error } = await supabase.from('rooms_with_occupancy').select('*');
    if (error) console.error('Error fetching rooms:', error);
    else {
      const availableRooms = data.filter(room => room.occupancy < room.capacity);
      setRooms(availableRooms);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.from('students').insert({ name: newStudentName, contact_info: newStudentContact, room_id: assignedRoomId || null });
    if (error) setError(error.message);
    else {
      resetForm();
      setIsModalOpen(false);
      await fetchData();
    }
    setLoading(false);
  };

  const deleteStudent = async (id) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) setError(error.message);
    else await fetchData();
  };
  
  const resetForm = () => {
      setNewStudentName('');
      setNewStudentContact('');
      setAssignedRoomId('');
      setError(null);
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Student Management</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage all student records and room assignments.</p>
          </div>
          <motion.button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <PlusCircle size={20} className="mr-2" />
            Add Student
          </motion.button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="p-4">Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Room</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="p-4 text-center">Loading students...</td></tr>
              ) : (
                students.map((student, i) => (
                  <motion.tr key={student.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <td className="p-4 font-medium">{student.name}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{student.contact_info}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{student.rooms ? student.rooms.room_number : 'N/A'}</td>
                    <td className="p-4 text-right">
                      <motion.button onClick={() => deleteStudent(student.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Trash2 size={18} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add New Student</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20}/></button>
              </div>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <input type="text" placeholder="Student Name" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} required className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <input type="text" placeholder="Contact Info" value={newStudentContact} onChange={(e) => setNewStudentContact(e.target.value)} required className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <select value={assignedRoomId} onChange={(e) => setAssignedRoomId(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Assign a room (optional)</option>
                  {rooms.map(room => <option key={room.id} value={room.id}>Room {room.room_number}</option>)}
                </select>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex justify-end pt-4">
                  <motion.button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {loading ? 'Adding...' : 'Add Student'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
