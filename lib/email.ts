import { Resend } from "resend";

/**
 * Email notifications via Resend.
 *
 * ADMIN_EMAIL — where approval-needed alerts go. Set this in your
 * env vars to your real inbox.
 *
 * EMAIL_FROM — the "from" address. Until you verify a domain in
 * Resend, this must stay "onboarding@resend.dev" (Resend's shared
 * sending address for unverified accounts) — anything else will
 * fail to send. Once you verify mbjsociety.space (or whatever
 * domain) in Resend's dashboard, switch this to something like
 * "MBJ Society <notifications@mbjsociety.space>".
 */
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAdminSignupNotification(params: {
  name: string;
  email: string;
  orderId: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!adminEmail) {
    console.error("ADMIN_EMAIL is not set — skipping admin notification email.");
    return;
  }

  try {
    await resend.emails.send({
      from: fromAddress,
      to: adminEmail,
      subject: `New MBJ Society signup pending approval — ${params.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <h2 style="color: #12151A;">New signup awaiting approval</h2>
          <p><strong>Name:</strong> ${escapeHtml(params.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(params.email)}</p>
          <p><strong>Order ID:</strong> ${escapeHtml(params.orderId)}</p>
          <p style="margin-top: 24px;">
            <a href="${siteUrl}/admin-panel"
               style="background:#C9A227;color:#12151A;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
              Review in Admin Panel
            </a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send admin signup notification:", err);
  }
}

export async function sendMemberApprovalEmail(params: { name: string; email: string }) {
  const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    await resend.emails.send({
      from: fromAddress,
      to: params.email,
      subject: "You're in — welcome to The MBJ Society",
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <h2 style="color: #12151A;">Welcome to The MBJ Society, ${escapeHtml(params.name)}.</h2>
          <p>Your membership has been approved. You can log in now.</p>
          <p style="margin-top: 24px;">
            <a href="${siteUrl}/login"
               style="background:#C9A227;color:#12151A;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
              Sign In
            </a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send member approval email:", err);
  }
}

export async function sendSupportReplyEmail(params: {
  name: string;
  email: string;
  subject: string;
  originalMessage: string;
  reply: string;
}) {
  const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    await resend.emails.send({
      from: fromAddress,
      to: params.email,
      subject: `Re: ${params.subject} — MBJ Society Support`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <h2 style="color: #12151A;">Hi ${escapeHtml(params.name)},</h2>
          <p>The MBJ Society team replied to your support message:</p>
          <div style="background:#F5F5F5;border-left:3px solid #C9A227;padding:12px 16px;margin:16px 0;white-space:pre-wrap;">${escapeHtml(params.reply)}</div>
          <p style="color:#666;font-size:13px;margin-top:24px;">
            Your original message:<br />
            <span style="white-space:pre-wrap;">${escapeHtml(params.originalMessage)}</span>
          </p>
          <p style="margin-top: 24px;">
            <a href="${siteUrl}/support"
               style="background:#C9A227;color:#12151A;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
              Visit Support
            </a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send support reply email:", err);
  }
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
