const mongoose = require('mongoose');
const validator = require('validator');

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
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    default: null,
  },
  status: {
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
  // Define the Personal Information Schema
  personal: {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
    },
    about: {
      type: String,
      required: [true, 'About is required'],
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    portfolioURL: {
      type: String,
      required: [true, 'Portfolio URL is required'],
      validate: [validator.isURL, 'Please provide a valid URL'],
    },
  },
  educations: [educationSchema],
  experiences: [experienceSchema],
  projects: [projectSchema],
  // Define the Skill schema
  skills: { type: [String], required: true },
});

// Create the Profile model
const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
