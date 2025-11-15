import React from 'react';
import './footer.css';
import reallogo from '../../../Assests/Real_Madrid_CF.svg.png';
import logoicon from '../../../Assests/rosebud.jpg';

const Footer = () => {
  return (
    <div className="admin-footer">
      <div className="footer-content">
        <div className="footer-left">
          <div className="logo">
            <img src={logoicon} alt="School Logo" className="logo-img" />
          </div>
          <p className="school-name">Rosebud</p>
        </div>
        <div className="footer-middle">
          <p className="copyright">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
        <div className="footer-right">
          <img src={reallogo} alt="Icon Logo" className="logo-icon" />
        </div>
      </div>
    </div>
  );
};

export default Footer;