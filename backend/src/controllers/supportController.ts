import { Request, Response } from 'express';
import { sendEmail } from '../services/mailgunService';

const SUPPORT_EMAIL = 'support@aomtrading.com';

export const submitSupportRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, issue, urgency } = req.body || {};

    if (!name || !email || !issue || !urgency) {
      res.status(400).json({
        success: false,
        message: 'Name, email, issue, and urgency are required.'
      });
      return;
    }

    const safeName = String(name).trim();
    const safeEmail = String(email).trim();
    const safeIssue = String(issue).trim();
    const safeUrgency = String(urgency).trim().toUpperCase();

    if (!safeName || !safeEmail || !safeIssue || !safeUrgency) {
      res.status(400).json({
        success: false,
        message: 'Please provide valid values for all fields.'
      });
      return;
    }

    const subject = `[Support] (${safeUrgency}) New request from ${safeName}`;
    const textBody = `Support request received:\n\nName: ${safeName}\nEmail: ${safeEmail}\nUrgency: ${safeUrgency}\n\nIssue:\n${safeIssue}`;
    const htmlBody = `
      <h2>Support Request</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Urgency:</strong> ${safeUrgency}</p>
      <h3>Issue</h3>
      <p style="white-space:pre-line;">${safeIssue}</p>
    `;

    await sendEmail({
      to: SUPPORT_EMAIL,
      subject,
      text: textBody,
      html: htmlBody,
      replyTo: safeEmail,
    });

    res.json({
      success: true,
      message: 'Support request submitted successfully.'
    });
  } catch (error) {
    console.error('❌ Support request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit support request.'
    });
  }
};

export default {
  submitSupportRequest,
};
