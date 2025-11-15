'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HiSearch } from 'react-icons/hi';
import './Gsearchbar.css';

// Mock data for students and teachers
const mockStudents = [
  { id: 1, name: 'Erika Yu', email: 'erika.yu@gmail.com', avatar: '🔴', type: 'student' },
  { id: 2, name: 'Jimmy Alzheimer', email: 'jimmy.alzheimer@gmail.com', avatar: '🔵', type: 'student' },
  { id: 3, name: 'Fred Browski', email: 'freddy.browski.007@gmail.com', avatar: '👤', type: 'student' },
  { id: 4, name: 'Annita Kelpanji', email: 'annita.kelpanji@gmail.com', avatar: '👩', type: 'student' },
  { id: 5, name: 'Sarah Johnson', email: 'sarah.johnson@gmail.com', avatar: '👩', type: 'student' },
];

const mockTeachers = [
  { id: 101, name: 'Dr. John Smith', email: 'john.smith@school.com', avatar: '👨‍🏫', type: 'teacher' },
  { id: 102, name: 'Dr. Emily Watson', email: 'emily.watson@school.com', avatar: '👩‍🏫', type: 'teacher' },
  { id: 103, name: 'Prof. Michael Brown', email: 'michael.brown@school.com', avatar: '👨‍🏫', type: 'teacher' },
  { id: 104, name: 'Dr. Lisa Anderson', email: 'lisa.anderson@school.com', avatar: '👩‍🏫', type: 'teacher' },
];

const Gsearchbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Filter results when search query changes
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const query = searchQuery.toLowerCase();
      const results = [];

      // Search through students
      mockStudents.forEach((student) => {
        if (
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
        ) {
          results.push(student);
        }
      });

      // Search through teachers
      mockTeachers.forEach((teacher) => {
        if (
          teacher.name.toLowerCase().includes(query) ||
          teacher.email.toLowerCase().includes(query)
        ) {
          results.push(teacher);
        }
      });

      setFilteredResults(results);
      setShowDropdown(results.length > 0);
    } else {
      setFilteredResults([]);
      setShowDropdown(false);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group results by type
  const students = filteredResults.filter((r) => r.type === 'student');
  const teachers = filteredResults.filter((r) => r.type === 'teacher');

  return (
    <div className="gsearch-container" ref={dropdownRef}>
      <div className="gsearch-wrapper">
        <input
          type="text"
          className="gsearch-input"
          placeholder="Search for students, teachers, or classes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
        />
        <button className="gsearch-btn">
          <HiSearch />
        </button>
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="gsearch-dropdown">
          {/* Students Section */}
          {students.length > 0 && (
            <div className="gsearch-section">
              <div className="gsearch-section-header">
                <span className="gsearch-section-title">Students</span>
                <span className="gsearch-result-count">{students.length} results</span>
              </div>
              <div className="gsearch-results-list">
                {students.map((student) => (
                  <div key={student.id} className="gsearch-result-item">
                    <div className="gsearch-avatar">{student.avatar}</div>
                    <div className="gsearch-result-content">
                      <div className="gsearch-result-name">{student.name}</div>
                      <div className="gsearch-result-email">{student.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teachers Section */}
          {teachers.length > 0 && (
            <div className="gsearch-section">
              <div className="gsearch-section-header">
                <span className="gsearch-section-title">Teachers</span>
                <span className="gsearch-result-count">{teachers.length} results</span>
              </div>
              <div className="gsearch-results-list">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="gsearch-result-item">
                    <div className="gsearch-avatar">{teacher.avatar}</div>
                    <div className="gsearch-result-content">
                      <div className="gsearch-result-name">{teacher.name}</div>
                      <div className="gsearch-result-email">{teacher.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {students.length === 0 && teachers.length === 0 && (
            <div className="gsearch-no-results">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Gsearchbar;