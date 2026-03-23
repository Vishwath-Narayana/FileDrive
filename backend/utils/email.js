const nodemailer = require('nodemailer');

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Use Gmail App Password (not your regular password)
  },
});

/**
 * Send an organization invite email with a token link.
 */
const sendInviteEmail = async (
  toEmail,
  inviteLink,
  role,
  organizationName,
  inviterName,
  inviterEmail
) => {
  try {
    console.log('📨 Sending invite email to:', toEmail);

    const mailOptions = {
      from: `"FileDrive" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: `You're invited to join ${organizationName} on FileDrive`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
          <div style="background: #000; padding: 16px 24px; border-radius: 6px 6px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 22px;">FileDrive</h1>
          </div>
          <div style="background: #fff; padding: 32px 24px; border-radius: 0 0 6px 6px;">
            <h2 style="margin-top: 0;">You've been invited!</h2>
            <p>
              ${inviterName ? `<b>${inviterName}</b>` : 'Someone'} ${inviterEmail ? `(${inviterEmail})` : ''} has invited you to join
              <strong>${organizationName}</strong> on FileDrive as a <strong>${role}</strong>.
            </p>
            <p>Click the button below to accept your invitation:</p>
            <a href="${inviteLink}"
              style="display:inline-block; padding:12px 24px; background:#000; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold; margin: 16px 0;">
              Accept Invitation
            </a>
            <p style="margin-top: 24px; font-size: 13px; color: #555;">
              If the button above doesn't work, copy and paste this link into your browser:
            </p>
            <p style="font-size: 13px; word-break: break-all; color: #333;">
              <a href="${inviteLink}" style="color: #000;">${inviteLink}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="font-size: 12px; color: #888;">
              This invitation link will expire in 48 hours. If you did not expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Invite email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Nodemailer invite email error:', error.message);
    throw error;
  }
};

/**
 * Send a password reset OTP email.
 */
const sendPasswordResetOTP = async (toEmail, otp, userName) => {
  try {
    console.log('📨 Sending OTP email to:', toEmail);

    const mailOptions = {
      from: `"FileDrive" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: 'Your FileDrive Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
          <div style="background: #000; padding: 16px 24px; border-radius: 6px 6px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 22px;">FileDrive</h1>
          </div>
          <div style="background: #fff; padding: 32px 24px; border-radius: 0 0 6px 6px;">
            <h2 style="margin-top: 0;">Password Reset Request</h2>
            <p>Hi ${userName || 'there'},</p>
            <p>We received a request to reset your FileDrive password. Use the OTP below to proceed:</p>
            <div style="text-align: center; margin: 28px 0;">
              <span style="display:inline-block; background:#000; color:#fff; font-size:32px; font-weight:bold; letter-spacing:10px; padding:16px 32px; border-radius:8px;">
                ${otp}
              </span>
            </div>
            <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="font-size: 12px; color: #888;">
              If you did not request a password reset, please ignore this email. Your account remains secure.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Nodemailer OTP email error:', error.message);
    throw error;
  }
};

module.exports = { sendInviteEmail, sendPasswordResetOTP };