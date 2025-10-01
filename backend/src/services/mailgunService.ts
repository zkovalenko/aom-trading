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

interface EmailLayoutOptions {
  heading: string;
  greeting?: string;
  intro?: string;
  paragraphs?: string[];
  listHeading?: string;
  listItems?: string[];
  cta?: {
    label: string;
    url: string;
  };
  metaNote?: string;
  footerNote?: string;
}

function renderEmailLayout({
  heading,
  greeting,
  intro,
  paragraphs = [],
  listHeading,
  listItems = [],
  cta,
  metaNote,
  footerNote,
}: EmailLayoutOptions): string {
  const safeGreeting = greeting ? greeting.trim() : '';

  const paragraphHtml = [intro, ...paragraphs]
    .filter((content): content is string => Boolean(content))
    .map((content) => `
              <p style="margin: 0 0 16px; line-height: 1.6; color: #1f2933;">
                ${content}
              </p>`)
    .join('');

  const listHtml = listItems.length
    ? `
              ${listHeading ? `<h3 style="margin: 24px 0 12px; color: #2f498b; font-size: 16px;">${listHeading}</h3>` : ''}
              <ul style="margin: 0 0 16px; padding-left: 20px; color: #1f2933; line-height: 1.6;">
                ${listItems
                  .map((item) => `<li style="margin-bottom: 8px;">${item}</li>`)
                  .join('')}
              </ul>`
    : '';

  const ctaHtml = cta
    ? `
              <p style="text-align: center; margin: 28px 0;">
                <a href="${cta.url}" style="display: inline-block; background: #2f498b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
                  ${cta.label}
                </a>
              </p>`
    : '';

  const metaHtml = metaNote
    ? `
              <p style="margin: 0 0 12px; line-height: 1.6; font-size: 14px; color: #445566;">
                ${metaNote}
              </p>`
    : '';

  const footerHtml = footerNote
    ? `
              <p style="margin: 24px 0 0; line-height: 1.6; color: #445566; font-size: 14px;">
                ${footerNote}
              </p>`
    : '';

  const greetingHtml = safeGreeting
    ? `
              <p style="margin: 0 0 16px; line-height: 1.6;">
                Hi ${safeGreeting},
              </p>`
    : '';

  return `
      <div style="font-family: Arial, sans-serif; color: #1f2933; background-color: #f6f9fc; padding: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 18px rgba(31, 41, 51, 0.08);">
          <tr>
            <td style="padding: 32px 32px 24px;">
              <h1 style="font-size: 22px; margin: 0 0 12px; color: #2f498b;">${heading}</h1>
              ${greetingHtml}
              ${paragraphHtml}
              ${listHtml}
              ${ctaHtml}
              ${metaHtml}
              ${footerHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background: #f3f6fb; text-align: center; font-size: 12px; color: #6b7280;">
              <img src="${LOGO_URL}" alt="AOMTrading" width="120" style="margin-bottom: 12px;" />
              <div>© ${new Date().getFullYear()} AOMTrading. All rights reserved.</div>
            </td>
          </tr>
        </table>
      </div>
    `;
}

