const express = require('express');
const cors = require('cors');
const db = require('./db');
const jwt = require('jsonwebtoken'); // <--- Nhớ import cái này
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu file và tên file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Lưu vào thư mục 'uploads'
    },
    filename: function (req, file, cb) {
        // Đặt tên file = Thời gian hiện tại + Tên gốc (để tránh bị trùng đè lên nhau)
        // Ví dụ: 1700000000-baitap.pdf
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// QUAN TRỌNG: Mở thư mục uploads ra cho bên ngoài truy cập (để tải file về)
// Khi truy cập http://localhost:5000/uploads/tenfile.pdf sẽ xem được file
app.use('/uploads', express.static('uploads'));


app.use(cors());
app.use(express.json());

// --- HELPER: HÀM TẠO THÔNG BÁO ---
// Dùng hàm này để bắn thông báo ở bất kỳ đâu
const createNotification = async (userId, message, link) => {
    try {
        if (!userId) return;
        await db.query(
            'INSERT INTO Notifications (user_id, message, link) VALUES (?, ?, ?)',
            [userId, message, link]
        );
    } catch (error) {
        console.error("Lỗi tạo thông báo:", error);
    }
};

// --- ROUTES ---

// 1. API Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Validate đầu vào
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    try {
        // Query DB tìm user
        // Lưu ý: Đồ án này đang dùng pass thường (plain text). 
        // Nếu muốn xịn hơn thì sau này dùng bcrypt để mã hóa.
        const [users] = await db.query(
            'SELECT * FROM Users WHERE username = ? AND password = ?', 
            [username, password]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu!" });
        }

        const user = users[0];

        // --- TẠO TOKEN (Cái vé) ---
        const token = jwt.sign(
            { 
                userId: user.user_id, 
                role: user.role,       // Lưu role vào vé để tiện phân quyền sau này
                username: user.username 
            },
            process.env.JWT_SECRET,   // Khóa bí mật lấy từ .env
            { expiresIn: '24h' }      // Vé hết hạn sau 24h
        );

        // Trả về cho Frontend
        res.json({
            success: true,
            message: "Đăng nhập thành công!",
            token: token, // <--- Quan trọng nhất
            user: {
                id: user.user_id,
                username: user.username,
                fullName: `${user.last_name} ${user.middle_name || ''} ${user.first_name}`,
                role: user.role,
                email: user.email,
                avatar: user.avatar || null // Nếu có
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
});

// --- server.js ---

// 1. API Kiểm tra email (Bước 1 của Forgot Password)
app.post('/api/verify-email', async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "Email không tồn tại trong hệ thống!" });
        }

        // Demo: Không gửi email thật, chỉ trả về thành công
        // Mặc định mã code là 123456 cho dễ test
        res.json({ success: true, message: "Mã xác nhận đã được gửi (Mã demo: 123456)" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// 2. API Đặt lại mật khẩu (Bước cuối)
app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        // Cập nhật mật khẩu mới (Lưu ý: chưa mã hóa password cho đơn giản)
        await db.query('UPDATE Users SET password = ? WHERE email = ?', [newPassword, email]);
        res.json({ success: true, message: "Đặt lại mật khẩu thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật mật khẩu" });
    }
});

