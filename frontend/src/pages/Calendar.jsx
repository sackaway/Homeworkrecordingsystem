import React, { useState, useEffect } from 'react';
import { getStudentHomeworks, getInstructorHomeworks } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Calendar({ user }) {
    const isInstructor = user?.role === 'instructor';
    const navigate = useNavigate();

    // State for calendar dates and data
    const [currentDate, setCurrentDate] = useState(new Date());
    const [homeworks, setHomeworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Fetch homeworks based on user role
    useEffect(() => {
        const fetchHomeworks = async () => {
            setLoading(true);
            try {
                if (isInstructor) {
                    // Instructors view: fetch homeworks directly
                    const data = await getInstructorHomeworks();
                    setHomeworks(Array.isArray(data) ? data : []);
                } else {
                    // Students view: fetch enrolled user homeworks directly
                    const data = await getStudentHomeworks();

                    const hwArray = Array.isArray(data) ? data : (data.homeworks || []);
                    const processedHomeworks = hwArray.map(hw => ({
                        ...hw,
                        course_code: hw.course_code || (hw.course ? hw.course.course_code : ''),
                        course_name: hw.course_name || (hw.course ? hw.course.course_name : ''),
                        instructor_name: hw.instructor_name || '',
                        my_submission: hw.my_submission || null
                    }));
                    setHomeworks(processedHomeworks);
                }
            } catch (error) {
                console.error("Error fetching calendar events:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeworks();
    }, [isInstructor]);

    // Calendar logic
    const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    const currentMonthName = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();
    const currentYearBuddhist = currentYear + 543;

    // Get the first day of the month (0 = Sunday, 1 = Monday...)
    const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay();
    // Get total days in current month
    const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();

    // Arrays for rendering
    const emptyStartDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Navigation functions
    const nextMonth = () => {
        setCurrentDate(new Date(currentYear, currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentYear, currentDate.getMonth() - 1, 1));
    };

    const getToday = new Date();
    const isDayToday = (day) => {
        return getToday.getDate() === day && getToday.getMonth() === currentDate.getMonth() && getToday.getFullYear() === currentYear;
    };

    // Filter homeworks for a specific date
    const getEventsForDate = (day) => {
        return homeworks.filter(hw => {
            if (!hw.due_date) return false;
            const dueDate = new Date(hw.due_date);
            return dueDate.getDate() === day && dueDate.getMonth() === currentDate.getMonth() && dueDate.getFullYear() === currentYear;
        });
    };

    // Determine badge style based on status/role
    const getEventBadgeClass = (hw) => {
        if (isInstructor) {
            return "primary"; // Instructor sees all assignments
        } else {
            // Student status logic (simplified for calendar)
            if (hw.my_submission?.grade !== null && hw.my_submission?.grade !== undefined) return "success";
            if (hw.my_submission) return "info";

            const dueDate = new Date(hw.due_date);
            if (dueDate < new Date()) return "danger"; // Overdue
            return "warning"; // Pending
        }
    };

    // Custom CSS for calendar grid
    const calendarStyles = {
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        backgroundColor: '#dee2e6'
    };

    const cellStyles = {
        backgroundColor: 'white',
        minHeight: '120px',
        padding: '0.5rem'
    };

    const headerStyles = {
        backgroundColor: '#f8f9fa',
        padding: '0.75rem',
        fontWeight: '600',
        textAlign: 'center'
    };

    const handleViewCourseDetails = (e) => {
        e.preventDefault();
        // Close modal first
        const modalEl = document.getElementById('eventModal');
        if (modalEl && window.bootstrap) {
            const modal = window.bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }

        // Remove backdrop manually in case it lingers
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(b => b.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        navigate(`/courses/${selectedEvent.course_id}`);
    };

    return (
        <div className="view-section">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom flex-wrap gap-3">
                <div>
                    <h3 className="fw-bold mb-1">หน้าปฏิทินงาน <i className="bi bi-calendar3 text-primary"></i></h3>
                    <p className="text-muted mb-0">แผนผังแสดงกำหนดการส่งงานทั้งหมด</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-outline-secondary btn-sm rounded-circle shadow-sm" onClick={prevMonth} style={{ width: '36px', height: '36px' }}><i className="bi bi-chevron-left"></i></button>
                    <h4 className="fw-bold mb-0 mx-2" style={{ minWidth: '150px', textAlign: 'center' }}>{currentMonthName} {currentYearBuddhist}</h4>
                    <button className="btn btn-outline-secondary btn-sm rounded-circle shadow-sm" onClick={nextMonth} style={{ width: '36px', height: '36px' }}><i className="bi bi-chevron-right"></i></button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5 my-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="text-muted mt-2">กำลังโหลดตารางงาน...</p>
                </div>
            ) : (
                <>
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
                        <div className="card-body p-0">
                            <div className="d-grid" style={calendarStyles}>
                                {/* Headers row */}
                                {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map(day => (
                                    <div key={day} style={headerStyles}>{day}</div>
                                ))}

                                {/* Empty start days */}
                                {emptyStartDays.map(empty => (
                                    <div key={`empty-${empty}`} style={{ ...cellStyles, backgroundColor: '#f8f9fa' }} className="text-muted text-end p-2 d-none d-md-block"></div>
                                ))}

                                {/* Days row */}
                                {monthDays.map(day => {
                                    const dayEvents = getEventsForDate(day);
                                    const isToday = isDayToday(day);

                                    return (
                                        <div key={day} style={cellStyles} className="position-relative">
                                            <div className={`text-end mb-2 ${isToday ? 'fw-bold' : ''}`}>
                                                {isToday ? (
                                                    <span className="bg-primary text-white rounded-circle d-inline-flex justify-content-center align-items-center mb-1 shadow-sm" style={{ width: '28px', height: '28px' }}>
                                                        {day}
                                                    </span>
                                                ) : (
                                                    <span className={new Date(currentYear, currentDate.getMonth(), day).getDay() === 0 ? "text-danger" : "text-muted"}>
                                                        {day}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Events for this day */}
                                            <div className="d-flex flex-column gap-1 overflow-auto" style={{ maxHeight: '80px' }}>
                                                {dayEvents.map(event => {
                                                    const badgeClass = getEventBadgeClass(event);
                                                    return (
                                                        <div
                                                            key={event.id}
                                                            className={`badge bg-${badgeClass} bg-opacity-25 text-${badgeClass === 'warning' ? 'dark' : badgeClass} border border-${badgeClass}-subtle text-truncate px-2 py-1 text-start shadow-sm`}
                                                            style={{ fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#eventModal"
                                                            onClick={() => setSelectedEvent(event)}
                                                            title={event.title}
                                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                        >
                                                            <div className="fw-bold text-truncate">{event.title}</div>
                                                            <div className="fw-normal text-truncate opacity-75" style={{ fontSize: '0.65rem' }}>{event.course_code}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    {/* {!isInstructor && (
                        <div className="d-flex flex-wrap gap-3 mt-4 ps-2 bg-light p-3 rounded-4 shadow-sm border">
                            <div className="fw-bold text-muted small me-2 w-100 mb-1">สถานะงาน (มุมมองนักเรียน)</div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-warning bg-opacity-25 border border-warning-subtle rounded-circle p-2"></span> <small className="text-muted">รอทำ</small>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-danger bg-opacity-25 border border-danger-subtle rounded-circle p-2"></span> <small className="text-muted">เลยกำหนด</small>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-info bg-opacity-25 border border-info-subtle rounded-circle p-2"></span> <small className="text-muted">ส่งแล้ว</small>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-success bg-opacity-25 border border-success-subtle rounded-circle p-2"></span> <small className="text-muted">ตรวจแล้ว</small>
                            </div>
                        </div>
                    )} */}
                </>
            )}

            {/* Event Details Modal */}
            <div className="modal fade" id="eventModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="modal-header border-bottom-0 bg-light pb-3">
                            <h5 className="modal-title fw-bold">
                                <i className="bi bi-calendar-event text-primary me-2"></i>รายละเอียดกำหนดการ
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        {selectedEvent && (
                            <div className="modal-body p-4 pt-3">
                                <div className="mb-4">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill border border-primary-subtle">{selectedEvent.course_code}</span>
                                        <span className="text-muted small">{selectedEvent.course_name}</span>
                                    </div>
                                    <h4 className="fw-bold mb-3">{selectedEvent.title}</h4>
                                    <div className="divider-dashed mb-3"></div>
                                    <div className="p-3 bg-light rounded-3 mb-3">
                                        <label className="fw-bold text-muted small d-block mb-2 text-uppercase letter-spacing-1">คำอธิบาย</label>
                                        <p className="mb-0 text-dark white-space-pre-wrap">{selectedEvent.description || 'ไม่มีคำอธิบายเพิ่มเติม'}</p>
                                    </div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-12">
                                        <div className="p-3 border rounded-3 bg-white">
                                            <label className="text-muted small d-block mb-1">กำหนดส่ง</label>
                                            <div className="fw-medium text-danger">
                                                <i className="bi bi-calendar-check opacity-50 me-2"></i>
                                                {new Date(selectedEvent.due_date).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} น.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-grid mt-2">
                                    <button className="btn btn-primary rounded-pill py-2 fw-medium shadow-sm d-flex justify-content-center align-items-center gap-2" onClick={handleViewCourseDetails}>
                                        <i className="bi bi-box-arrow-up-right"></i>
                                        เปิดหน้ารายวิชานี้เพื่อจัดการงาน
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Calendar;
