const Profile = require('../../model/profileModel');
const User = require('../../model/user');

async function createProfile(req, res) {
  const user = req.body.userId;
  // const savedProfile = await profile.save();
  await Profile.updateOne({ userId: user }, req.body, { upsert: true })
    .then((doc) => {
      if (doc.upsertedCount === 1) {
        res.status(200).json({
          status: "success",
          message: "profile created successfully"
        })
      } else {
        res.status(200).json({
          status: "success",
          message: "profile updated successfully"
        })
      }
    })
    .catch((err) => {
      res
        .status(500)
        .json({ status: 'failed', error: 'Internal Server Error' });
    });
}

async function getProfile(req, res) {
  const loginUser = await Profile.find({ userId: req.body.userId });
  if (loginUser.length === 0) {
    res.status(204).json({}); // No Content
  }
  res.status(200).json({
    status: 'success',
    profile: loginUser,
  });
}

module.exports = {
  createProfile,
  getProfile,
};
