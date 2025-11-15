import React from 'react'
import './DashBoard.css'
import GMainC from '../../Components/GlobalMainCalender/GMainC'
import Gcalender from '../../Components/GlobalCalender/Gcalender'
import GcalenderDetail from '../../Components/GlobalCalenderDetail/Gcalenderdetail'
export const DashBoard = () => {
  return (
    <div className="main-box">
    <div className="box">
        <Gcalender />
        
    </div>
    <div className="box1">
        <GcalenderDetail />
    </div>
    </div>

  )
}
