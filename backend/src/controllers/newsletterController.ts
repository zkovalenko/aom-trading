import { Request, Response } from 'express';
import pool from '../config/database';

export const subscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, firstName, lastName } = req.body ?? {};

    if (typeof email !== 'string' || !email.trim()) {
      res.status(400).json({ success: false, message: 'Email is required.' });
      return;
    }

    if (typeof firstName !== 'string' || !firstName.trim()) {
      res.status(400).json({ success: false, message: 'First name is required.' });
      return;
    }

    if (typeof lastName !== 'string' || !lastName.trim()) {
      res.status(400).json({ success: false, message: 'Last name is required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const safeFirstName = firstName.trim();
    const safeLastName = lastName.trim();

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      res.json({
        success: true,
        message: 'You are already subscribed to our updates.'
      });
      return;
    }

    await pool.query(
      `INSERT INTO users (email, first_name, last_name, created_at, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [normalizedEmail, safeFirstName, safeLastName]
    );

    res.json({
      success: true,
      message: 'Thanks for subscribing! We will keep you up to date with new releases.'
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ success: false, message: 'Unable to subscribe right now. Please try again later.' });
  }
};

export default { subscribeNewsletter };
