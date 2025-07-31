import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, LogIn, UserPlus } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('signin');
  const { theme, toggleTheme } = useTheme();

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');

    async function action(){
      if(activeTab==='signin'){
        return await supabase.auth.signInWithPassword({email,password});
      }
      return await supabase.auth.signUp({email,password})
    }
    const { error } = await action({ email, password });

    if (error) {
      setError(error.message);
    } else if (activeTab === 'signup') {
      setMessage('Success! Please check your email for a confirmation link.');
    }
    setLoading(false);
  };
  
  const switchTab = (tab) => {
      setActiveTab(tab);
      setEmail('');
      setPassword('');
      setError(null);
      setMessage(null);
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-md">
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex">
                <button
                    onClick={() => switchTab('signin')}
                    className={`w-1/2 p-4 text-sm font-medium transition-colors ${activeTab === 'signin' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                    Sign In
                </button>
                <button
                    onClick={() => switchTab('signup')}
                    className={`w-1/2 p-4 text-sm font-medium transition-colors ${activeTab === 'signup' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                    Sign Up
                </button>
            </div>
            <div className="p-8">
                 <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HostelHQ</h1>
                </div>

                {error && <p className="text-center text-sm text-red-500 dark:text-red-400 animate-fade-in">{error}</p>}
                {message && <p className="text-center text-sm text-green-500 dark:text-green-400 animate-fade-in">{message}</p>}

                <form onSubmit={handleAuthAction} className="space-y-6 pt-6">
                    <div className="relative">
                        <input id="email" type="email" className="w-full px-4 py-3 text-gray-900 bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="relative">
                        <input id="password" type="password" className="w-full px-4 py-3 text-gray-900 bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full flex justify-center items-center px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 disabled:opacity-60 transition-all duration-300">
                        {activeTab === 'signin' ? <LogIn className="mr-2 h-5 w-5"/> : <UserPlus className="mr-2 h-5 w-5"/>}
                        {loading ? 'Processing...' : (activeTab === 'signin' ? 'Sign In' : 'Create Account')}
                    </motion.button>
                </form>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
