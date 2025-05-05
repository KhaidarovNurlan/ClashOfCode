import express from 'express';
import { query } from '../db.js';
import { authenticateToken, isTeacher } from '../middleware/auth.js';
import { tournamentSchema } from '../middleware/validation.js';
import { runCode } from '../utils/codeRunner.js';

const router = express.Router();

// Get all tournaments
router.get('/', async (req, res, next) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const queryText = `
      SELECT 
        t.id, t.title, t.description,
        t.difficulty, t.max_participants, t.created_at,
        u.username AS created_by_username,
        (SELECT COUNT(*) FROM tournament_levels WHERE tournament_id = t.id) AS level_count,
        (SELECT COUNT(*) FROM tournament_completions WHERE tournament_id = t.id) AS participant_count
      FROM tournaments t
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const countQuery = 'SELECT COUNT(*) FROM tournaments';

    const [tournamentsResult, countResult] = await Promise.all([
      query(queryText, [limit, offset]),
      query(countQuery)
    ]);
    
    res.json({
      total: parseInt(countResult.rows[0].count),
      tournaments: tournamentsResult.rows
    });
  } catch (err) {
    next(err);
  }
});

// Get available programming languages
router.get('/languages', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM programming_languages ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get a specific tournament by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const tournamentId = req.params.id;
    const userId = req.user?.id;

    const tournamentResult = await query(
      `SELECT 
        t.id, t.title, t.description,
        t.difficulty, t.max_participants, t.created_at,
        u.username AS created_by_username
      FROM tournaments t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = $1`,
      [tournamentId]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Tournament not found'
      });
    }

    const levelsResult = await query(
      `SELECT 
        tl.id, tl.level_number, tl.expected_output, tl.required_keywords, tl.points,
        EXISTS (
          SELECT 1 FROM tournament_submissions ts 
          WHERE ts.level_id = tl.id 
          AND ts.user_id = $1 
          AND ts.passed = true
        ) as completed
      FROM tournament_levels tl
      WHERE tl.tournament_id = $2
      ORDER BY tl.level_number`,
      [userId || null, tournamentId]
    );

    const languagesResult = await query(
      `SELECT pl.name, pl.code
       FROM tournament_languages tl
       JOIN programming_languages pl ON tl.language_code = pl.code
       WHERE tl.tournament_id = $1`,
      [tournamentId]
    );

    const leaderboardResult = await query(
      `SELECT 
        u.id as user_id,
        u.username,
        tc.completion_time,
        (
          SELECT COUNT(DISTINCT ts.level_id)
          FROM tournament_submissions ts
          WHERE ts.user_id = u.id 
          AND ts.tournament_id = $1 
          AND ts.passed = true
        ) as completed_levels
      FROM tournament_completions tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.tournament_id = $1
      ORDER BY tc.completion_time ASC
      LIMIT 100`,
      [tournamentId]
    );

    let nextLevelNumber = 1;
    if (userId) {
      const userProgress = await query(
        `SELECT MAX(tl.level_number) as current_level
         FROM tournament_submissions ts
         JOIN tournament_levels tl ON ts.level_id = tl.id
         WHERE ts.user_id = $1 
         AND ts.tournament_id = $2 
         AND ts.passed = true`,
        [userId, tournamentId]
      );
      
      if (userProgress.rows[0].current_level) {
        nextLevelNumber = userProgress.rows[0].current_level + 1;
      }
    }

    res.json({
      tournament: {
        ...tournamentResult.rows[0],
        levels: levelsResult.rows,
        languages: languagesResult.rows
      },
      leaderboard: leaderboardResult.rows,
      nextLevelNumber
    });
  } catch (err) {
    next(err);
  }
});

// Create a new tournament
router.post('/', authenticateToken, isTeacher, async (req, res, next) => {
  try {
    const { 
      title, description, difficulty, max_participants, 
      languages, levels 
    } = req.body;
    
    const client = await query('BEGIN');
    
    try {
      const tournamentResult = await query(
        `INSERT INTO tournaments (
          title, description, difficulty, max_participants, created_by
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
        [title, description, difficulty, max_participants || null, req.user.id]
      );
      
      const tournamentId = tournamentResult.rows[0].id;
      
      for (const language of languages) {
        await query(
          `INSERT INTO tournament_languages (tournament_id, language_code)
           VALUES ($1, $2)`,
          [tournamentId, language]
        );
      }

      for (const level of levels) {
        await query(
          `INSERT INTO tournament_levels (
            tournament_id, level_number, expected_output,
            required_keywords, points
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            tournamentId,
            level.level_number,
            level.expected_output,
            level.required_keywords,
            level.points
          ]
        );
      }
      
      await query('COMMIT');
      
      res.status(201).json({
        status: 'success',
        message: 'Tournament created successfully',
        tournamentId
      });
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

// Submit solution for a tournament level
router.post('/:id/submit', authenticateToken, async (req, res, next) => {
  try {
    const tournamentId = req.params.id;
    const userId = req.user.id;
    const { level_id, code, languageCode } = req.body;

    // Get level details
    const levelResult = await query(
      `SELECT 
        tl.*,
        (
          SELECT COUNT(*) 
          FROM tournament_submissions ts
          WHERE ts.user_id = $1 
          AND ts.tournament_id = $2 
          AND ts.passed = true 
          AND ts.level_id IN (
            SELECT id FROM tournament_levels 
            WHERE tournament_id = $2 
            AND level_number = tl.level_number - 1
          )
        ) > 0 AS previous_level_completed
      FROM tournament_levels tl
      WHERE tl.tournament_id = $2 AND tl.level_number = $3`,
      [userId, tournamentId, level_id]
    );

    if (levelResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Level not found'
      });
    }

    const level = levelResult.rows[0];

    if (level.level_number > 1 && !level.previous_level_completed) {
      return res.status(403).json({
        status: 'error',
        message: 'Complete the previous level first'
      });
    }

    let output;
    try {
      output = await runCode(languageCode, code);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Code execution failed',
        error: error.toString()
      });
    }

    const outputMatches = output.trim() === level.expected_output.trim();
    const keywords = Array.isArray(level.required_keywords) ? level.required_keywords : [];
    const codeHasKeywords = keywords.every(keyword => code.includes(keyword));
    const passed = outputMatches && codeHasKeywords;

    try {
      await query(
        `INSERT INTO tournament_submissions
         (user_id, tournament_id, level_id, passed)
         VALUES ($1, $2, $3, $4)`,
        [userId, tournamentId, level.id, passed]
      );

      let tournamentCompleted = false;
      let nextLevelNumber = null;

      if (passed) {
        await query(
          `UPDATE users 
           SET points = points + $1 
           WHERE id = $2`,
          [level.points, userId]
        );

        const [totalLevels, completedLevels] = await Promise.all([
          query(
            'SELECT COUNT(*) FROM tournament_levels WHERE tournament_id = $1',
            [tournamentId]
          ),
          query(
            `SELECT COUNT(DISTINCT level_id) 
             FROM tournament_submissions 
             WHERE tournament_id = $1 AND user_id = $2 AND passed = true`,
            [tournamentId, userId]
          )
        ]);

        const totalLevelsCount = parseInt(totalLevels.rows[0].count);
        const completedLevelsCount = parseInt(completedLevels.rows[0].count);

        if (completedLevelsCount >= totalLevelsCount) {
          
          tournamentCompleted = true;

        } else {
          const nextLevel = await query(
            `SELECT level_number 
             FROM tournament_levels 
             WHERE tournament_id = $1 AND level_number > $2
             ORDER BY level_number ASC 
             LIMIT 1`,
            [tournamentId, level.level_number]
          );

          if (nextLevel.rows.length > 0) {
            nextLevelNumber = nextLevel.rows[0].level_number;
          }
        }
      }

      res.json({
        status: 'success',
        passed,
        output,
        points: passed ? level.points : 0,
        tournament_completed: tournamentCompleted,
        nextLevelNumber
      });
    } catch (err) {
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

// В вашем Express-роуте
router.post('/:id/complete', authenticateToken, async (req, res, next) => {
  try {
    const { completion_time } = req.body;
    const userId = req.user.id;
    const tournamentId = req.params.id;

    await query(
      `INSERT INTO tournament_completions 
       (user_id, tournament_id, completion_time)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, tournament_id) 
       DO UPDATE SET completion_time = $3`,
      [userId, tournamentId, completion_time]
    );

    res.json({ status: 'success' });
  } catch (err) {
    next(err);
  }
});

export default router;