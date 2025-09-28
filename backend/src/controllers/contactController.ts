import { Request, Response } from 'express';
import { sendEmail } from '../services/mailgunService';

const INFO_EMAIL = 'info@aomtrading.com';

export const submitInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, question } = req.body || {};

    if (!name || !email || !question) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and question are required.'
      });
      return;
    }

    const safeName = String(name).trim();
    const safeEmail = String(email).trim();
    const safeQuestion = String(question).trim();

    if (!safeName || !safeEmail || !safeQuestion) {
      res.status(400).json({
        success: false,
        message: 'Please provide valid values for all fields.'
      });
      return;
    }

    const subject = `[Inquiry] Message from ${safeName}`;
    const textBody = `New inquiry received:\n\nName: ${safeName}\nEmail: ${safeEmail}\n\nQuestion:\n${safeQuestion}`;
    const htmlBody = `
      <h2>New Inquiry</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <h3>Question</h3>
      <p style="white-space:pre-line;">${safeQuestion}</p>
    `;

    await sendEmail({
      to: INFO_EMAIL,
      subject,
      text: textBody,
      html: htmlBody,
      replyTo: safeEmail,
    });

    res.json({
      success: true,
      message: 'Thank you! Your inquiry has been sent.'
    });
  } catch (error) {
    console.error('❌ Inquiry submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry.'
    });
  }
};

export default {
  submitInquiry,
};
