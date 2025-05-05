import express from 'express';
import { query } from '../db.js';
import { authenticateToken, isTeacher } from '../middleware/auth.js';
import { courseSchema, lessonSchema } from '../middleware/validation.js';

const router = express.Router();

// Get all courses
router.get('/', async (req, res, next) => {
  try {
    const { level, limit = 10, offset = 0 } = req.query;
    
    // Build query with optional filter
    let queryText = `
      SELECT 
        c.id, c.title, c.description, c.level, c.image_url, c.created_at,
        u.username AS created_by_username,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) AS lesson_count
      FROM courses c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    if (level) {
      queryText += ` AND c.level = $${paramIndex}`;
      queryParams.push(level);
      paramIndex++;
    }
    
    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) FROM courses
      WHERE 1=1
      ${level ? ` AND level = $1` : ''}
    `;
    
    // Add sorting and pagination
    queryText += ` ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Execute queries
    const [coursesResult, countResult] = await Promise.all([
      query(queryText, queryParams),
      query(countQuery, level ? [level] : [])
    ]);
    
    res.json({
      total: parseInt(countResult.rows[0].count),
      courses: coursesResult.rows
    });
  } catch (err) {
    next(err);
  }
});

// Get a specific course by ID
router.get('/:id', async (req, res, next) => {
  try {
    const courseId = req.params.id;
    
    // Get course details
    const courseResult = await query(
      `SELECT 
        c.id, c.title, c.description, c.level, c.image_url, c.created_at,
        u.username AS created_by_username
      FROM courses c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = $1`,
      [courseId]
    );
    
    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }
    
    // Get lessons for this course
    const lessonsResult = await query(
      `SELECT 
        id, title, order_number, points
      FROM lessons
      WHERE course_id = $1
      ORDER BY order_number`,
      [courseId]
    );
    
    res.json({
      course: courseResult.rows[0],
      lessons: lessonsResult.rows
    });
  } catch (err) {
    next(err);
  }
});

// Create a new course (teachers only)
router.post('/', authenticateToken, isTeacher, async (req, res, next) => {
  try {
    // Validate request body
    const { error } = courseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        status: 'error', 
        message: error.details[0].message 
      });
    }
    
    const { title, description, level, image_url } = req.body;
    
    const result = await query(
      `INSERT INTO courses (
        title, description, level, image_url, created_by
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [title, description, level, image_url || null, req.user.id]
    );
    
    const courseId = result.rows[0].id;
    
    res.status(201).json({
      status: 'success',
      message: 'Course created successfully',
      courseId
    });
  } catch (err) {
    next(err);
  }
});

// Get a specific lesson by ID
router.get('/:courseId/lessons/:lessonId', authenticateToken, async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;
    
    // Get lesson details
    const lessonResult = await query(
      `SELECT 
        id, course_id, title, content, order_number, points
      FROM lessons
      WHERE id = $1 AND course_id = $2`,
      [lessonId, courseId]
    );
    
    if (lessonResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Lesson not found'
      });
    }
    
    const lesson = lessonResult.rows[0];
    
    // Check if user is enrolled in course, if not, enroll them
    const enrollmentCheck = await query(
      'SELECT id FROM user_courses WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );
    
    if (enrollmentCheck.rows.length === 0) {
      await query(
        `INSERT INTO user_courses (user_id, course_id, last_accessed)
        VALUES ($1, $2, NOW())`,
        [userId, courseId]
      );
    } else {
      // Update last accessed time
      await query(
        'UPDATE user_courses SET last_accessed = NOW() WHERE user_id = $1 AND course_id = $2',
        [userId, courseId]
      );
    }
    
    // Get completion status
    const completionResult = await query(
      'SELECT completed, completed_at FROM user_lessons WHERE user_id = $1 AND lesson_id = $2',
      [userId, lessonId]
    );
    
    const isCompleted = completionResult.rows.length > 0 && completionResult.rows[0].completed;
    const completedAt = completionResult.rows.length > 0 ? completionResult.rows[0].completed_at : null;
    
    // Get previous and next lessons for navigation
    const navResult = await query(
      `SELECT
        (SELECT id FROM lessons WHERE course_id = $1 AND order_number < $2 ORDER BY order_number DESC LIMIT 1) AS prev_id,
        (SELECT id FROM lessons WHERE course_id = $1 AND order_number > $2 ORDER BY order_number ASC LIMIT 1) AS next_id
      `,
      [courseId, lesson.order_number]
    );
    
    res.json({
      lesson,
      completion: {
        completed: isCompleted,
        completed_at: completedAt
      },
      navigation: {
        previous_id: navResult.rows[0].prev_id,
        next_id: navResult.rows[0].next_id
      }
    });
  } catch (err) {
    next(err);
  }
});