// 1.5. API Đăng ký tài khoản (Register)
app.post('/api/register', async (req, res) => {
    const { username, email, password, name, role } = req.body;

    if (!username || !email || !password || !name) {
        return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc!" });
    }

    try {
        // Tách họ tên đơn giản (Ví dụ: "Nguyễn Văn A" -> First: A, Last: Nguyễn Văn)
        const nameParts = name.trim().split(" ");
        const firstName = nameParts.pop();
        const lastName = nameParts.join(" ");

        // Insert vào DB
        const sql = `
            INSERT INTO Users (username, email, password, first_name, last_name, role) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        await db.query(sql, [username, email, password, firstName, lastName, role || 'Student']);

        res.json({ success: true, message: "Đăng ký thành công!" });

    } catch (error) {
        console.error("Register Error:", error);
        // Kiểm tra lỗi trùng lặp (Duplicate entry)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: "Tên đăng nhập hoặc Email đã tồn tại!" });
        }
        res.status(500).json({ success: false, message: "Lỗi Server khi đăng ký" });
    }
});

// --- MIDDLEWARE: Kiểm tra đăng nhập ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Header thường có dạng: "Bearer <token_loằng_ngoằng>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Chưa đăng nhập! Vui lòng gửi kèm Token." });
    }

    try {
        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Lưu thông tin user (id, role) vào biến req để dùng ở bước sau
        next(); // Cho phép đi tiếp
    } catch (error) {
        return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }
};

// --- API NOTIFICATIONS (MỚI) ---
// Lấy danh sách thông báo
app.get('/api/notifications', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM Notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [req.user.userId]
        );
        const [countRows] = await db.query(
            'SELECT COUNT(*) as unread FROM Notifications WHERE user_id = ? AND is_read = FALSE',
            [req.user.userId]
        );
        res.json({ notifications: rows, unreadCount: countRows[0].unread });
    } catch (error) { res.status(500).json({ message: "Lỗi lấy thông báo" }); }
});

// Đánh dấu đã đọc
app.put('/api/notifications/read', verifyToken, async (req, res) => {
    try {
        await db.query('UPDATE Notifications SET is_read = TRUE WHERE user_id = ?', [req.user.userId]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ message: "Lỗi update thông báo" }); }
});

// 3. API Lấy danh sách lớp học (Phân quyền)
app.get('/api/classes', verifyToken, async (req, res) => {
    // Lấy thông tin từ token (do middleware verifyToken cung cấp)
    const { userId, role } = req.user; 

    try {
        let query = '';
        let params = [];

        if (role === 'Admin') {
            // Admin thấy tất cả lớp + tên giáo viên dạy lớp đó
            query = `
                SELECT Classes.*, Users.first_name, Users.last_name 
                FROM Classes 
                LEFT JOIN Users ON Classes.teacher_id = Users.user_id
            `;
        } 
        else if (role === 'Teacher') {
            // Teacher chỉ thấy lớp mình dạy
            query = 'SELECT * FROM Classes WHERE teacher_id = ?';
            params = [userId];
        } 
        else if (role === 'Student') {
            // Student chỉ thấy lớp mình đã đăng ký (JOIN bảng Enrollments)
            query = `
                SELECT Classes.* FROM Classes 
                JOIN Enrollments ON Classes.class_id = Enrollments.class_id 
                WHERE Enrollments.student_id = ?
            `;
            params = [userId];
        }

        // Thực thi SQL
        const [rows] = await db.query(query, params);
        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi lấy danh sách lớp" });
    }
});

// 4. API Tạo lớp học mới (Chỉ Admin)
app.post('/api/classes', verifyToken, async (req, res) => {
    const { role, userId } = req.user; // Lấy thông tin từ Token

    // 1. Chặn nếu không phải Admin
    if (role !== 'Admin') {
        return res.status(403).json({ message: "Bạn không có quyền tạo lớp học!" });
    }

    // 2. Lấy dữ liệu từ Frontend gửi lên
    const { 
        class_name, 
        class_description, 
        start_time, 
        end_time, 
        days_of_week, // Ví dụ: "Thứ 2, Thứ 4"
        teacher_id,
        theme_color,   // ID của giáo viên dạy lớp này (nếu có)
    } = req.body;

    if (!class_name) {
        return res.status(400).json({ message: "Tên lớp học là bắt buộc!" });
    }

    try {
        // 3. Insert vào Database
        const sql = `
            INSERT INTO Classes 
            (class_name, class_description, start_time, end_time, days_of_week, teacher_id, created_by_admin_id, theme_color) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        // Default màu nếu không gửi lên
        const colorToSave = theme_color || 'linear-gradient(to right, #2563eb, #4f46e5)';

        const [result] = await db.query(sql, [
            class_name, class_description, start_time, end_time, days_of_week, teacher_id, userId, colorToSave
        ]);

        // NOTI: Báo cho giáo viên được phân công
        if (teacher_id) {
            await createNotification(teacher_id, `Bạn được phân công dạy lớp mới: ${class_name}`, `courses`);
        }

        res.json({ 
            success: true, 
            message: "Tạo lớp học thành công!",
            classId: result.insertId 
        });

    } catch (error) {
        console.error("Lỗi tạo lớp:", error);
        res.status(500).json({ message: "Lỗi Server khi tạo lớp" });
    }
});

// Thêm vào server.js
app.delete('/api/classes/:id', verifyToken, async (req, res) => {
    const { role } = req.user;
    if (role !== 'Admin') return res.status(403).json({ message: "Không có quyền xóa lớp!" });

    try {
        await db.query('DELETE FROM Classes WHERE class_id = ?', [req.params.id]);
        res.json({ success: true, message: "Xóa lớp học thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa lớp" });
    }
});

