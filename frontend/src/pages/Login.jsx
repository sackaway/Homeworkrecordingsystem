import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authLogin } from '../services/api';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await authLogin(username, password);
            onLogin(data.user);
            navigate('/');
        } catch (err) {
            setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100 pb-5">
            <div className="card border-0 shadow-lg" style={{ maxWidth: '440px', width: '100%', borderRadius: '1rem' }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-primary mb-2">
                            <i className="bi bi-journal-check me-2"></i>Homework Tracker
                        </h2>
                        <p className="text-muted">เข้าสู่ระบบเพื่อจัดการการเรียนการสอน</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger py-2 px-3 rounded-3 d-flex align-items-center mb-3">
                            <i className="bi bi-exclamation-circle me-2"></i>{error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label fw-medium">ชื่อผู้ใช้</label>
                            <div className="input-group shadow-sm rounded-3">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-person"></i></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    id="username"
                                    placeholder="กรอกชื่อผู้ใช้"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="form-label fw-medium">รหัสผ่าน</label>
                            <div className="input-group shadow-sm rounded-3">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-lock"></i></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    id="password"
                                    placeholder="กรอกรหัสผ่าน"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-2 fw-medium rounded-pill shadow-sm" disabled={loading}>
                            {loading ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span>กำลังเข้าสู่ระบบ...</>
                            ) : (
                                <>เข้าสู่ระบบ <i className="bi bi-box-arrow-in-right ms-1"></i></>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <span className="text-muted">ยังไม่มีบัญชี? </span>
                        <a href="/register" className="text-primary fw-medium text-decoration-none">สมัครสมาชิก</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
