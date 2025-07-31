import { useState, useEffect } from 'react';
import { supabase } from './supabase/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RoomsPage from './pages/RoomsPage';
import StudentsPage from './pages/StudentsPage';
import Layout from './components/Layout';

function App() {
    const [session, setSession] = useState(null);
    const [hostel, setHostel] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const setupHostel = async () => {
            if (session) {
                setLoading(true);
                // Check if user has a hostel
                let { data: hostelData, error } = await supabase
                    .from('hostels')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();
                
                if (error && error.code === 'PGRST116') { // No rows found
                    // Create a new hostel for the new user
                    const { data: newHostel, error: insertError } = await supabase
                        .from('hostels')
                        .insert({ name: `${session.user.email}'s Hostel`, user_id: session.user.id })
                        .select()
                        .single();
                    
                    if(insertError) {
                        console.error('Error creating hostel:', insertError);
                    } else {
                        setHostel(newHostel);
                    }
                } else if (error) {
                    console.error('Error fetching hostel:', error);
                } else {
                    setHostel(hostelData);
                }
                setLoading(false);
            }
        };

        setupHostel();
    }, [session]);

    if (loading && session) {
        return <div className="flex justify-center items-center h-screen">Loading Application...</div>
    }

    return (
        <Router>
            {!session ? (
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            ) : (
                <Layout user={session.user}>
                    <Routes>
                        <Route path="/" element={<DashboardPage hostelId={hostel?.id} />} />
                        <Route path="/rooms" element={<RoomsPage hostelId={hostel?.id} />} />
                        <Route path="/students" element={<StudentsPage hostelId={hostel?.id} />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Layout>
            )}
        </Router>
    );
}

export default App;