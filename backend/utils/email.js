const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendInviteEmail = async (
  toEmail,
  inviteLink,
  role,
  organizationName,
  inviterName,
  inviterEmail
) => {
  try {
    console.log("📨 Sending email to:", toEmail);

    const response = await resend.emails.send({
      from: 'FileDrive <onboarding@resend.dev>', // ✅ VALID sender
      to: toEmail,
      subject: `You're invited to ${organizationName}`,
      html: `
        <h2>FileDrive Invitation</h2>

        <p>
          <b>${inviterName}</b> (${inviterEmail}) invited you to 
          <strong>${organizationName}</strong>
        </p>

        <p>Role: <b>${role}</b></p>

        <a href="${inviteLink}" 
          style="padding:10px 20px;background:black;color:white;text-decoration:none;border-radius:6px;display:inline-block;">
          Accept Invitation
        </a>

        <p>If button doesn't work, use this link:</p>
        <p>${inviteLink}</p>
      `,
    });

    console.log("✅ Resend response:", response);
  } catch (error) {
    console.error("❌ Resend email error:", error.message);
  }
};

module.exports = { sendInviteEmail };