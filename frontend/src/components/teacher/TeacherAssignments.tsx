import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Clock,
  FileText,
  User,
  Download,
  Save,
  CheckCircle,
  Paperclip,
  Upload,
} from "lucide-react";
import api from "../../services/api";
import { User as UserType } from "../../lib/authContext"; // Lưu ý đường dẫn import User

interface TeacherAssignmentsProps {
  user: UserType;
  onNavigate: (page: string, data?: any) => void;
}

export function TeacherAssignments({
  user,
  onNavigate,
}: TeacherAssignmentsProps) {
  // --- States ---
  const [assignments, setAssignments] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);

  // State quản lý việc Sửa/Tạo
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    number | null
  >(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(
    null
  );

  // Form Data
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    dueDate: "",
    maxScore: "10",
  });

  const [attachment, setAttachment] = useState<File | null>(null);
  const [gradeData, setGradeData] = useState({ score: "", feedback: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const coursesRes = await api.get("/classes");
      setMyCourses(coursesRes.data);

      if (coursesRes.data.length > 0) {
        const promises = coursesRes.data.map((c: any) =>
          api
            .get(`/classes/${c.class_id}/assignments`)
            .then((res) =>
              res.data.map((a: any) => ({ ...a, courseName: c.class_name }))
            )
        );
        const results = await Promise.all(promises);
        setAssignments(results.flat());
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      courseId: "",
      title: "",
      description: "",
      dueDate: "",
      maxScore: "10",
    });
    setAttachment(null);
    setIsEditing(false);
    setSelectedAssignmentId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleOpenEdit = (assignment: any) => {
    setIsEditing(true);
    setSelectedAssignmentId(assignment.assignment_id);
    const dateObj = new Date(assignment.end_date);
    dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
    const formattedDate = dateObj.toISOString().slice(0, 16);

    setFormData({
      courseId: assignment.class_id,
      title: assignment.title,
      description: assignment.description || "",
      dueDate: formattedDate,
      maxScore: assignment.scale,
    });
    setAttachment(null);
    setCreateDialogOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!formData.courseId || !formData.title || !formData.dueDate) {
      alert("Vui lòng nhập đủ thông tin!");
      return;
    }
    try {
      const data = new FormData();
      data.append("class_id", formData.courseId);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("scale", formData.maxScore);
      if (!isEditing) {
        data.append(
          "start_date",
          new Date().toISOString().slice(0, 19).replace("T", " ")
        );
      }
      data.append("end_date", formData.dueDate.replace("T", " "));
      if (attachment) {
        data.append("file", attachment);
      }

      if (isEditing && selectedAssignmentId) {
        await api.put(`/assignments/${selectedAssignmentId}`, data);
        alert("Cập nhật bài tập thành công!");
      } else {
        await api.post("/assignments", data);
        alert("Tạo bài tập thành công!");
      }
      setCreateDialogOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      alert("Có lỗi xảy ra khi lưu bài tập!");
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    if (!confirm("Bạn chắc chắn muốn xóa bài tập này?")) return;
    try {
      await api.delete(`/assignments/${id}`);
      setAssignments(assignments.filter((a) => a.assignment_id !== id));
    } catch (error) {
      alert("Lỗi khi xóa!");
    }
  };

  const handleViewSubmissions = async (assignmentId: number) => {
    setSelectedAssignmentId(assignmentId);
    try {
      const res = await api.get(`/assignments/${assignmentId}/submissions`);
      setSubmissions(res.data);
      setGradeDialogOpen(true);
    } catch (error) {
      alert("Lỗi tải bài nộp!");
    }
  };

  const handleOpenGradeModal = (submission: any) => {
    setSelectedSubmission(submission);
    setGradeData({
      score: submission.score || "",
      feedback: submission.teacher_comment || "",
    });
    setSubmissionDialogOpen(true);
  };

  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return;
    try {
      await api.put(`/submissions/${selectedSubmission.submission_id}`, {
        score: gradeData.score,
        teacher_comment: gradeData.feedback,
      });
      alert("Đã lưu điểm!");
      setSubmissionDialogOpen(false);
      if (selectedAssignmentId) {
        const res = await api.get(
          `/assignments/${selectedAssignmentId}/submissions`
        );
        setSubmissions(res.data);
      }
    } catch (error) {
      alert("Lỗi chấm điểm!");
    }
  };

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý bài tập</h1>
          <p className="text-gray-500">Tạo, chỉnh sửa và chấm điểm bài tập</p>
        </div>
        {/* NÚT TẠO BÀI TẬP Ở HEADER */}
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-lg font-medium shadow-sm transition"
        >
          <Plus className="w-5 h-5" />
          Tạo bài tập mới
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          placeholder="Tìm kiếm bài tập..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">
            Danh sách ({filteredAssignments.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : filteredAssignments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Chưa có bài tập nào.
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <div
                key={assignment.assignment_id}
                className="p-4 hover:bg-gray-50 transition flex items-center justify-between group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-gray-900 text-lg">
                      {assignment.title}
                    </h4>
                    <span className="text-xs bg-white text-black border border-gray-300 px-2 py-0.5 rounded">
                      {assignment.courseName}
                    </span>
                    {assignment.attachment_url && (
                      <Paperclip className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Hạn:{" "}
                      {new Date(assignment.end_date).toLocaleDateString(
                        "vi-VN"
                      )}{" "}
                      {new Date(assignment.end_date).toLocaleTimeString(
                        "vi-VN",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </span>
                    <span>Thang điểm: {assignment.scale}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleViewSubmissions(assignment.assignment_id)
                    }
                    className="flex items-center gap-1 px-3 py-1.5 bg-white text-black border border-gray-300 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" /> Chấm bài
                  </button>
                  <button
                    onClick={() => handleOpenEdit(assignment)}
                    className="p-2 text-black bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteAssignment(assignment.assignment_id)
                    }
                    className="p-2 text-black bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- CREATE / EDIT DIALOG --- */}
      {createDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-0 overflow-hidden animate-in zoom-in duration-200">
            {/* HEADER MÀU XANH (DÙNG BG-PRIMARY) */}
            <div className="bg-white text-gray-900 px-6 py-4 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-xl font-bold">
                {isEditing ? "Cập nhật bài tập" : "Thêm bài tập mới"}
              </h2>
              <button
                onClick={() => setCreateDialogOpen(false)}
                className="text-gray-600 hover:text-black transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-white">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Lớp học {isEditing && "(Không thể đổi)"}
                </label>
                <select
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 text-gray-900"
                  value={formData.courseId}
                  onChange={(e) =>
                    setFormData({ ...formData, courseId: e.target.value })
                  }
                  disabled={isEditing}
                >
                  <option value="">-- Chọn lớp --</option>
                  {myCourses.map((c: any) => (
                    <option key={c.class_id} value={c.class_id}>
                      {c.class_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tiêu đề bài tập *
                </label>
                <input
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="VD: Bài tập tuần 1..."
                  autoFocus
                />
              </div>

              {/* Ô CHỌN FILE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Đính kèm file đề bài (Tùy chọn)
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 font-medium text-sm flex items-center gap-2 transition">
                    <Upload className="w-4 h-4" /> Chọn file
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        setAttachment(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                  <span className="text-sm text-gray-500 truncate max-w-[200px]">
                    {attachment ? attachment.name : "Chưa chọn file"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Hạn nộp
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Thang điểm
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    value={formData.maxScore}
                    onChange={(e) =>
                      setFormData({ ...formData, maxScore: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mô tả / Đề bài
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Nhập nội dung đề bài tại đây..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setCreateDialogOpen(false)}
                className="px-5 py-2.5 bg-white text-black border border-gray-300 hover:bg-gray-100 rounded-lg font-medium transition"
              >
                Hủy
              </button>
              {/* NÚT LƯU - DÙNG BG-PRIMARY */}
              <button
                onClick={handleSaveAssignment}
                className="px-6 py-2.5 bg-primary text-primary-foreground hover:opacity-90 font-bold shadow-md transition rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isEditing ? "Lưu thay đổi" : "Tạo bài tập"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- LIST SUBMISSIONS MODAL --- */}
      {gradeDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-5xl shadow-2xl h-[80vh] flex flex-col animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-white border-gray-300 rounded-t-xl">
              <h2 className="text-xl font-bold text-black">
                Danh sách bài nộp
              </h2>
              <button
                onClick={() => setGradeDialogOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-0">
              <table className="w-full text-left">
                <thead className="bg-white border-b sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="py-4 px-6 font-medium text-gray-500">
                      Sinh viên
                    </th>
                    <th className="py-4 px-6 font-medium text-gray-500">
                      Thời gian nộp
                    </th>
                    <th className="py-4 px-6 font-medium text-gray-500">
                      File
                    </th>
                    <th className="py-4 px-6 font-medium text-gray-500">
                      Trạng thái
                    </th>
                    <th className="py-4 px-6 font-medium text-gray-500 text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {submissions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-12 text-center text-gray-500"
                      >
                        Chưa có bài nộp nào.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => (
                      <tr
                        key={sub.submission_id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">
                            {sub.studentName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {sub.email}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {new Date(sub.submitted_at).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-4 px-6">
                          {sub.submission_file_url ? (
                            <a
                              href={sub.submission_file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
                            >
                              <FileText className="w-4 h-4" /> Xem
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">Trống</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {sub.score !== null ? (
                            <span className="bg-white text-black border border-gray-300 px-2 py-1 rounded text-xs font-bold">
                              {sub.score} điểm
                            </span>
                          ) : (
                            <span className="bg-white text-black border border-gray-300 px-2 py-1 rounded text-xs">
                              Chưa chấm
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleOpenGradeModal(sub)}
                            className="px-4 py-2 bg-white text-black border border-gray-300 hover:bg-gray-100 rounded-lg text-sm font-medium transition"
                          >
                            {sub.score !== null ? "Sửa điểm" : "Chấm điểm"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- GRADING MODAL --- */}
      {submissionDialogOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-auto animate-in zoom-in duration-200">
            <div className="flex-1 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-5 h-5" /> Bài làm của sinh viên
              </h3>
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    Sinh viên
                  </label>
                  <div className="text-lg font-medium text-gray-900">
                    {selectedSubmission.studentName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedSubmission.email}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    Mô tả / Lời nhắn
                  </label>
                  <p className="mt-1 text-gray-700 italic">
                    "
                    {selectedSubmission.submission_description ||
                      "Không có lời nhắn"}
                    "
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    Tập tin đính kèm
                  </label>
                  <div className="mt-2">
                    {selectedSubmission.submission_file_url ? (
                      <a
                        href={selectedSubmission.submission_file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 bg-white text-black border border-gray-300 hover:bg-gray-100 transition rounded-lg font-medium"
                      >
                        <FileText className="w-5 h-5" /> Tải xuống file bài làm{" "}
                        <Download className="w-4 h-4 ml-auto" />
                      </a>
                    ) : (
                      <div className="text-gray-400 italic text-sm">
                        Không có file đính kèm
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">
                  Đánh giá & Cho điểm
                </h3>
                <button
                  onClick={() => setSubmissionDialogOpen(false)}
                  className="text-black hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-5 flex-1">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Điểm số
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 text-lg font-bold"
                      value={gradeData.score}
                      onChange={(e) =>
                        setGradeData({ ...gradeData, score: e.target.value })
                      }
                      placeholder="0 - 10"
                      autoFocus
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      điểm
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nhận xét / Phản hồi
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 leading-relaxed"
                    value={gradeData.feedback}
                    onChange={(e) =>
                      setGradeData({ ...gradeData, feedback: e.target.value })
                    }
                    placeholder="Nhập nhận xét chi tiết..."
                  />
                </div>
              </div>
              <div className="pt-6 border-t mt-auto flex justify-end gap-3">
                <button
                  onClick={() => setSubmissionDialogOpen(false)}
                  className="px-5 py-2.5 bg-white text-black border border-gray-300 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Đóng
                </button>
                {/* NÚT LƯU KẾT QUẢ - DÙNG BG-PRIMARY */}
                <button
                  onClick={handleSubmitGrade}
                  className="px-6 py-2.5 bg-primary text-primary-foreground hover:opacity-90 font-bold shadow-md transition rounded-lg"
                >
                  Lưu kết quả
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
