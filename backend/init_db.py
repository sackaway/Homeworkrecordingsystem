from app.models import db, User, Course, Homework, CourseEnrollment, Submission
from run import create_app
from datetime import datetime, timedelta

def init_db():
    app = create_app()
    with app.app_context():
        # Create all tables
        db.drop_all()  # Warning: Drops existing data!
        db.create_all()
        print("Database tables created.")

        # ========== 1. USERS ==========
        # Instructors
        instructor1 = User(
            username='zack_teacher', password='1234', email='zack@school.com',
            role='instructor', name='อ. แซ็ก'
        )
        instructor2 = User(
            username='praew_teacher', password='1234', email='praew@school.com',
            role='instructor', name='อ. แพรวพรรณ ภาษาเด่น'
        )

        # Students
        student1 = User(
            username='somchai', password='1234', email='somchai@school.com',
            role='student', name='ด.ช. สมชาย รักเรียน', student_id='66010001'
        )
        student2 = User(
            username='somying', password='1234', email='somying@school.com',
            role='student', name='ด.ญ. สมหญิง ขยันดี', student_id='66010002'
        )
        student3 = User(
            username='somsak', password='1234', email='somsak@school.com',
            role='student', name='นาย สมศักดิ์ มาสาย', student_id='66010003'
        )
        student4 = User(
            username='pimjai', password='1234', email='pimjai@school.com',
            role='student', name='ด.ญ. พิมพ์ใจ แสนดี', student_id='66010004'
        )
        student5 = User(
            username='thanakrit', password='1234', email='thanakrit@school.com',
            role='student', name='นาย ธนกฤต เก่งมาก', student_id='66010005'
        )
        student6 = User(
            username='piya', password='1234', email='piya@school.com',
            role='student', name='ด.ช. ปิยะ สุขสันต์', student_id='66010006'
        )
        student7 = User(
            username='kanya', password='1234', email='kanya@school.com',
            role='student', name='ด.ญ. กัญญา รุ่งเรือง', student_id='66010007'
        )
        student8 = User(
            username='wichai', password='1234', email='wichai@school.com',
            role='student', name='นาย วิชัย ใจกล้า', student_id='66010008'
        )

        all_users = [instructor1, instructor2, student1, student2, student3, student4, student5, student6, student7, student8]
        db.session.add_all(all_users)
        db.session.commit()
        print(f"Created {len(all_users)} users.")

        # ========== 2. COURSES ==========
        course1 = Course(
            course_code='CS101', course_name='วิทยาการคอมพิวเตอร์ (กลุ่ม 1)',
            description='เรียนรู้พื้นฐานการเขียนโปรแกรมด้วย Python และโครงสร้างข้อมูล',
            invite_code='CS10-ABC', instructor_id=instructor1.id
        )
        course2 = Course(
            course_code='ENG202', course_name='ภาษาอังกฤษธุรกิจ (กลุ่ม 3)',
            description='การสื่อสารภาษาอังกฤษเพื่อการนำเสนองานในองค์กร',
            invite_code='ENG2-XYZ', instructor_id=instructor1.id
        )
        course3 = Course(
            course_code='MATH301', course_name='แคลคูลัส 2 (กลุ่ม 2)',
            description='ลิมิต อนุพันธ์ และอินทิกรัลขั้นสูง',
            invite_code='MAT3-QWE', instructor_id=instructor1.id
        )

        db.session.add_all([course1, course2, course3])
        db.session.commit()
        print(f"Created 3 courses.")

        # ========== 3. ENROLLMENTS ==========
        students = [student1, student2, student3, student4, student5, student6, student7, student8]

        # Enroll students in CS101 (all 8)
        for s in students:
            db.session.add(CourseEnrollment(course_id=course1.id, student_id=s.id))

        # Enroll some in ENG202 (5 students)
        for s in students[:5]:
            db.session.add(CourseEnrollment(course_id=course2.id, student_id=s.id))

        # Enroll some in MATH301 (4 students)
        for s in students[:4]:
            db.session.add(CourseEnrollment(course_id=course3.id, student_id=s.id))

        db.session.commit()
        print("Enrolled students in courses.")

        # ========== 4. HOMEWORKS ==========
        hw1 = Homework(
            course_id=course1.id,
            title='เขียนโปรแกรมคำนวณเกรด (Python)',
            description='ให้นักเรียนเขียนโปรแกรมรับค่าคะแนน 0-100 แล้วแปลงเป็นเกรด A, B, C, D, F ส่งเป็นไฟล์ .py',
            due_date=datetime.utcnow() + timedelta(days=1),
            status='open'
        )
        hw2 = Homework(
            course_id=course1.id,
            title='แบบฝึกหัดท้ายบทที่ 2 (อัลกอริทึม)',
            description='ตอบคำถามลงกระดาษแล้วถ่ายรูปส่ง',
            due_date=datetime(2026, 2, 28, 12, 0, 0),
            status='closed'
        )
        hw3 = Homework(
            course_id=course2.id,
            title='เขียน Business Email',
            description='เขียนอีเมลธุรกิจภาษาอังกฤษ 1 ฉบับ ส่งเป็นภาพ',
            due_date=datetime(2026, 2, 22, 23, 59, 0),
            status='closed'
        )
        hw4 = Homework(
            course_id=course3.id,
            title='แบบฝึกหัดบทที่ 4 (อินทิกรัล)',
            description='ทำแบบฝึกหัดบทที่ 4 ทุกข้อ ถ่ายรูปส่ง',
            due_date=datetime(2026, 2, 28, 16, 0, 0),
            status='closed'
        )

        db.session.add_all([hw1, hw2, hw3, hw4])
        db.session.commit()
        print(f"Created 4 homeworks.")

        # ========== 5. SUBMISSIONS ==========
        # HW2 (closed): Some students submitted and graded
        db.session.add(Submission(
            homework_id=hw2.id, student_id=student1.id,
            image_url='https://picsum.photos/seed/sub1/600/400',
            grade=38, feedback='ทำได้ดีมากครับ', status='graded'
        ))
        db.session.add(Submission(
            homework_id=hw2.id, student_id=student2.id,
            image_url='https://picsum.photos/seed/sub2/600/400',
            grade=35, feedback='เขียนโค้ดสะอาดดีค่ะ', status='graded'
        ))
        db.session.add(Submission(
            homework_id=hw2.id, student_id=student4.id,
            image_url='https://picsum.photos/seed/sub4/600/400',
            grade=30, feedback='ต้องปรับปรุงนิดหน่อย', status='graded'
        ))

        # HW1 (open): Some students submitted, waiting for grading
        db.session.add(Submission(
            homework_id=hw1.id, student_id=student1.id,
            image_url='https://picsum.photos/seed/sub5/600/400',
            status='submitted'
        ))
        db.session.add(Submission(
            homework_id=hw1.id, student_id=student2.id,
            image_url='https://picsum.photos/seed/sub6/600/400',
            status='submitted'
        ))

        # HW3 (ENG): Some submissions
        db.session.add(Submission(
            homework_id=hw3.id, student_id=student1.id,
            image_url='https://picsum.photos/seed/sub7/600/400',
            grade=18, feedback='Good email structure!', status='graded'
        ))
        db.session.add(Submission(
            homework_id=hw3.id, student_id=student2.id,
            image_url='https://picsum.photos/seed/sub8/600/400',
            grade=19, feedback='Excellent writing!', status='graded'
        ))

        db.session.commit()
        print("Created submissions.")
        print("\n✅ Demo data seeded successfully!")
        print("\n📋 Login credentials (all passwords: 1234):")
        print("  Instructor: zack_teacher")
        print("  Student:    somchai, somying, somsak, pimjai, thanakrit, piya, kanya, wichai")

if __name__ == '__main__':
    init_db()
