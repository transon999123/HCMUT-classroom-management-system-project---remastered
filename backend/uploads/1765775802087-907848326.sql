-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 14, 2025 at 07:06 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `educlassdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `assignment_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `scale` int(11) DEFAULT 10,
  `attachment_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`assignment_id`, `class_id`, `title`, `description`, `start_date`, `end_date`, `scale`, `attachment_url`) VALUES
(1, 1, 'Bài tập lớn giữa kỳ', 'Làm web', '2025-10-20 08:00:00', '2025-10-25 23:59:59', 10, NULL),
(2, 7, 'học hát', 'LÂU ĐÀI TÌNH ÁI', '2025-12-11 09:16:35', '2025-12-31 23:59:00', 10, 'http://localhost:5000/uploads/1765712274236-689456151.png'),
(3, 7, 'f', '', '2025-12-11 10:05:06', '2025-12-12 12:04:00', 10, 'http://localhost:5000/uploads/1765712257893-839345890.png'),
(4, 7, 'Giải tích', '', '2025-12-14 11:39:33', '2025-12-15 12:00:00', 10, 'http://localhost:5000/uploads/1765712373239-213974449.pdf'),
(5, 7, 'đồ án', '', '2025-12-14 13:02:27', '2055-11-11 12:00:00', 100, 'http://localhost:5000/uploads/1765717853849-594256910.png');

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `class_id` int(11) NOT NULL,
  `class_name` varchar(100) NOT NULL,
  `class_description` text DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `days_of_week` varchar(50) DEFAULT NULL,
  `created_by_admin_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `theme_color` varchar(50) DEFAULT 'linear-gradient(to right, #2563eb, #4f46e5)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`class_id`, `class_name`, `class_description`, `start_time`, `end_time`, `days_of_week`, `created_by_admin_id`, `teacher_id`, `theme_color`) VALUES
(1, 'Đồ án', 'Đồ án HTTT', '07:00:00', '11:30:00', 'Thứ 4', 1, 7, 'linear-gradient(to right, #1f2937, #111827)'),
(5, '12', '', '08:00:00', '09:11:00', 'Thứ 2', 1, 7, 'linear-gradient(to right, #2563eb, #4f46e5)'),
(6, 'Giải tích', '', '07:00:00', '09:00:00', 'Thứ 2', 1, 7, 'linear-gradient(to right, #dc2626, #991b1b)'),
(7, 'Thanh nhạc nhập môn', '', '07:00:00', '11:00:00', 'Thứ 6', 1, 9, 'linear-gradient(to right, #d97706, #b45309)'),
(9, 'Ngữ văn', '', '07:00:00', '09:00:00', 'Thứ 2', 1, 7, 'linear-gradient(to right, #7c3aed, #5b21b6)');

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `enrollment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `enrolled_date` date DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`enrollment_id`, `student_id`, `class_id`, `enrolled_date`) VALUES
(13, 1, 5, '2025-12-11'),
(15, 6, 1, '2025-12-11'),
(16, 6, 5, '2025-12-11'),
(26, 1, 6, '2025-12-11'),
(28, 1, 7, '2025-12-11'),
(33, 6, 7, '2025-12-11'),
(35, 4, 1, '2025-12-14'),
(36, 4, 5, '2025-12-14'),
(37, 4, 6, '2025-12-14'),
(38, 4, 7, '2025-12-14'),
(39, 5, 1, '2025-12-14'),
(40, 5, 5, '2025-12-14'),
(41, 5, 6, '2025-12-14'),
(42, 5, 7, '2025-12-14'),
(47, 3, 1, '2025-12-14'),
(48, 10, 7, '2025-12-14'),
(49, 3, 7, '2025-12-14'),
(50, 6, 6, '2025-12-14'),
(55, 8, 7, '2025-12-14'),
(56, 11, 7, '2025-12-14'),
(57, 8, 1, '2025-12-14'),
(58, 10, 1, '2025-12-15'),
(60, 11, 1, '2025-12-15');

-- --------------------------------------------------------

--
-- Table structure for table `forumposts`
--

CREATE TABLE `forumposts` (
  `post_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `forumposts`
--

