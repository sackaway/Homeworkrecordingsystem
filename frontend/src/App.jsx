import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import InstructorHome from './pages/InstructorHome';
import StudentHome from './pages/StudentHome';
import Calendar from './pages/Calendar';
import Courses from './pages/Courses';
import InstructorCourseList from './pages/InstructorCourseList';
import InstructorCourseDetail from './pages/InstructorCourseDetail';
import InstructorHomeworkDetail from './pages/InstructorHomeworkDetail';
import StudentCourseDetail from './pages/StudentCourseDetail';
import AddHomeworkModal from './components/AddHomeworkModal';
import AddCourseModal from './components/AddCourseModal';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { authLogout, authMe } from './services/api';

function App() {
    const [user, setUser] = useState(null); // Full user object from API
    const [loading, setLoading] = useState(true);

    const role = user?.role || 'student';

    // Check if already logged in on mount
    useEffect(() => {
        authMe()
            .then(data => setUser(data.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = async () => {
        try {
            await authLogout();
        } catch (e) { /* ignore */ }
        setUser(null);
    };

    const handleSaveHomework = () => {
        const toastEl = document.getElementById('successToast');
        if (toastEl && window.bootstrap) {
            const toast = new window.bootstrap.Toast(toastEl);
            toast.show();
        }
    };

    const handleSaveCourse = () => {
        const toastEl = document.getElementById('courseSuccessToast');
        if (toastEl && window.bootstrap) {
            const toast = new window.bootstrap.Toast(toastEl);
            toast.show();
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <p className="text-muted">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <Router>
                <Routes>
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/register" element={<Register onLogin={handleLogin} />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        );
    }

    return (
        <Router>
            <Navbar currentRole={role} onLogout={handleLogout} userName={user.name} />

            <div className="container py-4 py-md-5">
                <div className="main-wrapper">
                    <Routes>
                        <Route path="/" element={
                            role === 'instructor' ? <InstructorHome user={user} /> : <StudentHome user={user} />
                        } />
                        <Route path="/calendar" element={<Calendar user={user} />} />

                        <Route path="/courses" element={
                            role === 'instructor' ? <InstructorCourseList user={user} /> : <Courses user={user} />
                        } />

                        <Route path="/courses/:id" element={
                            role === 'instructor' ? <InstructorCourseDetail user={user} /> : <StudentCourseDetail user={user} />
                        } />

                        <Route path="/homework/:id" element={
                            role === 'instructor' ? <InstructorHomeworkDetail user={user} /> : <Navigate to="/" replace />
                        } />

                        <Route path="/profile" element={
                            <Profile user={user} onProfileUpdate={(updatedUser) => setUser(updatedUser)} />
                        } />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </div>

            {role === 'instructor' && (
                <>
                    <AddHomeworkModal onSave={handleSaveHomework} user={user} />
                    <AddCourseModal onSave={handleSaveCourse} user={user} />
                </>
            )}

            {/* Toast Notification (Homework) */}
            <div className="toast-container position-fixed bottom-0 end-0 p-3">
                <div id="successToast" className="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="d-flex">
                        <div className="toast-body d-flex align-items-center">
                            <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                            สั่งการบ้านเรียบร้อยแล้ว! ข้อมูลจะไปแสดงที่หน้านักเรียน
                        </div>
                        <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>
            </div>

            {/* Toast Notification (Course) */}
            <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ marginBottom: '4rem' }}>
                <div id="courseSuccessToast" className="toast align-items-center text-bg-primary border-0" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="d-flex">
                        <div className="toast-body d-flex align-items-center">
                            <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                            เพิ่มรายวิชาสำเร็จ!
                        </div>
                        <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>
            </div>
        </Router>
    );
}

export default App;
