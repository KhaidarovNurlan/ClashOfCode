import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const userResult = await query(
      `SELECT 
        id, username, email, role, points, rank, avatar_url, created_at 
      FROM users 
      WHERE id = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    const user = userResult.rows[0];
    
    // Get user courses progress
    const coursesResult = await query(
      `SELECT 
        c.id, c.title, c.level, c.image_url,
        uc.progress, uc.completed, uc.last_accessed
      FROM courses c
      JOIN user_courses uc ON c.id = uc.course_id
      WHERE uc.user_id = $1
      ORDER BY uc.last_accessed DESC`,
      [userId]
    );
    
    res.json({
      ...user,
      courses: coursesResult.rows
    });
  } catch (err) {
    next(err);
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, avatar_url } = req.body;
    
    // Validate username if provided
    if (username) {
      // Check if username is already taken by another user
      const usernameCheck = await query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, userId]
      );
      
      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Username is already taken'
        });
      }
    }
    
    // Build update query dynamically based on provided fields
    let updateQuery = 'UPDATE users SET updated_at = NOW()';
    const queryParams = [];
    let paramCounter = 1;
    
    if (username) {
      updateQuery += `, username = $${paramCounter}`;
      queryParams.push(username);
      paramCounter++;
    }
    
    if (avatar_url) {
      updateQuery += `, avatar_url = $${paramCounter}`;
      queryParams.push(avatar_url);
      paramCounter++;
    }
    
    // Add WHERE clause and RETURNING
    updateQuery += ` WHERE id = $${paramCounter} RETURNING id, username, email, role, points, rank, avatar_url, created_at, updated_at`;
    queryParams.push(userId);
    
    const result = await query(updateQuery, queryParams);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Get user progress in a specific course
router.get('/courses/:courseId/progress', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;
    
    // Get course progress overview
    const progressResult = await query(
      `SELECT 
        uc.progress, uc.completed, uc.last_accessed
      FROM user_courses uc
      WHERE uc.user_id = $1 AND uc.course_id = $2`,
      [userId, courseId]
    );
    
    let progress;

    // Если прогресс не найден — создаём новую запись
    if (progressResult.rows.length === 0) {
      const insertResult = await query(
        `INSERT INTO user_courses (user_id, course_id, progress, completed, last_accessed)
         VALUES ($1, $2, 0, false, NOW())
         RETURNING progress, completed, last_accessed`,
        [userId, courseId]
      );
      progress = insertResult.rows[0];
    } else {
      progress = progressResult.rows[0];
    }
    
    // Get lesson completion details
    const lessonsResult = await query(
      `SELECT 
        l.id, l.title, l.order_number,
        CASE WHEN ul.completed = true THEN true ELSE false END AS completed,
        ul.completed_at
      FROM lessons l
      LEFT JOIN user_lessons ul ON l.id = ul.lesson_id AND ul.user_id = $1
      WHERE l.course_id = $2
      ORDER BY l.order_number`,
      [userId, courseId]
    );
    
    res.json({
      ...progressResult.rows[0],
      lessons: lessonsResult.rows
    });
  } catch (err) {
    next(err);
  }
});

// Get user's challenge submissions (if relevant, but assuming the feature is no longer required, this can be removed)
router.get('/submissions', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM challenge_submissions WHERE user_id = $1',
      [userId]
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    // Get submissions with challenge info (if this is relevant, please keep the below query)
    const submissionsResult = await query(
      `SELECT 
        cs.id, cs.code, cs.language, cs.passed, cs.execution_time, cs.memory_used, cs.created_at,
        c.id AS challenge_id, c.title AS challenge_title, c.difficulty,
        t.id AS tournament_id, t.title AS tournament_title
      FROM challenge_submissions cs
      JOIN challenges c ON cs.challenge_id = c.id
      LEFT JOIN tournaments t ON cs.tournament_id = t.id
      WHERE cs.user_id = $1
      ORDER BY cs.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    res.json({
      total,
      submissions: submissionsResult.rows
    });
  } catch (err) {
    next(err);
  }
});

export default router;