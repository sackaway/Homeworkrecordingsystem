import React, { useRef } from 'react';

function ConfirmModal({ id, title, message, confirmText = 'ยืนยัน', confirmColor = 'danger', onConfirm }) {
    const closeBtnRef = useRef(null);

    const handleConfirm = () => {
        onConfirm();
        // Close modal by clicking the hidden close button
        if (closeBtnRef.current) closeBtnRef.current.click();
    };

    return (
        <div className="modal fade" id={id} tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4">
                    <div className="modal-header border-bottom-0 pb-0">
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" ref={closeBtnRef}></button>
                    </div>
                    <div className="modal-body p-4 pt-2 text-center">
                        <div className={`text-${confirmColor} mb-3`}>
                            <i className="bi bi-exclamation-circle" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h4 className="fw-bold mb-3">{title}</h4>
                        <p className="text-muted mb-4">{message}</p>

                        <div className="d-flex justify-content-center gap-3">
                            <button
                                type="button"
                                className="btn btn-light rounded-pill px-4 py-2 fw-medium"
                                data-bs-dismiss="modal"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                className={`btn btn-${confirmColor} rounded-pill px-4 py-2 fw-medium`}
                                onClick={handleConfirm}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
