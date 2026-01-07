/**
 * Writing Module Queries
 * 
 * Server-side query functions for Writing module
 */

import { createClient } from '@/lib/supabase/server'
import { getActiveOrgId } from '@/lib/organization'
import type { Test, TestLink, Attempt, Report, Candidate } from './types'

// ============================================================================
// Test Queries
// ============================================================================

export async function getTests(options?: {
  status?: 'draft' | 'active' | 'archived'
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()

  if (!orgId) {
    return { data: null, error: 'No active organization' }
  }

  let query = supabase
    .from('tests')
    .select('*')
    .eq('organization_id', orgId)
    .eq('module_key', 'writing')
    .order('created_at', { ascending: false })

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }

  const { data, error } = await query

  return { data: data as Test[] | null, error }
}

export async function getTest(testId: string) {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()

  if (!orgId) {
    return { data: null, error: 'No active organization' }
  }

  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('id', testId)
    .eq('organization_id', orgId)
    .single()

  return { data: data as Test | null, error }
}

// ============================================================================
// Test Link Queries
// ============================================================================

export async function getTestLinks(testId: string) {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()

  if (!orgId) {
    return { data: null, error: 'No active organization' }
  }

  // Verify test belongs to organization
  const { data: test } = await supabase
    .from('tests')
    .select('id')
    .eq('id', testId)
    .eq('organization_id', orgId)
    .single()

  if (!test) {
    return { data: null, error: 'Test not found' }
  }

  const { data, error } = await supabase
    .from('test_links')
    .select('*')
    .eq('test_id', testId)
    .order('created_at', { ascending: false })

  return { data: data as TestLink[] | null, error }
}

export async function getTestLinkByToken(token: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('test_links')
    .select(`
      *,
      test:tests(*)
    `)
    .eq('token', token)
    .single()

  return { data, error }
}

// ============================================================================
// Attempt Queries
// ============================================================================

export async function getAttempts(options?: {
  test_id?: string
  submitted?: boolean
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()

  if (!orgId) {
    return { data: null, error: 'No active organization' }
  }

  let query = supabase
    .from('attempts')
    .select(`
      *,
      test_link:test_links(
        *,
        test:tests(*)
      ),
      candidate:candidates(*),
      report:reports(*)
    `)
    .order('started_at', { ascending: false })

  // Filter by test if provided
  if (options?.test_id) {
    query = query.eq('test_link.test_id', options.test_id)
  }

  // Filter by submission status
  if (options?.submitted !== undefined) {
    if (options.submitted) {
      query = query.not('submitted_at', 'is', null)
    } else {
      query = query.is('submitted_at', null)
    }
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }

  const { data, error } = await query

  // Filter by organization (since we can't do it in the query due to nested relations)
  const filteredData = data?.filter((attempt: any) => 
    attempt.test_link?.test?.organization_id === orgId
  )

  return { data: filteredData as any[] | null, error }
}

export async function getAttempt(attemptId: string) {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()

  if (!orgId) {
    return { data: null, error: 'No active organization' }
  }

  const { data, error } = await supabase
    .from('attempts')
    .select(`
      *,
      test_link:test_links(
        *,
        test:tests(*)
      ),
      candidate:candidates(*),
      report:reports(*)
    `)
    .eq('id', attemptId)
    .single()

  // Verify belongs to organization
  if (data && (data as any).test_link?.test?.organization_id !== orgId) {
    return { data: null, error: 'Attempt not found' }
  }

  return { data, error }
}

// ============================================================================
// Report Queries
// ============================================================================

export async function getReports(options?: {
  test_id?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()

  if (!orgId) {
    return { data: null, error: 'No active organization' }
  }

  let query = supabase
    .from('reports')
    .select(`
      *,
      attempt:attempts(
        *,
        test_link:test_links(
          *,
          test:tests(*)
        ),
        candidate:candidates(*)
      )
    `)
    .eq('organization_id', orgId)
    .order('generated_at', { ascending: false })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }

  const { data, error } = await query

  return { data, error }
}

export async function getReport(reportId: string) {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()

  if (!orgId) {
    return { data: null, error: 'No active organization' }
  }

  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      attempt:attempts(
        *,
        test_link:test_links(
          *,
          test:tests(*)
        ),
        candidate:candidates(*)
      )
    `)
    .eq('id', reportId)
    .eq('organization_id', orgId)
    .single()

  return { data, error }
}

// ============================================================================
// Candidate Queries
// ============================================================================

export async function getCandidates(options?: {
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  const orgId = await getActiveOrgId()

  if (!orgId) {
    return { data: null, error: 'No active organization' }
  }

  let query = supabase
    .from('candidates')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }

  const { data, error } = await query

  return { data: data as Candidate[] | null, error }
}
