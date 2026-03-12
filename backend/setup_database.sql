-- ============================================
-- Homework Tracker - Database Setup & Seed Data
-- รันไฟล์นี้ใน HeidiSQL เพื่อสร้างฐานข้อมูลทั้งหมด
-- ============================================

-- 1. สร้าง Database
CREATE DATABASE IF NOT EXISTS homework_tracker
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE homework_tracker;

-- 2. ลบตารางเดิม (ถ้ามี)
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS course_enrollments;
DROP TABLE IF EXISTS homeworks;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;

-- ============================================
-- 3. สร้างตาราง
-- ============================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    name VARCHAR(120) NOT NULL,
    student_id VARCHAR(20) UNIQUE DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_name VARCHAR(120) NOT NULL,
    description TEXT DEFAULT NULL,
    invite_code VARCHAR(10) NOT NULL UNIQUE,
    instructor_id INT NOT NULL,
    FOREIGN KEY (instructor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE course_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id),
    UNIQUE KEY uq_course_student (course_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE homeworks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    due_date DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'open',
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    homework_id INT NOT NULL,
    student_id INT NOT NULL,
    image_url TEXT DEFAULT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    grade INT DEFAULT NULL,
    feedback TEXT DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'submitted',
    FOREIGN KEY (homework_id) REFERENCES homeworks(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id),
    UNIQUE KEY uq_homework_student (homework_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. เพิ่มข้อมูลตัวอย่าง
-- ============================================

-- 4.1 Users (รหัสผ่านทุกคน: 1234)
INSERT INTO users (username, password, email, role, name, student_id) VALUES
('zack_teacher',  '1234', 'zack@school.com',      'instructor', 'อ. แซ็ก', NULL),
('praew_teacher', '1234', 'praew@school.com',     'instructor', 'อ. แพรวพรรณ ภาษาเด่น', NULL),
('somchai',       '1234', 'somchai@school.com',    'student',    'ด.ช. สมชาย รักเรียน',    '66010001'),
('somying',       '1234', 'somying@school.com',    'student',    'ด.ญ. สมหญิง ขยันดี',     '66010002'),
('somsak',        '1234', 'somsak@school.com',     'student',    'นาย สมศักดิ์ มาสาย',     '66010003'),
('pimjai',        '1234', 'pimjai@school.com',     'student',    'ด.ญ. พิมพ์ใจ แสนดี',     '66010004'),
('thanakrit',     '1234', 'thanakrit@school.com',  'student',    'นาย ธนกฤต เก่งมาก',      '66010005'),
('piya',          '1234', 'piya@school.com',       'student',    'ด.ช. ปิยะ สุขสันต์',     '66010006'),
('kanya',         '1234', 'kanya@school.com',      'student',    'ด.ญ. กัญญา รุ่งเรือง',   '66010007'),
('wichai',        '1234', 'wichai@school.com',     'student',    'นาย วิชัย ใจกล้า',       '66010008');

-- 4.2 Courses (instructor_id = 1 คือ zack_teacher)
INSERT INTO courses (course_code, course_name, description, invite_code, instructor_id) VALUES
('CS101',   'วิทยาการคอมพิวเตอร์ (กลุ่ม 1)', 'เรียนรู้พื้นฐานการเขียนโปรแกรมด้วย Python และโครงสร้างข้อมูล', 'CS10-ABC', 1),
('ENG202',  'ภาษาอังกฤษธุรกิจ (กลุ่ม 3)',    'การสื่อสารภาษาอังกฤษเพื่อการนำเสนองานในองค์กร',             'ENG2-XYZ', 1),
('MATH301', 'แคลคูลัส 2 (กลุ่ม 2)',           'ลิมิต อนุพันธ์ และอินทิกรัลขั้นสูง',                       'MAT3-QWE', 1);

-- 4.3 Enrollments
-- CS101: นักเรียนทั้ง 8 คน (id 3-10)
INSERT INTO course_enrollments (course_id, student_id) VALUES
(1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10);

-- ENG202: 5 คน
INSERT INTO course_enrollments (course_id, student_id) VALUES
(2, 3), (2, 4), (2, 5), (2, 6), (2, 7);

-- MATH301: 4 คน
INSERT INTO course_enrollments (course_id, student_id) VALUES
(3, 3), (3, 4), (3, 5), (3, 6);

-- 4.4 Homeworks
INSERT INTO homeworks (course_id, title, description, due_date, status) VALUES
(1, 'เขียนโปรแกรมคำนวณเกรด (Python)',    'ให้นักเรียนเขียนโปรแกรมรับค่าคะแนน 0-100 แล้วแปลงเป็นเกรด A, B, C, D, F ส่งเป็นไฟล์ .py', '2026-03-10 23:59:00', 'open'),
(1, 'แบบฝึกหัดท้ายบทที่ 2 (อัลกอริทึม)', 'ตอบคำถามลงกระดาษแล้วถ่ายรูปส่ง',                                                            '2026-02-28 12:00:00', 'closed'),
(2, 'เขียน Business Email',               'เขียนอีเมลธุรกิจภาษาอังกฤษ 1 ฉบับ ส่งเป็นภาพ',                                              '2026-02-22 23:59:00', 'closed'),
(3, 'แบบฝึกหัดบทที่ 4 (อินทิกรัล)',       'ทำแบบฝึกหัดบทที่ 4 ทุกข้อ ถ่ายรูปส่ง',                                                       '2026-02-28 16:00:00', 'closed');

-- 4.5 Submissions
-- HW 2 (closed, CS101): บางคนส่งและตรวจแล้ว
INSERT INTO submissions (homework_id, student_id, image_url, grade, feedback, status) VALUES
(2, 3, 'https://picsum.photos/seed/sub1/600/400', 38, 'ทำได้ดีมากครับ',         'graded'),
(2, 4, 'https://picsum.photos/seed/sub2/600/400', 35, 'เขียนโค้ดสะอาดดีค่ะ',    'graded'),
(2, 6, 'https://picsum.photos/seed/sub4/600/400', 30, 'ต้องปรับปรุงนิดหน่อย',  'graded');

-- HW 1 (open, CS101): บางคนส่งแล้ว รอตรวจ
INSERT INTO submissions (homework_id, student_id, image_url, status) VALUES
(1, 3, 'https://picsum.photos/seed/sub5/600/400', 'submitted'),
(1, 4, 'https://picsum.photos/seed/sub6/600/400', 'submitted');

-- HW 3 (ENG202): ตรวจแล้วบางส่วน
INSERT INTO submissions (homework_id, student_id, image_url, grade, feedback, status) VALUES
(3, 3, 'https://picsum.photos/seed/sub7/600/400', 18, 'Good email structure!', 'graded'),
(3, 4, 'https://picsum.photos/seed/sub8/600/400', 19, 'Excellent writing!',    'graded');

-- ============================================
-- เสร็จแล้ว! ✅
-- ============================================
-- Login credentials (password ทุกคน: 1234)
-- Instructor: zack_teacher
-- Students:   somchai, somying, somsak, pimjai, thanakrit, piya, kanya, wichai
