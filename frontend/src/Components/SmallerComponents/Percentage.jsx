import React, { useState } from 'react'

const Percentage = () => {
  const performanceData = {
    terms: [
      {
        term: "first",
        classes: [
          {
            class: "9",
            sections: [
              { section: "A", percentage: 78, previousChange: "+3%" },
              { section: "B", percentage: 82, previousChange: "+5%" },
              { section: "C", percentage: 75, previousChange: "+2%" },
              { section: "D", percentage: 80, previousChange: "+4%" }
            ]
          },
          {
            class: "10",
            sections: [
              { section: "A", percentage: 85, previousChange: "+5%" },
              { section: "B", percentage: 88, previousChange: "+6%" },
              { section: "C", percentage: 82, previousChange: "+4%" },
              { section: "D", percentage: 79, previousChange: "+3%" }
            ]
          },
          {
            class: "11",
            sections: [
              { section: "A", percentage: 92, previousChange: "+7%" },
              { section: "B", percentage: 89, previousChange: "+5%" },
              { section: "C", percentage: 85, previousChange: "+4%" },
              { section: "D", percentage: 87, previousChange: "+6%" }
            ]
          },
          {
            class: "12",
            sections: [
              { section: "A", percentage: 95, previousChange: "+8%" },
              { section: "B", percentage: 91, previousChange: "+6%" },
              { section: "C", percentage: 88, previousChange: "+5%" },
              { section: "D", percentage: 93, previousChange: "+7%" }
            ]
          }
        ]
      },
      {
        term: "second",
        classes: [
          {
            class: "9",
            sections: [
              { section: "A", percentage: 81, previousChange: "+3%" },
              { section: "B", percentage: 85, previousChange: "+5%" },
              { section: "C", percentage: 78, previousChange: "+2%" },
              { section: "D", percentage: 83, previousChange: "+4%" }
            ]
          },
          {
            class: "10",
            sections: [
              { section: "A", percentage: 87, previousChange: "+5%" },
              { section: "B", percentage: 90, previousChange: "+6%" },
              { section: "C", percentage: 84, previousChange: "+4%" },
              { section: "D", percentage: 81, previousChange: "+3%" }
            ]
          },
          {
            class: "11",
            sections: [
              { section: "A", percentage: 94, previousChange: "+7%" },
              { section: "B", percentage: 91, previousChange: "+5%" },
              { section: "C", percentage: 87, previousChange: "+4%" },
              { section: "D", percentage: 89, previousChange: "+6%" }
            ]
          },
          {
            class: "12",
            sections: [
              { section: "A", percentage: 96, previousChange: "+8%" },
              { section: "B", percentage: 93, previousChange: "+6%" },
              { section: "C", percentage: 90, previousChange: "+5%" },
              { section: "D", percentage: 95, previousChange: "+7%" }
            ]
          }
        ]
      },
      {
        term: "third",
        classes: [
          {
            class: "9",
            sections: [
              { section: "A", percentage: 83, previousChange: "+3%" },
              { section: "B", percentage: 87, previousChange: "+5%" },
              { section: "C", percentage: 80, previousChange: "+2%" },
              { section: "D", percentage: 85, previousChange: "+4%" }
            ]
          },
          {
            class: "10",
            sections: [
              { section: "A", percentage: 89, previousChange: "+5%" },
              { section: "B", percentage: 92, previousChange: "+6%" },
              { section: "C", percentage: 86, previousChange: "+4%" },
              { section: "D", percentage: 83, previousChange: "+3%" }
            ]
          },
          {
            class: "11",
            sections: [
              { section: "A", percentage: 96, previousChange: "+7%" },
              { section: "B", percentage: 93, previousChange: "+5%" },
              { section: "C", percentage: 89, previousChange: "+4%" },
              { section: "D", percentage: 91, previousChange: "+6%" }
            ]
          },
          {
            class: "12",
            sections: [
              { section: "A", percentage: 98, previousChange: "+8%" },
              { section: "B", percentage: 95, previousChange: "+6%" },
              { section: "C", percentage: 92, previousChange: "+5%" },
              { section: "D", percentage: 97, previousChange: "+7%" }
            ]
          }
        ]
      }
    ]
  }

  return (
    <div className="p-4">
      <PercentageCard info={performanceData} />
    </div>
  )
}

