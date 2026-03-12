import React from 'react';

function StatCard({ title, value, unit, icon, colorClass, textColorClass }) {
    return (
        <div className={`col-md-4`}>
            <div className={`card stat-card h-100 p-3 shadow-none ${colorClass ? `border-${colorClass} border-opacity-25` : ''}`}>
                <div className="card-body d-flex align-items-center">
                    <div className={`icon-circle bg-${colorClass || 'primary'} bg-opacity-10 text-${textColorClass || 'primary'} me-3`}>
                        <i className={`bi ${icon}`}></i>
                    </div>
                    <div>
                        <h6 className="text-muted mb-1">{title}</h6>
                        <h3 className={`fw-bold mb-0 ${textColorClass ? `text-${textColorClass}` : ''}`}>
                            {value} <span className="fs-6 fw-normal text-muted">{unit}</span>
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatCard;
