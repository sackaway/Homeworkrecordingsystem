import React, { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';
import { getInstructorCourses, createHomework } from '../services/api';

function AddHomeworkModal({ onSave, user, initialCourseId }) {
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        course_id: initialCourseId || '', title: '', description: '', due_date: ''
    });

    useEffect(() => {
        if (user?.role === 'instructor') {
            getInstructorCourses().then(setCourses).catch(console.error);
        }
    }, [user]);

    useEffect(() => {
        if (initialCourseId) {
            setFormData(prev => ({ ...prev, course_id: initialCourseId }));
        }
    }, [initialCourseId]);

    const handleSave = async () => {
        try {
            await createHomework({
                course_id: parseInt(formData.course_id),
                title: formData.title,
                description: formData.description,
                due_date: formData.due_date
            });
            setFormData({ course_id: '', title: '', description: '', due_date: '' });
            if (onSave) onSave();
        } catch (err) {
            console.error('Error creating homework:', err);
        }
    };

    return (
        <>
            <div className="modal fade" id="addHomeworkModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold">
                                <i className="bi bi-megaphone text-primary me-2"></i>สั่งการบ้านใหม่
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-4 pt-3">
                            <div className="mb-3">
                                <label className="form-label fw-medium">รายวิชา</label>
                                <select className="form-select" value={formData.course_id} onChange={e => setFormData({ ...formData, course_id: e.target.value })}>
                                    <option value="">-- เลือกรายวิชา --</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-medium">หัวข้อการบ้าน</label>
                                <input type="text" className="form-control" placeholder="เช่น แบบฝึกหัดท้ายบทที่ 3"
                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-medium">คำอธิบาย / คำสั่ง</label>
                                <textarea className="form-control" rows="3" placeholder="รายละเอียดการบ้าน..."
                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-medium">กำหนดส่ง</label>
                                <input type="datetime-local" className="form-control"
                                    value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-footer border-top-0 pt-0">
                            <button type="button" className="btn btn-light" data-bs-dismiss="modal">ยกเลิก</button>
                            <button
                                type="button"
                                className="btn btn-primary px-4 rounded-pill fw-medium shadow-sm"
                                disabled={!formData.course_id || !formData.title || !formData.due_date}
                                data-bs-dismiss="modal"
                                data-bs-toggle="modal"
                                data-bs-target="#confirmAddHomework"
                            >
                                <i className="bi bi-check-lg me-1"></i>สั่งการบ้าน
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmModal
                id="confirmAddHomework"
                title="ยืนยันการสั่งการบ้าน"
                message={`ยืนยันสั่งการบ้าน "${formData.title}" ใช่หรือไม่?`}
                confirmText="ยืนยัน"
                confirmColor="primary"
                onConfirm={handleSave}
            />
        </>
    );
}

export default AddHomeworkModal;
