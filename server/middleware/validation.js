import Joi from 'joi';

// User registration validation
export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('student', 'teacher').required()
});

// User login validation
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Course validation
export const courseSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().required(),
  level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced').required(),
  image_url: Joi.string().uri().allow('').optional()
});

// Lesson validation
export const lessonSchema = Joi.object({
  course_id: Joi.number().integer().required(),
  title: Joi.string().min(3).max(100).required(),
  content: Joi.string().required(),
  order_number: Joi.number().integer().required(),
  points: Joi.number().integer().default(0)
});

// Tournament validation
export const tournamentSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().required(),
  start_time: Joi.date().iso().required(),
  end_time: Joi.date().iso().greater(Joi.ref('start_time')).required(),
  difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').required(),
  max_participants: Joi.number().integer().optional(),
  languages: Joi.array().items(Joi.string()).min(1).required(),
  levels: Joi.array().items(
    Joi.object({
      level_number: Joi.number().integer().min(1).required(),
      expected_output: Joi.string().required(),
      required_keywords: Joi.array().items(Joi.string()).min(1).required(),
      points: Joi.number().integer().min(0).default(0)
    })
  ).min(1).required()
});