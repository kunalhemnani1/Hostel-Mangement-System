import Dashboard from "../components/Dashboard";

const DashboardPage = ({ hostelId }) => {
    return (
        <div>
            <Dashboard hostelId={hostelId} />
        </div>
    );
};

export default DashboardPage;