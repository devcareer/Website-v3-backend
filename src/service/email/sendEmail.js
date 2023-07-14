const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: process.env.CONTACT_HOST,
  port: process.env.SEND_MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    minVersion: 'TLSv1.2', // Specify the desired minimum SSL/TLS version here
    maxVersion: 'TLSv1.3', // Specify the desired maximum SSL/TLS version here
  },
  ciphers: 'TLS_AES_128_GCM_SHA256',
});

module.exports.sendVerificationEmail = (_email, _subject, link) => {
  const mailOptions = {
    from: `DevCareer <${process.env.EMAIL_USERNAME}>`,
    to: _email,
    subject: 'Verify your email address for successful account activation',
    html: `
      <p>Please click the following link to verify your email and to complete your <strong>DevCareer</strong> registration account</p>
      
      <p>This link will expire in <strong> 5 minutes</strong>.</p>
      
      <p style="margin-bottom:20px;">Click this link for active your account</p>

      <a href="${link}" style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Verify Email</a>
      <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@devCareer.com</p>

        <p style="margin-bottom:0px;">Thank you</p>
        <strong>DevCareer Support Team</strong>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending verification email:', error);
    } else {
      console.log('Verification email sent:', info.response);
    }
  });
};

module.exports.resetPasswordMail = (_email, _subject, link) => {
  const mailOptions = {
    from: `DevCareer <${process.env.EMAIL_USERNAME}>`,
    to: _email,
    subject: _subject,
    html: `
      <p>Please click the following link to reset your password in other to <strong>DevCareer</strong> login into your account</p>
      
      <p>This link will expire in <strong> 5 minutes minute</strong>.</p>
      
       <p style="margin-bottom:20px;">Click this link to reset your password</p>
      
      <a href="${link}" style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Verify Login</a>
       <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@devCareer.com</p>
        <p style="margin-bottom:0px;">Thank you</p>
        <strong>DevCareer Support Team</strong>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending reset password email:', error);
    } else {
      console.log('Reset password email sent:', info.response);
    }
  });
};

module.exports.forgotPasswordMail = (_email, subject, link) => {
  const mailOptions = {
    from: `DevCareer <${process.env.EMAIL_USERNAME}>`,
    to: _email,
    subject: 'Forgot Your Password',
    html: `<p>Hello User,</p>

    <p>We have received a request to reset your password. To proceed with the password reset, please click the following link:</p>
    
    <a href="${link}" style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Reset Password</a>
    
    <p>Please note that this link will expire in <strong>5 minutes</strong>.</p>
    
    <p>If you did not initiate this password reset request, please disregard this email or contact our support team immediately at support@devCareer.com.</p>
    
    <p>Best regards,</p>
    <strong>DevCareer Support Team</strong>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending forgot password email:', error);
    } else {
      console.log('Forgot password email sent:', info.response);
    }
  });
};
