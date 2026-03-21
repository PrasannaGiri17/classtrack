"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { IoAddSharp, IoChevronDown } from "react-icons/io5"
import { IoIosCloseCircle } from "react-icons/io"
import { MdDone } from "react-icons/md"
import FailedPopup from "../SmallerComponents/FailedPopup.jsx"
import gradeService from "../../Api/gradeService"

const AddPopupTeacher = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phoneNo: "",
    subject: "",
    secondarySubject: "",
    class: [],
    email: "",
    currentAddress: "",
  })

  const [popup, setPopup] = useState({
    message: "",
    type: "error",
  })

  const [grades, setGrades] = useState([])
  
  useEffect(() => {
    const fetchGrades = async () => {
      if (isOpen) {
        try {
          // Priority to adminSchoolId for admin context
          const schoolId = localStorage.getItem("adminSchoolId") || localStorage.getItem("schoolId") || 1;
          const data = await gradeService.getGrades(schoolId);
          if (Array.isArray(data)) {
            // Sort grades numerically
            const sortedGrades = data.sort((a, b) => a.gradeNumber - b.gradeNumber);
            setGrades(sortedGrades);
          }
        } catch (err) {
          console.error("Failed to fetch grades:", err);
        }
      }
    };
    fetchGrades();
  }, [isOpen]);

  const closePopup = () => setPopup({ message: "", type: "error" })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Split full name -> firstName + lastName
    const parts = formData.name.trim().split(/\s+/)
    const firstName = parts[0] || ""
    const lastName = parts.slice(1).join(" ") || "."

    try {
      // IMPORTANT: backend route is /teachers/add (based on your index.js)
      const res = await axios.post("http://localhost:7000/teachers/add", {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phoneNo,
        gender: formData.gender, // must be "male" | "female" | "other"
        qualification: null,     // you can map age/qualification differently if needed
        currentAddress: formData.currentAddress,

        // if your backend expects subject as ObjectId, send ObjectId instead of text
        // for now, sending null to match TeacherModel (ObjectId fields)
        primarySubject: null,
        secondarySubject: null,

        // Your TeacherModel uses assignedGrades/assignedSections as ObjectIds.
        // Your UI uses class numbers => you should later map class -> Grade _id.
        // For now send empty arrays to avoid validation issues.
        assignedGrades: [],
        assignedSections: [],
      })

      setPopup({
        message: res.data?.message || "Teacher added successfully",
        type: "success",
      })

      onClose()
    } catch (err) {
      if (err?.response) {
        const status = err.response.status
        const msg = err.response.data?.message || "Request failed"

        const backendErrors = err.response.data?.errors
        const firstFieldError =
          backendErrors && Object.keys(backendErrors).length
            ? backendErrors[Object.keys(backendErrors)[0]]
            : null

        if (status === 409) {
          setPopup({ message: msg, type: "warning" })
        } else if (status === 400) {
          setPopup({
            message: firstFieldError ? `${msg}: ${firstFieldError}` : msg,
            type: "error",
          })
        } else {
          setPopup({ message: msg, type: "error" })
        }
        return
      }

      setPopup({
        message: "Network error: Backend not reachable (check server + URL + CORS).",
        type: "error",
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleClassChange = (selectedClass) => {
    if (formData.class.includes(selectedClass)) {
      setFormData({
        ...formData,
        class: formData.class.filter((c) => c !== selectedClass),
      })
    } else if (formData.class.length < 3) {
      setFormData({
        ...formData,
        class: [...formData.class, selectedClass],
      })
    }
  }

  return (
    <>
      <FailedPopup message={popup.message} type={popup.type} onClose={closePopup} />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={onClose}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl border border-gray-200 dark:border-slate-800"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#22c55e] rounded-lg">
                      <IoAddSharp size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Teacher</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <IoIosCloseCircle size={32} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                        placeholder="Enter teacher name"
                      />
                    </div>

                    {/* Age */}
                    <div>
                      <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                        placeholder="Enter age"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                        Gender
                      </label>
                      <div className="relative group">
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent appearance-none pr-10 text-gray-900 dark:text-white cursor-pointer dark:[color-scheme:dark]"
                        >
                          <option value="" className="bg-white dark:bg-slate-900">Select gender</option>
                          <option value="male" className="bg-white dark:bg-slate-900">Male</option>
                          <option value="female" className="bg-white dark:bg-slate-900">Female</option>
                          <option value="other" className="bg-white dark:bg-slate-900">Other</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#22c55e] transition-colors">
                          <IoChevronDown size={18} />
                        </div>
                      </div>
                    </div>

                    {/* Phone No */}
                    <div>
                      <label htmlFor="phoneNo" className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone No
                      </label>
                      <input
                        type="tel"
                        id="phoneNo"
                        name="phoneNo"
                        value={formData.phoneNo}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                        placeholder="Enter subject"
                      />
                    </div>

                    {/* Secondary Subject */}
                    <div>
                      <label
                        htmlFor="secondarySubject"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Secondary Subject <span className="text-xs font-normal opacity-50">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        id="secondarySubject"
                        name="secondarySubject"
                        value={formData.secondarySubject}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                        placeholder="Enter secondary subject"
                      />
                    </div>

                    {/* Class - Multi-select with max 3 */}
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Class (Select up to 3 classes)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {grades.map((grade) => {
                          const clsNum = grade.gradeNumber.toString();
                          return (
                            <button
                              key={grade._id || clsNum}
                              type="button"
                              onClick={() => handleClassChange(clsNum)}
                              className={`px-4 py-2 rounded-lg border-2 transition-all ${formData.class.includes(clsNum)
                                ? "bg-[#22c55e] text-white border-[#22c55e]"
                                : "bg-white text-gray-700 border-gray-300 hover:border-[#22c55e]"
                                } ${formData.class.length >= 3 && !formData.class.includes(clsNum)
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                                }`}
                              disabled={formData.class.length >= 3 && !formData.class.includes(clsNum)}
                            >
                              {clsNum}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Selected: {formData.class.join(", ") || "None"}
                      </p>
                    </div>

                    {/* Email Address */}
                    <div className="col-span-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>

                    {/* Current Address */}
                    <div className="col-span-2">
                      <label
                        htmlFor="currentAddress"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Current Address
                      </label>
                      <textarea
                        id="currentAddress"
                        name="currentAddress"
                        value={formData.currentAddress}
                        onChange={handleChange}
                        required
                        rows={2}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent resize-none"
                        placeholder="Enter current address"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors font-medium"
                    >
                      <MdDone size={20} />
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default AddPopupTeacher
