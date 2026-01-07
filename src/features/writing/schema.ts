/**
 * Writing Module Schemas
 * 
 * Zod validation schemas for Writing module
 */

import { z } from 'zod'

// Test schemas
export const createTestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(5000, 'Prompt is too long'),
  instructions: z.string().max(2000, 'Instructions are too long').optional(),
  time_limit_minutes: z.number().int().min(5).max(480).optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
})

export const updateTestSchema = createTestSchema.partial().extend({
  id: z.string().uuid('Invalid test ID'),
})

// Candidate invitation schema
export const inviteCandidateSchema = z.object({
  test_id: z.string().uuid('Invalid test ID'),
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
  expires_in_days: z.number().int().min(1).max(90).default(7),
  max_attempts: z.number().int().min(1).max(10).default(1),
})

// Attempt submission schema
export const submitAttemptSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  content: z.string().min(50, 'Your response must be at least 50 characters').max(10000, 'Your response is too long'),
  candidate_email: z.string().email('Invalid email address').optional(),
  candidate_name: z.string().min(1).max(100).optional(),
})

// Query schemas
export const testQuerySchema = z.object({
  status: z.enum(['draft', 'active', 'archived']).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

export const attemptQuerySchema = z.object({
  test_id: z.string().uuid().optional(),
  submitted: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

// Type exports
export type CreateTestInput = z.infer<typeof createTestSchema>
export type UpdateTestInput = z.infer<typeof updateTestSchema>
export type InviteCandidateInput = z.infer<typeof inviteCandidateSchema>
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>
export type TestQuery = z.infer<typeof testQuerySchema>
export type AttemptQuery = z.infer<typeof attemptQuerySchema>
