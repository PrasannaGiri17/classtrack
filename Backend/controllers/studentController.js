const express = require('express');
const Student = require('../models/studentModel');
const { get } = require('mongoose');

const getAllStudents = async (req, res) => {
   const students = await Student.find();
    res.status(200).json(students);
};

const addStudent = async (req, res) => {
    try{
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    }catch(error){
        res.status(400).json({ message: error.message });
    }
};
const getStudentById = async (req,res) => {
    try{
        const id = req.params.id;
        const student = await Student.findById(id);
        if(!student){
            return res.status(404).json({message: "Student not found"});
        }
        res.status(200).json(student);
    }
    catch(error){
        res.status(400).json({ message: error.message });
    }
}
const getStudentByName = async (req,res) => {
    try{
        const name = req.params.name;
        const student = await Student.findOne({name: name});
        if(!student){
            return res.status(404).json({message: "Student not found"});
        };
        res.status(200).json(student);

    }catch(error){
        res.status(400).json({ message: error.message });
    }
};

const updateStudent = async (req,res) => {
    try{
        const id =req.params.id;
        const userexists = await Student.findById(id);
        if(!userexists){
            return res.status(404).json({message: "Student not found"});
        };
        const updatedStudent = await Student.findByIdAndUpdate(id, req.body, {new: true});
        res.status(200).json(updatedStudent);
    }catch(error){
        res.status(400).json({ message: error.message });
}};
const deleteStudent = async (req,res) => {
    try{
        const id = req.params.id;
        const userexists = await Student.findById(id);
        if(!userexists){
            return res.status(404).json({message: "Student not found"});
        };
        await Student.findByIdAndDelete(id);
        res.status(200).json({message: "Student deleted successfully"});
    }catch(error){
        res.status(400).json({ message: error.message });
}};

module.exports = {
    getAllStudents,
    addStudent,
    getStudentById,
    getStudentByName,
    updateStudent,
    deleteStudent,
};