import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Navbar({ currentRole, onLogout, userName }) {
    const navigate = useNavigate();
    const isInstructor = currentRole === 'instructor';
    const userRoleDisplay = isInstructor ? 'อาจารย์ผู้สอน' : 'นักเรียน';

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
            <div className="container">
                <NavLink className="navbar-brand d-flex align-items-center gap-2" to="/">
                    <i className="bi bi-journal-check fs-4"></i>
                    Homework Tracker
                </NavLink>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/" end>
                                <i className="bi bi-house-door me-1"></i> หน้าแรก
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/calendar">
                                <i className="bi bi-calendar3 me-1"></i> ปฏิทิน
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/courses">
                                <i className="bi bi-book me-1"></i> รายวิชา
                            </NavLink>
                        </li>
                    </ul>
                    <div className="d-flex align-items-center gap-3 text-white">
                        <div className="dropdown">
                            <a
                                href="#"
                                className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
                                data-bs-toggle="dropdown"
                            >
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=0D8ABC&color=fff`}
                                    alt="User"
                                    width="32"
                                    height="32"
                                    className="rounded-circle me-2"
                                />
                                <strong>{userName}</strong>
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                                <li>
                                    <h6 className="dropdown-header">บทบาท: {userRoleDisplay}</h6>
                                </li>
                                <li>
                                    <button className="dropdown-item" onClick={() => navigate('/profile')}>
                                        <i className="bi bi-person me-2"></i>โปรไฟล์ส่วนตัว
                                    </button>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li>
                                    <button className="dropdown-item text-danger" onClick={onLogout}>
                                        <i className="bi bi-box-arrow-right me-2"></i>ออกจากระบบ
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
