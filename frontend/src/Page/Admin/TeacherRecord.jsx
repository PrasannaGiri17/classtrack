"use client"

import { useState } from "react"
import { PiChalkboardTeacher } from "react-icons/pi"
import { FaTrashAlt } from "react-icons/fa"
import { IoSearchOutline, IoAddSharp } from "react-icons/io5"
import  AddPopupTeacher from "../../Components/Admin/AddPopupTeacher.jsx"

const TeacherRecord = () => {
  const info = {
    title: "Total Teachers",
    number: 40,
    teachers: [
      {
        teacher_id: "T001",
        teacherName: "John Smith",
        class: "10,9,8",
        subject: "Science",
        secondarySubject: "English",
      },
      {
        teacher_id: "T002",
        teacherName: "Emma Johnson",
        class: "12,11",
        subject: "Mathematics",
        secondarySubject: "Physics",
      },
      {
        teacher_id: "T003",
        teacherName: "Michael Brown",
        class: "9,8,7",
        subject: "English",
        secondarySubject: "History",
      },
      {
        teacher_id: "T004",
        teacherName: "Sarah Davis",
        class: "11,10",
        subject: "Physics",
        secondarySubject: "Chemistry",
      },
      {
        teacher_id: "T005",
        teacherName: "Robert Wilson",
        class: "12",
        subject: "Chemistry",
        secondarySubject: "Biology",
      },
      {
        teacher_id: "T006",
        teacherName: "Lisa Anderson",
        class: "10,9",
        subject: "History",
        secondarySubject: "Geography",
      },
      {
        teacher_id: "T007",
        teacherName: "David Martinez",
        class: "8,7",
        subject: "Biology",
        secondarySubject: "Science",
      },
      {
        teacher_id: "T008",
        teacherName: "Jennifer Garcia",
        class: "11,10,9",
        subject: "Geography",
        secondarySubject: "History",
      },
      {
        teacher_id: "T009",
        teacherName: "James Rodriguez",
        class: "12,11",
        subject: "Computer Science",
        secondarySubject: "Mathematics",
      },
      {
        teacher_id: "T010",
        teacherName: "Maria Lopez",
        class: "9,8",
        subject: "Art",
        secondarySubject: "Music",
      },
      {
        teacher_id: "T011",
        teacherName: "William Taylor",
        class: "10",
        subject: "Physical Education",
        secondarySubject: "Health",
      },
      {
        teacher_id: "T012",
        teacherName: "Patricia Thomas",
        class: "11,10",
        subject: "Music",
        secondarySubject: "Art",
      },
    ],
  }

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const filteredTeachers = info.teachers.filter(
    (teacher) =>
      teacher.teacher_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.secondarySubject.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTeachers = filteredTeachers.slice(startIndex, endIndex)

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 inline-block">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#22c55e]/10 rounded-lg">
              <PiChalkboardTeacher size={50} color="#22c55e" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">{info.title}</p>
              <h1 className="text-4xl font-bold text-gray-900">{info.number}</h1>
            </div>
          </div>
        </div>

        {/* Teacher List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            {/* Flex container with Add button */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Teacher List</h2>
              <button
                onClick={() => setIsPopupOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors font-medium"
              >
                <IoAddSharp size={20} />
                Add
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by ID, name, class, or subject"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Teacher ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Teacher Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Secondary Subject</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentTeachers.map((teacher) => (
                  <tr key={teacher.teacher_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{teacher.teacher_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center text-white text-sm font-semibold">
                          {getInitials(teacher.teacherName)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{teacher.teacherName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{teacher.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{teacher.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{teacher.secondarySubject}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button className="text-red-500 hover:text-red-700 transition-colors">
                          <FaTrashAlt size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredTeachers.length)} of {filteredTeachers.length}{" "}
              entries
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    currentPage === page ? "bg-[#22c55e] text-white" : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddPopupTeacher isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </div>
  )
}

export default TeacherRecord