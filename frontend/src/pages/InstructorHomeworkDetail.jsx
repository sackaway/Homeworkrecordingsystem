import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { getSubmissions, gradeSubmission, getInstructorHomeworks } from '../services/api';

const API_BASE = '';

function InstructorHomeworkDetail({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [homework, setHomework] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });
    const [selectedSub, setSelectedSub] = useState(null);
    const [viewImages, setViewImages] = useState(null);  // array of image filenames
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [hwList, subs] = await Promise.all([
                    getInstructorHomeworks(),
                    getSubmissions(id)
                ]);
                const hw = hwList.find(h => h.id === parseInt(id));
                setHomework(hw);
                setSubmissions(subs);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleGrade = async () => {
        if (!selectedSub || !selectedSub.id) return;
        try {
            await gradeSubmission(selectedSub.id, {
                grade: parseInt(gradeData.grade),
                feedback: gradeData.feedback
            });
            // Refresh submissions
            const subs = await getSubmissions(id);
            setSubmissions(subs);
            setSelectedSub(null);
            setGradeData({ grade: '', feedback: '' });
        } catch (err) {
            console.error('Error grading:', err);
        }
    };

    const formatDate = (isoStr) => {
        if (!isoStr) return '-';
        return new Date(isoStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="view-section text-center py-5">
                <div className="spinner-border text-primary"></div>
                <p className="text-muted mt-3">กำลังโหลด...</p>
            </div>
        );
    }

    // Helper to find student name for the gallery
    const getGalleryStudentName = () => {
        if (!viewImages) return 'Student';
        const sub = submissions.find(s => s.image_urls === viewImages);
        return sub ? sub.student_name : 'Student';
    };

    return (
        <div className="view-section">
            <button className="btn btn-sm btn-light rounded-pill px-3 mb-3" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-1"></i> กลับ
            </button>

            {homework && (
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                        <div>
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-2 rounded-pill mb-2">
                                {homework.course_code}
                            </span>
                            <h4 className="fw-bold mb-2">{homework.title}</h4>
                            <p className="text-muted mb-2">{homework.description}</p>
                            <small className="text-muted"><i className="bi bi-calendar-event me-1"></i>กำหนดส่ง: {formatDate(homework.due_date)}</small>
                        </div>
                        <span className={`badge rounded-pill px-3 py-2 ${homework.status === 'open' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                            {homework.status === 'open' ? 'เปิดรับส่ง' : 'ปิดรับส่งแล้ว'}
                        </span>
                    </div>
                </div>
            )}

            <h5 className="fw-bold section-title mb-4">
                <span className="text-primary me-2">|</span>งานที่นักเรียนส่ง ({submissions.filter(s => s.status !== 'missing').length}/{submissions.length})
            </h5>

            <div className="table-wrapper">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th className="ps-4">นักเรียน</th>
                                <th>รหัส</th>
                                <th>สถานะ</th>
                                <th>ส่งเมื่อ</th>
                                <th>คะแนน</th>
                                <th className="text-end pe-4">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((sub, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(sub.student_name)}&background=random&color=fff`} alt="" width="32" height="32" className="rounded-circle" />
                                            <span className="fw-medium">{sub.student_name}</span>
                                        </div>
                                    </td>
                                    <td><span className="badge bg-light text-dark border">{sub.student_code}</span></td>
                                    <td>
                                        {sub.status === 'graded' && <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2"><i className="bi bi-check-circle me-1"></i>ตรวจแล้ว</span>}
                                        {sub.status === 'submitted' && <span className="badge bg-warning bg-opacity-10 text-dark rounded-pill px-3 py-2"><i className="bi bi-clock me-1"></i>รอตรวจ</span>}
                                        {sub.status === 'missing' && <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2"><i className="bi bi-x-circle me-1"></i>ยังไม่ส่ง</span>}
                                    </td>
                                    <td className="text-muted">{formatDate(sub.submitted_at)}</td>
                                    <td>
                                        {sub.grade !== null ? (
                                            <span className="fw-bold text-primary">{sub.grade}</span>
                                        ) : '-'}
                                    </td>
                                    <td className="text-end pe-4">
                                        {sub.image_urls && sub.image_urls.length > 0 && (
                                            <button className="btn btn-sm btn-outline-primary rounded-pill me-1" onClick={() => { setViewImages(sub.image_urls); setCurrentImageIndex(0); }}>
                                                <i className="bi bi-images me-1"></i>{sub.image_urls.length}
                                            </button>
                                        )}
                                        {sub.id && sub.status !== 'missing' && (
                                            <button
                                                className="btn btn-sm btn-primary rounded-pill px-3"
                                                data-bs-toggle="modal"
                                                data-bs-target="#gradeModal"
                                                onClick={() => {
                                                    setSelectedSub(sub);
                                                    setGradeData({ grade: sub.grade || '', feedback: sub.feedback || '' });
                                                }}
                                            >
                                                <i className="bi bi-pencil me-1"></i>{sub.status === 'graded' ? 'แก้ไข' : 'ให้คะแนน'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Grade Modal */}
            <div className="modal fade" id="gradeModal" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold">
                                <i className="bi bi-pencil-square text-primary me-2"></i>ให้คะแนน — {selectedSub?.student_name}
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="mb-3">
                                <label className="form-label fw-medium">คะแนน</label>
                                <input type="number" className="form-control" placeholder="เช่น 35" value={gradeData.grade} onChange={e => setGradeData({ ...gradeData, grade: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-medium">ความคิดเห็น (Feedback)</label>
                                <textarea className="form-control" rows="3" placeholder="แสดงความคิดเห็น..." value={gradeData.feedback} onChange={e => setGradeData({ ...gradeData, feedback: e.target.value })}></textarea>
                            </div>
                        </div>
                        <div className="modal-footer border-top-0">
                            <button className="btn btn-light" data-bs-dismiss="modal">ยกเลิก</button>
                            <button className="btn btn-primary px-4 rounded-pill" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#confirmGradeModal">
                                <i className="bi bi-check-lg me-1"></i>บันทึกคะแนน
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                id="confirmGradeModal"
                title="ยืนยันการให้คะแนน"
                message={`ยืนยันให้คะแนน ${gradeData.grade} แก่ ${selectedSub?.student_name} ใช่หรือไม่?`}
                confirmText="ยืนยัน"
                confirmColor="primary"
                onConfirm={handleGrade}
            />

            {/* Image Gallery Modal */}
            {viewImages && (
                <div className="modal fade show d-block glass-backdrop animate-fadeIn"
                    style={{ zIndex: 1060 }}
                    onClick={() => setViewImages(null)}
                    onKeyDown={e => {
                        if (e.key === 'ArrowLeft') setCurrentImageIndex(prev => Math.max(0, prev - 1));
                        if (e.key === 'ArrowRight') setCurrentImageIndex(prev => Math.min(viewImages.length - 1, prev + 1));
                        if (e.key === 'Escape') setViewImages(null);
                    }}
                    tabIndex={0}
                    ref={el => el && el.focus()}
                >
                    <div className="d-flex flex-column align-items-center justify-content-center vh-100 p-3" onClick={e => e.stopPropagation()}>
                        {/* Header - Glass Card */}
                        <div className="glass-card rounded-pill px-4 py-2 d-flex justify-content-between align-items-center w-100 mb-4 animate-fadeIn" style={{ maxWidth: '900px' }}>
                            <div className="d-flex align-items-center gap-3">
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getGalleryStudentName())}&background=0d6efd&color=fff`} alt="" width="32" height="32" className="rounded-circle shadow-sm" />
                                <div>
                                    <div className="text-white fw-bold small mb-0" style={{ lineHeight: 1.2 }}>{getGalleryStudentName()}</div>
                                    <span className="text-white-50" style={{ fontSize: '0.75rem' }}>
                                        <i className="bi bi-images me-1"></i>รูปที่ {currentImageIndex + 1} จาก {viewImages.length}
                                    </span>
                                </div>
                            </div>
                            <button className="btn btn-link text-white p-0 lh-1 opacity-75" style={{ textDecoration: 'none' }} onClick={() => setViewImages(null)}>
                                <i className="bi bi-x-lg fs-5"></i>
                            </button>
                        </div>

                        {/* Main Image Container */}
                        <div className="position-relative d-flex align-items-center justify-content-center w-100 animate-fadeIn" style={{ maxWidth: '1000px', flex: 1, minHeight: 0 }}>
                            {viewImages.length > 1 && (
                                <button
                                    className={`glass-control rounded-circle position-absolute start-0 ms-4 transition-all ${currentImageIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                                    style={{ width: '56px', height: '56px', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}
                                    onClick={() => setCurrentImageIndex(prev => prev - 1)}
                                    disabled={currentImageIndex === 0}
                                >
                                    <i className="bi bi-chevron-left fs-4"></i>
                                </button>
                            )}

                            <div className="image-viewer-container p-2 rounded-4 shadow-lg" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                <img
                                    src={`${API_BASE}/uploads/${viewImages[currentImageIndex]}`}
                                    alt={`รูปที่ ${currentImageIndex + 1}`}
                                    className="img-fluid rounded-4 shadow-lg mx-auto d-block"
                                    style={{ maxHeight: '75vh', objectFit: 'contain', transition: 'all 0.4s ease' }}
                                />
                            </div>

                            {viewImages.length > 1 && (
                                <button
                                    className={`glass-control rounded-circle position-absolute end-0 me-4 transition-all ${currentImageIndex === viewImages.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                                    style={{ width: '56px', height: '56px', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}
                                    onClick={() => setCurrentImageIndex(prev => prev + 1)}
                                    disabled={currentImageIndex === viewImages.length - 1}
                                >
                                    <i className="bi bi-chevron-right fs-4"></i>
                                </button>
                            )}
                        </div>

                        {/* Thumbnail Strip - Glass Container */}
                        {viewImages.length > 1 && (
                            <div className="glass-card rounded-4 p-2 mt-4 d-flex gap-2 justify-content-center animate-fadeIn shadow-lg overflow-hidden" style={{ maxWidth: '90%' }}>
                                <div className="d-flex gap-2 overflow-auto py-1 px-2 custom-scrollbar" style={{ maxWidth: '100%' }}>
                                    {viewImages.map((img, i) => (
                                        <div
                                            key={i}
                                            className={`rounded-3 p-1 transition-all cursor-pointer ${i === currentImageIndex ? 'bg-primary' : ''}`}
                                            onClick={() => setCurrentImageIndex(i)}
                                            style={{ transition: 'all 0.3s' }}
                                        >
                                            <img
                                                src={`${API_BASE}/uploads/${img}`}
                                                alt={`Thumb ${i + 1}`}
                                                className={`rounded-2 ${i === currentImageIndex ? 'opacity-100' : 'opacity-60'}`}
                                                style={{ width: '50px', height: '50px', objectFit: 'cover', transition: 'all 0.3s' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default InstructorHomeworkDetail;
