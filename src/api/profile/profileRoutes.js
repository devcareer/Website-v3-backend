const express = require('express');
const router = express.Router();
const profileController = require('../profile/profileController');
const { ensuredAuthenticated } = require('../../middleware/authentication');
const validator = require('../../middleware/validator');

router.route('/').post(profileController.createProfile);

module.exports = router;
