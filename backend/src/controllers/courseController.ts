import { Request, Response } from 'express';
import pool from '../config/database';

export const getUserCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Get user's active courses using purchased_at and expires_at columns
    const userCoursesResult = await pool.query(
      `SELECT 
        uc.id as user_course_id,
        uc.user_id,
        uc.course_id,
        uc.purchased_at,
        uc.expires_at,
        uc.progress,
        c.id,
        c.name,
        c.description,
        c.price,
        c.duration_days,
        c.is_active,
        c.created_at as course_created_at,
        c.updated_at as course_updated_at,
        CASE 
          WHEN uc.expires_at > CURRENT_TIMESTAMP THEN true 
          ELSE false 
        END as has_access,
        CASE 
          WHEN uc.expires_at > CURRENT_TIMESTAMP THEN 
            EXTRACT(EPOCH FROM (uc.expires_at - CURRENT_TIMESTAMP)) / 86400
          ELSE 0 
        END as days_remaining
      FROM user_courses uc
      INNER JOIN courses c ON uc.course_id = c.id
      WHERE uc.user_id = $1
      ORDER BY uc.purchased_at DESC`,
      [(req.user as any)?.id]
    );

    // Separate active and expired courses
    const activeCourses = userCoursesResult.rows.filter(course => course.has_access);
    const expiredCourses = userCoursesResult.rows.filter(course => !course.has_access);

    res.json({
      success: true,
      data: {
        activeCourses: activeCourses.map(course => ({
          userCourseId: course.user_course_id,
          courseId: course.course_id,
          purchasedAt: course.purchased_at,
          expiresAt: course.expires_at,
          progress: course.progress || 0,
          daysRemaining: Math.ceil(course.days_remaining),
          course: {
            id: course.id,
            name: course.name,
            description: course.description,
            price: course.price,
            durationDays: course.duration_days,
            isActive: course.is_active,
            createdAt: course.course_created_at,
            updatedAt: course.course_updated_at
          }
        })),
        expiredCourses: expiredCourses.map(course => ({
          userCourseId: course.user_course_id,
          courseId: course.course_id,
          purchasedAt: course.purchased_at,
          expiresAt: course.expires_at,
          progress: course.progress || 0,
          course: {
            id: course.id,
            name: course.name,
            description: course.description,
            price: course.price,
            durationDays: course.duration_days,
            isActive: course.is_active,
            createdAt: course.course_created_at,
            updatedAt: course.course_updated_at
          }
        })),
        totalCourses: userCoursesResult.rows.length,
        activeCourseCount: activeCourses.length,
        expiredCourseCount: expiredCourses.length
      }
    });
  } catch (error) {
    console.error('Get user courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user courses'
    });
  }
};

export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all active courses
    const coursesResult = await pool.query(
      'SELECT id, name, description, price, duration_days, is_active, created_at, updated_at FROM courses WHERE is_active = true ORDER BY created_at DESC'
    );

    // If user is authenticated, check which courses they have access to
    let userCourseAccess: any[] = [];
    if (req.user) {
      const currentUser = req.user as any;
      const userAccessResult = await pool.query(
        'SELECT course_id, expires_at > CURRENT_TIMESTAMP as has_access FROM user_courses WHERE user_id = $1',
        [currentUser.id]
      );
      userCourseAccess = userAccessResult.rows;
    }

    const coursesWithAccess = coursesResult.rows.map(course => {
      const accessInfo = userCourseAccess.find((access: any) => access.course_id === course.id);
      return {
        id: course.id,
        name: course.name,
        description: course.description,
        price: course.price,
        durationDays: course.duration_days,
        isActive: course.is_active,
        createdAt: course.created_at,
        updatedAt: course.updated_at,
        hasAccess: accessInfo ? accessInfo.has_access : false
      };
    });

    res.json({
      success: true,
      data: {
        courses: coursesWithAccess
      }
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve courses'
    });
  }
};

export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
      return;
    }

    // Get course details
    const courseResult = await pool.query(
      'SELECT id, name, description, price, duration_days, is_active, created_at, updated_at FROM courses WHERE id = $1',
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    const course = courseResult.rows[0];

    // Check user access if authenticated
    let hasAccess = false;
    let userCourseInfo: any = null;

    if (req.user) {
      const currentUser = req.user as any;
      const userAccessResult = await pool.query(
        'SELECT purchased_at, expires_at, progress, expires_at > CURRENT_TIMESTAMP as has_access FROM user_courses WHERE user_id = $1 AND course_id = $2',
        [currentUser.id, courseId]
      );

      if (userAccessResult.rows.length > 0) {
        const accessData = userAccessResult.rows[0];
        hasAccess = accessData.has_access;
        userCourseInfo = {
          purchasedAt: accessData.purchased_at,
          expiresAt: accessData.expires_at,
          progress: accessData.progress || 0,
          hasAccess: hasAccess
        };
      }
    }

    res.json({
      success: true,
      data: {
        course: {
          id: course.id,
          name: course.name,
          description: course.description,
          price: course.price,
          durationDays: course.duration_days,
          isActive: course.is_active,
          createdAt: course.created_at,
          updatedAt: course.updated_at,
          hasAccess: hasAccess
        },
        userAccess: userCourseInfo
      }
    });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course'
    });
  }
};

export const updateCourseProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { courseId } = req.params;
    const { progress } = req.body;

    if (!courseId) {
      res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
      return;
    }

    if (progress === undefined || progress < 0 || progress > 100) {
      res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100'
      });
      return;
    }

    // Check if user has access to the course
    const currentUser = req.user as any;
    const accessResult = await pool.query(
      'SELECT id, expires_at > CURRENT_TIMESTAMP as has_access FROM user_courses WHERE user_id = $1 AND course_id = $2',
      [currentUser.id, courseId]
    );

    if (accessResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Course access not found'
      });
      return;
    }

    if (!accessResult.rows[0].has_access) {
      res.status(403).json({
        success: false,
        message: 'Course access has expired'
      });
      return;
    }

    // Update progress
    const updateResult = await pool.query(
      'UPDATE user_courses SET progress = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND course_id = $3 RETURNING *',
      [progress, currentUser.id, courseId]
    );

    res.json({
      success: true,
      message: 'Course progress updated successfully',
      data: {
        userCourseId: updateResult.rows[0].id,
        courseId: courseId,
        progress: updateResult.rows[0].progress,
        updatedAt: updateResult.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Update course progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course progress'
    });
  }
};