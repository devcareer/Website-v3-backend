const Profile = require('../../model/profileModel');
const User = require('../../model/user');

function removeIdKeys(data) {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(removeIdKeys);
  }

  const newData = {};
  for (const key in data) {
    if (key !== '_id') {
      newData[key] = removeIdKeys(data[key]);
    }
  }

  return newData;
}

async function createProfile(req, res) {
  const user = req.body.userId;
  // const savedProfile = await profile.save();
  // console.log(req.body);

  const data = removeIdKeys(req.body);

  // console.log(data);

  await Profile.updateOne({ userId: user }, data, { upsert: true })
    .then((doc) => {
      if (doc.upsertedCount === 1) {
        return res.status(200).json({
          status: 'success',
          message: 'profile created successfully',
        });
      } else {
        return res.status(200).json({
          status: 'success',
          message: 'profile updated successfully',
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(500)
        .json({ status: 'failed', error: 'Internal Server Error' });
    });
}

async function getProfile(req, res) {
  const loginUser = await Profile.find({ userId: req.body.userId });
  if (loginUser.length === 0) {
    return res.status(204).json({}); // No Content
  }

  sortEducationAndExperience(loginUser[0]);

  console.log(loginUser);
  return res.status(200).json({
    status: 'success',
    profile: loginUser,
  });
}

async function profileLinkDetails(req, res) {
  const { username } = req.params;

  try {
    const profileUser = await Profile.findOne({ username: username });
    if (!profileUser) {
      return res.status(404).json({
        status: 'failed',
        message: 'User not found',
      });
    }

    sortEducationAndExperience(profileUser);
    // If the database query is successful, send the profile data in the response
    return res.status(200).json({
      status: 'success',
      profile: profileUser,
    });
  } catch (error) {
    console.error('Database Error:', error);
    // Respond with an appropriate error message
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching the profile data',
    });
  }
}

const sortEducationAndExperience = (userDetails) => {
  userDetails.educations.sort(
    (a, b) => parseInt(b.endYear) - parseInt(a.endYear)
  );

  userDetails.experiences.sort((a, b) => {
    if (a.tillPresent === b.tillPresent) {
      return new Date(b.endDate) - new Date(a.endDate);
    } else {
      return b.tillPresent - a.tillPresent;
    }
  });
};

module.exports = {
  createProfile,
  getProfile,
  profileLinkDetails,
};
