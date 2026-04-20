"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { PiStudent } from "react-icons/pi";
import { Search, Trash2 } from "lucide-react";
import { IoAddSharp } from "react-icons/io5";
import { AddPopupStudent } from "../../Components/Admin/AddPopupStudent.jsx";

const API_BASE = "http://localhost:7000";

const StudentRecord = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const itemsPerPage = 6;

  // NEW: from DB
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/students`);
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // OPTIONAL: auto refresh list after closing popup (you can also do after successful add)
  useEffect(() => {
    if (!isPopupOpen) fetchStudents();
  }, [isPopupOpen]);

  const info = useMemo(
    () => ({
      title: "Total Students",
      number: students.length,
      studentlist: students.map((s) => ({
        // map DB -> UI fields
        student_id: s.studentId, // "STU-..."
        studentName: `${s.firstName || ""} ${s.lastName || ""}`.trim(),
        class: s.studentClass != null ? String(s.studentClass) : "-", // Number in DB
        section: s.sectionId ? String(s.sectionId) : "-", // later you can populate to show name
        flag: s.flag || "green",
        _id: s._id, // for delete
      })),
    }),
    [students],
  );

  // Filter
  const filteredStudents = info.studentlist.filter((student) => {
    const q = searchQuery.toLowerCase();
    return (
      String(student.student_id || "").toLowerCase().includes(q) ||
      String(student.studentName || "").toLowerCase().includes(q) ||
      String(student.class || "").toLowerCase().includes(q) ||
      String(student.section || "").toLowerCase().includes(q)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const getFlagColor = (flag) => {
    switch (flag) {
      case "red":
        return "bg-red-500 shadow-lg shadow-red-500/20";
      case "amber":
      case "yellow":
        return "bg-amber-500 shadow-lg shadow-amber-500/20";
      case "green":
        return "bg-emerald-500 shadow-lg shadow-emerald-500/20";
      default:
        return "bg-gray-400";
    }
  };

  const handleDelete = async (mongoId) => {
    try {
      await axios.delete(`${API_BASE}/students/${mongoId}`);
      fetchStudents();
    } catch (e) {
      // optional: show popup/toast
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 w-fit">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <PiStudent size={40} color="#22c55e" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">{info.title}</p>
              <h2 className="text-3xl font-bold text-gray-900">{info.number}</h2>
            </div>
          </div>
        </div>

        {/* Student List Card */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Student List</h2>
              <button
                onClick={() => setIsPopupOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors font-medium"
              >
                <IoAddSharp size={20} />
                Add
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by ID, name, class, or section"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {loading && <p className="mt-3 text-sm text-gray-500">Loading...</p>}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Section
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Flag
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{student.student_id}</td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                          {(student.studentName || "?").charAt(0)}
                        </div>
                        <span className="text-sm text-gray-900 font-medium">
                          {student.studentName}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900">{student.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.section}</td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div className={`w-5 h-5 rounded ${getFlagColor(student.flag)}`} />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && currentStudents.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-sm text-gray-500" colSpan={6}>
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredStudents.length === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} entries
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === page
                      ? "bg-[#22c55e] text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Component */}
      <AddPopupStudent isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </div>
  );
};

export default StudentRecord;
