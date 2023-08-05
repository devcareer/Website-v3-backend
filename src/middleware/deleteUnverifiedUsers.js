const User = require('../model/user');

async function deleteUnverifiedUsers() {
  try {
    // Find and delete unverified users whose verification token has expired
    const howMany = await User.deleteMany({
      isVerified: false,
      emailVerificationTokenExpiresAt: { $lte: new Date() },
    });
    if (howMany.deletedCount > 0) {
      console.log(
        `Deleted ${howMany.deletedCount} unverified user(s) whose verification token has expired.`
      );
    }
  } catch (err) {
    console.error('Error deleting unverified users:', err);
  }
}
module.exports = deleteUnverifiedUsers;
