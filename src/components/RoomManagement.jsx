import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Trash2, X } from 'lucide-react';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRooms();
    const channel = supabase.channel('public:rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, fetchRooms)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, fetchRooms)
      .subscribe();
    
    return () => supabase.removeChannel(channel);
  }, []);

  const fetchRooms = async () => {
    const { data, error } = await supabase.from('rooms_with_occupancy').select('*').order('room_number', { ascending: true });
    if (error) console.error('Error fetching rooms:', error);
    else setRooms(data);
    setLoading(false);
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.from('rooms').insert({ room_number: newRoomNumber, capacity: newRoomCapacity });
    if (error) setError(error.message);
    else {
      resetForm();
      setIsModalOpen(false);
    }
    setLoading(false);
  };

  const deleteRoom = async (id, occupancy) => {
    if (occupancy > 0) {
      alert('Cannot delete an occupied room. Please reassign students first.');
      return;
    }
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) setError(error.message);
  };
  
  const resetForm = () => {
    setNewRoomNumber('');
    setNewRoomCapacity('');
    setError(null);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Room Management</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage room availability and capacity.</p>
          </div>
          <motion.button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <PlusCircle size={20} className="mr-2" />
            Add Room
          </motion.button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="p-4">Room Number</th>
                <th className="p-4">Occupancy</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="p-4 text-center">Loading rooms...</td></tr>
              ) : (
                rooms.map((room, i) => (
                  <motion.tr key={room.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <td className="p-4 font-medium">{room.room_number}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${room.occupancy >= room.capacity ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>
                        {room.occupancy} / {room.capacity}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <motion.button onClick={() => deleteRoom(room.id, room.occupancy)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
                <h3 className="text-xl font-bold">Add New Room</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20}/></button>
              </div>
              <form onSubmit={handleAddRoom} className="space-y-4">
                <input type="text" placeholder="Room Number" value={newRoomNumber} onChange={(e) => setNewRoomNumber(e.target.value)} required className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <input type="number" placeholder="Capacity" value={newRoomCapacity} onChange={(e) => setNewRoomCapacity(e.target.value)} required min="1" className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex justify-end pt-4">
                  <motion.button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {loading ? 'Adding...' : 'Add Room'}
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