const PercentageCard = ({ info }) => {
  const { terms } = info
  
  const [selectedTerm, setSelectedTerm] = useState(terms[0].term)
  const [selectedClass, setSelectedClass] = useState(terms[0].classes[0].class)
  const [selectedSection, setSelectedSection] = useState(terms[0].classes[0].sections[0].section)

  // Find current data based on selections
  const currentTerm = terms.find(term => term.term === selectedTerm)
  const currentClass = currentTerm?.classes.find(cls => cls.class === selectedClass)
  const currentSection = currentClass?.sections.find(sec => sec.section === selectedSection)

  const currentPercentage = currentSection?.percentage || 0
  const previousTermChange = currentSection?.previousChange || "+0%"

  // Update class options when term changes
  const handleTermChange = (term) => {
    setSelectedTerm(term)
    const newTerm = terms.find(t => t.term === term)
    if (newTerm) {
      setSelectedClass(newTerm.classes[0].class)
      setSelectedSection(newTerm.classes[0].sections[0].section)
    }
  }

  // Update section options when class changes
  const handleClassChange = (cls) => {
    setSelectedClass(cls)
    const newClass = currentTerm?.classes.find(c => c.class === cls)
    if (newClass) {
      setSelectedSection(newClass.sections[0].section)
    }
  }

  // Calculate percentage for the circular progress
  const percentage = currentPercentage
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-[450px] h-[340px]">
      <div className="flex justify-between items-center mb-6 gap-3">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Performance</h3>
        <div className="flex items-center gap-2.5">
          {/* Term Dropdown */}
          <select
            value={selectedTerm}
            onChange={(e) => handleTermChange(e.target.value)}
            className="text-sm text-gray-700 bg-white border border-gray-300 rounded px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23666%27 strokeWidth=%272%27 strokeLinecap=%27round%27 strokeLinejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
          >
            {terms?.map((term) => (
              <option key={term.term} value={term.term}>
                {term.term.charAt(0).toUpperCase() + term.term.slice(1)} Term
              </option>
            ))}
          </select>

          {/* Class Dropdown */}
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="text-sm text-gray-700 bg-white border border-gray-300 rounded px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23666%27 strokeWidth=%272%27 strokeLinecap=%27round%27 strokeLinejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
          >
            {currentTerm?.classes?.map((cls) => (
              <option key={cls.class} value={cls.class}>
                Class {cls.class}
              </option>
            ))}
          </select>

          {/* Section Dropdown */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="text-sm text-gray-700 bg-white border border-gray-300 rounded px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23666%27 strokeWidth=%272%27 strokeLinecap=%27round%27 strokeLinejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
          >
            {currentClass?.sections?.map((section) => (
              <option key={section.section} value={section.section}>
                 {section.section}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Circular Progress */}
      <div className="flex justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-40 h-40 transform -rotate-90">
            {/* Background circle */}
            <circle cx="80" cy="80" r="60" stroke="#e5e7eb" strokeWidth="12" fill="none" />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="60"
              stroke="#3b82f6"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference * 1.333}
              strokeDashoffset={strokeDashoffset * 1.333}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          {/* Center text with white background circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full w-28 h-28 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-gray-900">{currentPercentage}%</div>
              <div className="text-xs text-gray-500">Current Percentage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center">
        <div>
          <div className="text-2xl font-bold text-green-500">{previousTermChange}</div>
          <div className="text-xs text-gray-500">Previous term</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            {selectedTerm.charAt(0).toUpperCase() + selectedTerm.slice(1)} Term
          </div>
          <div className="text-xs text-gray-500">
            Class {selectedClass}, Section {selectedSection}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Percentage