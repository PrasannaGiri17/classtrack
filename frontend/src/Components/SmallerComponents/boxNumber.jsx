import React from 'react';
import './boxNumber.css';

const BoxNumber = ({ info }) => {
  return (
    <div className="box-number">
    
      <div className="box-number-title">{info.title}</div>
      <div className="box-number-value">{info.number}</div>
    </div>
  );
};

export default BoxNumber;
