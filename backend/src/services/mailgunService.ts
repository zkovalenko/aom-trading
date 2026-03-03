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
  subscriptionType,
  billingAmount,
  trialEndsAt,
}: {
  email: string;
  firstName: string;
  tier: 'basic' | 'premium';
  subscriptionType: 'monthly' | 'annual';
  billingAmount: number;
  trialEndsAt?: string;
}): Promise<void> {
  const safeName = firstName?.trim() || 'Customer';
  const normalizedTier = tier === 'premium' ? 'Premium' : 'Basic';
  const planName = `AOM Trading ${normalizedTier}`;
  const subType = subscriptionType === 'monthly' ? 'Monthly' : 'Annual';
  const amount = `$${(billingAmount / 100).toFixed(2)}`;
  const hasTrial = !!trialEndsAt;
  const trialEndDate = trialEndsAt ? new Date(trialEndsAt).toLocaleDateString() : '';
  const trialStartDate = new Date().toLocaleDateString();

  const listItems = tier === 'premium'
    ? [
        'Unlimited access to premium trading rooms and advanced mentorship',
        'Full study-course library, quizzes, and software updates',
        'Priority support whenever you need assistance',
      ]
    : [
        'Full access to the basic live trading rooms',
        'Study-course library, quizzes, and software updates',
        'Community support',
      ];

  const textLines = [
    `Hi ${safeName},`,
    '',
    `Welcome to the AOM Trading ${normalizedTier} — your subscription is now active and ready to use.`,
  ];

  if (hasTrial) {
    textLines.push('', `As part of your signup, your ${normalizedTier} Plan includes a 3-month free trial.`);
  }

  textLines.push(
    '',
    'Subscription Details',
    `Plan: ${planName}`,
    `Subscription Type: ${subType}`,
    `Billing Amount: ${amount}`,
  );

  if (hasTrial) {
    textLines.push(
      `Free Trial Start Date: ${trialStartDate}`,
      `Free Trial End Date: ${trialEndDate}`,
    );
  }

  textLines.push('', 'Billing & Cancellation');

  if (hasTrial) {
    textLines.push(
      'You may cancel anytime during the trial period — no questions asked.',
      '',
      `If your subscription is not canceled before the trial ends, your credit card will be automatically charged ${amount} for the ${subType} ${normalizedTier} Subscription you selected.`,
      '',
      'After the trial, you may still cancel anytime, and your access will continue through the end of your current billing period.',
    );
  } else {
    textLines.push(
      'You may cancel anytime, and your access will continue through the end of your current billing period.',
    );
  }

  textLines.push(
    '',
    `Here's what you can access`,
    ...listItems.map((item) => `- ${item}`),
  );

  if (hasTrial) {
    textLines.push('', `Once again, your free trial access runs through ${trialEndDate}.`);
  }

  textLines.push(
    '',
    'If you need support, contact us at info@aomtrading.com.',
    '',
    'Welcome aboard,',
    'AOM Trading',
  );

  const subscriptionDetailsHtml = `
    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin: 0 0 12px; color: #2f498b; font-size: 16px;">Subscription Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #6b7280;"><strong>Plan:</strong></td><td style="padding: 4px 0; color: #1f2933;">${planName}</td></tr>
        <tr><td style="padding: 4px 0; color: #6b7280;"><strong>Subscription Type:</strong></td><td style="padding: 4px 0; color: #1f2933;">${subType}</td></tr>
        <tr><td style="padding: 4px 0; color: #6b7280;"><strong>Billing Amount:</strong></td><td style="padding: 4px 0; color: #1f2933;">${amount}</td></tr>
        ${hasTrial ? `<tr><td style="padding: 4px 0; color: #6b7280;"><strong>Free Trial Start Date:</strong></td><td style="padding: 4px 0; color: #1f2933;">${trialStartDate}</td></tr>` : ''}
        ${hasTrial ? `<tr><td style="padding: 4px 0; color: #6b7280;"><strong>Free Trial End Date:</strong></td><td style="padding: 4px 0; color: #1f2933;">${trialEndDate}</td></tr>` : ''}
      </table>
    </div>`;

  const billingCancellationHtml = hasTrial
    ? `
      <h3 style="margin: 24px 0 12px; color: #2f498b; font-size: 16px;">Billing & Cancellation</h3>
      <p style="margin: 0 0 16px; line-height: 1.6; color: #1f2933;">
        You may cancel anytime during the trial period — no questions asked.
      </p>
      <p style="margin: 0 0 16px; line-height: 1.6; color: #1f2933;">
        If your subscription is not canceled before the trial ends, your credit card will be automatically charged ${amount} for the ${subType} ${normalizedTier} Subscription you selected.
      </p>
      <p style="margin: 0 0 16px; line-height: 1.6; color: #1f2933;">
        After the trial, you may still cancel anytime, and your access will continue through the end of your current billing period.
      </p>`
    : `
      <h3 style="margin: 24px 0 12px; color: #2f498b; font-size: 16px;">Billing & Cancellation</h3>
      <p style="margin: 0 0 16px; line-height: 1.6; color: #1f2933;">
        You may cancel anytime, and your access will continue through the end of your current billing period.
      </p>`;

  await sendEmail({
    to: email,
    subject: `Welcome to AOM Trading ${normalizedTier} — Your subscription is active`,
    text: textLines.join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2933; background-color: #f6f9fc; padding: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 18px rgba(31, 41, 51, 0.08);">
          <tr>
            <td style="padding: 32px 32px 24px;">
              <p style="margin: 0 0 16px; line-height: 1.6;">Hi ${safeName},</p>
              <p style="margin: 0 0 16px; line-height: 1.6; color: #1f2933;">
                Welcome to the AOM Trading ${normalizedTier} — your subscription is now active and ready to use.
              </p>
              ${hasTrial ? `<p style="margin: 0 0 16px; line-height: 1.6; color: #1f2933;">As part of your signup, your ${normalizedTier} Plan includes a 3-month free trial.</p>` : ''}

              ${subscriptionDetailsHtml}

              ${billingCancellationHtml}

              <h3 style="margin: 24px 0 12px; color: #2f498b; font-size: 16px;">Here's what you can access</h3>
              <ul style="margin: 0 0 16px; padding-left: 20px; color: #1f2933; line-height: 1.6;">
                ${listItems.map((item) => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
              </ul>

              ${hasTrial ? `<p style="margin: 16px 0; line-height: 1.6; color: #1f2933;">Once again, your free trial access runs through ${trialEndDate}.</p>` : ''}

              <p style="margin: 24px 0 0; line-height: 1.6; color: #445566; font-size: 14px;">
                If you need support, contact us at <a href="mailto:info@aomtrading.com" style="color:#2f498b;">info@aomtrading.com</a>.
              </p>
              <p style="margin: 16px 0 0; line-height: 1.6; color: #1f2933;">
                Welcome aboard,<br/>
                AOM Trading
              </p>
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
    `,
  });
}

export async function sendSubscriptionUpgradeEmail({
  email,
  firstName,
  subscriptionType,
  billingAmount,
  upgradeDate,
  billingNote,
}: {
  email: string;
  firstName: string;
  subscriptionType: 'monthly' | 'annual';
  billingAmount: number;
  upgradeDate?: string;
  billingNote?: string;
}): Promise<void> {
  const safeName = firstName?.trim() || 'Customer';
  const subType = subscriptionType === 'monthly' ? 'Monthly' : 'Annual';
  const amount = `$${(billingAmount / 100).toFixed(2)}`;
  const effectiveDate = upgradeDate
    ? new Date(upgradeDate).toLocaleDateString()
    : new Date().toLocaleDateString();

  const defaultBillingNote = billingNote || `Your billing has been prorated, and your new billing cycle begins on ${effectiveDate}.`;

  const premiumFeatures = [
    'Everything in the Basic Plan',
    'Premium trading tools and advanced features',
    'Ongoing course content, software updates, and support',
    'Expanded functionality to help you trade with more confidence, precision, and control',
  ];

  const textBody = [
    `Hi ${safeName},`,
    '',
    `Your upgrade from AOM Trading Basic to AOM Trading Premium has been successfully processed — welcome to Premium.`,
    '',
    `You now have access to the full AOM Trading experience, including all Basic features plus Premium tools and advanced functionality designed to support a more structured path from analysis to execution.`,
    '',
    'Subscription Details',
    'Plan: AOM Trading Premium',
    `Subscription Type: ${subType}`,
    `Billing Amount: ${amount}`,
    `Upgrade Effective Date: ${effectiveDate}`,
    '',
    'Billing & Cancellation',
    `Your Premium ${subType} Subscription is now active as of ${effectiveDate}.`,
    '',
    `Billing Note: ${defaultBillingNote}`,
    '',
    `Please note: Premium subscriptions do not include a free trial period.`,
    '',
    `You may cancel anytime, and your access will continue through the end of your current billing period.`,
    '',
    'What your Premium access now includes',
    ...premiumFeatures.map((item) => `- ${item}`),
    '',
    `We're excited to have you in Premium and look forward to supporting your continued progress.`,
    '',
    'If you need support, contact us at info@aomtrading.com.',
    '',
    'Welcome to Premium,',
    'AOM Trading',
  ].join('\n');

  const subscriptionDetailsHtml = `
    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin: 0 0 12px; color: #2f498b; font-size: 16px;">Subscription Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #6b7280;"><strong>Plan:</strong></td><td style="padding: 4px 0; color: #1f2933;">AOM Trading Premium</td></tr>
        <tr><td style="padding: 4px 0; color: #6b7280;"><strong>Subscription Type:</strong></td><td style="padding: 4px 0; color: #1f2933;">${subType}</td></tr>
        <tr><td style="padding: 4px 0; color: #6b7280;"><strong>Billing Amount:</strong></td><td style="padding: 4px 0; color: #1f2933;">${amount}</td></tr>
        <tr><td style="padding: 4px 0; color: #6b7280;"><strong>Upgrade Effective Date:</strong></td><td style="padding: 4px 0; color: #1f2933;">${effectiveDate}</td></tr>
      </table>
    </div>`;

  await sendEmail({
    to: email,
    subject: 'Welcome to AOM Trading Premium — Your upgrade is complete',
    text: textBody,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2933; background-color: #f6f9fc; padding: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 18px rgba(31, 41, 51, 0.08);">
          <tr>
            <td style="padding: 32px 32px 24px;">
              <p style="margin: 0 0 16px; line-height: 1.6;">Hi ${safeName},</p>
              <p style="margin: 0 0 16px; line-height: 1.6; color: #1f2933;">
                Your upgrade from AOM Trading Basic to AOM Trading Premium has been successfully processed — welcome to Premium.
              </p>
              <p style="margin: 0 0 16px; line-height: 1.6; color: #1f2933;">
                You now have access to the full AOM Trading experience, including all Basic features plus Premium tools and advanced functionality designed to support a more structured path from analysis to execution.
              </p>

              ${subscriptionDetailsHtml}

              <h3 style="margin: 24px 0 12px; color: #2f498b; font-size: 16px;">Billing & Cancellation</h3>
              <p style="margin: 0 0 16px; line-height: 1.6; color: #1f2933;">
                Your Premium ${subType} Subscription is now active as of ${effectiveDate}.
              </p>
              <p style="margin: 0 0 16px; line-height: 1.6; color: #445566; font-size: 14px;">
                <strong>Billing Note:</strong> ${defaultBillingNote}
              </p>
              <p style="margin: 0 0 16px; line-height: 1.6; color: #1f2933;">
                Please note: Premium subscriptions do not include a free trial period.
              </p>
              <p style="margin: 0 0 16px; line-height: 1.6; color: #1f2933;">
                You may cancel anytime, and your access will continue through the end of your current billing period.
              </p>

              <h3 style="margin: 24px 0 12px; color: #2f498b; font-size: 16px;">What your Premium access now includes</h3>
              <ul style="margin: 0 0 16px; padding-left: 20px; color: #1f2933; line-height: 1.6;">
                ${premiumFeatures.map((item) => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
              </ul>

              <p style="margin: 16px 0; line-height: 1.6; color: #1f2933;">
                We're excited to have you in Premium and look forward to supporting your continued progress.
              </p>

              <p style="margin: 24px 0 0; line-height: 1.6; color: #445566; font-size: 14px;">
                If you need support, contact us at <a href="mailto:info@aomtrading.com" style="color:#2f498b;">info@aomtrading.com</a>.
              </p>
              <p style="margin: 16px 0 0; line-height: 1.6; color: #1f2933;">
                Welcome to Premium,<br/>
                AOM Trading
              </p>
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
    `,
  });
}

export async function sendSubscriptionCancellationEmail({
  email,
  firstName,
  tier,
  subscriptionType,
  billingAmount,
  cancelledAt,
}: {
  email: string;
  firstName: string;
  tier: 'basic' | 'premium';
  subscriptionType: 'monthly' | 'annual';
  billingAmount: number;
  cancelledAt?: string;
}): Promise<void> {
  const safeName = firstName?.trim() || 'Customer';
  const normalizedTier = tier === 'premium' ? 'Premium' : 'Basic';
  const planName = `AOM Trading ${normalizedTier}`;
  const subType = subscriptionType === 'monthly' ? 'Monthly' : 'Annual';
  const cancelDate = cancelledAt
    ? new Date(cancelledAt).toLocaleDateString()
    : new Date().toLocaleDateString();
  const amount = `$${(billingAmount / 100).toFixed(2)}`;

  const textBody = [
    `Hi ${safeName},`,
    '',
    `We've processed your ${normalizedTier} Subscription cancellation, effective ${cancelDate}.`,
    '',
    'Subscription Details',
    `Plan: ${planName}`,
    `Subscription Type: ${subType}`,
    `Billing Amount: ${amount}`,
    `Cancellation Effective Date: ${cancelDate}`,
    '',
    'Access & Cancellation',
    `You'll still have full access through the end of your current billing period.`,
    '',
    `Until then, you'll have time to:`,
    '- Continue using your course content until your subscription ends',
    '- Download any software or materials you may want before access expires',
    '',
    'No further charges will be made after your current billing period ends, unless you choose to resubscribe.',
    '',
    `We appreciate the time you spent with AOM Trading, and we're glad to have been part of your trading journey.`,
    '',
    `If there's anything we can do to help, or if you'd like help finding a plan that fits better in the future, just contact us at info@aomtrading.com.`,
    '',
    'Wishing you all the best,',
    'AOM Trading'
  ].join('\n');

  const subscriptionDetailsHtml = `
    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin: 0 0 12px; color: #2f498b; font-size: 16px;">Subscription Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #6b7280;"><strong>Plan:</strong></td><td style="padding: 4px 0; color: #1f2933;">${planName}</td></tr>
        <tr><td style="padding: 4px 0; color: #6b7280;"><strong>Subscription Type:</strong></td><td style="padding: 4px 0; color: #1f2933;">${subType}</td></tr>
        <tr><td style="padding: 4px 0; color: #6b7280;"><strong>Billing Amount:</strong></td><td style="padding: 4px 0; color: #1f2933;">${amount}</td></tr>
        <tr><td style="padding: 4px 0; color: #6b7280;"><strong>Cancellation Effective Date:</strong></td><td style="padding: 4px 0; color: #1f2933;">${cancelDate}</td></tr>
      </table>
    </div>`;

  await sendEmail({
    to: email,
    subject: `Your ${normalizedTier} subscription has been cancelled`,
    text: textBody,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2933; background-color: #f6f9fc; padding: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 18px rgba(31, 41, 51, 0.08);">
          <tr>
            <td style="padding: 32px 32px 24px;">
              <p style="margin: 0 0 16px; line-height: 1.6;">Hi ${safeName},</p>
              <p style="margin: 0 0 16px; line-height: 1.6; color: #1f2933;">
                We've processed your ${normalizedTier} Subscription cancellation, effective ${cancelDate}.
              </p>

              ${subscriptionDetailsHtml}

              <h3 style="margin: 24px 0 12px; color: #2f498b; font-size: 16px;">Access & Cancellation</h3>
              <p style="margin: 0 0 16px; line-height: 1.6; color: #1f2933;">
                You'll still have full access through the end of your current billing period.
              </p>
              <p style="margin: 0 0 12px; line-height: 1.6; color: #1f2933;">Until then, you'll have time to:</p>
              <ul style="margin: 0 0 16px; padding-left: 20px; color: #1f2933; line-height: 1.6;">
                <li style="margin-bottom: 8px;">Continue using your course content until your subscription ends</li>
                <li style="margin-bottom: 8px;">Download any software or materials you may want before access expires</li>
              </ul>
              <p style="margin: 0 0 16px; line-height: 1.6; color: #1f2933;">
                No further charges will be made after your current billing period ends, unless you choose to resubscribe.
              </p>
              <p style="margin: 0 0 16px; line-height: 1.6; color: #1f2933;">
                We appreciate the time you spent with AOM Trading, and we're glad to have been part of your trading journey.
              </p>
              <p style="margin: 24px 0 0; line-height: 1.6; color: #445566; font-size: 14px;">
                If there's anything we can do to help, or if you'd like help finding a plan that fits better in the future, just contact us at <a href="mailto:info@aomtrading.com" style="color:#2f498b;">info@aomtrading.com</a>.
              </p>
              <p style="margin: 16px 0 0; line-height: 1.6; color: #1f2933;">
                Wishing you all the best,<br/>
                AOM Trading
              </p>
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
    `,
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
