import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { getInstructorStats, getInstructorHomeworks, deleteHomework } from '../services/api';

function InstructorHome({ user }) {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total_homeworks: 0, pending_grading: 0, students_count: 0 });
    const [homeworks, setHomeworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hwToDelete, setHwToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        try {
            const [statsData, hwData] = await Promise.all([
                getInstructorStats(),
                getInstructorHomeworks()
            ]);
            setStats(statsData);
            setHomeworks(hwData);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDeleteHomework = async () => {
        if (!hwToDelete) return;
        try {
            await deleteHomework(hwToDelete.id);
            setHomeworks(homeworks.filter(hw => hw.id !== hwToDelete.id));
            setHwToDelete(null);
        } catch (err) {
            console.error('Error deleting homework:', err);
        }
    };

    const formatDate = (isoStr) => {
        if (!isoStr) return '';
        const d = new Date(isoStr);
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const filteredHomeworks = homeworks.filter(hw => {
        const q = searchQuery.toLowerCase();
        return !q || hw.title.toLowerCase().includes(q) || hw.course_code.toLowerCase().includes(q) || hw.course_name.toLowerCase().includes(q);
    });

    if (loading) {
        return (
            <div className="view-section text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-3">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    return (
        <div className="view-section">
            {/* Welcome Section */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom flex-wrap gap-3">
                <div>
                    <h3 className="fw-bold mb-1 text-primary">สวัสดี, {user?.name || 'อาจารย์'}! </h3>
                    <p className="text-muted mb-0">ระบบจัดการห้องเรียนและการสั่งการบ้าน</p>
                </div>
                <button
                    className="btn btn-primary px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2"
                    data-bs-toggle="modal"
                    data-bs-target="#addHomeworkModal"
                >
                    <i className="bi bi-megaphone"></i> สั่งการบ้านใหม่
                </button>
            </div>

            <h5 className="fw-bold section-title mb-4">ภาพรวมการสอน</h5>

            {/* Statistics Cards */}
            <div className="row g-4 mb-2">
                <div className="col-md-4">
                    <div className="card stat-card h-100 p-3 shadow-none">
                        <div className="card-body d-flex align-items-center">
                            <div className="icon-circle bg-primary bg-opacity-10 text-primary me-3">
                                <i className="bi bi-journal-text"></i>
                            </div>
                            <div>
                                <h6 className="text-muted mb-1">งานที่สั่งทั้งหมด</h6>
                                <h3 className="fw-bold mb-0">
                                    {stats.total_homeworks} <span className="fs-6 fw-normal text-muted">งาน</span>
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card stat-card h-100 p-3 shadow-none">
                        <div className="card-body d-flex align-items-center">
                            <div className="icon-circle bg-warning bg-opacity-10 text-warning me-3">
                                <i className="bi bi-inbox"></i>
                            </div>
                            <div>
                                <h6 className="text-muted mb-1">รอตรวจคะแนน</h6>
                                <h3 className="fw-bold mb-0">
                                    {stats.pending_grading} <span className="fs-6 fw-normal text-muted">ชิ้น</span>
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card stat-card h-100 p-3 shadow-none">
                        <div className="card-body d-flex align-items-center">
                            <div className="icon-circle bg-success bg-opacity-10 text-success me-3">
                                <i className="bi bi-people"></i>
                            </div>
                            <div>
                                <h6 className="text-muted mb-1">นักเรียนทั้งหมด</h6>
                                <h3 className="fw-bold mb-0">
                                    {stats.students_count} <span className="fs-6 fw-normal text-muted">คน</span>
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="divider-dashed"></div>

            {/* Homework List Header */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <h5 className="mb-0 fw-bold section-title">รายการงานที่สั่ง ({homeworks.length})</h5>

                <div className="custom-search-wrapper shadow-sm d-flex align-items-center px-3 py-1">
                    <i className="bi bi-search text-muted"></i>
                    <input
                        type="text"
                        className="form-control py-1 ps-2 pe-0"
                        placeholder="ค้นหางาน..."
                        style={{ minWidth: '220px' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Homework Table */}
            <div className="table-wrapper mb-2">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th scope="col" className="ps-4">รหัสวิชา</th>
                                <th scope="col">ชื่อวิชา</th>
                                <th scope="col">รายละเอียดงาน</th>
                                <th scope="col">กำหนดส่ง</th>
                                <th scope="col">ยอดส่งงาน</th>
                                <th scope="col">สถานะ</th>
                                <th scope="col" className="text-end pe-4">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHomeworks.length > 0 ? filteredHomeworks.map(hw => {
                                const pct = hw.submissions.total > 0 ? (hw.submissions.submitted / hw.submissions.total) * 100 : 0;
                                return (
                                    <tr key={hw.id}>
                                        <td className="ps-4">
                                            <span className="fw-medium text-dark">
                                                {hw.course_code}
                                            </span>
                                        </td>
                                        <td><span className="fw-medium text-dark">{hw.course_name}</span></td>
                                        <td className="td-task-desc">{hw.title}</td>
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
                                                <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success-subtle px-3 py-2">เปิดรับส่ง</span>
                                            ) : (
                                                <span className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle px-3 py-2">ปิดรับส่งแล้ว</span>
                                            )}
                                        </td>
                                        <td className="text-end pe-4">
                                            <button className="action-btn btn-check-task me-1" title="ตรวจงาน" onClick={() => navigate(`/homework/${hw.id}`)}>
                                                <i className="bi bi-clipboard-check fs-5"></i>
                                            </button>
                                            <button
                                                className="action-btn btn-delete-task"
                                                title="ลบ"
                                                data-bs-toggle="modal"
                                                data-bs-target="#confirmDeleteHomeworkModal"
                                                onClick={() => setHwToDelete(hw)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        <i className="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
                                        {searchQuery ? 'ไม่พบงานที่ค้นหา' : 'ยังไม่มีงานที่สั่ง'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm Delete Homework Modal */}
            <ConfirmModal
                id="confirmDeleteHomeworkModal"
                title="ยืนยันการลบการบ้าน"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบงาน "${hwToDelete?.title}"? ข้อมูลงานจะถูกลบอย่างถาวร`}
                confirmText="ลบงาน"
                onConfirm={handleDeleteHomework}
            />
        </div>
    );
}

export default InstructorHome;
