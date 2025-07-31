import AddRoom from "../components/AddRoom";
import RoomList from "../components/RoomList";

const RoomsPage = ({ hostelId }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <AddRoom hostelId={hostelId} />
            </div>
            <div className="md:col-span-2">
                <RoomList hostelId={hostelId} />
            </div>
        </div>
    );
};

export default RoomsPage;