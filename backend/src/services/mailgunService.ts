import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const LOGO_URL = 'https://aom-trading.onrender.com/logo.svg';

const mg = process.env.MAILGUN_API_KEY
  ? mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY })
  : null;

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, text, html, from, replyTo }: EmailOptions): Promise<void> {
  if (!mg) {
    console.warn('📭 Mailgun client not configured. Skipping email send.');
    return;
  }

  const domain = process.env.MAILGUN_DOMAIN;
  if (!domain) {
    console.warn('📭 MAILGUN_DOMAIN not set. Skipping email send.');
    return;
  }

  const sender = from || `AOMTrading <no-reply@${domain}>`;

  try {
    const message = await mg.messages.create(domain, {
      from: sender,
      to: [to],
      subject,
      text,
      html,
      ...(replyTo ? { 'h:Reply-To': replyTo } : {}),
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
    subject: 'Welcome to AOMTrading',
    text: `Hi ${safeName},\n\nThanks for signing up for AOMTrading. Your account is ready to go!`,
    html: `
     <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f6f9fc; color:#333;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden;">
        <tr>
          <td style="padding: 30px;">
            <h1 style="color:#2f498b; font-size:24px; margin-top:0;">Welcome to AOMTrading!</h1>
            <p style="font-size:16px; line-height:1.5; margin:16px 0;">
              Hi ${safeName},\n\nThanks for signing up for AOMTrading. Your account is ready to go!
            </p>

            <h3 style="color:#333;">Here’s what happens next:</h3>
            <ul style="font-size:16px; line-height:1.6; padding-left:20px; margin:16px 0;">
              <li><b>Access Your Learning and Software:</b> Log in anytime at <a href="https://aom-trading.onrender.com/login" style="color:#0052cc; text-decoration:none;">aomtrading.com/login</a></li>
              <li><b>Learn the Methodology:</b> Start with our guided tutorials designed to build strong trading habits.</li>
              <li><b>Join Live Trading Rooms:</b> Watch strategies in action and ask questions in real time.</li>
            </ul>

            <p style="text-align:center; margin:30px 0;">
              <a href="https://aom-trading.onrender.com/learn-to-trade"
                style="background-color:#2f498b; color:#ffffff; padding:12px 24px; text-decoration:none; font-size:16px; border-radius:6px; display:inline-block; border-color:#2f498b">
                Learn To Trade
              </a>
            </p>

            <p style="font-size:16px; line-height:1.5; margin:16px 0;">
              We’re excited to have you in the community. If you need help, reach out at 
              <a href="mailto:info@aomtrading.com" style="color:#0052cc;">info@aomtrading.com</a>.
            </p>

            <p style="font-size:16px; line-height:1.5; margin:16px 0;">
              Trade smart,<br/>
              <b>The AOMTrading Team</b>
            </p>

            <hr style="border:none; border-top:1px solid #ddd; margin:30px 0;" />
            <p style="text-align:center; margin-top:20px;">
              <img src="${LOGO_URL}" alt="AOMTrading" width="120" style="max-width:150px; height:auto;" />
            </p>
            <p style="text-align:center; font-size:12px; color:#777;">
              © 2025 AOMTrading, All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    `,
  });
}

export async function sendSubscriptionEmail({
  email,
  firstName,
  tier,
  trialEndsAt,
}: {
  email: string;
  firstName: string;
  tier: 'basic' | 'premium';
  trialEndsAt?: string;
}): Promise<void> {
  const safeName = firstName?.trim() || 'Trader';
  const normalizedTier = tier === 'premium' ? 'Premium' : 'Basic';
  const trialMessage = trialEndsAt
    ? `<p><strong>Free Trial:</strong> You have access through ${new Date(trialEndsAt).toLocaleDateString()} before billing begins.</p>`
    : '';

  const benefits = tier === 'premium'
    ? `
        <li>Premium trading rooms and advanced mentorship</li>
        <li>Full study-course library and quizzes</li>
        <li>Access to proprietary trading software</li>
        <li>Priority customer support</li>
      `
    : `
        <li>Live Basic trading room access</li>
        <li>Full study-course library and quizzes</li>
        <li>Access to proprietary trading software</li>
        <li>Customer support</li>
      `;

  await sendEmail({
    to: email,
    subject: `Your ${normalizedTier} AOMTrading subscription is active`,
    text: `Hi ${safeName},\n\nWelcome to the ${normalizedTier} plan!\n\nYou now have access to course materials, the trading software, live rooms, and ongoing support. ${trialEndsAt ? `Your free trial runs until ${new Date(trialEndsAt).toLocaleDateString()}.` : ''}`,
    html: `
      <h1>Welcome to the AOMTrading ${normalizedTier} Plan!</h1>
      <p>Your subscription is active and includes:</p>
      <ul>
        ${benefits}
      </ul>
      ${trialMessage}
      <hr style="border:none; border-top:1px solid #ddd; margin:30px 0;" />
      <p style="text-align:left; margin-top:20px;">
        <img src="${LOGO_URL}" alt="AOMTrading" width="120" style="max-width:150px; height:auto;" />
      </p>
      <p style="text-align:left; font-size:12px; color:#777;">
        © 2025 AOMTrading, All rights reserved.
      </p>
    `,
  });
}

export async function sendSubscriptionCancellationEmail({
  email,
  firstName,
  tier,
  cancelledAt,
}: {
  email: string;
  firstName: string;
  tier: 'basic' | 'premium';
  cancelledAt?: string;
}): Promise<void> {
  const safeName = firstName?.trim() || 'Trader';
  const normalizedTier = tier === 'premium' ? 'Premium' : 'Basic';
  const cancelDate = cancelledAt
    ? new Date(cancelledAt).toLocaleDateString()
    : new Date().toLocaleDateString();

  const reminders = tier === 'premium'
    ? `
        <li>Premium trading rooms remain open until your billing cycle ends.</li>
        <li>Download any resources you need before your end date.</li>
        <li>You can reactivate anytime to regain premium access.</li>
      `
    : `
        <li>You retain access to course content until your current period ends.</li>
        <li>Download software or materials you need before it expires.</li>
        <li>Your account will stay ready should you decide to return.</li>
      `;

  await sendEmail({
    to: email,
    subject: `Your ${normalizedTier} subscription has been cancelled`,
    text: `Hi ${safeName},\n\nWe've processed the cancellation of your ${normalizedTier} plan effective ${cancelDate}. You'll keep access until the end of your current billing period. Need help or want to reactivate later? Reach out at info@aomtrading.com.`,
    html: `
      <h1>Hi ${safeName},</h1>
      <p>Your <strong>${normalizedTier}</strong> subscription will end on ${cancelDate}.</p>
      <p>You still have access until the end of your current period. Before then you can:</p>
      <ul>
        ${reminders}
      </ul>
      <p>If we can help tailor a new plan, reply to this email or contact <a href="mailto:info@aomtrading.com">info@aomtrading.com</a>.</p>
      <hr style="border:none; border-top:1px solid #ddd; margin:30px 0;" />
      <p style="text-align:left; margin-top:20px;">
        <img src="${LOGO_URL}" alt="AOMTrading" width="120" style="max-width:150px; height:auto;" />
      </p>
      <p style="text-align:left; font-size:12px; color:#777;">
        © 2025 AOMTrading, All rights reserved.
      </p>
    `,
  });
}