// Add a lesson to a course (teachers only)
router.post('/:id/lessons', authenticateToken, isTeacher, async (req, res, next) => {
  try {
    const courseId = req.params.id;
    
    // Check if course exists
    const courseCheck = await query(
      'SELECT id FROM courses WHERE id = $1',
      [courseId]
    );
    
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }
    
    // Validate request body
    const lessonData = { ...req.body, course_id: parseInt(courseId) };
    const { error } = lessonSchema.validate(lessonData);
    if (error) {
      return res.status(400).json({ 
        status: 'error', 
        message: error.details[0].message 
      });
    }
    
    const { title, content, order_number, points } = req.body;
    
    // Insert lesson
    const result = await query(
      `INSERT INTO lessons (
        course_id, title, content, order_number, points
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [courseId, title, content, order_number, points || 0]
    );
    
    const lessonId = result.rows[0].id;
    
    res.status(201).json({
      status: 'success',
      message: 'Lesson added successfully',
      lessonId
    });
  } catch (err) {
    next(err);
  }
});

// Mark a lesson as completed
router.post('/:courseId/lessons/:lessonId/complete', authenticateToken, async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;
    
    // Check if lesson exists and belongs to the course
    const lessonCheck = await query(
      'SELECT id, points FROM lessons WHERE id = $1 AND course_id = $2',
      [lessonId, courseId]
    );
    
    if (lessonCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Lesson not found'
      });
    }
    
    // Check if already completed
    const completionCheck = await query(
      'SELECT id, completed FROM user_lessons WHERE user_id = $1 AND lesson_id = $2',
      [userId, lessonId]
    );
    
    const client = await query('BEGIN');
    
    try {
      if (completionCheck.rows.length === 0) {
        // First time completing
        await query(
          `INSERT INTO user_lessons (user_id, lesson_id, completed, completed_at)
          VALUES ($1, $2, true, NOW())`,
          [userId, lessonId]
        );
        
        // Award points
        await query(
          'UPDATE users SET points = points + $1 WHERE id = $2',
          [lessonCheck.rows[0].points, userId]
        );
      } else if (!completionCheck.rows[0].completed) {
        // Update existing record
        await query(
          `UPDATE user_lessons SET completed = true, completed_at = NOW()
          WHERE id = $1`,
          [completionCheck.rows[0].id]
        );
        
        // Award points
        await query(
          'UPDATE users SET points = points + $1 WHERE id = $2',
          [lessonCheck.rows[0].points, userId]
        );
      }
      
      // Calculate course progress
      const progressResult = await query(
        `SELECT 
          (SELECT COUNT(*) FROM user_lessons ul
           JOIN lessons l ON ul.lesson_id = l.id
           WHERE l.course_id = $1 AND ul.user_id = $2 AND ul.completed = true) AS completed_count,
          (SELECT COUNT(*) FROM lessons WHERE course_id = $1) AS total_count
        `,
        [courseId, userId]
      );
      
      const { completed_count, total_count } = progressResult.rows[0];
      const progress = Math.round((completed_count / total_count) * 100);
      const isCompleted = progress >= 100;
      
      // Update course progress
      await query(
        `INSERT INTO user_courses (user_id, course_id, progress, completed, last_accessed)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (user_id, course_id)
        DO UPDATE SET progress = $3, completed = $4, last_accessed = NOW()`,
        [userId, courseId, progress, isCompleted]
      );
      
      await query('COMMIT');
      
      res.json({
        status: 'success',
        message: 'Lesson marked as completed',
        progress,
        course_completed: isCompleted
      });
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

// Get user's enrolled courses
router.get('/enrolled', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await query(
      `SELECT 
        c.id, c.title, c.description, c.level, c.image_url,
        uc.progress, uc.completed, uc.last_accessed,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) AS lesson_count,
        (SELECT COUNT(*) FROM user_lessons ul 
         JOIN lessons l ON ul.lesson_id = l.id 
         WHERE l.course_id = c.id AND ul.user_id = $1 AND ul.completed = true) AS completed_lessons
      FROM courses c
      JOIN user_courses uc ON c.id = uc.course_id
      WHERE uc.user_id = $1
      ORDER BY uc.last_accessed DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;