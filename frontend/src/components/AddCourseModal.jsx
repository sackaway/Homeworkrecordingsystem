import React, { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import { createCourse } from '../services/api';

function AddCourseModal({ onSave, user }) {
    const [formData, setFormData] = useState({
        course_code: '', course_name: '', description: ''
    });

    const handleSave = async () => {
        try {
            await createCourse(formData);
            setFormData({ course_code: '', course_name: '', description: '' });
            if (onSave) onSave();
        } catch (err) {
            console.error('Error creating course:', err);
        }
    };

    return (
        <>
            <div className="modal fade" id="addCourseModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold">
                                <i className="bi bi-journal-plus text-primary me-2"></i>สร้างรายวิชาใหม่
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-4 pt-3">
                            <div className="mb-3">
                                <label className="form-label fw-medium">รหัสวิชา</label>
                                <input type="text" className="form-control" placeholder="เช่น CS101"
                                    value={formData.course_code} onChange={e => setFormData({ ...formData, course_code: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-medium">ชื่อวิชา</label>
                                <input type="text" className="form-control" placeholder="เช่น วิทยาการคอมพิวเตอร์ (กลุ่ม 1)"
                                    value={formData.course_name} onChange={e => setFormData({ ...formData, course_name: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-medium">คำอธิบายวิชา</label>
                                <textarea className="form-control" rows="3" placeholder="คำอธิบายรายวิชา..."
                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                        </div>
                        <div className="modal-footer border-top-0 pt-0">
                            <button type="button" className="btn btn-light" data-bs-dismiss="modal">ยกเลิก</button>
                            <button
                                type="button"
                                className="btn btn-primary px-4 rounded-pill fw-medium shadow-sm"
                                disabled={!formData.course_code || !formData.course_name}
                                data-bs-dismiss="modal"
                                data-bs-toggle="modal"
                                data-bs-target="#confirmAddCourse"
                            >
                                <i className="bi bi-check-lg me-1"></i>สร้างรายวิชา
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmModal
                id="confirmAddCourse"
                title="ยืนยันการสร้างรายวิชา"
                message={`ยืนยันสร้างรายวิชา "${formData.course_code} - ${formData.course_name}" ใช่หรือไม่?`}
                confirmText="ยืนยัน"
                confirmColor="primary"
                onConfirm={handleSave}
            />
        </>
    );
}

export default AddCourseModal;
