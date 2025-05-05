import express from 'express';
import { query, pool } from '../db.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Удаление всех курсов
router.post('/delete-courses', authenticateToken, isAdmin, async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    
    // Удаление связанных данных сначала
    await client.query('DELETE FROM user_lessons');
    await client.query('DELETE FROM  user_courses');
    await client.query('DELETE FROM  lessons');
    await client.query('DELETE FROM  courses');
    
    res.status(200).json({ message: 'All courses deleted successfully' });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
});

// Удаление всех турниров
router.post('/delete-tournaments', authenticateToken, isAdmin, async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Удаление связанных данных сначала
    await client.query('DELETE FROM tournament_languages');
    await client.query('DELETE FROM tournament_submissions');
    await client.query('DELETE FROM tournament_levels');
    await client.query('DELETE FROM tournament_completions');
    await client.query('DELETE FROM tournaments');
    
    await client.query('COMMIT');
    res.status(200).json({ message: 'All tournaments deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Удаление всех пользователей (кроме админов)
router.post('/delete-users', authenticateToken, isAdmin, async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Проверяем, что нет связанных данных
    const coursesCheck = await client.query('SELECT COUNT(*) FROM courses');
    const tournamentsCheck = await client.query('SELECT COUNT(*) FROM tournaments');
    
    if (parseInt(coursesCheck.rows[0].count) > 0 || parseInt(tournamentsCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Delete all courses and tournaments first' 
      });
    }
    
    // Удаляем пользователей, не являющихся админами
    await client.query(`
      DELETE FROM users 
      WHERE id != $1 AND is_admin = false
    `, [req.user.id]);
    
    await client.query('COMMIT');
    res.status(200).json({ message: 'All non-admin users deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;