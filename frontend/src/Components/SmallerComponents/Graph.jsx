import React from 'react';
import './Graph.css';

const Graph = ({ info }) => {
  const total = info.subtitle1Value + info.subtitle2Value;
  const percentage1 = (info.subtitle1Value / total) * 100;
  const percentage2 = (info.subtitle2Value / total) * 100;
  
  // Calculate stroke-dasharray for donut chart
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dash1 = (percentage1 / 100) * circumference;
  const dash2 = (percentage2 / 100) * circumference;

  return (
    <div className="circle-graph">
      <h3 className="circle-graph-title">{info.title}</h3>
      
      <div className="circle-graph-content">
        <svg className="donut-chart" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#f0f0f0"
            strokeWidth="20"
          />
          
          {/* First segment */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#dc2626"
            strokeWidth="20"
            strokeDasharray={`${dash1} ${circumference - dash1}`}
            strokeDashoffset={circumference / 4}
            transform="rotate(-90 80 80)"
          />
          
          {/* Second segment */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#f87171"
            strokeWidth="20"
            strokeDasharray={`${dash2} ${circumference - dash2}`}
            strokeDashoffset={circumference / 4 - dash1}
            transform="rotate(-90 80 80)"
          />
        </svg>

        <div className="circle-graph-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#dc2626' }}></span>
            <span className="legend-label">{info.subtitle1Name}</span>
            <span className="legend-value">{info.subtitle1Value}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#f87171' }}></span>
            <span className="legend-label">{info.subtitle2Name}</span>
            <span className="legend-value">{info.subtitle2Value}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Graph;
