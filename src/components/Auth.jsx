import { useState } from 'react';
import { supabase } from '../supabase/client';

const getURL = () => {
  let url =
    import.meta.env?.VITE_PUBLIC_SITE_URL ?? 
    import.meta?.env?.VITE_PUBLIC_VERCEL_URL ??
    'http://localhost:3000/'

  url = url.startsWith('http') ? url : `https://${url}`

  url = url.endsWith('/') ? url : `${url}/`
  return url
}


export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage('');

        try {
            let response;
            if (isLogin) {
                response = await supabase.auth.signInWithPassword({ email, password });
            } else {
                response = await supabase.auth.signUp({ email, password ,options:{
                  emailRedirectTo: getURL()
                }});
                if (!response.error) {
                    setMessage('Check your email for the confirmation link!');
                }
            }
            if (response.error) throw response.error;
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isLogin ? 'Sign in to your account' : 'Create a new account'}
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleAuth}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                            {loading ? 'Loading...' : (isLogin ? 'Sign in' : 'Sign up')}
                        </button>
                    </div>

                    {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
                    {message && <p className="mt-2 text-center text-sm text-green-600\">{message}</p>}
                </form>
                <p className="mt-2 text-center text-sm text-gray-600">
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); setError(null); setMessage(''); }} className="font-medium text-indigo-600 hover:text-indigo-500">
                        {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                    </a>
                </p>
            </div>
        </div>
    );
}