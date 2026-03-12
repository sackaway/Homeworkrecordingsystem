import React, { useState, useEffect, useRef } from 'react';
import StatCard from '../components/common/StatCard';
import ConfirmModal from '../components/ConfirmModal';
import { getStudentStats, getStudentHomeworks, submitHomework } from '../services/api';

const API_BASE = '';

function StudentHome({ user }) {
    const [stats, setStats] = useState({ pending: 0, completed: 0, overdue: 0 });
    const [homeworks, setHomeworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHw, setSelectedHw] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const fetchData = async () => {
        try {
            const [statsData, hwData] = await Promise.all([
                getStudentStats(),
                getStudentHomeworks()
            ]);
            setStats(statsData);
            setHomeworks(hwData);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const formatDate = (isoStr) => {
        if (!isoStr) return '';
        const d = new Date(isoStr);
        const now = new Date();
        const diff = d - now;
        if (diff > 0 && diff < 86400000) return 'พรุ่งนี้, ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
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
        // Generate previews
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

    return (
        <div className="view-section">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom flex-wrap gap-3">
                <div>
                    <h3 className="fw-bold mb-1 text-primary">สวัสดี, {user?.name}!</h3>
                    <p className="text-muted mb-0">นี่คือภาพรวมการบ้านของคุณ</p>
                </div>
            </div>

            <h5 className="fw-bold section-title mb-4">ภาพรวมสถานะงานของคุณ</h5>
            <div className="row g-4 mb-5">
                <StatCard title="รอทำ (Pending)" value={stats.pending} unit="งาน" icon="bi-clock-history" colorClass="warning" textColorClass="warning" />
                <StatCard title="เสร็จแล้ว (Completed)" value={stats.completed} unit="งาน" icon="bi-check2-circle" colorClass="success" textColorClass="success" />
                <StatCard title="เลยกำหนด (Overdue)" value={stats.overdue} unit="งาน" icon="bi-exclamation-triangle" colorClass="danger" textColorClass="danger" />
            </div>

            <div className="divider-dashed"></div>
            <h5 className="fw-bold section-title mb-4">รายการการบ้านทั้งหมด ({homeworks.length})</h5>

            <div className="table-wrapper mb-2">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th scope="col" className="ps-4">รหัสวิชา</th>
                                <th scope="col">ชื่อวิชา</th>
                                <th scope="col">อาจารย์</th>
                                <th scope="col">หัวข้องาน</th>
                                <th scope="col">วันที่สั่ง</th>
                                <th scope="col">กำหนดส่ง</th>
                                <th scope="col">สถานะ</th>
                                <th scope="col">คะแนน</th>
                                <th scope="col" className="text-end pe-4">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {homeworks.length > 0 ? homeworks.map(hw => {
                                const status = getStatus(hw);
                                return (
                                    <tr key={hw.id}>
                                        <td className="ps-4">
                                            <span className="fw-medium text-dark">{hw.course_code}</span>
                                        </td>
                                        <td><span className="fw-medium text-dark">{hw.course_name}</span></td>
                                        <td><span className="text-muted small">{hw.instructor_name}</span></td>
                                        <td className="td-task-desc">{hw.title}</td>
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
                                            {status === 'graded' && <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success-subtle px-3 py-2"><i className="bi bi-check-circle me-1"></i>ตรวจแล้ว</span>}
                                            {status === 'submitted' && <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-2"><i className="bi bi-send me-1"></i>ส่งแล้ว</span>}
                                            {status === 'pending' && <span className="badge rounded-pill bg-warning bg-opacity-10 text-dark border border-warning-subtle px-3 py-2"><i className="bi bi-clock me-1"></i>รอทำ</span>}
                                            {status === 'overdue' && <span className="badge rounded-pill bg-danger bg-opacity-10 text-danger border border-danger-subtle px-3 py-2"><i className="bi bi-exclamation-circle me-1"></i>เลยกำหนด</span>}
                                        </td>
                                        <td>
                                            {hw.my_submission?.grade !== null && hw.my_submission?.grade !== undefined
                                                ? <span className="fw-bold text-primary">{hw.my_submission.grade}</span>
                                                : <span className="text-muted">-</span>
                                            }
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
                                                        <button
                                                            className="btn btn-sm btn-primary rounded-pill w-100 shadow-sm border-0"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#submitHomeworkModal"
                                                            onClick={() => { setSelectedHw(hw); resetFileSelection(); }}
                                                        >
                                                            <i className="bi bi-send me-1"></i>ส่งงาน
                                                        </button>
                                                    )}
                                                    {status === 'submitted' && (
                                                        <span className="text-muted small align-self-center"><i className="bi bi-hourglass-split me-1"></i>รอตรวจ</span>
                                                    )}
                                                    {status === 'graded' && hw.my_submission?.feedback && (
                                                        <button
                                                            className="btn btn-sm btn-outline-success rounded-pill w-100"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#viewFeedbackModal"
                                                            onClick={() => setSelectedHw(hw)}
                                                        >
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
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        <i className="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
                                        ยังไม่มีการบ้าน
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Submit Homework Modal */}
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
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1 me-2">{selectedHw.course_code}</span>
                                            <span className="fw-medium">{selectedHw.title}</span>
                                        </div>
                                    </div>
                                    {selectedHw.description && (
                                        <p className="text-muted small mt-2 mb-0">{selectedHw.description}</p>
                                    )}
                                </div>
                            )}

                            {/* File Upload Area */}
                            <div className="mb-3">
                                <label className="form-label fw-medium">
                                    <i className="bi bi-images me-1"></i>อัปโหลดรูปภาพ (เลือกได้หลายรูป)
                                </label>
                                <div
                                    className="border border-2 border-dashed rounded-3 p-4 text-center"
                                    style={{ cursor: 'pointer', borderColor: '#dee2e6', background: '#f8f9fa', transition: 'all 0.2s' }}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#0d6efd'; e.currentTarget.style.background = '#e8f0fe'; }}
                                    onDragLeave={e => { e.currentTarget.style.borderColor = '#dee2e6'; e.currentTarget.style.background = '#f8f9fa'; }}
                                    onDrop={e => {
                                        e.preventDefault();
                                        e.currentTarget.style.borderColor = '#dee2e6';
                                        e.currentTarget.style.background = '#f8f9fa';
                                        const dt = e.dataTransfer;
                                        if (dt.files.length > 0) {
                                            handleFilesSelected({ target: { files: dt.files } });
                                        }
                                    }}
                                >
                                    <i className="bi bi-cloud-arrow-up fs-1 text-primary opacity-75 d-block mb-2"></i>
                                    <p className="mb-1 fw-medium">คลิกเพื่อเลือกรูปภาพ หรือลากไฟล์มาวางที่นี่</p>
                                    <small className="text-muted">รองรับ JPG, PNG, GIF (สูงสุด 16MB ต่อไฟล์)</small>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="d-none"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFilesSelected}
                                />
                            </div>

                            {/* Image Previews */}
                            {previews.length > 0 && (
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <small className="fw-medium text-muted">รูปภาพที่เลือก ({previews.length} รูป)</small>
                                        <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={resetFileSelection}>
                                            <i className="bi bi-x-lg me-1"></i>ล้างทั้งหมด
                                        </button>
                                    </div>
                                    <div className="row g-2">
                                        {previews.map((preview, idx) => (
                                            <div key={idx} className="col-4 col-md-3">
                                                <div className="position-relative">
                                                    <img src={preview.src} alt={preview.name}
                                                        className="img-fluid rounded-3 border shadow-sm"
                                                        style={{ height: '120px', width: '100%', objectFit: 'cover' }} />
                                                    <button
                                                        className="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 m-1 shadow"
                                                        style={{ width: '24px', height: '24px', padding: 0, lineHeight: '24px', fontSize: '0.7rem' }}
                                                        onClick={() => removeFile(idx)}
                                                    >
                                                        <i className="bi bi-x"></i>
                                                    </button>
                                                    <small className="d-block text-muted text-truncate mt-1" style={{ fontSize: '0.7rem' }}>{preview.name}</small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer border-top-0 pt-0">
                            <button type="button" className="btn btn-light" data-bs-dismiss="modal">ยกเลิก</button>
                            <button
                                type="button"
                                className="btn btn-primary px-4 rounded-pill fw-medium shadow-sm"
                                disabled={submitting}
                                data-bs-dismiss="modal"
                                data-bs-toggle="modal"
                                data-bs-target="#confirmSubmitModal"
                            >
                                <i className="bi bi-send me-1"></i>ส่งงาน {selectedFiles.length > 0 ? `(${selectedFiles.length} รูป)` : ''}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Submit */}
            <ConfirmModal
                id="confirmSubmitModal"
                title="ยืนยันการส่งงาน"
                message={`คุณต้องการส่งงาน "${selectedHw?.title}" ${selectedFiles.length > 0 ? `พร้อมรูปภาพ ${selectedFiles.length} รูป` : '(ไม่มีรูปภาพ)'} ใช่หรือไม่?`}
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
                                            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill border border-primary-subtle">{selectedHw.course_code}</span>
                                            <span className="text-muted small">{selectedHw.course_name}</span>
                                        </div>
                                        <div className="text-muted small mb-2"><i className="bi bi-person me-1"></i>อาจารย์: {selectedHw.instructor_name}</div>
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

            {/* View Feedback Modal */}
            <div className="modal fade" id="viewFeedbackModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold">
                                <i className="bi bi-chat-dots text-success me-2"></i>Feedback จากอาจารย์
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-4 pt-3">
                            {selectedHw && (
                                <>
                                    <div className="bg-light rounded-3 p-3 mb-3">
                                        <span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1 me-2">{selectedHw.course_code}</span>
                                        <span className="fw-medium">{selectedHw.title}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <div className="bg-success bg-opacity-10 rounded-3 p-3 text-center" style={{ minWidth: '80px' }}>
                                            <div className="fs-3 fw-bold text-success">{selectedHw.my_submission?.grade}</div>
                                            <small className="text-muted">คะแนน</small>
                                        </div>
                                        <div className="flex-grow-1">
                                            <label className="form-label fw-medium text-muted small mb-1">ความคิดเห็น</label>
                                            <p className="mb-0">{selectedHw.my_submission?.feedback || 'ไม่มีความคิดเห็น'}</p>
                                        </div>
                                    </div>
                                    {/* Show submitted images */}
                                    {selectedHw.my_submission?.image_urls?.length > 0 && (
                                        <div>
                                            <label className="form-label fw-medium text-muted small">รูปที่ส่ง</label>
                                            <div className="row g-2">
                                                {selectedHw.my_submission.image_urls.map((img, i) => (
                                                    <div key={i} className="col-4">
                                                        <img src={`${API_BASE}/uploads/${img}`} alt="" className="img-fluid rounded-3 border" style={{ height: '80px', width: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="modal-footer border-top-0 pt-0">
                            <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">ปิด</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1060 }}>
                <div id="submitSuccessToast" className="toast align-items-center text-bg-success border-0" role="alert">
                    <div className="d-flex">
                        <div className="toast-body d-flex align-items-center">
                            <i className="bi bi-check-circle me-2 fs-5"></i>ส่งงานสำเร็จ!
                        </div>
                        <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentHome;
