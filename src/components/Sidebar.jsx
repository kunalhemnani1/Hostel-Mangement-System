import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const activeLink = 'bg-gray-700 text-white';
    const normalLink = 'text-gray-300 hover:bg-gray-700 hover:text-white';

    return (
        <div className="w-64 bg-gray-800 text-white flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-2xl font-bold">Menu</h2>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
                <NavLink
                    to="/"
                    className={({ isActive }) => `${isActive ? activeLink : normalLink} block px-3 py-2 rounded-md text-base font-medium`}
                >
                    Dashboard
                </NavLink>
                <NavLink
                    to="/rooms"
                    className={({ isActive }) => `${isActive ? activeLink : normalLink} block px-3 py-2 rounded-md text-base font-medium`}
                >
                    Rooms
                </NavLink>
                <NavLink
                    to="/students"
                    className={({ isActive }) => `${isActive ? activeLink : normalLink} block px-3 py-2 rounded-md text-base font-medium`}
                >
                    Students
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;