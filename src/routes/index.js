const express = require('express');
const authRoutes = require('../api/auth/authRoutes');
const profileRoutes = require('../api/profile/profileRoutes');

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/profile', profileRoutes);

module.exports = router;
