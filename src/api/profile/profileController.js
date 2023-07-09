const Profile = require('../../model/profileModel');

async function createProfile(req, res) {
  const profile = new Profile(req.body);

  const savedProfile = await profile.save();
  res.status(201).json({
    status: 'success',
    message: savedProfile,
  });
}

module.exports = {
  createProfile,
};
