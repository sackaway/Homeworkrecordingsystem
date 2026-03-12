-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.41 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for homework_tracker
CREATE DATABASE IF NOT EXISTS `homework_tracker` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `homework_tracker`;

-- Dumping structure for table homework_tracker.courses
DROP TABLE IF EXISTS `courses`;
CREATE TABLE IF NOT EXISTS `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_code` varchar(20) NOT NULL,
  `course_name` varchar(120) NOT NULL,
  `description` text,
  `invite_code` varchar(10) NOT NULL,
  `instructor_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_code` (`course_code`),
  UNIQUE KEY `invite_code` (`invite_code`),
  KEY `instructor_id` (`instructor_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table homework_tracker.courses: ~6 rows (approximately)
DELETE FROM `courses`;
INSERT INTO `courses` (`id`, `course_code`, `course_name`, `description`, `invite_code`, `instructor_id`) VALUES
	(1, 'CS101', 'วิทยาการคอมพิวเตอร์ (กลุ่ม 1)', 'เรียนรู้พื้นฐานการเขียนโปรแกรมด้วย Python และโครงสร้างข้อมูล', 'CS10-ABC', 1),
	(2, 'ENG202', 'ภาษาอังกฤษธุรกิจ (กลุ่ม 3)', 'การสื่อสารภาษาอังกฤษเพื่อการนำเสนองานในองค์กร', 'ENG2-XYZ', 1),
	(3, 'MATH301', 'แคลคูลัส 2 (กลุ่ม 2)', 'ลิมิต อนุพันธ์ และอินทิกรัลขั้นสูง', 'MAT3-QWE', 1),
	(7, 'CS102', 'Algorithms', '', 'MLRG-AIH', 12),
	(9, 'CS102-TEST', 'Test Course', 'Description for testing.', 'QQPR-W8F', 14),
	(10, 'MATH101', 'Mathematics for Engineers', 'Foundations of Calculus and Algebra.', 'UTR1-7FW', 18);

-- Dumping structure for table homework_tracker.course_enrollments
DROP TABLE IF EXISTS `course_enrollments`;
CREATE TABLE IF NOT EXISTS `course_enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `student_id` int NOT NULL,
  `joined_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_course_student` (`course_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `course_enrollments_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_enrollments_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table homework_tracker.course_enrollments: ~19 rows (approximately)
DELETE FROM `course_enrollments`;
INSERT INTO `course_enrollments` (`id`, `course_id`, `student_id`, `joined_at`) VALUES
	(1, 1, 3, '2026-03-09 23:50:47'),
	(2, 1, 4, '2026-03-09 23:50:47'),
	(3, 1, 5, '2026-03-09 23:50:47'),
	(4, 1, 6, '2026-03-09 23:50:47'),
	(5, 1, 7, '2026-03-09 23:50:47'),
	(6, 1, 8, '2026-03-09 23:50:47'),
	(7, 1, 9, '2026-03-09 23:50:47'),
	(8, 1, 10, '2026-03-09 23:50:47'),
	(9, 2, 3, '2026-03-09 23:50:47'),
	(10, 2, 4, '2026-03-09 23:50:47'),
	(11, 2, 5, '2026-03-09 23:50:47'),
	(12, 2, 6, '2026-03-09 23:50:47'),
	(13, 2, 7, '2026-03-09 23:50:47'),
	(14, 3, 3, '2026-03-09 23:50:47'),
	(15, 3, 4, '2026-03-09 23:50:47'),
	(16, 3, 5, '2026-03-09 23:50:47'),
	(17, 3, 6, '2026-03-09 23:50:47'),
	(18, 9, 13, '2026-03-10 03:59:06'),
	(19, 10, 17, '2026-03-10 05:21:16');

-- Dumping structure for table homework_tracker.homeworks
DROP TABLE IF EXISTS `homeworks`;
CREATE TABLE IF NOT EXISTS `homeworks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `due_date` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(20) DEFAULT 'open',
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `homeworks_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table homework_tracker.homeworks: ~4 rows (approximately)
DELETE FROM `homeworks`;
INSERT INTO `homeworks` (`id`, `course_id`, `title`, `description`, `due_date`, `created_at`, `status`) VALUES
	(1, 1, 'เขียนโปรแกรมคำนวณเกรด (Python)', 'ให้นักเรียนเขียนโปรแกรมรับค่าคะแนน 0-100 แล้วแปลงเป็นเกรด A, B, C, D, F ส่งเป็นไฟล์ .py', '2026-03-10 23:59:00', '2026-03-09 23:50:47', 'open'),
	(2, 1, 'แบบฝึกหัดท้ายบทที่ 2 (อัลกอริทึม)', 'ตอบคำถามลงกระดาษแล้วถ่ายรูปส่ง', '2026-02-28 12:00:00', '2026-03-09 23:50:47', 'closed'),
	(3, 2, 'เขียน Business Email', 'เขียนอีเมลธุรกิจภาษาอังกฤษ 1 ฉบับ ส่งเป็นภาพ', '2026-02-22 23:59:00', '2026-03-09 23:50:47', 'closed'),
	(4, 3, 'แบบฝึกหัดบทที่ 4 (อินทิกรัล)', 'ทำแบบฝึกหัดบทที่ 4 ทุกข้อ ถ่ายรูปส่ง', '2026-02-28 16:00:00', '2026-03-09 23:50:47', 'closed');

-- Dumping structure for table homework_tracker.submissions
DROP TABLE IF EXISTS `submissions`;
CREATE TABLE IF NOT EXISTS `submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `homework_id` int NOT NULL,
  `student_id` int NOT NULL,
  `image_urls` text,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `grade` int DEFAULT NULL,
  `feedback` text,
  `status` varchar(20) DEFAULT 'submitted',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_homework_student` (`homework_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`homework_id`) REFERENCES `homeworks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table homework_tracker.submissions: ~9 rows (approximately)
DELETE FROM `submissions`;
INSERT INTO `submissions` (`id`, `homework_id`, `student_id`, `image_urls`, `submitted_at`, `grade`, `feedback`, `status`) VALUES
	(1, 2, 3, 'https://picsum.photos/seed/sub1/600/400', '2026-03-09 23:50:47', 38, 'ทำได้ดีมากครับ', 'graded'),
	(2, 2, 4, 'https://picsum.photos/seed/sub2/600/400', '2026-03-09 23:50:47', 35, 'เขียนโค้ดสะอาดดีค่ะ', 'graded'),
	(3, 2, 6, 'https://picsum.photos/seed/sub4/600/400', '2026-03-09 23:50:47', 30, 'ต้องปรับปรุงนิดหน่อย', 'graded'),
	(4, 1, 3, 'https://picsum.photos/seed/sub5/600/400', '2026-03-09 23:50:47', NULL, NULL, 'submitted'),
	(5, 1, 4, 'https://picsum.photos/seed/sub6/600/400', '2026-03-09 23:50:47', NULL, NULL, 'submitted'),
	(6, 3, 3, 'https://picsum.photos/seed/sub7/600/400', '2026-03-09 23:50:47', 18, 'Good email structure!', 'graded'),
	(7, 3, 4, 'https://picsum.photos/seed/sub8/600/400', '2026-03-09 23:50:47', 19, 'Excellent writing!', 'graded'),
	(8, 1, 10, '["b5cfb3ff90d2444a8d8357894d518704.png", "d330a6b3e16f4251a8c0aaf394244b87.png"]', '2026-03-09 20:32:28', NULL, NULL, 'submitted'),
	(9, 4, 3, '["9c8e927114284737b64ae1bade5465c3.png"]', '2026-03-10 07:20:53', NULL, NULL, 'submitted');

-- Dumping structure for table homework_tracker.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(80) NOT NULL,
  `password` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'student',
  `name` varchar(120) NOT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `student_id` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table homework_tracker.users: ~19 rows (approximately)
DELETE FROM `users`;
INSERT INTO `users` (`id`, `username`, `password`, `email`, `role`, `name`, `student_id`) VALUES
	(1, 'zack_teacher', '1234', 'zack@school.com', 'instructor', 'อ. คนเทส', NULL),
	(2, 'praew_teacher', '1234', 'praew@school.com', 'instructor', 'อ. แพรวพรรณ ภาษาเด่น', NULL),
	(3, 'somchai', '123456', 'somchai@school.com', 'student', 'ด.ช. สมชาย รักเรียน', '66010001'),
	(4, 'somying', '1234', 'somying@school.com', 'student', 'ด.ญ. สมหญิง ขยันดี', '66010002'),
	(5, 'somsak', '1234', 'somsak@school.com', 'student', 'นาย สมศักดิ์ มาสาย', '66010003'),
	(6, 'pimjai', '1234', 'pimjai@school.com', 'student', 'ด.ญ. พิมพ์ใจ แสนดี', '66010004'),
	(7, 'thanakrit', '1234', 'thanakrit@school.com', 'student', 'นาย ธนกฤต เก่งมาก', '66010005'),
	(8, 'piya', '1234', 'piya@school.com', 'student', 'ด.ช. ปิยะ สุขสันต์', '66010006'),
	(9, 'kanya', '1234', 'kanya@school.com', 'student', 'ด.ญ. กัญญา รุ่งเรือง', '66010007'),
	(10, 'wichai', '1234', 'wichai@school.com', 'student', 'นาย วิชัย ใจกล้า', '66010008'),
	(11, 'AAAA 1234', '1231', 'AAAA1234', 'student', 'AAA1234', '102354'),
	(12, 'gallery_test', 'password123', 'test@test.com', 'instructor', 'Gallery Test', NULL),
	(13, 'student1', 'password', 'student1@test.com', 'student', 'Student One', '12345678'),
	(14, 'instructor1', 'password', 'instructor1@test.com', 'instructor', 'Instructor One', NULL),
	(15, 'student2', 'password', 'student2@test.com', 'student', 'Student Two', '22222222'),
	(17, 'unique_student_123', 'password123', 'unique_email_123@test.com', 'student', 'Student Test', '123123123'),
	(18, 'instructor1_unique', 'password123', 'instructor1@example.com', 'instructor', 'Instructor One', NULL),
	(19, 'Punchrakcat ', '10052550', 'pimlaphatpunch2550@gmail.com', 'student', 'พิมพ์ลภัส วรรณโอทอง', '66209010034'),
	(20, 'yonlada', '190950', 'yonlada.1655@gmail.com', 'student', 'น.ส.ยลดา เตชะนันท์', '66209010039');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
