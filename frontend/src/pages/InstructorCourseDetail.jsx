import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { getCourseStudents, getAllStudents, addStudentsToCourse, removeStudentFromCourse, getInstructorCourses, getCourseHomeworks, deleteHomework } from '../services/api';
import AddHomeworkModal from '../components/AddHomeworkModal';

function InstructorCourseDetail({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [homeworks, setHomeworks] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [studentToRemove, setStudentToRemove] = useState(null);

    const fetchData = async () => {
        try {
            const [coursesData, studentsData, homeworksData, allStudentsData] = await Promise.all([
                getInstructorCourses(),
                getCourseStudents(id),
                getCourseHomeworks(id),
                getAllStudents()
            ]);
            const foundCourse = coursesData.find(c => c.id === parseInt(id));
            setCourse(foundCourse);
            setStudents(studentsData);
            setHomeworks(homeworksData);
            setAllStudents(allStudentsData);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    const enrolledIds = students.map(s => s.id);
    const availableStudents = allStudents.filter(s => !enrolledIds.includes(s.id));
    const filteredAvailable = availableStudents.filter(s => {
        const q = searchQuery.toLowerCase();
        return !q || s.name.toLowerCase().includes(q) || (s.student_id && s.student_id.toLowerCase().includes(q));
    });

    const isStudentSelected = (student) => selectedStudents.some(s => s.id === student.id);
    const toggleSelectStudent = (student) => {
        if (isStudentSelected(student)) {
            setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
        } else {
            setSelectedStudents([...selectedStudents, student]);
        }
    };

    const handleAddSelectedStudents = async () => {
        if (selectedStudents.length === 0) return;
        try {
            const studentIds = selectedStudents.map(s => s.id);
            await addStudentsToCourse(id, studentIds);
            setSelectedStudents([]);
            setSearchQuery('');
            await fetchData(); // Refresh

            const toastEl = document.getElementById('addStudentToast');
            if (toastEl && window.bootstrap) new window.bootstrap.Toast(toastEl).show();
        } catch (err) {
            console.error('Error adding students:', err);
        }
    };

    const handleRemoveStudent = async () => {
        if (!studentToRemove) return;
        try {
            await removeStudentFromCourse(id, studentToRemove.id);
            setStudentToRemove(null);
            await fetchData(); // Refresh

            const toastEl = document.getElementById('removeStudentToast');
            if (toastEl && window.bootstrap) new window.bootstrap.Toast(toastEl).show();
        } catch (err) {
            console.error('Error removing student:', err);
        }
    };

    const handleDeleteHomework = async (hwId) => {
        try {
            await deleteHomework(hwId);
            fetchData(); // Refresh
        } catch (err) {
            console.error('Error deleting homework:', err);
        }
    };

    const formatDate = (isoStr) => {
        if (!isoStr) return 'ไม่ทราบ';
        const d = new Date(isoStr);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return 'วันนี้';
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="view-section text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-3">กำลังโหลด...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="view-section text-center py-5 text-muted">
                <i className="bi bi-journal-x fs-1 d-block mb-2"></i>
                <h5>ไม่พบรายวิชา</h5>
                <button className="btn btn-outline-primary mt-3" onClick={() => navigate('/courses')}>กลับหน้ารายวิชา</button>
            </div>
        );
    }

    return (
        <div className="view-section">
            {/* Header */}
            <div className="mb-4">
                <button className="btn btn-sm btn-light rounded-pill px-3 mb-3" onClick={() => navigate('/courses')}>
                    <i className="bi bi-arrow-left me-1"></i> กลับ
                </button>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                    <div>
                        <span className="badge bg-primary rounded-pill px-3 py-2 mb-2">{course.course_code}</span>
                        <h3 className="fw-bold mb-1">{course.course_name}</h3>
                        <p className="text-muted mb-0">{course.description}</p>
                    </div>
                    <div className="text-end">
                        <small className="text-muted d-block mb-1">รหัสเชิญนักเรียน (Invite Code)</small>
                        <span className="badge bg-warning text-dark px-4 py-2 fs-5 shadow-sm">{course.invite_code}
                            <button className="btn btn-sm btn-link text-dark ms-1 p-0" onClick={() => navigator.clipboard.writeText(course.invite_code)}>
                                <i className="bi bi-clipboard"></i>
                            </button>
                        </span>
                    </div>
                </div>
            </div>

            <div className="divider-dashed"></div>

            {/* Homework List Section */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h5 className="fw-bold section-title mb-0">
                    <span className="text-primary me-2">|</span>รายการการบ้าน ({homeworks.length})
                </h5>
                <button className="btn btn-outline-primary rounded-pill px-4 shadow-sm" data-bs-toggle="modal" data-bs-target="#addHomeworkModal">
                    <i className="bi bi-megaphone me-1"></i> สั่งการบ้านเพิ่ม
                </button>
            </div>

            <div className="table-wrapper mb-5">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th scope="col" className="ps-4">ชื่อการบ้าน</th>
                                <th scope="col">กำหนดส่ง</th>
                                <th scope="col">ยอดส่งงาน</th>
                                <th scope="col">สถานะ</th>
                                <th scope="col" className="text-end pe-4">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {homeworks.length > 0 ? homeworks.map(hw => {
                                const pct = hw.submissions.total > 0 ? (hw.submissions.submitted / hw.submissions.total) * 100 : 0;
                                return (
                                    <tr key={hw.id}>
                                        <td className="ps-4">
                                            <div className="fw-medium text-dark">{hw.title}</div>
                                            <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '200px' }}>{hw.description}</small>
                                        </td>
                                        <td>
                                            <div className={new Date(hw.due_date) < new Date() ? 'text-muted' : 'text-danger fw-medium'}>
                                                <i className="bi bi-calendar-event me-1"></i> {formatDate(hw.due_date)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="progress flex-grow-1" style={{ height: '6px', width: '60px' }}>
                                                    <div className="progress-bar bg-success" style={{ width: `${pct}%` }}></div>
                                                </div>
                                                <span className="small fw-medium">{hw.submissions.submitted}/{hw.submissions.total}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {hw.status === 'open' ? (
                                                <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success-subtle px-3 py-1 small">เปิด</span>
                                            ) : (
                                                <span className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle px-3 py-1 small">ปิด</span>
                                            )}
                                        </td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm btn-light rounded-circle me-1" title="ตรวจงาน" onClick={() => navigate(`/homework/${hw.id}`)}>
                                                <i className="bi bi-clipboard-check text-primary"></i>
                                            </button>
                                            <button className="btn btn-sm btn-light rounded-circle" title="ลบ" onClick={() => {
                                                if (window.confirm(`ยืนยันการลบการบ้าน "${hw.title}"?`)) handleDeleteHomework(hw.id);
                                            }}>
                                                <i className="bi bi-trash text-danger"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted small">
                                        ยังไม่มีการสั่งการบ้านในวิชานี้
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Student List */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h5 className="fw-bold section-title mb-0">
                    <span className="text-primary me-2">|</span>รายชื่อนักเรียน ({students.length} คน)
                </h5>
                <button className="btn btn-primary rounded-pill px-4 shadow-sm" data-bs-toggle="modal" data-bs-target="#addStudentPickerModal">
                    <i className="bi bi-person-plus me-1"></i> เพิ่มนักเรียน
                </button>
            </div>

            <div className="table-wrapper mb-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th scope="col" className="ps-4">รหัส</th>
                                <th scope="col">รายชื่อ</th>
                                <th scope="col">อีเมล</th>
                                <th scope="col">วันที่เข้าร่วม</th>
                                <th scope="col" className="text-end pe-4">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? students.map(student => (
                                <tr key={student.id}>
                                    <td className="ps-4">
                                        <span className="badge bg-light text-dark border px-2 py-1">{student.student_id}</span>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&color=fff`} alt="" width="32" height="32" className="rounded-circle" />
                                            <span className="fw-medium">{student.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="text-muted">{student.email}</span></td>
                                    <td><span className="text-muted">{formatDate(student.joined_at)}</span></td>
                                    <td className="text-end pe-4">
                                        <button
                                            className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                            data-bs-toggle="modal"
                                            data-bs-target="#confirmRemoveStudentModal"
                                            onClick={() => setStudentToRemove(student)}
                                        >
                                            <i className="bi bi-person-x me-1"></i>นำออก
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        <i className="bi bi-people fs-1 d-block mb-2 opacity-50"></i>
                                        ยังไม่มีนักเรียนในรายวิชานี้
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Student Picker Modal */}
            <div className="modal fade" id="addStudentPickerModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold">
                                <i className="bi bi-person-plus text-primary me-2"></i>เพิ่มนักเรียนเข้าคลาส
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-4 pt-3">
                            {/* Search */}
                            <div className="input-group shadow-sm rounded-3 mb-3">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="ค้นหาด้วยชื่อ หรือ รหัสนักเรียน..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button className="btn btn-outline-secondary border-start-0" onClick={() => setSearchQuery('')}>
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                )}
                            </div>

                            {/* Select All + Count */}
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                    onClick={() => {
                                        if (selectedStudents.length === filteredAvailable.length && filteredAvailable.length > 0) {
                                            setSelectedStudents([]);
                                        } else {
                                            setSelectedStudents([...filteredAvailable]);
                                        }
                                    }}
                                    disabled={filteredAvailable.length === 0}
                                >
                                    <i className={`bi ${selectedStudents.length === filteredAvailable.length && filteredAvailable.length > 0 ? 'bi-x-square' : 'bi-check2-all'} me-1`}></i>
                                    {selectedStudents.length === filteredAvailable.length && filteredAvailable.length > 0 ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
                                </button>
                                {selectedStudents.length > 0 && (
                                    <span className="badge bg-primary rounded-pill px-3 py-2">
                                        <i className="bi bi-check2-circle me-1"></i>เลือกแล้ว {selectedStudents.length} คน
                                    </span>
                                )}
                            </div>

                            {/* Student table */}
                            <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="sticky-top bg-white">
                                        <tr>
                                            <th style={{ width: '40px' }}></th>
                                            <th>รหัสนักเรียน</th>
                                            <th>ชื่อ-สกุล</th>
                                            <th>อีเมล</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAvailable.length > 0 ? filteredAvailable.map(student => (
                                            <tr key={student.id} onClick={() => toggleSelectStudent(student)} style={{ cursor: 'pointer' }}
                                                className={isStudentSelected(student) ? 'table-primary' : ''}>
                                                <td className="ps-3">
                                                    <div className="form-check mb-0">
                                                        <input className="form-check-input" type="checkbox" checked={isStudentSelected(student)}
                                                            onChange={() => toggleSelectStudent(student)} onClick={(e) => e.stopPropagation()} />
                                                    </div>
                                                </td>
                                                <td><span className="badge bg-light text-dark border px-2 py-1">{student.student_id}</span></td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&color=fff`} alt="" width="30" height="30" className="rounded-circle" />
                                                        <span className="fw-medium">{student.name}</span>
                                                    </div>
                                                </td>
                                                <td><span className="text-muted small">{student.email}</span></td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-4 text-muted">
                                                    <i className="bi bi-search fs-3 d-block mb-2 opacity-50"></i>
                                                    {searchQuery ? 'ไม่พบนักเรียนที่ค้นหา' : 'นักเรียนทุกคนอยู่ในคลาสนี้แล้ว'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer border-top-0 pt-0">
                            <button type="button" className="btn btn-light" data-bs-dismiss="modal">ยกเลิก</button>
                            <button
                                type="button"
                                className="btn btn-primary px-4 rounded-pill fw-medium shadow-sm"
                                disabled={selectedStudents.length === 0}
                                data-bs-dismiss="modal"
                                data-bs-toggle="modal"
                                data-bs-target="#confirmAddStudentModal"
                            >
                                <i className="bi bi-person-plus me-1"></i>
                                เพิ่ม {selectedStudents.length > 0 ? `${selectedStudents.length} คน` : 'นักเรียน'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddHomeworkModal onSave={fetchData} user={user} initialCourseId={id} />

            <ConfirmModal
                id="confirmAddStudentModal"
                title="ยืนยันการเพิ่มนักเรียน"
                message={`คุณต้องการเพิ่มนักเรียน ${selectedStudents.length} คนเข้าในรายวิชานี้ใช่หรือไม่?`}
                confirmText="ยืนยันการเพิ่ม"
                confirmColor="primary"
                onConfirm={handleAddSelectedStudents}
            />

            {/* Confirm Remove Student Modal */}
            <ConfirmModal
                id="confirmRemoveStudentModal"
                title="ยืนยันการนำนักเรียนออก"
                message={`คุณแน่ใจหรือไม่ว่าต้องการนำ "${studentToRemove?.name}" ออกจากรายวิชานี้?`}
                confirmText="ลบรายชื่อ"
                onConfirm={handleRemoveStudent}
            />

            {/* Toasts */}
            <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1060 }}>
                <div id="addStudentToast" className="toast align-items-center text-bg-success border-0" role="alert">
                    <div className="d-flex">
                        <div className="toast-body d-flex align-items-center">
                            <i className="bi bi-check-circle me-2 fs-5"></i>เพิ่มนักเรียนเข้าคลาสสำเร็จ!
                        </div>
                        <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                    </div>
                </div>
                <div id="removeStudentToast" className="toast align-items-center text-bg-dark border-0 mt-2" role="alert">
                    <div className="d-flex">
                        <div className="toast-body d-flex align-items-center">
                            <i className="bi bi-person-x me-2 fs-5"></i>นำนักเรียนออกจากคลาสเรียบร้อย
                        </div>
                        <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InstructorCourseDetail;
