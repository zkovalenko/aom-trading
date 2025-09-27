import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);

const mg = process.env.MAILGUN_API_KEY
  ? mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    })
  : null;

interface EmailType {
  to: string;
  subject: string;
  text: string;
  html: string;
  from?: string;
};

export async function sendEmail(emailObj: EmailType): Promise<void> {
  const {to, subject, text, html, from} = emailObj;
  
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

            <!-- Footer with Logo -->
            <hr style="border:none; border-top:1px solid #ddd; margin:30px 0;" />
            <p style="text-align:center; margin-top:20px;">
              <img src="https://aom-trading.onrender.com/static/media/aom_logo_green.feb6a5063a110ae94ad5.svg" alt="AOMTrading" width="120" style="max-width:150px; height:auto;" />
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
