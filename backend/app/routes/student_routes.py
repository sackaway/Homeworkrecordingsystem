from flask import Blueprint, jsonify, request, session
from app.models import db, User, Course, Homework, Submission, CourseEnrollment
from datetime import datetime

student_bp = Blueprint('student', __name__)

def get_student():
    """Get current student from session"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    user = User.query.get(user_id)
    if not user or user.role != 'student':
        return None
    return user

# ============ STATS ============
@student_bp.route('/stats', methods=['GET'])
def get_stats():
    student = get_student()
    if not student:
        return jsonify({"error": "Unauthorized"}), 401

    # Get all enrolled courses
    enrollments = CourseEnrollment.query.filter_by(student_id=student.id).all()
    course_ids = [e.course_id for e in enrollments]

    # Get all homeworks for enrolled courses
    homeworks = Homework.query.filter(Homework.course_id.in_(course_ids)).all() if course_ids else []
    hw_ids = [hw.id for hw in homeworks]

    # Get submissions
    submissions = Submission.query.filter(
        Submission.homework_id.in_(hw_ids),
        Submission.student_id == student.id
    ).all() if hw_ids else []
    submitted_hw_ids = {s.homework_id for s in submissions}

    # Calculate stats
    total = len(homeworks)
    completed = len([s for s in submissions if s.status in ('submitted', 'graded')])
    overdue = len([hw for hw in homeworks if hw.id not in submitted_hw_ids and hw.due_date < datetime.utcnow()])
    pending = total - completed - overdue

    return jsonify({
        "pending": max(pending, 0),
        "completed": completed,
        "overdue": overdue
    })

# ============ COURSES ============
@student_bp.route('/courses', methods=['GET'])
def get_courses():
    student = get_student()
    if not student:
        return jsonify({"error": "Unauthorized"}), 401

    enrollments = CourseEnrollment.query.filter_by(student_id=student.id).all()
    result = []
    for e in enrollments:
        course = e.course
        # Calculate homework stats for this course
        homeworks = Homework.query.filter_by(course_id=course.id).all()
        hw_ids = [hw.id for hw in homeworks]

        submissions = Submission.query.filter(
            Submission.homework_id.in_(hw_ids),
            Submission.student_id == student.id
        ).all() if hw_ids else []

        graded = [s for s in submissions if s.status == 'graded' and s.grade is not None]
        avg_score = 0
        if graded:
            avg_score = round(sum(s.grade for s in graded) / len(graded))

        result.append({
            **course.to_dict(),
            "total_homework": len(homeworks),
            "completed_homework": len(submissions),
            "avg_score": avg_score,
            "joined_at": e.joined_at.isoformat() if e.joined_at else None
        })
    return jsonify(result)

@student_bp.route('/courses/join', methods=['POST'])
def join_course():
    student = get_student()
    if not student:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    invite_code = data.get('invite_code', '').strip()

    course = Course.query.filter_by(invite_code=invite_code).first()
    if not course:
        return jsonify({"error": "ไม่พบรายวิชาสำหรับรหัสนี้"}), 404

    # Check already enrolled
    existing = CourseEnrollment.query.filter_by(course_id=course.id, student_id=student.id).first()
    if existing:
        return jsonify({"error": "คุณอยู่ในรายวิชานี้แล้ว"}), 400

    enrollment = CourseEnrollment(course_id=course.id, student_id=student.id)
    db.session.add(enrollment)
    db.session.commit()

    return jsonify({"message": "เข้าร่วมรายวิชาสำเร็จ", "course": course.to_dict()}), 201

@student_bp.route('/courses/<int:id>/leave', methods=['DELETE'])
def leave_course(id):
    student = get_student()
    if not student:
        return jsonify({"error": "Unauthorized"}), 401

    enrollment = CourseEnrollment.query.filter_by(course_id=id, student_id=student.id).first()
    if not enrollment:
        return jsonify({"error": "คุณไม่ได้อยู่ในรายวิชานี้"}), 404

    db.session.delete(enrollment)
    db.session.commit()
    return jsonify({"message": "ออกจากรายวิชาสำเร็จ"})

@student_bp.route('/courses/<int:id>/classmates', methods=['GET'])
def get_course_classmates(id):
    student = get_student()
    if not student:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Check if enrolled
    enrollment = CourseEnrollment.query.filter_by(course_id=id, student_id=student.id).first()
    if not enrollment:
        return jsonify({"error": "Forbidden"}), 403
        
    enrollments = CourseEnrollment.query.filter_by(course_id=id).all()
    classmates = []
    for e in enrollments:
        classmates.append({
            "id": e.student.id,
            "username": e.student.username,
            "name": e.student.name,
            "student_id": e.student.student_id,
            "joined_at": e.joined_at.isoformat() if e.joined_at else None
        })
    return jsonify(classmates)

@student_bp.route('/courses/<int:id>/homeworks', methods=['GET'])
def get_course_homeworks(id):
    student = get_student()
    if not student:
        return jsonify({"error": "Unauthorized"}), 401
        
    # Check if enrolled
    enrollment = CourseEnrollment.query.filter_by(course_id=id, student_id=student.id).first()
    if not enrollment:
        return jsonify({"error": "Forbidden"}), 403
        
    homeworks = Homework.query.filter_by(course_id=id).order_by(Homework.due_date.desc()).all()
    
    # Get student's submissions for these homeworks
    hw_ids = [hw.id for hw in homeworks]
    submissions = {s.homework_id: s for s in Submission.query.filter(
        Submission.homework_id.in_(hw_ids),
        Submission.student_id == student.id
    ).all()} if hw_ids else {}
    
    result = []
    for hw in homeworks:
        hw_data = hw.to_dict()
        sub = submissions.get(hw.id)
        hw_data['my_submission'] = sub.to_dict() if sub else None
        result.append(hw_data)
        
    return jsonify(result)

# ============ HOMEWORKS ============
@student_bp.route('/homeworks', methods=['GET'])
def get_homeworks():
    student = get_student()
    if not student:
        return jsonify({"error": "Unauthorized"}), 401

    enrollments = CourseEnrollment.query.filter_by(student_id=student.id).all()
    course_ids = [e.course_id for e in enrollments]

    homeworks = Homework.query.filter(
        Homework.course_id.in_(course_ids)
    ).order_by(Homework.due_date.desc()).all() if course_ids else []

    # Get student's submissions
    hw_ids = [hw.id for hw in homeworks]
    submissions = {s.homework_id: s for s in Submission.query.filter(
        Submission.homework_id.in_(hw_ids),
        Submission.student_id == student.id
    ).all()} if hw_ids else {}

    result = []
    for hw in homeworks:
        hw_data = hw.to_dict()
        sub = submissions.get(hw.id)
        if sub:
            hw_data['my_submission'] = sub.to_dict()
        else:
            hw_data['my_submission'] = None
        result.append(hw_data)
    return jsonify(result)

@student_bp.route('/homeworks/<int:id>/submit', methods=['POST'])
def submit_homework(id):
    student = get_student()
    if not student:
        return jsonify({"error": "Unauthorized"}), 401

    hw = Homework.query.get_or_404(id)

    # Handle file uploads
    import json, uuid, os
    from flask import current_app

    uploaded_filenames = []
    files = request.files.getlist('images')
    if files:
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        for f in files:
            if f and f.filename:
                ext = f.filename.rsplit('.', 1)[-1].lower() if '.' in f.filename else 'png'
                safe_name = f"{uuid.uuid4().hex}.{ext}"
                f.save(os.path.join(upload_folder, safe_name))
                uploaded_filenames.append(safe_name)

    image_urls_json = json.dumps(uploaded_filenames) if uploaded_filenames else None

    # Check if already submitted
    existing = Submission.query.filter_by(homework_id=id, student_id=student.id).first()
    if existing:
        if image_urls_json:
            # Merge with existing images
            old_images = existing.get_image_list()
            all_images = old_images + uploaded_filenames
            existing.image_urls = json.dumps(all_images)
        existing.submitted_at = datetime.utcnow()
        existing.status = 'submitted'
        db.session.commit()
        return jsonify({"message": "Updated", "submission": existing.to_dict()})

    try:
        sub = Submission(
            homework_id=id,
            student_id=student.id,
            image_urls=image_urls_json,
            status='submitted'
        )
        db.session.add(sub)
        db.session.commit()
        return jsonify({"message": "Submitted", "submission": sub.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
