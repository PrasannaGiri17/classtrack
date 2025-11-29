"use client"

import { useState } from "react"

const Gender = () => {
  const studentInfo = {
    classes: [
      { class: "9", boys: 320, girls: 280, total: 600 },
      { class: "10", boys: 650, girls: 550, total: 1200 },
      { class: "11", boys: 280, girls: 320, total: 600 },
      { class: "12", boys: 300, girls: 300, total: 600 },
    ],
  }

  return (
    <div className="p-4">
      <StudentDistribution info={studentInfo} />
    </div>
  )
}

const StudentDistribution = ({ info }) => {
  const { classes } = info
  const [selectedClass, setSelectedClass] = useState(classes[0].class)

  // Find the selected class data
  const classData = classes.find((cls) => cls.class === selectedClass)
  const { boys, girls, total } = classData

  // Calculate percentages
  const boysPercentage = Math.round((boys / total) * 100)
  const girlsPercentage = Math.round((girls / total) * 100)

  // SVG circle calculations
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const boysStrokeDashoffset = circumference - (boysPercentage / 100) * circumference

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-[344px] h-[340px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Gender Distribution</h3>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="text-sm text-gray-700 bg-white border border-gray-300 rounded px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23666%27 strokeWidth=%272%27 strokeLinecap=%27round%27 strokeLinejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
        >
          {classes?.map((cls) => (
            <option key={cls.class} value={cls.class}>
              Class {cls.class}
            </option>
          ))}
        </select>
      </div>

      {/* Donut Chart with external percentages */}
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-48 h-48 transform -rotate-90">
            {/* Background circle */}
            <circle cx="96" cy="96" r={radius} stroke="#e5e7eb" strokeWidth="20" fill="none" />
            {/* Girls segment (orange) */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="#fb923c"
              strokeWidth="20"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={0}
              strokeLinecap="round"
            />
            {/* Boys segment (purple) */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="#7c3aed"
              strokeWidth="20"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={boysStrokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Left side - Boys percentage */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{boysPercentage}%</div>
              <div className="text-xs text-gray-500">Boys</div>
            </div>
          </div>

          {/* Right side - Girls percentage */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{girlsPercentage}%</div>
              <div className="text-xs text-gray-500">Girls</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-600"></div>
          <span className="text-sm font-medium text-gray-700">Boys</span>
          <span className="text-lg font-bold text-gray-900">{boys}</span>
          <span className="text-xs text-gray-500">students</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-400"></div>
          <span className="text-sm font-medium text-gray-700">Girls</span>
          <span className="text-lg font-bold text-gray-900">{girls}</span>
          <span className="text-xs text-gray-500">students</span>
        </div>
      </div>
    </div>
  )
}

export default Gender
