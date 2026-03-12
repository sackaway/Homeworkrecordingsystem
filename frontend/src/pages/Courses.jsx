import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { getStudentCourses, joinCourse, leaveCourse, getStudentHomeworks } from '../services/api';
function Courses({ user }) {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [homeworks, setHomeworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');
    const [courseToLeave, setCourseToLeave] = useState(null);
    const [expandedCourse, setExpandedCourse] = useState(null);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [coursesData, hwData] = await Promise.all([
                getStudentCourses(),
                getStudentHomeworks()
            ]);
            setCourses(coursesData);
            setHomeworks(hwData);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleJoinCourse = async () => {
        if (!joinCode.trim()) return;
        try {
            setError('');
            await joinCourse(joinCode.trim());
            setJoinCode('');
            await fetchData();

            const toastEl = document.getElementById('joinCourseToast');
            if (toastEl && window.bootstrap) new window.bootstrap.Toast(toastEl).show();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLeaveCourse = async () => {
        if (!courseToLeave) return;
        try {
            await leaveCourse(courseToLeave.id);
            setCourseToLeave(null);
            await fetchData();

            const toastEl = document.getElementById('leaveCourseToast');
            if (toastEl && window.bootstrap) new window.bootstrap.Toast(toastEl).show();
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const getCourseHomeworks = (courseId) => homeworks.filter(hw => hw.course_id === courseId);

    const getProgressColor = (completed, total) => {
        const pct = total > 0 ? (completed / total) * 100 : 0;
        if (pct >= 80) return 'success';
        if (pct >= 50) return 'warning';
        return 'danger';
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'danger';
    };

    const getHwStatus = (hw) => {
        if (hw.my_submission?.status === 'graded') return 'graded';
        if (hw.my_submission?.status === 'submitted') return 'submitted';
        if (new Date(hw.due_date) < new Date()) return 'overdue';
        return 'pending';
    };

    if (loading) {
        return (
            <div className="view-section text-center py-5">
                <div className="spinner-border text-primary"></div>
                <p className="text-muted mt-3">กำลังโหลด...</p>
            </div>
        );
    }

    return (
        <div className="view-section">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom flex-wrap gap-3">
                <div>
                    <h3 className="fw-bold mb-1">รายวิชาของฉัน <i className="bi bi-journal-bookmark text-primary"></i></h3>
                    <p className="text-muted mb-0">คุณลงทะเบียนทั้งหมด {courses.length} รายวิชา</p>
                </div>
                <button className="btn btn-primary px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2"
                    data-bs-toggle="modal" data-bs-target="#joinCourseModal">
                    <i className="bi bi-plus-lg"></i> เข้าร่วมรายวิชา
                </button>
            </div>

            <div className="row g-4">
                {courses.map(course => (
                    <div key={course.id} className="col-md-6 col-lg-4">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '1.25rem', transition: 'transform 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div className="bg-primary" style={{ height: '6px', borderRadius: '1.25rem 1.25rem 0 0' }}></div>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-medium">{course.course_code}</span>
                                    <div className="dropdown">
                                        <button className="btn btn-sm btn-light rounded-circle" data-bs-toggle="dropdown"><i className="bi bi-three-dots-vertical"></i></button>
                                        <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                                            <li><button className="dropdown-item" onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}><i className="bi bi-list-task me-2"></i>ดูการบ้านทั้งหมด</button></li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li><button className="dropdown-item text-danger" data-bs-toggle="modal" data-bs-target="#confirmLeaveCourseModal" onClick={() => setCourseToLeave(course)}><i className="bi bi-box-arrow-right me-2"></i>ออกจากรายวิชา</button></li>
                                        </ul>
                                    </div>
                                </div>

                                <h5 className="fw-bold mb-2">{course.course_name}</h5>
                                <p className="text-muted small mb-3"><i className="bi bi-person me-1"></i>{course.instructor_name}</p>

                                <div className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <small className="text-muted">ส่งงานแล้ว</small>
                                        <small className={`fw-medium text-${getProgressColor(course.completed_homework, course.total_homework)}`}>
                                            {course.completed_homework}/{course.total_homework}
                                        </small>
                                    </div>
                                    <div className="progress" style={{ height: '6px' }}>
                                        <div className={`progress-bar bg-${getProgressColor(course.completed_homework, course.total_homework)}`}
                                            style={{ width: `${course.total_homework > 0 ? (course.completed_homework / course.total_homework) * 100 : 0}%` }}></div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="small text-muted">คะแนนเฉลี่ย</span>
                                    {course.avg_score > 0 ? (
                                        <span className={`badge bg-${getScoreColor(course.avg_score)} bg-opacity-10 text-${getScoreColor(course.avg_score)} border border-${getScoreColor(course.avg_score)}-subtle px-3 py-2 rounded-pill`}>{course.avg_score}%</span>
                                    ) : (
                                        <span className="badge bg-light text-muted border px-3 py-2 rounded-pill">ยังไม่มีคะแนน</span>
                                    )}
                                </div>

                                <div className="d-grid gap-2 mt-3">
                                    <button className="btn btn-primary rounded-pill" onClick={() => navigate(`/courses/${course.id}`)}>
                                        <i className="bi bi-eye me-1"></i> ดูรายละเอียดวิชา
                                    </button>
                                    <button className="btn btn-sm btn-light rounded-pill" onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}>
                                        <i className={`bi bi-chevron-${expandedCourse === course.id ? 'up' : 'down'} me-1`}></i>
                                        {expandedCourse === course.id ? 'ซ่อนรายการ' : 'ดูการบ้าน'}
                                    </button>
                                </div>
                            </div>

                            {expandedCourse === course.id && (
                                <div className="card-footer bg-light border-top-0 p-0" style={{ borderRadius: '0 0 1.25rem 1.25rem' }}>
                                    <ul className="list-group list-group-flush">
                                        {getCourseHomeworks(course.id).map(hw => {
                                            const status = getHwStatus(hw);
                                            return (
                                                <li key={hw.id} className="list-group-item d-flex justify-content-between align-items-center px-4 py-3">
                                                    <div>
                                                        <div className="fw-medium mb-1">{hw.title}</div>
                                                        <small className="text-muted"><i className="bi bi-calendar-event me-1"></i>{new Date(hw.due_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</small>
                                                    </div>
                                                    <div>
                                                        {status === 'graded' && <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2"><i className="bi bi-check-circle me-1"></i>{hw.my_submission?.grade || '✓'}</span>}
                                                        {status === 'submitted' && <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2"><i className="bi bi-send me-1"></i>ส่งแล้ว</span>}
                                                        {status === 'pending' && <span className="badge bg-warning bg-opacity-10 text-dark rounded-pill px-3 py-2"><i className="bi bi-clock me-1"></i>รอส่ง</span>}
                                                        {status === 'overdue' && <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2"><i className="bi bi-exclamation-circle me-1"></i>เลยกำหนด</span>}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                        {getCourseHomeworks(course.id).length === 0 && (
                                            <li className="list-group-item text-center text-muted py-4">ยังไม่มีการบ้านในรายวิชานี้</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {courses.length === 0 && (
                    <div className="col-12 text-center py-5 text-muted">
                        <i className="bi bi-journal-x fs-1 d-block mb-2 opacity-50"></i>
                        <h5>ยังไม่ได้เข้าร่วมรายวิชาใดๆ</h5>
                        <p>กดปุ่ม "เข้าร่วมรายวิชา" เพื่อเริ่มต้น</p>
                    </div>
                )}
            </div>

            {/* Join Course Modal */}
            <div className="modal fade" id="joinCourseModal" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold"><i className="bi bi-box-arrow-in-right text-primary me-2"></i>เข้าร่วมรายวิชา</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-4 pt-3">
                            <p className="text-muted mb-3">กรอกรหัสเข้าร่วมห้องเรียน (Invite Code) ที่ได้รับจากอาจารย์ผู้สอน</p>
                            {error && <div className="alert alert-danger py-2 rounded-3 mb-3"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}
                            <div className="input-group input-group-lg shadow-sm rounded-3">
                                <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-key"></i></span>
                                <input type="text" className="form-control border-start-0 ps-0 text-center fw-bold" placeholder="เช่น CS10-ABC"
                                    value={joinCode} onChange={e => { setJoinCode(e.target.value.toUpperCase()); setError(''); }}
                                    style={{ letterSpacing: '0.2em', fontSize: '1.2rem' }} />
                            </div>
                        </div>
                        <div className="modal-footer border-top-0 pt-0">
                            <button type="button" className="btn btn-light" data-bs-dismiss="modal">ยกเลิก</button>
                            <button type="button" className="btn btn-primary px-4 rounded-pill fw-medium shadow-sm" disabled={!joinCode.trim()}
                                data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#confirmJoinCourseModal">
                                <i className="bi bi-check-lg me-1"></i>เข้าร่วม
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal id="confirmJoinCourseModal" title="ยืนยันการเข้าร่วมรายวิชา"
                message={`คุณต้องการเข้าร่วมรายวิชาด้วยรหัส "${joinCode}" ใช่หรือไม่?`}
                confirmText="ยืนยันเข้าร่วม" confirmColor="primary" onConfirm={handleJoinCourse} />

            <ConfirmModal id="confirmLeaveCourseModal" title="ยืนยันการออกจากรายวิชา"
                message={`คุณแน่ใจหรือไม่ว่าต้องการออกจากรายวิชา "${courseToLeave?.course_name}"?`}
                confirmText="ออกจากรายวิชา" onConfirm={handleLeaveCourse} />

            <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1060 }}>
                <div id="joinCourseToast" className="toast align-items-center text-bg-success border-0" role="alert">
                    <div className="d-flex">
                        <div className="toast-body d-flex align-items-center"><i className="bi bi-check-circle me-2 fs-5"></i>เข้าร่วมรายวิชาสำเร็จ!</div>
                        <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                    </div>
                </div>
                <div id="leaveCourseToast" className="toast align-items-center text-bg-dark border-0 mt-2" role="alert">
                    <div className="d-flex">
                        <div className="toast-body d-flex align-items-center"><i className="bi bi-box-arrow-right me-2 fs-5"></i>ออกจากรายวิชาเรียบร้อยแล้ว</div>
                        <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Courses;
