// "use client"

// import { useState } from "react"
// import axios from "axios"
// import { motion, AnimatePresence } from "framer-motion"
// import { IoAddSharp } from "react-icons/io5"
// import { IoIosCloseCircle } from "react-icons/io"
// import { MdDone } from "react-icons/md"
// import FailedPopup from "../SmallerComponents/FailedPopup.jsx"

// export const AddPopupStudent = ({ isOpen, onClose }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     age: "",
//     gender: "",
//     parentName: "",
//     parentContact: "",
//     email: "",
//     currentAddress: "",
//     class: "",
//   })

//   const [errors, setErrors] = useState({
//     parentContact: "",
//   })

//   const [popup, setPopup] = useState({
//     message: "",
//     type: "error", // "success" | "warning" | "error"
//   })

//   const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]

//   const validateContact = (value) => {
//     const onlyDigits = value.replace(/\D/g, "")
//     if (onlyDigits.length !== 10) return "Contact number must be exactly 10 digits."
//     return ""
//   }

//   const closePopup = () => setPopup({ message: "", type: "error" })

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     const contactError = validateContact(formData.parentContact)
//     if (contactError) {
//       setErrors({ parentContact: contactError })
//       return
//     }

//     // Split full name -> firstName + lastName
//     const parts = formData.name.trim().split(/\s+/)
//     const firstName = parts[0] || ""
//     const lastName = parts.slice(1).join(" ") || "."

//     try {
//       // IMPORTANT: backend route is /students/add (based on your index.js)
//       const res = await axios.post("http://localhost:7000/students/add", {
//         firstName,
//         lastName,
//         parentName: formData.parentName,
//         parentPhone: formData.parentContact,
//         email: formData.email,
//         Address: formData.currentAddress,
//       })

//       setPopup({
//         message: res.data?.message || "Student added successfully",
//         type: "success",
//       })

//       onClose()
//     } catch (err) {
//       // HTTP error (backend responded)
//       if (err?.response) {
//         const status = err.response.status
//         const msg = err.response.data?.message || "Request failed"

//         // If backend sent field errors, show first one
//         const backendErrors = err.response.data?.errors
//         const firstFieldError =
//           backendErrors && Object.keys(backendErrors).length
//             ? backendErrors[Object.keys(backendErrors)[0]]
//             : null

//         if (status === 409) {
//           setPopup({ message: msg, type: "warning" })
//         } else if (status === 400) {
//           setPopup({
//             message: firstFieldError ? `${msg}: ${firstFieldError}` : msg,
//             type: "error",
//           })
//         } else {
//           setPopup({ message: msg, type: "error" })
//         }
//         return
//       }

//       // Network / CORS / server down (no response)
//       setPopup({
//         message: "Network error: Backend not reachable (check server + URL + CORS).",
//         type: "error",
//       })
//     }
//   }

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))

//     if (name === "parentContact") {
//       setErrors((prev) => ({ ...prev, parentContact: validateContact(value) }))
//     }
//   }

//   return (
//     <>
//       <FailedPopup message={popup.message} type={popup.type} onClose={closePopup} />

//       <AnimatePresence>
//         {isOpen && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={onClose}
//               className="fixed inset-0 bg-black/50 z-40"
//             />

//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               transition={{ duration: 0.2 }}
//               className="fixed inset-0 z-50 flex items-center justify-center p-4"
//               onClick={onClose}
//             >
//               <div
//                 onClick={(e) => e.stopPropagation()}
//                 className="bg-white rounded-xl shadow-2xl w-full max-w-4xl"
//               >
//                 <div className="flex items-center justify-between p-6 border-b border-gray-200">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-[#22c55e] rounded-lg">
//                       <IoAddSharp size={24} className="text-white" />
//                     </div>
//                     <h2 className="text-2xl font-bold text-gray-900">Add Student</h2>
//                   </div>
//                   <button
//                     onClick={onClose}
//                     className="text-gray-400 hover:text-gray-600 transition-colors"
//                   >
//                     <IoIosCloseCircle size={32} />
//                   </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="p-6">
//                   <div className="grid grid-cols-2 gap-6 mb-6">
//                     <div>
//                       <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
//                         Name
//                       </label>
//                       <input
//                         type="text"
//                         id="name"
//                         name="name"
//                         value={formData.name}
//                         onChange={handleChange}
//                         required
//                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
//                         placeholder="Enter student name"
//                       />
//                     </div>

//                     <div>
//                       <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
//                         Age
//                       </label>
//                       <input
//                         type="number"
//                         id="age"
//                         name="age"
//                         value={formData.age}
//                         onChange={handleChange}
//                         required
//                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
//                         placeholder="Enter age"
//                       />
//                     </div>

//                     <div>
//                       <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
//                         Gender
//                       </label>
//                       <select
//                         id="gender"
//                         name="gender"
//                         value={formData.gender}
//                         onChange={handleChange}
//                         required
//                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
//                       >
//                         <option value="">Select gender</option>
//                         <option value="male">Male</option>
//                         <option value="female">Female</option>
//                         <option value="other">Other</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label htmlFor="class" className="block text-sm font-semibold text-gray-700 mb-2">
//                         Class
//                       </label>
//                       <select
//                         id="class"
//                         name="class"
//                         value={formData.class}
//                         onChange={handleChange}
//                         required
//                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
//                       >
//                         <option value="">Select class</option>
//                         {classes.map((cls) => (
//                           <option key={cls} value={cls}>
//                             {cls}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label
//                         htmlFor="parentName"
//                         className="block text-sm font-semibold text-gray-700 mb-2"
//                       >
//                         Parent Name
//                       </label>
//                       <input
//                         type="text"
//                         id="parentName"
//                         name="parentName"
//                         value={formData.parentName}
//                         onChange={handleChange}
//                         required
//                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
//                         placeholder="Enter parent name"
//                       />
//                     </div>

//                     <div>
//                       <label
//                         htmlFor="parentContact"
//                         className="block text-sm font-semibold text-gray-700 mb-2"
//                       >
//                         Parent Contact
//                       </label>
//                       <input
//                         type="tel"
//                         id="parentContact"
//                         name="parentContact"
//                         value={formData.parentContact}
//                         onChange={handleChange}
//                         required
//                         maxLength={10}
//                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
//                         placeholder="Enter 10 digit number"
//                       />
//                       {errors.parentContact && (
//                         <p className="mt-1 text-sm text-red-500">{errors.parentContact}</p>
//                       )}
//                     </div>

//                     <div className="col-span-2">
//                       <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
//                         Email
//                       </label>
//                       <input
//                         type="email"
//                         id="email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleChange}
//                         required
//                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
//                         placeholder="Enter email address"
//                       />
//                     </div>

//                     <div className="col-span-2">
//                       <label
//                         htmlFor="currentAddress"
//                         className="block text-sm font-semibold text-gray-700 mb-2"
//                       >
//                         Current Address
//                       </label>
//                       <textarea
//                         id="currentAddress"
//                         name="currentAddress"
//                         value={formData.currentAddress}
//                         onChange={handleChange}
//                         required
//                         rows={2}
//                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent resize-none"
//                         placeholder="Enter current address"
//                       />
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
//                     <button
//                       type="button"
//                       onClick={onClose}
//                       className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="flex items-center gap-2 px-6 py-2.5 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors font-medium"
//                     >
//                       <MdDone size={20} />
//                       Submit
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </>
//   )
// }
