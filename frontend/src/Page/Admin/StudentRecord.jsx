"use client"

import { useState } from "react"
import { PiStudent } from "react-icons/pi"
import { Search, Trash2 } from "lucide-react"
import { IoAddSharp } from "react-icons/io5"
import  {AddPopupStudent} from "../../Components/Admin/AddPopupStudent.jsx"

const StudentRecord = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const itemsPerPage = 6

  const info = {
    title: "Total Students",
    number: 1200,
    studentlist: [
      { student_id: "ST001", studentName: "John Smith", class: "10th", section: "A", flag: "green" },
      { student_id: "ST002", studentName: "Emma Johnson", class: "9th", section: "B", flag: "green" },
      { student_id: "ST003", studentName: "Michael Brown", class: "10th", section: "A", flag: "red" },
      { student_id: "ST004", studentName: "Sarah Davis", class: "11th", section: "C", flag: "green" },
      { student_id: "ST005", studentName: "Robert Wilson", class: "9th", section: "B", flag: "yellow" },
      { student_id: "ST006", studentName: "Lisa Anderson", class: "10th", section: "A", flag: "green" },
      { student_id: "ST007", studentName: "David Martinez", class: "11th", section: "C", flag: "red" },
      { student_id: "ST008", studentName: "Emily Taylor", class: "9th", section: "B", flag: "yellow" },
    ],
  }

  // Filter students based on search query
  const filteredStudents = info.studentlist.filter(
    (student) =>
      student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.section.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentStudents = filteredStudents.slice(startIndex, endIndex)

  const getFlagColor = (flag) => {
    switch (flag) {
      case "red":
        return "bg-red-500"
      case "yellow":
        return "bg-yellow-500"
      case "green":
        return "bg-[#22c55e]"
      default:
        return "bg-gray-500"
    }
  }

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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by ID, name, class, or section"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Section</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Flag</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentStudents.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{student.student_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                          {student.studentName.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-900 font-medium">{student.studentName}</span>
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
                        <button className="text-red-500 hover:text-red-700 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length}{" "}
              entries
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
                    currentPage === page ? "bg-[#22c55e] text-white" : "border border-gray-300 hover:bg-gray-50"
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
  )
}

export default StudentRecord