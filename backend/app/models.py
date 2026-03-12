from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import random
import string

db = SQLAlchemy()

def generate_invite_code():
    """Generate a random 7-character invite code like X7B9-MQ2"""
    chars = string.ascii_uppercase + string.digits
    part1 = ''.join(random.choices(chars, k=4))
    part2 = ''.join(random.choices(chars, k=3))
    return f"{part1}-{part2}"

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)  # Plaintext
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')  # 'instructor' or 'student'
    name = db.Column(db.String(120), nullable=False)
    student_id = db.Column(db.String(20), unique=True, nullable=True)  # Only for students

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "name": self.name,
            "student_id": self.student_id
        }

class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(20), unique=True, nullable=False)
    course_name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True, default=None)
    invite_code = db.Column(db.String(10), unique=True, nullable=False, default=generate_invite_code)
    instructor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    instructor = db.relationship('User', backref=db.backref('courses_taught', lazy=True))
    enrollments = db.relationship('CourseEnrollment', backref='course', lazy=True, cascade="all, delete-orphan")
    homeworks = db.relationship('Homework', backref='course', lazy=True, cascade="all, delete-orphan")

    def to_dict(self, include_students=False):
        data = {
            "id": self.id,
            "course_code": self.course_code,
            "course_name": self.course_name,
            "description": self.description,
            "invite_code": self.invite_code,
            "instructor_id": self.instructor_id,
            "instructor_name": self.instructor.name if self.instructor else None,
            "student_count": len(self.enrollments)
        }
        if include_students:
            data["students"] = [e.student.to_dict() for e in self.enrollments]
        return data

class CourseEnrollment(db.Model):
    __tablename__ = 'course_enrollments'
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('User', backref=db.backref('enrollments', lazy=True))

    __table_args__ = (db.UniqueConstraint('course_id', 'student_id', name='uq_course_student'),)

class Homework(db.Model):
    __tablename__ = 'homeworks'
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='open')  # 'open', 'closed'

    submissions = db.relationship('Submission', backref='homework', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "course_code": self.course.course_code if self.course else None,
            "course_name": self.course.course_name if self.course else None,
            "instructor_name": self.course.instructor.name if self.course and self.course.instructor else None,
            "title": self.title,
            "description": self.description,
            "due_date": self.due_date.isoformat(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "status": self.status,
            "submissions": {
                "submitted": len([s for s in self.submissions if s.status in ('submitted', 'graded')]),
                "total": len(self.course.enrollments) if self.course else 0
            }
        }

class Submission(db.Model):
    __tablename__ = 'submissions'
    id = db.Column(db.Integer, primary_key=True)
    homework_id = db.Column(db.Integer, db.ForeignKey('homeworks.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    image_urls = db.Column(db.Text, nullable=True)  # JSON array of filenames
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    grade = db.Column(db.Integer, nullable=True)
    feedback = db.Column(db.Text, nullable=True, default=None)
    status = db.Column(db.String(20), default='submitted')  # 'submitted', 'graded'

    student = db.relationship('User', backref=db.backref('submissions', lazy=True))

    __table_args__ = (db.UniqueConstraint('homework_id', 'student_id', name='uq_homework_student'),)

    def get_image_list(self):
        if not self.image_urls:
            return []
        import json
        try:
            return json.loads(self.image_urls)
        except:
            return [self.image_urls] if self.image_urls else []

    def to_dict(self):
        return {
            "id": self.id,
            "homework_id": self.homework_id,
            "student_id": self.student_id,
            "student_name": self.student.name if self.student else None,
            "student_code": self.student.student_id if self.student else None,
            "image_urls": self.get_image_list(),
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "grade": self.grade,
            "feedback": self.feedback,
            "status": self.status
        }
