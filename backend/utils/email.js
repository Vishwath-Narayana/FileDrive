const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendInviteEmail = async (toEmail, inviteLink, role, organizationName) => {
  const mailOptions = {
    from: `"FileDrive" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `You've been invited to join ${organizationName} on FileDrive`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .role-badge { display: inline-block; padding: 4px 12px; background: #e5e5e5; border-radius: 4px; font-size: 14px; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FileDrive Invitation</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You've been invited to join <strong>${organizationName}</strong> on FileDrive as a <span class="role-badge">${role.charAt(0).toUpperCase() + role.slice(1)}</span>.</p>
            <p>Click the button below to accept the invitation and join the organization:</p>
            <div style="text-align: center;">
              <a href="${inviteLink}" class="button">Accept Invitation</a>
            </div>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0066cc; font-size: 12px;">${inviteLink}</p>
            <p style="margin-top: 30px; color: #999; font-size: 12px;">This invitation link will expire in 48 hours.</p>
          </div>
          <div class="footer">
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} FileDrive. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send invitation email');
  }
};

const sendPasswordResetOTP = async (toEmail, otp, userName) => {
  const mailOptions = {
    from: `"FileDrive" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Password Reset OTP - FileDrive',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-box { background: #fff; border: 2px dashed #000; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>You requested to reset your password. Use the OTP code below to proceed:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes.</p>
            <p style="margin-top: 30px; color: #999; font-size: 12px;">If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} FileDrive. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = {
  sendInviteEmail,
  sendPasswordResetOTP,
};
