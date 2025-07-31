import { useState } from 'react';
import { supabase } from '../supabaseClient';
import StudentManagement from './StudentManagement';
import RoomManagement from './RoomManagement';
import { useTheme } from './ThemeProvider';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Moon, Sun, Users, BedDouble, Menu, X } from 'lucide-react';

export default function Dashboard({ session }) {
  const [activeTab, setActiveTab] = useState('students');
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const NavButton = ({ tabName, icon, children }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
        activeTab === tabName
          ? 'bg-blue-600 text-white'
          : 'hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="ml-4 font-medium">{children}</span>
    </button>
  );

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="open"
        animate={isSidebarOpen ? 'open' : 'closed'}
        className="absolute md:relative z-20 w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col p-4"
      >
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HostelHQ</h1>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1">
                <X size={20} />
            </button>
        </div>
        <nav className="flex flex-col space-y-2">
          <NavButton tabName="students" icon={<Users size={20} />}>Students</NavButton>
          <NavButton tabName="rooms" icon={<BedDouble size={20} />}>Rooms</NavButton>
        </nav>
        <div className="mt-auto space-y-2">
           <div className="text-sm p-3 border-t border-gray-200 dark:border-gray-700">
                <p className="font-semibold truncate">{session.user.email}</p>
           </div>
           <button
             onClick={toggleTheme}
             className="w-full flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
           >
             {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
             <span className="ml-4 font-medium">Toggle Theme</span>
           </button>
           <button
             onClick={() => supabase.auth.signOut()}
             className="w-full flex items-center p-3 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20"
           >
             <LogOut size={20} />
             <span className="ml-4 font-medium">Sign Out</span>
           </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center md:hidden p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <button onClick={() => setIsSidebarOpen(true)} className="p-1">
                <Menu size={20} />
            </button>
             <h1 className="text-lg font-bold ml-4">{activeTab === 'students' ? 'Student Management' : 'Room Management'}</h1>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'students' ? <StudentManagement /> : <RoomManagement />}
              </motion.div>
            </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