export async function sendWelcomeEmail({
  email,
  firstName,
}: {
  email: string;
  firstName: string;
}): Promise<void> {
  const safeName = firstName?.trim() || 'Trader';

  const textBody = [
    `Hi ${safeName},`,
    '',
    'Thanks for joining AOMTrading! Your account is ready.',
    '',
    'What to do next:',
    '- Log in anytime at https://aom-trading.onrender.com/login to access your dashboard.',
    '- Follow the guided tutorials to lock in the methodology.',
    '- Join the live trading rooms to see the strategy in action.',
    '',
    'Need help? Reach us at info@aomtrading.com.',
    '',
    'Trade smart,',
    'The AOMTrading Team'
  ].join('\n');

  await sendEmail({
    to: email,
    subject: 'Welcome to AOMTrading',
    text: textBody,
    html: renderEmailLayout({
      heading: 'Welcome to AOMTrading!',
      greeting: safeName,
      intro: 'Thanks for joining AOMTrading. Your account is ready to go!',
      listHeading: 'Here’s what happens next:',
      listItems: [
        '<strong>Access your learning and software:</strong> Log in anytime at <a href="https://aom-trading.onrender.com/login" style="color:#2f498b;">aom-trading.onrender.com/login</a>.',
        '<strong>Learn the methodology:</strong> Follow the guided tutorials to build strong trading habits.',
        '<strong>Join live trading rooms:</strong> Watch the strategy in action and ask questions in real time.'
      ],
      cta: {
        label: 'Explore Your Dashboard',
        url: 'https://aom-trading.onrender.com/learn-to-trade'
      },
      footerNote: 'Need a hand? Reach us at <a href="mailto:info@aomtrading.com" style="color:#2f498b;">info@aomtrading.com</a>.'
    }),
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
  const listItems = tier === 'premium'
    ? [
        'Unlimited access to premium trading rooms and advanced mentorship.',
        'Full study-course library, quizzes, and software updates.',
        'Priority support whenever you need assistance.',
      ]
    : [
        'Full access to the basic live trading room experience.',
        'Study-course library, quizzes, and software updates.',
        'Community support whenever you need a hand.',
      ];

  const textLines = [
    `Hi ${safeName},`,
    '',
    `Your ${normalizedTier} subscription is active. Welcome aboard!`,
    '',
    'What you can access:',
    ...listItems.map((item) => `- ${item}`),
  ];

  if (trialEndsAt) {
    textLines.push('', `Free trial access runs through ${new Date(trialEndsAt).toLocaleDateString()}.`);
  }

  textLines.push('', 'See you in the trading room,', 'The AOMTrading Team');

  await sendEmail({
    to: email,
    subject: `Your ${normalizedTier} AOMTrading subscription is active`,
    text: textLines.join('\n'),
    html: renderEmailLayout({
      heading: `Welcome to the ${normalizedTier} Plan`,
      greeting: safeName,
      intro: `Your ${normalizedTier.toLowerCase()} subscription is active and ready to use.`,
      listHeading: 'Here’s what you can access:',
      listItems,
      metaNote: trialEndsAt ? `Free trial access runs through ${new Date(trialEndsAt).toLocaleDateString()}.` : undefined,
      footerNote: 'Need support? Reply to this email or contact <a href="mailto:info@aomtrading.com" style="color:#2f498b;">info@aomtrading.com</a>.',
    }),
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

  const listItems = tier === 'premium'
    ? [
        'Premium trading rooms remain open until your billing cycle ends.',
        'Download any resources you need before your end date.',
        'You can reactivate anytime to regain premium access.',
      ]
    : [
        'Retain access to course content until your current period ends.',
        'Download software or materials you need before it expires.',
      ];

  const textBody = [
    `Hi ${safeName},`,
    '',
    `We’ve processed your ${normalizedTier} plan cancellation effective ${cancelDate}.`,
    'You’ll keep access until the end of your current billing period.',
    '',
    'Before then consider:',
    ...listItems.map((item) => `- ${item}`),
    '',
    'If we can help tailor a new plan, reply to this email or contact info@aomtrading.com.',
    '',
    'Thank you for being part of the community,',
    'The AOMTrading Team'
  ].join('\n');

  await sendEmail({
    to: email,
    subject: `Your ${normalizedTier} subscription has been cancelled`,
    text: textBody,
    html: renderEmailLayout({
      heading: `${normalizedTier} Subscription Cancellation`,
      greeting: safeName,
      intro: `We’ve processed your ${normalizedTier.toLowerCase()} subscription cancellation effective ${cancelDate}.`,
      paragraphs: ['You’ll keep access until the end of your current billing period. Before then you can:'],
      listItems,
      footerNote: 'If we can help build a plan that fits better, reply to this email or contact <a href="mailto:info@aomtrading.com" style="color:#2f498b;">info@aomtrading.com</a>.',
    }),
  });
}

export async function sendPasswordResetEmail({
  email,
  firstName,
  resetLink,
  expiresAt,
}: {
  email: string;
  firstName?: string;
  resetLink: string;
  expiresAt: Date;
}): Promise<void> {
  const safeName = firstName?.trim() || 'Trader';
  const expiresFormatted = expiresAt.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  await sendEmail({
    to: email,
    subject: 'Reset your AOMTrading password',
    text: `Hi ${safeName},\n\nWe received a request to reset your AOMTrading password.\n\nOpen this link to choose a new password: ${resetLink}\n\nThis link expires at ${expiresFormatted}. If you didn’t request a reset, you can safely ignore this email.\n`,
    html: renderEmailLayout({
      heading: 'Reset your password',
      greeting: safeName,
      intro: 'We received a request to reset your AOMTrading password. Click below to choose a new password.',
      cta: {
        label: 'Reset Password',
        url: resetLink,
      },
      metaNote: `This link expires at <strong>${expiresFormatted}</strong>.`,
      footerNote: 'If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.',
    }),
  });
}
