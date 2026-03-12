import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

function Profile({ user, onProfileUpdate }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', email: '', student_id: ''
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '', new_password: '', confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                student_id: user.student_id || ''
            });
        }
    }, [user]);

    const handleUpdateProfile = async () => {
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    student_id: formData.student_id
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSuccessMsg('บันทึกข้อมูลสำเร็จ!');
            if (onProfileUpdate) onProfileUpdate(data.user);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setErrorMsg(err.message || 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setPwError('');
        setPwSuccess('');

        if (passwordData.new_password !== passwordData.confirm_password) {
            setPwError('รหัสผ่านใหม่ไม่ตรงกัน');
            return;
        }
        if (passwordData.new_password.length < 4) {
            setPwError('รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร');
            return;
        }

        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPwSuccess('เปลี่ยนรหัสผ่านสำเร็จ!');
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
            setTimeout(() => setPwSuccess(''), 3000);
        } catch (err) {
            setPwError(err.message || 'เกิดข้อผิดพลาด');
        }
    };

    const isInstructor = user?.role === 'instructor';

    return (
        <div className="view-section">
            <button className="btn btn-sm btn-light rounded-pill px-3 mb-3" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-1"></i> กลับ
            </button>

            <div className="d-flex align-items-center mb-4 pb-4 border-bottom gap-3">
                <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0D8ABC&color=fff&size=80`}
                    alt="Avatar"
                    width="80" height="80"
                    className="rounded-circle shadow-sm"
                />
                <div>
                    <h3 className="fw-bold mb-1">โปรไฟล์ส่วนตัว</h3>
                    <span className={`badge rounded-pill px-3 py-2 ${isInstructor ? 'bg-primary bg-opacity-10 text-primary' : 'bg-success bg-opacity-10 text-success'}`}>
                        <i className={`bi ${isInstructor ? 'bi-person-video3' : 'bi-person-badge'} me-1`}></i>
                        {isInstructor ? 'อาจารย์ผู้สอน' : 'นักเรียน'}
                    </span>
                </div>
            </div>

            <div className="row g-4">
                {/* Profile Info Card */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white border-bottom-0 p-4 pb-2">
                            <h5 className="fw-bold mb-0"><i className="bi bi-person-circle text-primary me-2"></i>ข้อมูลส่วนตัว</h5>
                        </div>
                        <div className="card-body p-4 pt-2">
                            {successMsg && (
                                <div className="alert alert-success py-2 rounded-3 d-flex align-items-center mb-3">
                                    <i className="bi bi-check-circle me-2"></i>{successMsg}
                                </div>
                            )}
                            {errorMsg && (
                                <div className="alert alert-danger py-2 rounded-3 d-flex align-items-center mb-3">
                                    <i className="bi bi-exclamation-circle me-2"></i>{errorMsg}
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label fw-medium text-muted small">ชื่อผู้ใช้ (Username)</label>
                                <input type="text" className="form-control bg-light" value={user?.username || ''} disabled />
                                <small className="text-muted">ชื่อผู้ใช้ไม่สามารถเปลี่ยนได้</small>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-medium">ชื่อ-นามสกุล</label>
                                <input type="text" className="form-control" placeholder="เช่น อ. แซ็ก"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-medium">อีเมล</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white"><i className="bi bi-envelope"></i></span>
                                    <input type="email" className="form-control" placeholder="email@school.com"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                            </div>

                            {!isInstructor && (
                                <div className="mb-3">
                                    <label className="form-label fw-medium">รหัสนักเรียน</label>
                                    <input type="text" className="form-control" placeholder="เช่น 66010001"
                                        value={formData.student_id} onChange={e => setFormData({ ...formData, student_id: e.target.value })} />
                                </div>
                            )}

                            <button
                                className="btn btn-primary w-100 rounded-pill py-2 fw-medium shadow-sm mt-2"
                                disabled={loading}
                                data-bs-toggle="modal"
                                data-bs-target="#confirmUpdateProfile"
                            >
                                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>กำลังบันทึก...</> : <><i className="bi bi-check-lg me-1"></i>บันทึกข้อมูล</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white border-bottom-0 p-4 pb-2">
                            <h5 className="fw-bold mb-0"><i className="bi bi-shield-lock text-warning me-2"></i>เปลี่ยนรหัสผ่าน</h5>
                        </div>
                        <div className="card-body p-4 pt-2">
                            {pwSuccess && (
                                <div className="alert alert-success py-2 rounded-3 d-flex align-items-center mb-3">
                                    <i className="bi bi-check-circle me-2"></i>{pwSuccess}
                                </div>
                            )}
                            {pwError && (
                                <div className="alert alert-danger py-2 rounded-3 d-flex align-items-center mb-3">
                                    <i className="bi bi-exclamation-circle me-2"></i>{pwError}
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label fw-medium">รหัสผ่านปัจจุบัน</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white"><i className="bi bi-lock"></i></span>
                                    <input type="text" className="form-control" placeholder="กรอกรหัสผ่านปัจจุบัน"
                                        value={passwordData.current_password} onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })} />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-medium">รหัสผ่านใหม่</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white"><i className="bi bi-key"></i></span>
                                    <input type="text" className="form-control" placeholder="กรอกรหัสผ่านใหม่"
                                        value={passwordData.new_password} onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })} />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-medium">ยืนยันรหัสผ่านใหม่</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white"><i className="bi bi-key-fill"></i></span>
                                    <input type="text" className="form-control" placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                                        value={passwordData.confirm_password} onChange={e => setPasswordData({ ...passwordData, confirm_password: e.target.value })} />
                                </div>
                            </div>

                            <button
                                className="btn btn-warning w-100 rounded-pill py-2 fw-medium shadow-sm mt-2"
                                disabled={!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                                data-bs-toggle="modal"
                                data-bs-target="#confirmChangePassword"
                            >
                                <i className="bi bi-shield-check me-1"></i>เปลี่ยนรหัสผ่าน
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Info */}
            <div className="card border-0 shadow-sm rounded-4 mt-4">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-3"><i className="bi bi-info-circle text-muted me-2"></i>ข้อมูลบัญชี</h5>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="bg-light rounded-3 p-3">
                                <small className="text-muted d-block">บทบาท</small>
                                <span className="fw-medium">{isInstructor ? 'อาจารย์ผู้สอน' : 'นักเรียน'}</span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="bg-light rounded-3 p-3">
                                <small className="text-muted d-block">ชื่อผู้ใช้</small>
                                <span className="fw-medium">{user?.username}</span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="bg-light rounded-3 p-3">
                                <small className="text-muted d-block">User ID</small>
                                <span className="fw-medium">#{user?.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Modals */}
            <ConfirmModal
                id="confirmUpdateProfile"
                title="ยืนยันการบันทึกข้อมูล"
                message="คุณต้องการบันทึกการเปลี่ยนแปลงข้อมูลส่วนตัวใช่หรือไม่?"
                confirmText="บันทึก"
                confirmColor="primary"
                onConfirm={handleUpdateProfile}
            />
            <ConfirmModal
                id="confirmChangePassword"
                title="ยืนยันการเปลี่ยนรหัสผ่าน"
                message="คุณต้องการเปลี่ยนรหัสผ่านใช่หรือไม่?"
                confirmText="เปลี่ยนรหัสผ่าน"
                confirmColor="warning"
                onConfirm={handleChangePassword}
            />
        </div>
    );
}

export default Profile;