INSERT INTO `forumposts` (`post_id`, `class_id`, `user_id`, `parent_id`, `content`, `image_url`, `created_at`) VALUES
(1, 7, 5, NULL, 'zô nào anh chị em ơiiii', NULL, '2025-12-14 19:24:10'),
(2, 7, 6, 1, 'em yêu chị :> wlw forever', NULL, '2025-12-14 19:24:46'),
(3, 7, 9, 1, 'emoilaudaitinhaido', NULL, '2025-12-14 19:25:37'),
(4, 7, 9, NULL, 'Kölle Alaaf', 'http://localhost:5000/uploads/1765715172916-141736834.png', '2025-12-14 19:26:12'),
(5, 7, 6, NULL, 'abcsfhsudihfj', NULL, '2025-12-14 20:07:33'),
(6, 7, 6, 4, 'ưtf\r\n', NULL, '2025-12-14 20:07:56'),
(7, 7, 9, NULL, 'sdjifhjisahlnjkfsajkv', NULL, '2025-12-14 20:10:28'),
(8, 7, 9, NULL, 'âfdadadaffd', NULL, '2025-12-14 21:30:19'),
(9, 7, 9, NULL, 'x', NULL, '2025-12-14 22:15:54'),
(10, 7, 9, NULL, 'cscs', NULL, '2025-12-14 23:55:28'),
(11, 7, 5, NULL, 'em yêu mọi người', NULL, '2025-12-15 00:38:54'),
(12, 7, 9, 11, 'hay quá em', 'http://localhost:5000/uploads/1765734795177-706898050.png', '2025-12-15 00:53:15');

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `material_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `material_type` varchar(50) DEFAULT NULL,
  `material_url` text DEFAULT NULL,
  `uploaded_by_teacher_id` int(11) DEFAULT NULL,
  `upload_date` datetime DEFAULT current_timestamp(),
  `last_edit_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`material_id`, `class_id`, `title`, `material_type`, `material_url`, `uploaded_by_teacher_id`, `upload_date`, `last_edit_date`) VALUES