// 5. API Đăng ký lớp học (Admin enroll cho Student, hoặc Student tự enroll - Đã chặn ở FE)
app.post('/api/enroll', verifyToken, async (req, res) => {
    let { class_id, student_id } = req.body;
    const { role, userId } = req.user;

    // Logic phân quyền:
    // 1. Nếu là Admin: Được quyền add bất kỳ student_id nào.
    // 2. Nếu là Teacher: Có thể add student (tùy nghiệp vụ, ở đây ta cho phép).
    // 3. Nếu là Student: Chỉ được add chính mình (student_id = userId).
    
    //if (role === 'Student') {
        // Chặn Student enroll nếu hệ thống yêu cầu Admin xếp lớp
        // Tuy nhiên, để linh hoạt nếu bạn muốn mở lại sau này, ta cứ để logic này
        // nhưng ở Frontend ta sẽ ẩn nút đi.
       // student_id = userId; 
   // } 
    
    if (!student_id || !class_id) {
        return res.status(400).json({ message: "Thiếu thông tin ID!" });
    }

    try {
        await db.query(
            'INSERT INTO Enrollments (student_id, class_id) VALUES (?, ?)',
            [student_id, class_id]
        );
        const [classInfo] = await db.query('SELECT class_name, teacher_id FROM Classes WHERE class_id = ?', [class_id]);

        if (classInfo.length > 0) {
            const cls = classInfo[0];
            // 1. Báo cho Sinh viên
            await createNotification(student_id, `Bạn đã được thêm vào lớp: ${cls.class_name}`, `course-detail?courseId=${class_id}`);
            // 2. Báo cho Giáo viên
            if (cls.teacher_id) {
                await createNotification(cls.teacher_id, `Có sinh viên mới tham gia lớp ${cls.class_name}.`, `students`);
            }
        }
        res.json({ success: true, message: "Thêm sinh viên vào lớp thành công!" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Sinh viên này đã ở trong lớp rồi!" });
        }
        res.status(500).json({ message: "Lỗi Server khi thêm sinh viên" });
    }
});
// Thêm vào server.js
app.get('/api/teachers', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT user_id, first_name, last_name, email FROM Users WHERE role = 'Teacher'");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách giáo viên" });
    }
});
// --- QUẢN LÝ BÀI TẬP (CÓ UPLOAD FILE ĐỀ BÀI) ---

