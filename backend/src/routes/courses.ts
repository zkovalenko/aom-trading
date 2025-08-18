import express from 'express';
import { 
  getUserCourses, 
  getAllCourses, 
  getCourseById, 
  updateCourseProgress 
} from '../controllers/courseController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = express.Router();

// Get all available courses (public, but shows access status if authenticated)
router.get('/', optionalAuth, getAllCourses);

// Get specific course by ID (public, but shows access status if authenticated)
router.get('/:courseId', optionalAuth, getCourseById);

// Get user's enrolled courses (protected)
router.get('/user/enrolled', authenticateToken, getUserCourses);

// Update course progress (protected)
router.put('/:courseId/progress', authenticateToken, updateCourseProgress);

// Get course content/materials (protected - requires course access)
router.get('/:courseId/content', authenticateToken, async (req, res): Promise<void> => {
  try {
    const { courseId } = req.params;
    
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Check if user has access to the course
    const pool = require('../config/database').default;
    const currentUser = req.user as any;
    const accessResult = await pool.query(
      'SELECT uc.*, c.name as course_name FROM user_courses uc INNER JOIN courses c ON uc.course_id = c.id WHERE uc.user_id = $1 AND uc.course_id = $2 AND uc.expires_at > CURRENT_TIMESTAMP',
      [currentUser.id, courseId]
    );

    if (accessResult.rows.length === 0) {
      res.status(403).json({
        success: false,
        message: 'You do not have access to this course or your access has expired'
      });
      return;
    }

    const courseAccess = accessResult.rows[0];

    // Here you would typically return the actual course content
    // For now, we'll return a placeholder structure
    res.json({
      success: true,
      data: {
        courseId: courseId,
        courseName: courseAccess.course_name,
        accessInfo: {
          purchasedAt: courseAccess.purchased_at,
          expiresAt: courseAccess.expires_at,
          progress: courseAccess.progress || 0
        },
        content: {
          modules: [
            {
              id: '1',
              title: 'Introduction to Trading',
              description: 'Learn the basics of trading and market fundamentals',
              lessons: [
                {
                  id: '1-1',
                  title: 'Market Basics',
                  type: 'video',
                  duration: '15:30',
                  completed: false
                },
                {
                  id: '1-2',
                  title: 'Trading Terminology',
                  type: 'text',
                  duration: '10:00',
                  completed: false
                }
              ]
            },
            {
              id: '2',
              title: 'Advanced Strategies',
              description: 'Master advanced trading strategies and techniques',
              lessons: [
                {
                  id: '2-1',
                  title: 'Technical Analysis',
                  type: 'video',
                  duration: '25:45',
                  completed: false
                },
                {
                  id: '2-2',
                  title: 'Risk Management',
                  type: 'text',
                  duration: '15:20',
                  completed: false
                }
              ]
            }
          ]
        }
      }
    });
  } catch (error) {
    console.error('Get course content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course content'
    });
    return;
  }
});

// Mark lesson as completed (protected - requires course access)
router.post('/:courseId/lessons/:lessonId/complete', authenticateToken, async (req, res): Promise<void> => {
  try {
    const { courseId, lessonId } = req.params;
    
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Check if user has access to the course
    const pool = require('../config/database').default;
    const currentUser = req.user as any;
    const accessResult = await pool.query(
      'SELECT id FROM user_courses WHERE user_id = $1 AND course_id = $2 AND expires_at > CURRENT_TIMESTAMP',
      [currentUser.id, courseId]
    );

    if (accessResult.rows.length === 0) {
      res.status(403).json({
        success: false,
        message: 'You do not have access to this course or your access has expired'
      });
      return;
    }

    // Here you would typically update lesson completion status in a lessons progress table
    // For now, we'll just acknowledge the completion
    
    res.json({
      success: true,
      message: 'Lesson marked as completed',
      data: {
        courseId: courseId,
        lessonId: lessonId,
        completedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Mark lesson complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark lesson as completed'
    });
    return;
  }
});

export default router;