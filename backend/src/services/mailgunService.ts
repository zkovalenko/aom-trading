import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);

const mg = process.env.MAILGUN_API_KEY
  ? mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    })
  : null;

export async function sendEmail({
  to,
  subject,
  text,
  html,
  from,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
  from?: string;
}): Promise<void> {
  if (!mg) {
    console.warn('📭 Mailgun client not configured. Skipping email send.');
    return;
  }

  const domain = process.env.MAILGUN_DOMAIN;
  if (!domain) {
    console.warn('📭 MAILGUN_DOMAIN not set. Skipping email send.');
    return;
  }

  const sender = from || `AOM Trading <no-reply@${domain}>`;

  try {
    const message = await mg.messages.create(domain, {
      from: sender,
      to: [to],
      subject,
      text,
      html,
    });

    console.log('✅ Email sent:', message.id);
  } catch (err) {
    console.error('❌ Mailgun error:', err);
  }
}

export async function sendWelcomeEmail({
  email,
  firstName,
}: {
  email: string;
  firstName: string;
}): Promise<void> {
  const safeName = firstName?.trim() || 'Trader';

  await sendEmail({
    to: email,
    subject: 'Welcome to AOM Trading',
    text: `Hi ${safeName},\n\nThanks for signing up for AOM Trading. Your account is ready to go!`,
    html: `
      <h1>Welcome, ${safeName}!</h1>
      <p>Thanks for joining <strong>AOM Trading</strong>. Your account is ready — sign in to explore your dashboard, access the course material, and join live sessions.</p>
      <p>If you didn’t create this account, please ignore this email.</p>
    `,
  });
}
