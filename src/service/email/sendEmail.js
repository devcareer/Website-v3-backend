const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'Your Email Service Provider',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports.sendVerificationEmail = (email, subject, link) => {
  const mailOptions = {
    from: 'Your Name <your-email@example.com>',
    to: email,
    subject: subject,
    html: `
      <p>Please click the following link to verify your email and to complete your <strong>DevCareer</strong> registration account</p>
      
      <p>This link will expire in <strong> 5 minutes minute</strong>.</p>
      
      <p style="margin-bottom:20px;">Click this link for active your account</p>
      

      <a href="${link} style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Verify Email</a>
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

module.exports.resetPasswordMail = (email, subject, link) => {
  const mailOptions = {
    from: 'Your Name <your-email@example.com>',
    to: email,
    subject: subject,
    html: `
      <p>Please click the following link to reset your password in other to <strong>DevCareer</strong> login into your account</p>
      
      <p>This link will expire in <strong> 5 minutes minute</strong>.</p>
      
       <p style="margin-bottom:20px;">Click this link for activate reset password</p>
       
        <p style="margin-bottom:20px;">Click this link for active your account</p>
      
      
      <a href="${link} style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Verify Login</a>
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

module.exports.forgotPasswordMail = (email, subject, link) => {
  const mailOptions = {
    from: 'Your Name <your-email@example.com>',
    to: email,
    subject: subject,
    html: `
      <p>Please click the following forgot password link to be able to <strong>DevCareer</strong>reset your password</p>
      
      <p>This link will expire in <strong> 5 minutes minute</strong>.</p>
      
       <p style="margin-bottom:20px;">Click this link for active your account</p>
       
        <p style="margin-bottom:20px;">Click this link to activate reset password</p>
      
      
      <a href="${link} style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">Verify Login</a>
       <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at support@devCareer.com</p>
        <p style="margin-bottom:0px;">Thank you</p>
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
