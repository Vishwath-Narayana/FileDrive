const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendInviteEmail = async (toEmail, inviteLink, role, organizationName) => {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: toEmail,
      subject: `You're invited to ${organizationName}`,
      html: `
        <h2>FileDrive Invitation</h2>
        <p>You have been invited to <strong>${organizationName}</strong> as <b>${role}</b>.</p>
        <a href="${inviteLink}" style="padding:10px 20px;background:black;color:white;text-decoration:none;border-radius:6px;">
          Accept Invitation
        </a>
        <p>If button doesn't work, use this link:</p>
        <p>${inviteLink}</p>
      `,
    });

    console.log("✅ Email sent to:", toEmail);
  } catch (error) {
    console.error("❌ Resend email error:", error.message);
  }
};

module.exports = { sendInviteEmail };