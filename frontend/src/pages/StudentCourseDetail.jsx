import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatCard from '../components/common/StatCard';
import ConfirmModal from '../components/ConfirmModal';
import {
    getStudentCourses,
    getStudentCourseClassmates,
    getStudentCourseHomeworks,
    submitHomework
} from '../services/api';

const API_BASE = '';

function StudentCourseDetail({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [homeworks, setHomeworks] = useState([]);
    const [classmates, setClassmates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('homework'); // 'homework' or 'classmates'

    // Submission state (from StudentHome.jsx)
    const [selectedHw, setSelectedHw] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const fetchData = async () => {
        try {
            const [coursesData, classmatesData, hwData] = await Promise.all([
                getStudentCourses(),
                getStudentCourseClassmates(id),
                getStudentCourseHomeworks(id)
            ]);

            const foundCourse = coursesData.find(c => c.id === parseInt(id));
            setCourse(foundCourse);
            setClassmates(classmatesData);
            setHomeworks(hwData);
        } catch (err) {
            console.error('Error fetching course detail:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const formatDate = (isoStr) => {
        if (!isoStr) return '-';
        const d = new Date(isoStr);
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getStatus = (hw) => {
        if (hw.my_submission?.status === 'graded') return 'graded';
        if (hw.my_submission?.status === 'submitted') return 'submitted';
        if (new Date(hw.due_date) < new Date()) return 'overdue';
        return 'pending';
    };

    const handleFilesSelected = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPreviews(prev => [...prev, { name: file.name, src: ev.target.result }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const resetFileSelection = () => {
        setSelectedFiles([]);
        setPreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!selectedHw) return;
        setSubmitting(true);
        try {
            await submitHomework(selectedHw.id, selectedFiles);
            setSelectedHw(null);
            resetFileSelection();
            await fetchData();

            const toastEl = document.getElementById('submitSuccessToast');
            if (toastEl && window.bootstrap) new window.bootstrap.Toast(toastEl).show();
        } catch (err) {
            console.error('Error submitting:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="view-section text-center py-5">
                <div className="spinner-border text-primary"></div>
                <p className="text-muted mt-3">กำลังโหลด...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="view-section text-center py-5">
                <i className="bi bi-journal-x fs-1 d-block mb-3 opacity-50"></i>
                <h4 className="text-muted">ไม่พบรายวิชา</h4>
                <button className="btn btn-primary rounded-pill px-4 mt-3" onClick={() => navigate('/courses')}>
                    กลับไปหน้ารายวิชา
                </button>
            </div>
        );
    }

    const pendingCount = homeworks.filter(hw => getStatus(hw) === 'pending' || getStatus(hw) === 'overdue').length;
    const completedCount = homeworks.filter(hw => getStatus(hw) === 'submitted' || getStatus(hw) === 'graded').length;

    return (
        <div className="view-section">
            {/* Header */}
            <div className="mb-4">
                <button className="btn btn-sm btn-light rounded-pill px-3 mb-3" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left me-1"></i> กลับ
                </button>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                    <div>
                        <span className="badge bg-primary rounded-pill px-3 py-2 mb-2">{course.course_code}</span>
                        <h3 className="fw-bold mb-1">{course.course_name}</h3>
                        <p className="text-muted mb-0">{course.description || 'ไม่มีคำอธิบายรายวิชา'}</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="row g-4 mb-4">
                <StatCard title="งานที่ต้องส่ง" value={pendingCount} unit="งาน" icon="bi-clock-history" colorClass="warning" textColorClass="warning" />
                <StatCard title="ส่งแล้ว" value={completedCount} unit="งาน" icon="bi-check2-circle" colorClass="success" textColorClass="success" />
                <StatCard title="เพื่อนร่วมคลาส" value={classmates.length} unit="คน" icon="bi-people" colorClass="primary" textColorClass="primary" />
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs border-bottom-0 mb-4 gap-2" role="tablist">
                <li className="nav-item">
                    <button
                        className={`nav-link rounded-pill px-4 fw-medium border-0 ${activeTab === 'homework' ? 'active bg-primary text-white shadow-sm' : 'text-muted'}`}
                        onClick={() => setActiveTab('homework')}
                    >
                        <i className="bi bi-journal-text me-2"></i>การบ้าน
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link rounded-pill px-4 fw-medium border-0 ${activeTab === 'classmates' ? 'active bg-primary text-white shadow-sm' : 'text-muted'}`}
                        onClick={() => setActiveTab('classmates')}
                    >
                        <i className="bi bi-people me-2"></i>เพื่อนร่วมคลาส
                    </button>
                </li>
            </ul>

            {/* Tab Content */}
            {activeTab === 'homework' ? (
                <div className="table-wrapper">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th className="ps-4">ชื่อการบ้าน</th>
                                    <th>วันที่สั่ง</th>
                                    <th>กำหนดส่ง</th>
                                    <th>สถานะ</th>
                                    <th>คะแนน</th>
                                    <th className="text-end pe-4">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {homeworks.length > 0 ? homeworks.map(hw => {
                                    const status = getStatus(hw);
                                    return (
                                        <tr key={hw.id}>
                                            <td className="ps-4">
                                                <div className="fw-medium">{hw.title}</div>
                                                <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '250px' }}>{hw.description}</small>
                                            </td>
                                            <td>
                                                <div className="text-muted small">
                                                    <i className="bi bi-calendar-plus me-1"></i> {hw.created_at ? new Date(hw.created_at).toLocaleDateString('th-TH') : '-'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={status === 'overdue' ? 'text-danger fw-medium' : 'text-muted'}>
                                                    <i className="bi bi-calendar-event me-1"></i> {formatDate(hw.due_date)}
                                                </div>
                                            </td>
                                            <td>
                                                {status === 'graded' && <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success-subtle px-3 py-1">ตรวจแล้ว</span>}
                                                {status === 'submitted' && <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-1">ส่งแล้ว</span>}
                                                {status === 'pending' && <span className="badge rounded-pill bg-warning bg-opacity-10 text-dark border border-warning-subtle px-3 py-1">รอทำ</span>}
                                                {status === 'overdue' && <span className="badge rounded-pill bg-danger bg-opacity-10 text-danger border border-danger-subtle px-3 py-1">เลยกำหนด</span>}
                                            </td>
                                            <td>
                                                {hw.my_submission?.grade !== null ? <span className="fw-bold text-primary">{hw.my_submission.grade}</span> : '-'}
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2 text-nowrap">
                                                    <button
                                                        className="btn btn-sm btn-light rounded-pill px-3 border"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#viewHomeworkDetailModal"
                                                        onClick={() => setSelectedHw(hw)}
                                                        title="ดูรายละเอียด"
                                                        style={{ minWidth: '95px' }}
                                                    >
                                                        <i className="bi bi-info-circle me-1"></i>ละเอียด
                                                    </button>

                                                    <div style={{ minWidth: '105px' }} className="d-flex justify-content-center">
                                                        {(status === 'pending' || status === 'overdue') && (
                                                            <button className="btn btn-sm btn-primary rounded-pill w-100 shadow-sm border-0" data-bs-toggle="modal" data-bs-target="#submitHomeworkModal" onClick={() => { setSelectedHw(hw); resetFileSelection(); }}>
                                                                <i className="bi bi-send me-1"></i>ส่งงาน
                                                            </button>
                                                        )}
                                                        {status === 'submitted' && <span className="text-muted small align-self-center"><i className="bi bi-hourglass-split me-1"></i>รอตรวจ</span>}
                                                        {status === 'graded' && (
                                                            <button className="btn btn-sm btn-outline-success rounded-pill w-100" data-bs-toggle="modal" data-bs-target="#viewFeedbackModal" onClick={() => setSelectedHw(hw)}>
                                                                <i className="bi bi-chat-dots me-1"></i>Feedback
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">ยังไม่มีการสั่งการบ้าน</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="table-wrapper">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th className="ps-4">รหัส</th>
                                    <th>ชื่อ-นามสกุล</th>
                                    <th>วันที่เข้าร่วม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classmates.length > 0 ? classmates.map(mate => (
                                    <tr key={mate.id} className={mate.id === user.id ? 'table-primary bg-opacity-10' : ''}>
                                        <td className="ps-4">
                                            <span className="badge bg-light text-dark border px-2 py-1">{mate.student_id}</span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mate.name)}&background=random&color=fff`} alt="" width="32" height="32" className="rounded-circle" />
                                                <span className="fw-medium">{mate.name} {mate.id === user.id && <small className="text-primary">(คุณ)</small>}</span>
                                            </div>
                                        </td>
                                        <td className="text-muted">{mate.joined_at ? new Date(mate.joined_at).toLocaleDateString('th-TH') : '-'}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-5 text-muted">ยังไม่พบเพื่อนร่วมคลาส</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals & Toasts (same logic as StudentHome.jsx) */}
            <div className="modal fade" id="submitHomeworkModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold">
                                <i className="bi bi-send text-primary me-2"></i>ส่งการบ้าน
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-4 pt-3">
                            {selectedHw && (
                                <div className="bg-light rounded-3 p-3 mb-3">
                                    <div className="fw-medium">{selectedHw.title}</div>
                                    <p className="text-muted small mt-1 mb-0">{selectedHw.description}</p>
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label fw-medium">อัปโหลดรูปภาพ</label>
                                <div
                                    className="border border-2 border-dashed rounded-3 p-4 text-center bg-light"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <i className="bi bi-cloud-arrow-up fs-2 text-primary opacity-50 mb-2 d-block"></i>
                                    <p className="mb-0">คลิกเพื่อเลือกรูปภาพ หรือลากไฟล์มาวาง</p>
                                    <small className="text-muted">รองรับหลายไฟล์</small>
                                </div>
                                <input type="file" ref={fileInputRef} className="d-none" multiple accept="image/*" onChange={handleFilesSelected} />
                            </div>

                            {previews.length > 0 && (
                                <div className="row g-2 mb-3">
                                    {previews.map((p, i) => (
                                        <div key={i} className="col-4 col-md-3 position-relative">
                                            <img src={p.src} className="img-fluid rounded border shadow-sm" style={{ height: '100px', width: '100%', objectFit: 'cover' }} />
                                            <button className="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 m-1" style={{ width: '24px', height: '24px', padding: 0 }} onClick={() => removeFile(i)}>×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer border-top-0 pt-0">
                            <button className="btn btn-light" data-bs-dismiss="modal">ยกเลิก</button>
                            <button className="btn btn-primary px-4 rounded-pill shadow-sm" disabled={submitting} data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#confirmSubmitModal">
                                ส่งงาน
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                id="confirmSubmitModal"
                title="ยืนยันการส่งงาน"
                message={`คุณต้องการส่งงาน "${selectedHw?.title}" ใช่หรือไม่?`}
                confirmText="ยืนยันส่งงาน"
                confirmColor="primary"
                onConfirm={handleSubmit}
            />

            {/* Homework Detail Modal */}
            <div className="modal fade" id="viewHomeworkDetailModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold">
                                <i className="bi bi-journal-text text-primary me-2"></i>รายละเอียดการบ้าน
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-4 pt-3">
                            {selectedHw && (
                                <>
                                    <div className="mb-4">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill border border-primary-subtle">{course.course_code}</span>
                                            <span className="text-muted small">{course.course_name}</span>
                                        </div>
                                        <div className="text-muted small mb-2"><i className="bi bi-person me-1"></i>อาจารย์: {course.instructor_name}</div>
                                        <h4 className="fw-bold mb-3">{selectedHw.title}</h4>
                                        <div className="divider-dashed mb-3"></div>
                                        <div className="p-3 bg-light rounded-3 mb-3">
                                            <label className="fw-bold text-muted small d-block mb-2 text-uppercase letter-spacing-1">คำอธิบาย</label>
                                            <p className="mb-0 text-dark white-space-pre-wrap">{selectedHw.description || 'ไม่มีคำอธิบายเพิ่มเติม'}</p>
                                        </div>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-6">
                                            <div className="p-3 border rounded-3 bg-white h-100">
                                                <label className="text-muted small d-block mb-1">วันที่สั่ง</label>
                                                <div className="fw-medium text-dark">
                                                    <i className="bi bi-calendar-plus text-primary opacity-50 me-2"></i>
                                                    {selectedHw.created_at ? new Date(selectedHw.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="p-3 border rounded-3 bg-white h-100">
                                                <label className="text-muted small d-block mb-1">กำหนดส่ง</label>
                                                <div className="fw-medium text-danger">
                                                    <i className="bi bi-calendar-check opacity-50 me-2"></i>
                                                    {formatDate(selectedHw.due_date)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer border-top-0 pt-0">
                            <button className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">ปิด</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="viewFeedbackModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow rounded-4">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold">Feedback จากอาจารย์</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-4">
                            {selectedHw?.my_submission && (
                                <>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <div className="bg-success bg-opacity-10 rounded-3 p-3 text-center" style={{ minWidth: '80px' }}>
                                            <div className="fs-3 fw-bold text-success">{selectedHw.my_submission.grade}</div>
                                            <small className="text-muted small">คะแนน</small>
                                        </div>
                                        <div>
                                            <label className="text-muted small d-block mb-1">ความคิดเห็น</label>
                                            <p className="mb-0">{selectedHw.my_submission.feedback || 'ไม่มีความคิดเห็น'}</p>
                                        </div>
                                    </div>
                                    {selectedHw.my_submission.image_urls?.length > 0 && (
                                        <div className="row g-2">
                                            {selectedHw.my_submission.image_urls.map((img, i) => (
                                                <div key={i} className="col-4">
                                                    <img src={`${API_BASE}/uploads/${img}`} className="img-fluid rounded border" style={{ height: '80px', width: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="modal-footer border-top-0">
                            <button className="btn btn-light px-4 rounded-pill" data-bs-dismiss="modal">ปิด</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1060 }}>
                <div id="submitSuccessToast" className="toast align-items-center text-bg-success border-0" role="alert">
                    <div className="d-flex">
                        <div className="toast-body">ส่งงานสำเร็จ!</div>
                        <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentCourseDetail;
