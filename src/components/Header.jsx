import { supabase } from '../supabase/client';

const Header = ({ user }) => {

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold">Hostel Management</h1>
            </div>
            <div className="flex items-center">
                <span className="mr-4">{user.email}</span>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;