(1, 7, 'oplang', 'pdf', 'http://localhost:5000/uploads/1765711991358-533394653.md', 9, '2025-12-14 18:33:11', NULL),
(2, 7, 'xstk', 'pdf', 'http://localhost:5000/uploads/1765712332019-263715166.pdf', 9, '2025-12-14 18:38:52', NULL),
(3, 7, 'f', 'pdf', 'http://localhost:5000/uploads/1765734357412-756225303.png', 9, '2025-12-15 00:45:57', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `message`, `link`, `is_read`, `created_at`) VALUES
(1, 8, 'Bạn đã được thêm vào lớp: Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 21:28:45'),
(2, 9, 'Có sinh viên mới tham gia lớp Thanh nhạc nhập môn.', 'students', 1, '2025-12-14 21:28:45'),
(3, 11, 'Bạn đã được thêm vào lớp: Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 21:28:48'),
(4, 9, 'Có sinh viên mới tham gia lớp Thanh nhạc nhập môn.', 'students', 1, '2025-12-14 21:28:48'),
(5, 1, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 1, '2025-12-14 21:30:19'),
(6, 6, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 1, '2025-12-14 21:30:19'),
(7, 4, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 21:30:19'),
(8, 5, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 1, '2025-12-14 21:30:19'),
(9, 10, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 21:30:19'),
(10, 3, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 21:30:19'),
(11, 8, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 21:30:19'),
(12, 11, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 21:30:19'),
(13, 1, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 1, '2025-12-14 22:15:54'),
(14, 6, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 1, '2025-12-14 22:15:54'),
(15, 4, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 22:15:54'),
(16, 5, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 1, '2025-12-14 22:15:54'),
(17, 10, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 22:15:54'),
(18, 3, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 22:15:54'),
(19, 8, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 22:15:54'),
(20, 11, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 22:15:54'),
(21, 5, 'Bài tập \"học hát\" đã có điểm số.', 'assignment-detail?assignmentId=undefined', 1, '2025-12-14 22:22:36'),
(22, 9, 'Sinh viên vừa nộp bài tập \"đà ốn\" (Thanh nhạc nhập môn)', 'assignment-detail?assignmentId=5', 1, '2025-12-14 22:40:31'),
(23, 6, 'Bài tập \"đà ốn\" đã có điểm số.', 'assignment-detail?assignmentId=undefined', 1, '2025-12-14 22:40:57'),
(24, 8, 'Bạn đã được thêm vào lớp: Đồ án', 'course-detail?courseId=1', 0, '2025-12-14 23:23:16'),
(25, 7, 'Có sinh viên mới tham gia lớp Đồ án.', 'students', 0, '2025-12-14 23:23:16'),
(26, 1, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 23:55:28'),
(27, 6, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 1, '2025-12-14 23:55:28'),
(28, 4, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 23:55:28'),
(29, 5, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 1, '2025-12-14 23:55:28'),
(30, 10, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 23:55:28'),
(31, 3, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 23:55:28'),
(32, 8, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 23:55:28'),
(33, 11, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-14 23:55:28'),
(34, 10, 'Bạn đã được thêm vào lớp: Đồ án', 'course-detail?courseId=1', 0, '2025-12-15 00:01:22'),
(35, 7, 'Có sinh viên mới tham gia lớp Đồ án.', 'students', 0, '2025-12-15 00:01:22'),
(36, 6, 'Bạn đã được thêm vào lớp: Bộ PC', 'course-detail?courseId=8', 1, '2025-12-15 00:22:25'),
(37, 9, 'Có sinh viên mới tham gia lớp Bộ PC.', 'students', 0, '2025-12-15 00:22:25'),
(38, 7, 'Bạn được phân công dạy lớp mới: dsf', 'courses', 0, '2025-12-15 00:23:21'),
(39, 1, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:38:54'),
(40, 6, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:38:54'),
(41, 4, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:38:54'),
(42, 10, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:38:54'),
(43, 3, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:38:55'),
(44, 8, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:38:55'),
(45, 11, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:38:55'),
(46, 9, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:38:55'),
(47, 5, 'Bài tập \"học hát\" đã có điểm số.', 'assignment-detail?assignmentId=undefined', 0, '2025-12-15 00:40:33'),
(48, 1, 'Tài liệu mới: \"f\" trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:45:57'),
(49, 6, 'Tài liệu mới: \"f\" trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:45:57'),
(50, 4, 'Tài liệu mới: \"f\" trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:45:57'),
(51, 5, 'Tài liệu mới: \"f\" trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:45:57'),
(52, 10, 'Tài liệu mới: \"f\" trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:45:57'),
(53, 3, 'Tài liệu mới: \"f\" trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:45:57'),
(54, 8, 'Tài liệu mới: \"f\" trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:45:57'),
(55, 11, 'Tài liệu mới: \"f\" trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:45:57'),
(56, 5, 'Bài tập \"đồ án\" đã có điểm số.', 'assignment-detail?assignmentId=undefined', 0, '2025-12-15 00:52:13'),
(57, 1, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:53:15'),
(58, 6, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:53:15'),
(59, 4, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:53:15'),
(60, 5, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:53:15'),
(61, 10, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:53:15'),
(62, 3, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:53:15'),
(63, 8, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:53:15'),
(64, 11, 'Thảo luận mới trong lớp Thanh nhạc nhập môn', 'course-detail?courseId=7', 0, '2025-12-15 00:53:15'),
(65, 11, 'Bạn đã được thêm vào lớp: Đồ án', 'course-detail?courseId=1', 0, '2025-12-15 00:55:54'),
(66, 7, 'Có sinh viên mới tham gia lớp Đồ án.', 'students', 0, '2025-12-15 00:55:54');

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `submission_id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `submission_file_url` text DEFAULT NULL,
  `submission_description` text DEFAULT NULL,
  `submitted_at` datetime DEFAULT current_timestamp(),
  `score` decimal(5,2) DEFAULT NULL,
  `teacher_comment` text DEFAULT NULL,
  `score_breakdown` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`score_breakdown`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `submissions`
--

INSERT INTO `submissions` (`submission_id`, `assignment_id`, `student_id`, `submission_file_url`, `submission_description`, `submitted_at`, `score`, `teacher_comment`, `score_breakdown`) VALUES
(2, 2, 6, 'http://localhost:5000/uploads/1765445500896-293637174.pdf', 'em ơi lâu đài tình ái đóooooo', '2025-12-11 16:31:40', 10.00, 'giỏi đó e', NULL),
(3, 2, 5, 'http://localhost:5000/uploads/1765712981547-163532524.xlsx', '', '2025-12-14 18:49:41', 7.50, 'tốt', NULL),
(4, 5, 5, 'http://localhost:5000/uploads/1765717900619-468067406.png', 'sdjfksaldhfguklsahuigasfhuir', '2025-12-14 20:11:40', 50.50, 'ngu', NULL),
(5, 5, 6, 'http://localhost:5000/uploads/1765726831839-233255530.png', '', '2025-12-14 22:40:31', 50.00, 'ik', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `role` enum('Admin','Teacher','Student') NOT NULL,
  `experience_years` int(11) DEFAULT NULL,
  `teacher_start_date` date DEFAULT NULL,
  `admin_start_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `avatar_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `email`, `phone_number`, `first_name`, `last_name`, `middle_name`, `gender`, `date_of_birth`, `role`, `experience_years`, `teacher_start_date`, `admin_start_date`, `created_at`, `avatar_url`) VALUES
(1, 'admin1', '123456', 'admin@hcmut.edu.vn', NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', NULL, NULL, '2025-12-10', '2025-12-10 09:54:10', NULL),
(2, 'teacher1', '123456', 'gv@hcmut.edu.vn', NULL, NULL, NULL, NULL, NULL, NULL, 'Teacher', 5, NULL, NULL, '2025-12-10 09:54:10', NULL),
(3, 'student1', '123456', 'sv1@hcmut.edu.vn', NULL, NULL, NULL, NULL, NULL, NULL, 'Student', NULL, NULL, NULL, '2025-12-10 09:54:10', NULL),
(4, 'student2', '123456', 'sv2@hcmut.edu.vn', NULL, NULL, NULL, NULL, NULL, NULL, 'Student', NULL, NULL, NULL, '2025-12-10 09:54:10', NULL),
(5, 'student99', '123456', 'student99@bku.edu.vn', '', 'Hà', 'Trần Thanh Nguyên', NULL, 'Female', '2005-02-13', 'Student', NULL, NULL, NULL, '2025-12-10 17:13:00', 'http://localhost:5000/uploads/1765733880786-536561627.png'),
(6, 'studenttest', '123456', 'nhuto@bku.edu.vn', '0123456789', 'Như', 'Lê Thị Tố', NULL, 'Female', NULL, 'Student', NULL, NULL, NULL, '2025-12-10 18:57:23', 'http://localhost:5000/uploads/1765717701753-75734666.png'),
(7, 'teacher2', '123456', 'teacher2@bku.edu.vn', NULL, 'Độ', 'Phùng Thanh', NULL, NULL, NULL, 'Teacher', NULL, NULL, NULL, '2025-12-10 19:44:49', NULL),
(8, 'student4', '123456', 'siuuuu@alnassr.com', NULL, 'Ronaldo', '', NULL, NULL, NULL, 'Student', NULL, NULL, NULL, '2025-12-11 07:05:01', NULL),
(9, 'teacher5', '123456', 'dvh@gmail.com', '', 'Hưng', 'Đàm Vĩnh', NULL, 'Male', '2005-02-12', 'Teacher', NULL, NULL, NULL, '2025-12-11 08:32:20', 'http://localhost:5000/uploads/1765716316853-322522083.png'),
(10, 'thaile', '123456', 'thaile@hcmut.edu.vn', '', 'Thái', 'Lê Quốc', NULL, NULL, NULL, 'Student', NULL, NULL, NULL, '2025-12-11 08:37:01', NULL),
(11, 'a1', '123456', 'aashfdkjsdh@hcmut.edu', '00000001', 'Sơn', 'Đào', NULL, NULL, NULL, 'Student', NULL, NULL, NULL, '2025-12-14 13:19:39', NULL),
(12, 'student10', '123456', 'messigoat@m10.com', NULL, 'Messi', 'Lionel', NULL, NULL, NULL, 'Student', NULL, NULL, NULL, '2025-12-14 17:30:08', NULL),
(13, 'df', '123456', 'c@g.com', NULL, 'f', '', NULL, NULL, NULL, 'Student', NULL, NULL, NULL, '2025-12-14 17:30:43', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`assignment_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`class_id`),
  ADD KEY `created_by_admin_id` (`created_by_admin_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`enrollment_id`),
  ADD UNIQUE KEY `student_id` (`student_id`,`class_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `forumposts`
--
ALTER TABLE `forumposts`
  ADD PRIMARY KEY (`post_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`material_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `uploaded_by_teacher_id` (`uploaded_by_teacher_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`submission_id`),
  ADD KEY `assignment_id` (`assignment_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `class_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `enrollment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `forumposts`
--
ALTER TABLE `forumposts`
  MODIFY `post_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `material_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `submission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE CASCADE;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`created_by_admin_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE CASCADE;

--
-- Constraints for table `forumposts`
--
ALTER TABLE `forumposts`
  ADD CONSTRAINT `forumposts_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `forumposts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `forumposts_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `forumposts` (`post_id`) ON DELETE CASCADE;

--
-- Constraints for table `materials`
--
ALTER TABLE `materials`
  ADD CONSTRAINT `materials_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `materials_ibfk_2` FOREIGN KEY (`uploaded_by_teacher_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
