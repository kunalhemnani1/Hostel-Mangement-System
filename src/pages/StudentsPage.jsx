import AddStudent from "../components/AddStudent";
import StudentList from "../components/StudentList";

const StudentsPage = ({ hostelId }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <AddStudent hostelId={hostelId} />
            </div>
            <div className="md:col-span-2">
                <StudentList hostelId={hostelId} />
            </div>
        </div>
    );
};

export default StudentsPage;