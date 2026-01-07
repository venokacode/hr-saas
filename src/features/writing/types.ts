/**
 * Writing Module Types
 * 
 * Core types for the Writing assessment module
 */

export type TestStatus = 'draft' | 'active' | 'archived'

export interface Test {
  id: string
  organization_id: string
  module_key: 'writing'
  title: string
  description: string | null
  prompt: string
  instructions: string | null
  time_limit_minutes: number | null
  status: TestStatus
  created_by: string
  created_at: string
  updated_at: string
}

export interface TestLink {
  id: string
  test_id: string
  token: string
  expires_at: string | null
  max_attempts: number | null
  created_at: string
}

export interface Candidate {
  id: string
  organization_id: string
  email: string
  name: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface Attempt {
  id: string
  test_link_id: string
  candidate_id: string | null
  started_at: string
  submitted_at: string | null
  content: string | null
  metadata: Record<string, unknown>
}

export interface Report {
  id: string
  attempt_id: string
  organization_id: string
  score: {
    overall?: number
    grammar?: number
    vocabulary?: number
    coherence?: number
    task_achievement?: number
  } | null
  feedback: string | null
  generated_at: string
}

// Form data types
export interface CreateTestInput {
  title: string
  description?: string
  prompt: string
  instructions?: string
  time_limit_minutes?: number
  status?: TestStatus
}

export interface UpdateTestInput extends Partial<CreateTestInput> {
  id: string
}

export interface InviteCandidateInput {
  test_id: string
  email: string
  name?: string
  expires_in_days?: number
  max_attempts?: number
}

export interface SubmitAttemptInput {
  token: string
  content: string
  candidate_email?: string
  candidate_name?: string
}

// Extended types with relations
export interface TestWithStats extends Test {
  _count?: {
    test_links: number
    attempts: number
  }
}

export interface AttemptWithDetails extends Attempt {
  test_link?: TestLink & {
    test?: Test
  }
  candidate?: Candidate
  report?: Report
}
