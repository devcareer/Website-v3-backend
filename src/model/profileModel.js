const mongoose = require('mongoose');
const validator = require('validator');

// Define the Personal Information Schema
const personalSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  linkedIn: {
    type: String,
    required: [true, 'LinkedIn URL is required'],
  },
  gitHub: {
    type: String,
    required: [true, 'GitHub URL is required'],
  },
});
// Define the Education schema
const educationSchema = new mongoose.Schema({
  institutionAttended: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  graduationDate: {
    type: Date,
    required: true,
  },
});

// Define the Experience schema
const experienceSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  employmentDate: {
    type: Date,
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
});

// Define the Project schema
const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
  },
  projectURL: {
    type: String,
    required: true,
  },
  projectDescription: {
    type: String,
    required: true,
  },
});

// Define the Profile schema
const profileSchema = new mongoose.Schema({
  personal: [personalSchema],
  educations: [educationSchema],
  experiences: [experienceSchema],
  projects: [projectSchema],
  // Define the Skill schema
  skills: {type: [String], required: true,},
});

// Create the Profile model
const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
