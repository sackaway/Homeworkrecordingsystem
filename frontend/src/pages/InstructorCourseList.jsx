import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { getInstructorCourses, deleteCourse } from '../services/api';

function InstructorCourseList({ user }) {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courseToDelete, setCourseToDelete] = useState(null);

    const fetchCourses = async () => {
        try {
            const data = await getInstructorCourses();
            setCourses(data);
        } catch (err) {
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCourses(); }, []);

    const handleDeleteCourse = async () => {
        if (!courseToDelete) return;
        try {
            await deleteCourse(courseToDelete.id);
            setCourses(courses.filter(c => c.id !== courseToDelete.id));
            setCourseToDelete(null);
        } catch (err) {
            console.error('Error deleting course:', err);
        }
    };

    if (loading) {
        return (
            <div className="view-section text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-3">กำลังโหลดรายวิชา...</p>
            </div>
        );
    }

    return (
        <div className="view-section">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom flex-wrap gap-3">
                <div>
                    <h3 className="fw-bold mb-1">รายวิชาที่คุณสอน <i className="bi bi-journal-bookmark text-primary"></i></h3>
                    <p className="text-muted mb-0">จัดการรายวิชาและนักเรียนในที่ปรึกษา ({courses.length} วิชา)</p>
                </div>
                <button
                    className="btn btn-primary px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2"
                    data-bs-toggle="modal"
                    data-bs-target="#addCourseModal"
                >
                    <i className="bi bi-plus-lg"></i> เพิ่มรายวิชาใหม่
                </button>
            </div>

            <div className="row g-4">
                {courses.map(course => (
                    <div key={course.id} className="col-md-6 col-lg-4">
                        <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '1.25rem' }}>
                            <div className="card-header bg-primary bg-opacity-10 border-0 p-4" style={{ borderTopLeftRadius: '1.25rem', borderTopRightRadius: '1.25rem' }}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <span className="fw-medium text-dark">{course.course_code}</span>
                                    <div className="dropdown">
                                        <button className="btn btn-sm btn-light rounded-circle" type="button" data-bs-toggle="dropdown">
                                            <i className="bi bi-three-dots-vertical"></i>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                                            <li><button className="dropdown-item"><i className="bi bi-pencil me-2"></i>แก้ไขรายวิชา</button></li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li>
                                                <button
                                                    className="dropdown-item text-danger"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#confirmDeleteCourseModal"
                                                    onClick={() => setCourseToDelete(course)}
                                                >
                                                    <i className="bi bi-trash me-2"></i>ลบรายวิชา
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-3">{course.course_name}</h5>
                                <p className="text-muted small mb-4 line-clamp-2">{course.description}</p>

                                <div className="d-flex justify-content-between align-items-center mt-auto">
                                    <div className="d-flex align-items-center text-muted">
                                        <i className="bi bi-people-fill me-2 text-primary"></i>
                                        <span className="fw-medium">{course.student_count} นักเรียน</span>
                                    </div>
                                    <button
                                        className="btn btn-outline-primary btn-sm rounded-pill px-3"
                                        onClick={() => navigate(`/courses/${course.id}`)}
                                    >
                                        จัดการ <i className="bi bi-arrow-right ms-1"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {courses.length === 0 && (
                    <div className="col-12 text-center py-5 text-muted">
                        <i className="bi bi-journal-x fs-1 d-block mb-2 opacity-50"></i>
                        <h5>ยังไม่มีรายวิชา</h5>
                        <p>กดปุ่ม "เพิ่มรายวิชาใหม่" เพื่อเริ่มต้น</p>
                    </div>
                )}
            </div>

            <ConfirmModal
                id="confirmDeleteCourseModal"
                title="ยืนยันการลบรายวิชา"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบรายวิชา "${courseToDelete?.course_name}"? ข้อมูลทั้งหมดจะถูกลบ`}
                confirmText="ลบรายวิชา"
                onConfirm={handleDeleteCourse}
            />
        </div>
    );
}

export default InstructorCourseList;
