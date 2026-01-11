-- =============================================
-- PHẦN 1: RESET DATABASE
-- =============================================
-- Tắt kiểm tra khóa ngoại tạm thời để tránh lỗi khi drop
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa database cũ nếu tồn tại để làm sạch hoàn toàn
DROP DATABASE IF EXISTS EduClassDB;

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- PHẦN 2: TẠO MỚI
-- =============================================

CREATE DATABASE EduClassDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE EduClassDB;

-- 1. Bảng User 
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL, 
    password VARCHAR(255) NOT NULL,       
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    avatar_url TEXT DEFAULT NULL,
    
    gender ENUM('Male', 'Female', 'Other'),
    date_of_birth DATE,
    
    role ENUM('Admin', 'Teacher', 'Student') NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.1. Bảng Students (Mở rộng từ Users)
CREATE TABLE Students (
    student_id INT PRIMARY KEY,
    student_code VARCHAR(20) NOT NULL UNIQUE,
    major VARCHAR(100),
    enrollment_year YEAR,
    gpa DECIMAL(3, 2) DEFAULT 0.00,
    credits_accumulated INT DEFAULT 0,
    
    FOREIGN KEY (student_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 1.2. Bảng Teachers (Mở rộng từ Users)
CREATE TABLE Teachers (
    teacher_id INT PRIMARY KEY,
    teacher_code VARCHAR(20) NOT NULL UNIQUE,
    department VARCHAR(100),
    qualification VARCHAR(50),
    contract_type ENUM('Full-time', 'Part-time', 'Visiting'),
    
    FOREIGN KEY (teacher_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 1.3. Bảng Admins (Mở rộng từ Users)
CREATE TABLE Admins (
    admin_id INT PRIMARY KEY,
    admin_code VARCHAR(20) NOT NULL UNIQUE,
    responsibility_area VARCHAR(100),
    
    FOREIGN KEY (admin_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 2. Bảng Class (Lớp học)
CREATE TABLE Classes (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    class_credits INT DEFAULT 1,
    class_description TEXT,
    
    start_time TIME,
    end_time TIME,
    days_of_week VARCHAR(50), 
    
    created_by_admin_id INT,
    teacher_id INT,
    theme_color VARCHAR(50) DEFAULT 'linear-gradient(to right, #2563eb, #4f46e5)',
    
    FOREIGN KEY (created_by_admin_id) REFERENCES Users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (teacher_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

-- 3. Bảng Enrollments (Sinh viên đăng ký lớp)
CREATE TABLE Enrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    enrolled_date DATE DEFAULT (CURRENT_DATE),
    
    UNIQUE(student_id, class_id), 
    FOREIGN KEY (student_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE
);

-- 4. Bảng Materials (Tài liệu)
CREATE TABLE Materials (
    material_id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    material_type VARCHAR(50), 
    material_url TEXT,         
    
    uploaded_by_teacher_id INT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_edit_date DATETIME,
    
    FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by_teacher_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

-- 5. Bảng Assignments (Bài tập)
CREATE TABLE Assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    start_date DATETIME,
    end_date DATETIME,
    scale INT DEFAULT 10,
    attachment_url TEXT, 
    
    FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE
);

-- 6. Bảng Submissions (Nộp bài)
CREATE TABLE Submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    
    submission_file_url TEXT, 
    submission_description TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    score DECIMAL(5, 2), 
    teacher_comment TEXT,
    score_breakdown JSON, 
    
    FOREIGN KEY (assignment_id) REFERENCES Assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES Users(user_id) ON DELETE CASCADE
);


CREATE TABLE ForumPosts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_id INT DEFAULT NULL, -- Nếu NULL thì là Chủ đề mới, nếu có số thì là Reply cho bài đó
    
    content TEXT,
    image_url TEXT, -- Lưu đường dẫn ảnh nếu có
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES ForumPosts(post_id) ON DELETE CASCADE
);



CREATE TABLE Quiz (
    quiz_id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    teacher_id INT NOT NULL,
    quiz_title VARCHAR(200) NOT NULL,
    quiz_description TEXT,
    quiz_status ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'Not Started',
    quiz_limit_time INT, -- Thời gian làm bài (phút)
    quiz_allowed_attempts INT DEFAULT 1,
    quiz_scale INT DEFAULT 10,
    quiz_password VARCHAR(100), -- Mật khẩu nếu có
    quiz_deadline_date DATETIME,
    quiz_deadline_time DATETIME,

    quiz_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    quiz_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES Teachers(teacher_id) ON DELETE CASCADE
);

CREATE TABLE Questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_scale INT DEFAULT 1,
    question_description TEXT,
    question_attachment_url TEXT,
    question_type ENUM ('Multiple Choice', 'True/False', 'Fill in the Blank') NOT NULL,

    Foreign KEY (quiz_id) REFERENCES Quiz(quiz_id) ON DELETE CASCADE
);

CREATE TABLE CHOICES (
    choice_id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    choice_description TEXT,
    is_correct BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (question_id) REFERENCES Questions(question_id) ON DELETE CASCADE
);

CREATE TABLE Attempt (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    quiz_id INT NOT NULL,

    attempt_count INT DEFAULT 1,
    attempt_duration INT,
    attempt_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    attempt_status ENUM('In Progress', 'Completed', 'Graded', 'Not attempted') DEFAULT 'Not attempted',
    total_score DECIMAL(5,2),
    teacher_comment TEXT,
    score_breakdown JSON,


    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES Quiz(quiz_id) ON DELETE CASCADE
);

Create table StudentAnswer (
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,

    answer_content TEXT,
    answer_choice_id INT, -- Dùng cho câu trắc nghiệm


    PRIMARY KEY (attempt_id, question_id),
    FOREIGN KEY (answer_choice_id) REFERENCES CHOICES(choice_id) ON DELETE SET NULL,
    FOREIGN KEY (attempt_id) REFERENCES Attempt(attempt_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES Questions(question_id) ON DELETE CASCADE
);


CREATE TABLE Notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,          -- Người nhận thông báo
    event_id INT,                  -- Sự kiện liên quan (nếu có)
    message TEXT NOT NULL,         -- Nội dung thông báo
    link VARCHAR(255),             -- Đường dẫn khi click vào (VD: assignments?id=1)
    is_read BOOLEAN DEFAULT FALSE, -- Trạng thái đã đọc
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);


CREATE TABLE Event (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_title VARCHAR(200) NOT NULL,
    event_description TEXT,
    event_time DATETIME NOT NULL,
    event_duration INT, -- Độ dài sự kiện (phút)
    event_loop_frequency ENUM('None', 'Daily', 'Weekly', 'Monthly', 'Yearly') DEFAULT 'None',
    event_loop_count INT DEFAULT 0, -- Số lần lặp lại
    event_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    event_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    user_id INT NOT NULL,
    notification_id INT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (notification_id) REFERENCES Notifications(notification_id) ON DELETE CASCADE
);


