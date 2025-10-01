import { Request, Response } from 'express';
import pool from '../config/database';

const getUserId = (req: Request): string | null => {
  const user = req.user as { id?: string } | undefined;
  return user?.id ?? null;
};

export const getCourseProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const [lessonResult, quizResult] = await Promise.all([
      pool.query(
        `SELECT chapter_id, lesson_id, completed_at
         FROM course_lesson_progress
         WHERE user_id = $1
         ORDER BY completed_at DESC`,
        [userId]
      ),
      pool.query(
        `SELECT chapter_id, quiz_id, score, passed, attempts, completed_at
         FROM course_quiz_progress
         WHERE user_id = $1
         ORDER BY completed_at DESC`,
        [userId]
      )
    ]);

    res.json({
      success: true,
      data: {
        lessons: lessonResult.rows.map(row => ({
          chapterId: row.chapter_id,
          lessonId: row.lesson_id,
          completedAt: row.completed_at,
        })),
        quizzes: quizResult.rows.map(row => ({
          chapterId: row.chapter_id,
          quizId: row.quiz_id,
          score: row.score,
          passed: row.passed,
          attempts: row.attempts,
          completedAt: row.completed_at,
        })),
      }
    });
  } catch (error) {
    console.error('Failed to load course progress:', error);
    res.status(500).json({ success: false, message: 'Failed to load course progress' });
  }
};

export const markLessonComplete = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { lessonId, chapterId } = req.body ?? {};

    if (typeof lessonId !== 'string' || !lessonId.trim()) {
      res.status(400).json({ success: false, message: 'lessonId is required' });
      return;
    }

    if (typeof chapterId !== 'string' || !chapterId.trim()) {
      res.status(400).json({ success: false, message: 'chapterId is required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO course_lesson_progress (user_id, chapter_id, lesson_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, lesson_id)
       DO UPDATE SET chapter_id = $2, completed_at = CURRENT_TIMESTAMP
       RETURNING lesson_id, chapter_id, completed_at`,
      [userId, chapterId.trim(), lessonId.trim()]
    );

    res.json({
      success: true,
      data: {
        lessonId: result.rows[0].lesson_id,
        chapterId: result.rows[0].chapter_id,
        completedAt: result.rows[0].completed_at,
      }
    });
  } catch (error) {
    console.error('Failed to mark lesson complete:', error);
    res.status(500).json({ success: false, message: 'Failed to mark lesson as completed' });
  }
};

export const markQuizComplete = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { quizId, chapterId, score, passed } = req.body ?? {};

    if (typeof quizId !== 'string' || !quizId.trim()) {
      res.status(400).json({ success: false, message: 'quizId is required' });
      return;
    }

    if (typeof chapterId !== 'string' || !chapterId.trim()) {
      res.status(400).json({ success: false, message: 'chapterId is required' });
      return;
    }

    const normalizedScore = typeof score === 'number' ? Math.round(score) : null;
    const passedFlag = !!passed;

    const result = await pool.query(
      `INSERT INTO course_quiz_progress (user_id, chapter_id, quiz_id, score, passed, attempts)
       VALUES ($1, $2, $3, $4, $5, 1)
       ON CONFLICT (user_id, quiz_id)
       DO UPDATE SET
         chapter_id = EXCLUDED.chapter_id,
         score = EXCLUDED.score,
         passed = EXCLUDED.passed,
         attempts = course_quiz_progress.attempts + 1,
         completed_at = CURRENT_TIMESTAMP
       RETURNING quiz_id, chapter_id, score, passed, attempts, completed_at`,
      [userId, chapterId.trim(), quizId.trim(), normalizedScore, passedFlag]
    );

    res.json({
      success: true,
      data: {
        quizId: result.rows[0].quiz_id,
        chapterId: result.rows[0].chapter_id,
        score: result.rows[0].score,
        passed: result.rows[0].passed,
        attempts: result.rows[0].attempts,
        completedAt: result.rows[0].completed_at,
      }
    });
  } catch (error) {
    console.error('Failed to record quiz result:', error);
    res.status(500).json({ success: false, message: 'Failed to record quiz result' });
  }
};

export default {
  getCourseProgress,
  markLessonComplete,
  markQuizComplete,
};
