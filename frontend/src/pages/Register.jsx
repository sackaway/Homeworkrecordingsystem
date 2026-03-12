import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authRegister } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

function Register({ onLogin }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '', password: '', confirmPassword: '',
        name: '', email: '', role: 'student', student_id: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                username: formData.username,
                password: formData.password,
                name: formData.name,
                email: formData.email,
                role: formData.role,
            };
            if (formData.role === 'student' && formData.student_id) {
                payload.student_id = formData.student_id;
            }
            const data = await authRegister(payload);
            onLogin(data.user);
            navigate('/');
        } catch (err) {
            setError(err.message || 'สมัครสมาชิกไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = formData.username && formData.password && formData.confirmPassword && formData.name && formData.email;

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
            <div className="card border-0 shadow-lg" style={{ maxWidth: '480px', width: '100%', borderRadius: '1rem' }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-primary mb-2">
                            <i className="bi bi-journal-check me-2"></i>Homework Tracker
                        </h2>
                        <p className="text-muted">สมัครสมาชิกเพื่อเริ่มใช้งาน</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger py-2 px-3 rounded-3 d-flex align-items-center mb-3">
                            <i className="bi bi-exclamation-circle me-2"></i>{error}
                        </div>
                    )}

                    <form onSubmit={e => e.preventDefault()}>
                        {/* Role Selection */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">บทบาท</label>
                            <div className="d-flex gap-2">
                                <input type="radio" className="btn-check" name="regRole" id="regStudent" autoComplete="off"
                                    checked={formData.role === 'student'} onChange={() => setFormData({ ...formData, role: 'student' })} />
                                <label className="btn btn-outline-success flex-fill py-2" htmlFor="regStudent">
                                    <i className="bi bi-person-badge me-1"></i> นักเรียน
                                </label>

                                <input type="radio" className="btn-check" name="regRole" id="regInstructor" autoComplete="off"
                                    checked={formData.role === 'instructor'} onChange={() => setFormData({ ...formData, role: 'instructor' })} />
                                <label className="btn btn-outline-primary flex-fill py-2" htmlFor="regInstructor">
                                    <i className="bi bi-person-video3 me-1"></i> อาจารย์
                                </label>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">ชื่อ-นามสกุล</label>
                            <div className="input-group shadow-sm rounded-3">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-person"></i></span>
                                <input type="text" className="form-control border-start-0 ps-0" placeholder="เช่น ด.ช. สมชาย รักเรียน"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">อีเมล</label>
                            <div className="input-group shadow-sm rounded-3">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-envelope"></i></span>
                                <input type="email" className="form-control border-start-0 ps-0" placeholder="เช่น somchai@school.com"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            </div>
                        </div>

                        {/* Student ID (only for students) */}
                        {formData.role === 'student' && (
                            <div className="mb-3">
                                <label className="form-label fw-medium">รหัสนักเรียน</label>
                                <div className="input-group shadow-sm rounded-3">
                                    <span className="input-group-text bg-white border-end-0"><i className="bi bi-hash"></i></span>
                                    <input type="text" className="form-control border-start-0 ps-0" placeholder="เช่น 66010001"
                                        value={formData.student_id} onChange={e => setFormData({ ...formData, student_id: e.target.value })} />
                                </div>
                            </div>
                        )}

                        <div className="divider-dashed my-3"></div>

                        {/* Username */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">ชื่อผู้ใช้ (Username)</label>
                            <div className="input-group shadow-sm rounded-3">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-at"></i></span>
                                <input type="text" className="form-control border-start-0 ps-0" placeholder="เช่น somchai"
                                    value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="mb-3">
                            <label className="form-label fw-medium">รหัสผ่าน</label>
                            <div className="input-group shadow-sm rounded-3">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-lock"></i></span>
                                <input type="text" className="form-control border-start-0 ps-0" placeholder="กรอกรหัสผ่าน"
                                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-4">
                            <label className="form-label fw-medium">ยืนยันรหัสผ่าน</label>
                            <div className="input-group shadow-sm rounded-3">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-lock-fill"></i></span>
                                <input type="text" className="form-control border-start-0 ps-0" placeholder="กรอกรหัสผ่านอีกครั้ง"
                                    value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} required />
                            </div>
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <small className="text-danger"><i className="bi bi-x-circle me-1"></i>รหัสผ่านไม่ตรงกัน</small>
                            )}
                        </div>

                        <button
                            type="button"
                            className="btn btn-primary w-100 py-2 fw-medium rounded-pill shadow-sm"
                            disabled={!isFormValid || loading}
                            data-bs-toggle="modal"
                            data-bs-target="#confirmRegisterModal"
                        >
                            {loading ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span>กำลังสมัคร...</>
                            ) : (
                                <>สมัครสมาชิก <i className="bi bi-person-plus ms-1"></i></>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <span className="text-muted">มีบัญชีอยู่แล้ว? </span>
                        <Link to="/login" className="text-primary fw-medium text-decoration-none">เข้าสู่ระบบ</Link>
                    </div>
                </div>
            </div>

            <ConfirmModal
                id="confirmRegisterModal"
                title="ยืนยันการสมัครสมาชิก"
                message={`สมัครเป็น "${formData.role === 'instructor' ? 'อาจารย์' : 'นักเรียน'}" ด้วยชื่อผู้ใช้ "${formData.username}" ใช่หรือไม่?`}
                confirmText="ยืนยันสมัคร"
                confirmColor="primary"
                onConfirm={handleRegister}
            />
        </div>
    );
}

export default Register;
