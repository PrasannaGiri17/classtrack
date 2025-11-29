"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IoAddSharp } from "react-icons/io5"
import { IoIosCloseCircle } from "react-icons/io"
import { MdDone } from "react-icons/md"

const AddPopupTeacher = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phoneNo: "",
    subject: "",
    secondarySubject: "",
    class: [],
    currentAddress: "",
  })

  const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Add your submission logic here
    onClose()
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleClassChange = (selectedClass) => {
    if (formData.class.includes(selectedClass)) {
      // Remove if already selected
      setFormData({
        ...formData,
        class: formData.class.filter((c) => c !== selectedClass),
      })
    } else if (formData.class.length < 3) {
      // Add if less than 3 selected
      setFormData({
        ...formData,
        class: [...formData.class, selectedClass],
      })
    }
  }

  return (
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
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-4xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#22c55e] rounded-lg">
                    <IoAddSharp size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Add Teacher</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
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
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
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
                    <label htmlFor="secondarySubject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Secondary Subject
                    </label>
                    <input
                      type="text"
                      id="secondarySubject"
                      name="secondarySubject"
                      value={formData.secondarySubject}
                      onChange={handleChange}
                      required
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
                      {classes.map((cls) => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => handleClassChange(cls)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            formData.class.includes(cls)
                              ? "bg-[#22c55e] text-white border-[#22c55e]"
                              : "bg-white text-gray-700 border-gray-300 hover:border-[#22c55e]"
                          } ${formData.class.length >= 3 && !formData.class.includes(cls) ? "opacity-50 cursor-not-allowed" : ""}`}
                          disabled={formData.class.length >= 3 && !formData.class.includes(cls)}
                        >
                          {cls}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Selected: {formData.class.join(", ") || "None"}</p>
                  </div>

                  {/* Current Address - spans 2 columns */}
                  <div className="col-span-2">
                    <label htmlFor="currentAddress" className="block text-sm font-semibold text-gray-700 mb-2">
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
  )
}

export default AddPopupTeacher