// 6. API Tạo Bài tập mới (Có upload file)
app.post('/api/assignments', verifyToken, upload.single('file'), async (req, res) => {
    // Check quyền
    if (req.user.role === 'Student') return res.status(403).json({ message: "Không có quyền!" });

    const { class_id, title, description, start_date, end_date, scale } = req.body;
    
    // Xử lý file (nếu có)
    let fileUrl = null;
    if (req.file) {
        fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    try {
        const sql = `
            INSERT INTO Assignments (class_id, title, description, start_date, end_date, scale, attachment_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [class_id, title, description, start_date, end_date, scale, fileUrl]);
        const [students] = await db.query('SELECT student_id FROM Enrollments WHERE class_id = ?', [class_id]);
        const [cls] = await db.query('SELECT class_name FROM Classes WHERE class_id = ?', [class_id]);
        for (const s of students) {
            await createNotification(s.student_id, `Bài tập mới: "${title}" trong lớp ${cls[0].class_name}`, `assignments`);
        }

        res.json({ success: true, message: "Tạo bài tập thành công!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi tạo bài tập" });
    }
});
// 7. API Lấy danh sách bài tập của 1 lớp (Ai trong lớp cũng xem được)
app.get('/api/classes/:classId/assignments', verifyToken, async (req, res) => {
    const { classId } = req.params; // Lấy ID lớp từ trên URL

    try {
        // Query đơn giản lấy hết bài tập của lớp đó
        const [rows] = await db.query(
            'SELECT * FROM Assignments WHERE class_id = ? ORDER BY start_date DESC', 
            [classId]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi lấy danh sách bài tập" });
    }
});

// 8. API Nộp bài tập (Student upload file)
app.post('/api/submissions', verifyToken, upload.single('file'), async (req, res) => {
    const { role, userId } = req.user;
    const { assignment_id, submission_description } = req.body;

    if (role !== 'Student') {
        return res.status(403).json({ message: "Chỉ sinh viên mới được nộp bài!" });
    }

    try {
        // 1. Kiểm tra Deadline
        const [assignment] = await db.query(
            'SELECT end_date FROM Assignments WHERE assignment_id = ?', 
            [assignment_id]
        );

        if (assignment.length === 0) {
            return res.status(404).json({ message: "Bài tập không tồn tại" });
        }

        const endDate = new Date(assignment[0].end_date);
        const now = new Date();

        if (now > endDate) {
            return res.status(400).json({ message: "Đã hết hạn nộp bài! Bạn bị 0 điểm." });
        }

        // 2. Kiểm tra file
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng đính kèm file bài làm!" });
        }

        // 3. Tạo đường dẫn file
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        // 4. Lưu vào Database (SỬA LẠI CÂU SQL ĐẦY ĐỦ Ở ĐÂY)
        const sql = `
            INSERT INTO Submissions (assignment_id, student_id, submission_file_url, submission_description) 
            VALUES (?, ?, ?, ?)
        `;

        await db.query(sql, [assignment_id, userId, fileUrl, submission_description || ""]);
        const [assignInfo] = await db.query(
            'SELECT a.title, c.teacher_id, c.class_name FROM Assignments a JOIN Classes c ON a.class_id = c.class_id WHERE a.assignment_id = ?', 
            [assignment_id]
        );
        if (assignInfo.length > 0) {
            const info = assignInfo[0];
            if (info.teacher_id) {
                await createNotification(info.teacher_id, `Sinh viên vừa nộp bài tập "${info.title}" (${info.class_name})`, `assignment-detail?assignmentId=${assignment_id}`);
            }
        }

        res.json({ 
            success: true, 
            message: "Nộp bài thành công!", 
            fileUrl: fileUrl 
        });

    } catch (error) {
        console.error("Lỗi nộp bài:", error);
        // Bắt lỗi nộp trùng (nếu một bài chỉ được nộp 1 lần)
        if (error.code === 'ER_DUP_ENTRY') { 
             return res.status(400).json({ message: "Bạn đã nộp bài này rồi!" });
        }
        res.status(500).json({ message: "Lỗi Server khi nộp bài" });
    }
});

// 20. API Sinh viên sửa bài nộp (Resubmit)
app.put('/api/submissions/student', verifyToken, upload.single('file'), async (req, res) => {
    const { role, userId } = req.user;
    // Lấy dữ liệu từ FormData (Frontend gửi lên)
    const { assignment_id, submission_description } = req.body;

    if (role !== 'Student') {
        return res.status(403).json({ message: "Chỉ sinh viên mới được sửa bài!" });
    }

    try {
        // 1. Kiểm tra xem bài tập còn hạn không
        const [assignment] = await db.query(
            'SELECT end_date FROM Assignments WHERE assignment_id = ?', 
            [assignment_id]
        );

        if (assignment.length === 0) return res.status(404).json({ message: "Bài tập không tồn tại" });

        const endDate = new Date(assignment[0].end_date);
        const now = new Date();

        if (now > endDate) {
            return res.status(400).json({ message: "Đã hết hạn nộp bài, không thể chỉnh sửa!" });
        }

        // 2. Xây dựng câu query update
        // Logic: Luôn update mô tả và thời gian nộp.
        // Chỉ update file nếu người dùng có gửi file mới lên.
        let sql = `UPDATE Submissions SET submission_description = ?, submitted_at = NOW()`;
        let params = [submission_description];

        if (req.file) {
            // Nếu có file mới -> Cập nhật đường dẫn file
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            sql += `, submission_file_url = ?`;
            params.push(fileUrl);
        }

        sql += ` WHERE assignment_id = ? AND student_id = ?`;
        params.push(assignment_id, userId);

        await db.query(sql, params);
        const [assignInfo] = await db.query('SELECT a.title, c.teacher_id FROM Assignments a JOIN Classes c ON a.class_id = c.class_id WHERE a.assignment_id = ?', [assignment_id]);
        if (assignInfo.length > 0 && assignInfo[0].teacher_id) {
            await createNotification(assignInfo[0].teacher_id, `Sinh viên đã cập nhật bài nộp "${assignInfo[0].title}".`, `assignment-detail?assignmentId=${assignment_id}`);
        }

        res.json({ success: true, message: "Cập nhật bài nộp thành công!" });

    } catch (error) {
        console.error("Lỗi sửa bài:", error);
        res.status(500).json({ message: "Lỗi Server khi sửa bài" });
    }
});

// 9. API Chấm điểm (Teacher)
app.put('/api/submissions/:submissionId', verifyToken, async (req, res) => {
    const { role } = req.user;
    const { submissionId } = req.params;
    const { score, teacher_comment } = req.body;

    if (role !== 'Teacher') {
        return res.status(403).json({ message: "Chỉ giáo viên mới được chấm điểm!" });
    }

    try {
        // Update bảng Submissions
        const sql = `
            UPDATE Submissions 
            SET score = ?, teacher_comment = ? 
            WHERE submission_id = ?
        `;

        await db.query(sql, [score, teacher_comment, submissionId]);
        const [subInfo] = await db.query(
            'SELECT s.student_id, a.title FROM Submissions s JOIN Assignments a ON s.assignment_id = a.assignment_id WHERE s.submission_id = ?',
            [submissionId]
        );
        if (subInfo.length > 0) {
            await createNotification(subInfo[0].student_id, `Bài tập "${subInfo[0].title}" đã có điểm số.`, `assignment-detail?assignmentId=${subInfo[0].assignment_id}`);
        }

        res.json({ success: true, message: "Đã chấm điểm thành công!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi chấm điểm" });
    }
});

// 10. API Xem kết quả bài làm (Có xử lý Tự động 0 điểm)
app.get('/api/assignments/:assignmentId/my-submission', verifyToken, async (req, res) => {
    const { userId } = req.user;
    const { assignmentId } = req.params;

    try {
        // Bước 1: Lấy thông tin bài tập trước (để xem deadline)
        const [assignments] = await db.query(
            'SELECT end_date FROM Assignments WHERE assignment_id = ?', 
            [assignmentId]
        );

        if (assignments.length === 0) {
            return res.status(404).json({ message: "Bài tập không tồn tại" });
        }
        
        const endDate = new Date(assignments[0].end_date);
        const now = new Date();

        // Bước 2: Tìm bài nộp của sinh viên
        const sql = `
            SELECT * FROM Submissions 
            WHERE assignment_id = ? AND student_id = ?
        `;
        const [rows] = await db.query(sql, [assignmentId, userId]);

        // TRƯỜNG HỢP 1: Đã nộp bài
        if (rows.length > 0) {
            return res.json({ 
                submitted: true, 
                status: "Đã nộp",
                data: rows[0] 
            });
        }

        // TRƯỜNG HỢP 2: Chưa nộp + Đã quá hạn (Overdue)
        // Logic: Tự động coi như 0 điểm
        if (now > endDate) {
            return res.json({ 
                submitted: false,
                status: "Missing", // Đánh dấu là Mất bài/Quá hạn
                data: {
                    score: 0, // <--- Tự động cho 0 điểm
                    teacher_comment: "Hệ thống: Bạn đã không nộp bài đúng hạn."
                }
            });
        }

        // TRƯỜNG HỢP 3: Chưa nộp + Vẫn còn hạn
        res.json({ 
            submitted: false, 
            status: "Not Submitted",
            message: "Bạn chưa nộp bài này." 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy thông tin bài làm" });
    }
});

// 11. API Upload Tài liệu (Chỉ Teacher/Admin)
app.post('/api/materials', verifyToken, upload.single('file'), async (req, res) => {
    const { role, userId } = req.user;
    const { class_id, title, material_type } = req.body;

    // 1. Phân quyền: Chỉ GV hoặc Admin mới được up tài liệu
    if (role !== 'Teacher' && role !== 'Admin') {
        return res.status(403).json({ message: "Bạn không có quyền đăng tài liệu!" });
    }

    // 2. Kiểm tra file
    if (!req.file) {
        return res.status(400).json({ message: "Vui lòng chọn file tài liệu!" });
    }

    if (!title || !class_id) {
        return res.status(400).json({ message: "Thiếu tiêu đề hoặc ID lớp!" });
    }

    try {
        // 3. Tạo đường dẫn URL
        const materialUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        // 4. Lưu vào DB
        const sql = `
            INSERT INTO Materials (class_id, title, material_type, material_url, uploaded_by_teacher_id) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        await db.query(sql, [
            class_id, 
            title, 
            material_type || 'File', // Nếu không gửi type thì mặc định là 'File'
            materialUrl, 
            userId
        ]);

        const [students] = await db.query('SELECT student_id FROM Enrollments WHERE class_id = ?', [class_id]);
        const [cls] = await db.query('SELECT class_name FROM Classes WHERE class_id = ?', [class_id]);
        for (const s of students) {
            await createNotification(s.student_id, `Tài liệu mới: "${title}" trong lớp ${cls[0].class_name}`, `course-detail?courseId=${class_id}`);
        }

        res.json({ 
            success: true, 
            message: "Upload tài liệu thành công!", 
            url: materialUrl 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server khi upload tài liệu" });
    }
});

// 12. API Lấy danh sách tài liệu của lớp (Ai trong lớp cũng xem được)
app.get('/api/classes/:classId/materials', verifyToken, async (req, res) => {
    const { classId } = req.params;

    try {
        const [rows] = await db.query(
            'SELECT * FROM Materials WHERE class_id = ? ORDER BY upload_date DESC', 
            [classId]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi lấy danh sách tài liệu" });
    }
});

// --- QUẢN LÝ USER (Dành cho Admin) ---

// 13. Lấy danh sách tất cả người dùng (User Management)
app.get('/api/admin/users', verifyToken, async (req, res) => {
    // Chỉ Admin mới được xem
    if (req.user.role !== 'Admin') return res.status(403).json({ message: "Không có quyền!" });

    try {
        const [rows] = await db.query('SELECT * FROM Users ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách người dùng" });
    }
});

// 14. Admin tạo người dùng mới (Add User)
app.post('/api/admin/users', verifyToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: "Không có quyền!" });

    const { name, email, password, role, phone, code } = req.body;

    // Tách tên (Giả sử nhập "Nguyễn Văn A")
    const nameParts = name ? name.trim().split(" ") : ["User"];
    const firstName = nameParts.pop();
    const lastName = nameParts.join(" ");

    // Username tạm lấy là email hoặc code (nếu có)
    const username = code || email.split('@')[0];

    try {
        const sql = `
            INSERT INTO Users (username, password, email, first_name, last_name, role, phone_number) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [username, password, email, firstName, lastName, role, phone]);
        res.json({ success: true, message: "Tạo người dùng thành công!" });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Email hoặc Username đã tồn tại!" });
        }
        res.status(500).json({ message: "Lỗi server" });
    }
});

// 15. Admin xóa người dùng
app.delete('/api/admin/users/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: "Không có quyền!" });

    try {
        await db.query('DELETE FROM Users WHERE user_id = ?', [req.params.id]);
        res.json({ success: true, message: "Đã xóa người dùng!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa người dùng" });
    }
});

// 16. API Thống kê Dashboard (Admin Dashboard Stats)
app.get('/api/admin/stats', verifyToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: "Không có quyền!" });

    try {
        // 1. Đếm User theo Role
        const [userStats] = await db.query("SELECT role, COUNT(*) as count FROM Users GROUP BY role");
        
        // 2. Đếm tổng Lớp học và Bài tập
        const [classCount] = await db.query("SELECT COUNT(*) as total FROM Classes");
        const [assignmentCount] = await db.query("SELECT COUNT(*) as total FROM Assignments");

        // 3. Lấy 5 hoạt động gần đây (Ví dụ: 5 user mới nhất đăng ký)
        const [recentUsers] = await db.query("SELECT username, first_name, last_name, created_at, role FROM Users ORDER BY created_at DESC LIMIT 5");

        // Format dữ liệu trả về
        const stats = {
            totalUsers: userStats.reduce((acc, cur) => acc + cur.count, 0),
            students: userStats.find(u => u.role === 'Student')?.count || 0,
            teachers: userStats.find(u => u.role === 'Teacher')?.count || 0,
            admins: userStats.find(u => u.role === 'Admin')?.count || 0,
            totalClasses: classCount[0].total,
            totalAssignments: assignmentCount[0].total,
            recentActivity: recentUsers.map(u => ({
                action: "Gia nhập hệ thống",
                user: `${u.last_name} ${u.first_name} (${u.role})`,
                time: new Date(u.created_at).toLocaleDateString("vi-VN")
            }))
        };

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi lấy thống kê" });
    }
});

// 1. API Sửa thông tin lớp học (Thêm theme_color)
app.put('/api/classes/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: "Không có quyền!" });
    
    const { class_name, class_description, teacher_id, start_time, end_time, days_of_week, theme_color } = req.body;
    try {
        await db.query(
            `UPDATE Classes SET 
            class_name=?, class_description=?, teacher_id=?, start_time=?, end_time=?, days_of_week=?, theme_color=?
            WHERE class_id=?`,
            [class_name, class_description, teacher_id, start_time, end_time, days_of_week, theme_color, req.params.id]
        );
        
        // ... (Giữ nguyên đoạn tạo Noti ở dưới) ...

        res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật lớp" });
    }
});

// 2. API Lấy danh sách Sinh viên trong 1 lớp cụ thể
app.get('/api/classes/:id/students', verifyToken, async (req, res) => {
    try {
        const sql = `
            SELECT Users.user_id, Users.first_name, Users.last_name, Users.email 
            FROM Enrollments 
            JOIN Users ON Enrollments.student_id = Users.user_id 
            WHERE Enrollments.class_id = ?
        `;
        const [rows] = await db.query(sql, [req.params.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách sinh viên" });
    }
});

// 3. API Lấy tất cả Sinh viên (để Admin chọn thêm vào lớp)
app.get('/api/students', verifyToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: "Không có quyền!" });
    try {
        const [rows] = await db.query("SELECT user_id, first_name, last_name, email FROM Users WHERE role = 'Student'");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// 4. API Xóa sinh viên khỏi lớp (Kick)
app.delete('/api/classes/:classId/students/:studentId', verifyToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: "Không có quyền!" });
    try {
        await db.query(
            'DELETE FROM Enrollments WHERE class_id = ? AND student_id = ?', 
            [req.params.classId, req.params.studentId]
        );
        res.json({ success: true, message: "Đã xóa sinh viên khỏi lớp!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa sinh viên" });
    }
});

// --- BỔ SUNG QUẢN LÝ BÀI TẬP ---

// 17. Xóa bài tập (Chỉ Teacher/Admin)
app.delete('/api/assignments/:id', verifyToken, async (req, res) => {
    try {
        await db.query('DELETE FROM Assignments WHERE assignment_id = ?', [req.params.id]);
        res.json({ success: true, message: "Đã xóa bài tập!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa bài tập" });
    }
});

// 18. Lấy danh sách nộp bài (Bao gồm cả chưa nộp)
app.get('/api/assignments/:id/submissions', verifyToken, async (req, res) => {
    // Chỉ Teacher hoặc Admin mới được xem list này
    if (req.user.role === 'Student') return res.status(403).json({ message: "Không có quyền!" });

    const assignmentId = req.params.id;

    try {
        // QUERY MỚI:
        // Đã thêm s.submission_description vào danh sách SELECT
        const sql = `
            SELECT 
                u.user_id, 
                u.first_name, 
                u.last_name, 
                u.email,
                s.submission_id,
                s.submitted_at,
                s.submission_file_url,
                s.submission_description, -- <--- QUAN TRỌNG: Lấy thêm cột mô tả
                s.score,
                s.teacher_comment
            FROM Assignments a
            JOIN Enrollments e ON a.class_id = e.class_id
            JOIN Users u ON e.student_id = u.user_id
            LEFT JOIN Submissions s ON s.assignment_id = a.assignment_id AND s.student_id = u.user_id
            WHERE a.assignment_id = ?
        `;

        const [rows] = await db.query(sql, [assignmentId]);
        
        // Format lại dữ liệu trả về
        const data = rows.map(row => ({
            studentId: row.user_id,
            studentName: `${row.last_name} ${row.first_name}`,
            email: row.email,
            isSubmitted: !!row.submission_id, 
            submission_id: row.submission_id,
            submitted_at: row.submitted_at,
            submission_file_url: row.submission_file_url,
            submission_description: row.submission_description, // <--- Trả về cho Frontend
            score: row.score,
            teacher_comment: row.teacher_comment
        }));
        
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi lấy danh sách bài nộp" });
    }
});

// 19. API Cập nhật bài tập (Có cập nhật file)
app.put('/api/assignments/:id', verifyToken, upload.single('file'), async (req, res) => {
    // Chỉ Teacher hoặc Admin mới được sửa
    if (req.user.role === 'Student') return res.status(403).json({ message: "Không có quyền!" });

    const { title, description, end_date, scale } = req.body;
    const assignmentId = req.params.id;
    
    try {
        // Query động: Chỉ update file URL nếu người dùng có upload file mới
        let sql = "UPDATE Assignments SET title=?, description=?, end_date=?, scale=?";
        let params = [title, description, end_date, scale];

        if (req.file) {
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            sql += ", attachment_url=?";
            params.push(fileUrl);
        }

        sql += " WHERE assignment_id=?";
        params.push(assignmentId);

        await db.query(sql, params);
        
        res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (error) {
        console.error("Lỗi update assignment:", error);
        res.status(500).json({ message: "Lỗi cập nhật" });
    }
});


// --- QUẢN LÝ FORUM (THẢO LUẬN) ---

// 21. Lấy danh sách thảo luận của 1 lớp
app.get('/api/classes/:classId/forum', verifyToken, async (req, res) => {
    const { classId } = req.params;
    try {
        // Lấy tất cả bài post của lớp, sắp xếp bài mới nhất lên đầu
        // Kèm thông tin người đăng
        const sql = `
            SELECT 
                fp.*, 
                u.first_name, u.last_name, u.role
            FROM ForumPosts fp
            JOIN Users u ON fp.user_id = u.user_id
            WHERE fp.class_id = ?
            ORDER BY fp.created_at DESC
        `;
        const [rows] = await db.query(sql, [classId]);

        // Xử lý phân cấp (Topic và Reply) ở phía Client hoặc Server
        // Ở đây mình trả về flat list, Client sẽ tự group
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi lấy thảo luận" });
    }
});

// 22. Đăng bài thảo luận / Trả lời (Có upload ảnh)
app.post('/api/forum', verifyToken, upload.single('image'), async (req, res) => {
    const { userId } = req.user;
    const { class_id, content, parent_id } = req.body;

    if (!content && !req.file) {
        return res.status(400).json({ message: "Nội dung không được để trống!" });
    }

    let imageUrl = null;
    if (req.file) {
        imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    try {
        const sql = `
            INSERT INTO ForumPosts (class_id, user_id, parent_id, content, image_url) 
            VALUES (?, ?, ?, ?, ?)
        `;
        // Nếu parent_id gửi lên là "null" (string) hoặc rỗng thì chuyển thành null (db)
        const parent = (parent_id && parent_id !== "null") ? parent_id : null;

        await db.query(sql, [class_id, userId, parent, content, imageUrl]);
        // NOTI: Báo cho tất cả thành viên (trừ người đăng)
        const [members] = await db.query(`
            SELECT student_id as uid FROM Enrollments WHERE class_id = ? 
            UNION 
            SELECT teacher_id as uid FROM Classes WHERE class_id = ?
        `, [class_id, class_id]);

        const [cls] = await db.query('SELECT class_name FROM Classes WHERE class_id = ?', [class_id]);
        
        for (const mem of members) {
            if (mem.uid && mem.uid !== userId) {
                await createNotification(mem.uid, `Thảo luận mới trong lớp ${cls[0].class_name}`, `course-detail?courseId=${class_id}`);
            }
        }

        res.json({ success: true, message: "Đăng bài thành công!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi đăng bài" });
    }
});

// --- QUẢN LÝ HỒ SƠ CÁ NHÂN (PROFILE) ---

// 23. Lấy thông tin hồ sơ chi tiết (Của chính user đang đăng nhập)
app.get('/api/users/profile', verifyToken, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT user_id, username, email, first_name, last_name, phone_number, gender, date_of_birth, role, avatar_url FROM Users WHERE user_id = ?', 
            [req.user.userId]
        );
        
        if (users.length === 0) return res.status(404).json({ message: "User không tồn tại" });
        
        res.json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi lấy thông tin cá nhân" });
    }
});

// 24. Cập nhật hồ sơ (Upload Avatar + Info)
app.put('/api/users/profile', verifyToken, upload.single('avatar'), async (req, res) => {
    const { userId } = req.user;
    const { first_name, last_name, phone_number, gender, date_of_birth } = req.body;

    try {
        // 1. Xây dựng câu query update động
        let sql = `
            UPDATE Users 
            SET first_name = ?, last_name = ?, phone_number = ?, gender = ?, date_of_birth = ?
        `;
        let params = [first_name, last_name, phone_number, gender, date_of_birth || null];

        // 2. Nếu có upload ảnh mới -> Update thêm cột avatar_url
        if (req.file) {
            const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            sql += `, avatar_url = ?`;
            params.push(avatarUrl);
        }

        sql += ` WHERE user_id = ?`;
        params.push(userId);

        await db.query(sql, params);

        // 3. Lấy lại thông tin mới nhất để trả về cho Frontend cập nhật UI
        const [updatedUser] = await db.query('SELECT * FROM Users WHERE user_id = ?', [userId]);

        res.json({ 
            success: true, 
            message: "Cập nhật hồ sơ thành công!", 
            user: updatedUser[0] 
        });

    } catch (error) {
        console.error("Lỗi update profile:", error);
        res.status(500).json({ message: "Lỗi Server khi cập nhật hồ sơ" });
    }
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});