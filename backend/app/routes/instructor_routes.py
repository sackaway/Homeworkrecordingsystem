from flask import Blueprint, jsonify, request, session
from app.models import db, User, Course, Homework, Submission, CourseEnrollment
from datetime import datetime

instructor_bp = Blueprint('instructor', __name__)

def get_instructor():
    """Get current instructor from session"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    user = User.query.get(user_id)
    if not user or user.role != 'instructor':
        return None
    return user

# ============ STATS ============
@instructor_bp.route('/stats', methods=['GET'])
def get_stats():
    instructor = get_instructor()
    if not instructor:
        return jsonify({"error": "Unauthorized"}), 401

    courses = Course.query.filter_by(instructor_id=instructor.id).all()
    course_ids = [c.id for c in courses]

    total_homeworks = Homework.query.filter(Homework.course_id.in_(course_ids)).count()

    # Count pending grading (submitted but not graded)
    pending_grading = Submission.query.join(Homework).filter(
        Homework.course_id.in_(course_ids),
        Submission.status == 'submitted'
    ).count()

    # Count total students across all courses
    students_count = CourseEnrollment.query.filter(
        CourseEnrollment.course_id.in_(course_ids)
    ).count()

    return jsonify({
        "total_homeworks": total_homeworks,
        "pending_grading": pending_grading,
        "students_count": students_count
    })

# ============ COURSES ============
@instructor_bp.route('/courses', methods=['GET'])
def get_courses():
    instructor = get_instructor()
    if not instructor:
        return jsonify({"error": "Unauthorized"}), 401
    courses = Course.query.filter_by(instructor_id=instructor.id).all()
    return jsonify([c.to_dict() for c in courses])

@instructor_bp.route('/courses', methods=['POST'])
def create_course():
    instructor = get_instructor()
    if not instructor:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    try:
        course = Course(
            course_code=data['course_code'],
            course_name=data['course_name'],
            description=data.get('description', ''),
            instructor_id=instructor.id
        )
        db.session.add(course)
        db.session.commit()
        return jsonify({"message": "Course created", "course": course.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@instructor_bp.route('/courses/<int:id>', methods=['DELETE'])
def delete_course(id):
    instructor = get_instructor()
    if not instructor:
        return jsonify({"error": "Unauthorized"}), 401
    course = Course.query.get_or_404(id)
    if course.instructor_id != instructor.id:
        return jsonify({"error": "Forbidden"}), 403
    try:
        db.session.delete(course)
        db.session.commit()
        return jsonify({"message": "Course deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ============ COURSE STUDENTS ============
@instructor_bp.route('/courses/<int:id>/students', methods=['GET'])
def get_course_students(id):
    instructor = get_instructor()
    if not instructor:
        return jsonify({"error": "Unauthorized"}), 401
    course = Course.query.get_or_404(id)
    if course.instructor_id != instructor.id:
        return jsonify({"error": "Forbidden"}), 403

    enrollments = CourseEnrollment.query.filter_by(course_id=id).all()
    students = []
    for e in enrollments:
        s = e.student.to_dict()
        s['joined_at'] = e.joined_at.isoformat() if e.joined_at else None
        students.append(s)
    return jsonify(students)

@instructor_bp.route('/courses/<int:id>/students', methods=['POST'])
def add_students_to_course(id):
    instructor = get_instructor()
    if not instructor:
        return jsonify({"error": "Unauthorized"}), 401
    course = Course.query.get_or_404(id)
    if course.instructor_id != instructor.id:
        return jsonify({"error": "Forbidden"}), 403

    data = request.json
    student_ids = data.get('student_ids', [])
    added = 0
    for sid in student_ids:
        # Check if already enrolled
        existing = CourseEnrollment.query.filter_by(course_id=id, student_id=sid).first()
        if not existing:
            enrollment = CourseEnrollment(course_id=id, student_id=sid)
            db.session.add(enrollment)
            added += 1
    db.session.commit()
    return jsonify({"message": f"Added {added} students", "added": added})

@instructor_bp.route('/courses/<int:course_id>/students/<int:student_id>', methods=['DELETE'])
def remove_student_from_course(course_id, student_id):
    instructor = get_instructor()
    if not instructor:
        return jsonify({"error": "Unauthorized"}), 401
    course = Course.query.get_or_404(course_id)
    if course.instructor_id != instructor.id:
        return jsonify({"error": "Forbidden"}), 403

    enrollment = CourseEnrollment.query.filter_by(course_id=course_id, student_id=student_id).first()
    if not enrollment:
        return jsonify({"error": "Student not in course"}), 404
    db.session.delete(enrollment)
    db.session.commit()
    return jsonify({"message": "Student removed"})

# ============ ALL STUDENTS (for picker) ============
@instructor_bp.route('/students', methods=['GET'])
def get_all_students():
    instructor = get_instructor()
    if not instructor:
        return jsonify({"error": "Unauthorized"}), 401
    students = User.query.filter_by(role='student').all()
    return jsonify([s.to_dict() for s in students])

# ============ HOMEWORKS ============
@instructor_bp.route('/homeworks', methods=['GET'])
def get_homeworks():
    instructor = get_instructor()
    if not instructor:
        return jsonify({"error": "Unauthorized"}), 401
    homeworks = Homework.query.join(Course).filter(
        Course.instructor_id == instructor.id
    ).order_by(Homework.due_date.desc()).all()
    return jsonify([hw.to_dict() for hw in homeworks])

@instructor_bp.route('/courses/<int:id>/homeworks', methods=['GET'])
def get_course_homeworks(id):
    instructor = get_instructor()
    if not instructor:
        return jsonify({"error": "Unauthorized"}), 401
    course = Course.query.get_or_404(id)
    if course.instructor_id != instructor.id:
        return jsonify({"error": "Forbidden"}), 403
    
    homeworks = Homework.query.filter_by(course_id=id).order_by(Homework.due_date.desc()).all()
    return jsonify([hw.to_dict() for hw in homeworks])

@instructor_bp.route('/homeworks', methods=['POST'])
def create_homework():
    instructor = get_instructor()
    if not instructor:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    try:
        new_hw = Homework(
            course_id=data['course_id'],
            title=data['title'],
            description=data['description'],
            due_date=datetime.fromisoformat(data['due_date'].replace("Z", "+00:00"))
        )
        db.session.add(new_hw)
        db.session.commit()
        return jsonify({"message": "Homework created", "homework": new_hw.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@instructor_bp.route('/homeworks/<int:id>', methods=['PUT'])
def update_homework(id):
    instructor = get_instructor()
    if not instructor:
        return jsonify({"error": "Unauthorized"}), 401
    hw = Homework.query.get_or_404(id)
    data = request.json
    try:
        if 'title' in data:
            hw.title = data['title']
        if 'description' in data:
            hw.description = data['description']
        if 'due_date' in data:
            hw.due_date = datetime.fromisoformat(data['due_date'].replace("Z", "+00:00"))
        if 'status' in data:
            hw.status = data['status']
        db.session.commit()
        return jsonify({"message": "Homework updated", "homework": hw.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@instructor_bp.route('/homeworks/<int:id>', methods=['DELETE'])
def delete_homework(id):
    instructor = get_instructor()
    if not instructor:
        return jsonify({"error": "Unauthorized"}), 401
    hw = Homework.query.get_or_404(id)
    try:
        db.session.delete(hw)
        db.session.commit()
        return jsonify({"message": "Homework deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ============ SUBMISSIONS & GRADING ============
@instructor_bp.route('/homeworks/<int:id>/submissions', methods=['GET'])
def get_submissions(id):
    instructor = get_instructor()
    if not instructor:
        return jsonify({"error": "Unauthorized"}), 401
    hw = Homework.query.get_or_404(id)

    # Get all enrolled students for this course
    enrollments = CourseEnrollment.query.filter_by(course_id=hw.course_id).all()
    submissions = {s.student_id: s for s in hw.submissions}

    result = []
    for e in enrollments:
        sub = submissions.get(e.student_id)
        if sub:
            result.append(sub.to_dict())
        else:
            # Student hasn't submitted
            result.append({
                "id": None,
                "homework_id": id,
                "student_id": e.student_id,
                "student_name": e.student.name,
                "student_code": e.student.student_id,
                "image_url": None,
                "submitted_at": None,
                "grade": None,
                "feedback": "",
                "status": "missing"
            })
    return jsonify(result)

@instructor_bp.route('/submissions/<int:id>/grade', methods=['PUT'])
def grade_submission(id):
    instructor = get_instructor()
    if not instructor:
        return jsonify({"error": "Unauthorized"}), 401
    sub = Submission.query.get_or_404(id)
    data = request.json
    try:
        sub.grade = data.get('grade')
        sub.feedback = data.get('feedback', '')
        sub.status = 'graded'
        db.session.commit()
        return jsonify({"message": "Graded", "submission": sub.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
