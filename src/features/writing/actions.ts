'use server'

/**
 * Writing Module Server Actions
 * 
 * Server-side actions for Writing assessment module
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getActiveOrgId } from '@/lib/organization'
import { 
  createTestSchema, 
  updateTestSchema, 
  inviteCandidateSchema,
  submitAttemptSchema,
} from './schema'
import type { Test, TestLink, Attempt, Candidate } from './types'

// ============================================================================
// Test Management Actions
// ============================================================================

export async function createTest(formData: FormData) {
  try {
    const supabase = await createClient()
    const orgId = await getActiveOrgId()

    if (!orgId) {
      return { success: false, error: 'No active organization' }
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Parse and validate input
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description') || undefined,
      prompt: formData.get('prompt'),
      instructions: formData.get('instructions') || undefined,
      time_limit_minutes: formData.get('time_limit_minutes') 
        ? parseInt(formData.get('time_limit_minutes') as string) 
        : undefined,
      status: (formData.get('status') || 'draft') as 'draft' | 'active' | 'archived',
    }

    const result = createTestSchema.safeParse(rawData)
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || 'Invalid input',
      }
    }

    // Create test
    const { data, error } = await supabase
      .from('tests')
      .insert({
        organization_id: orgId,
        module_key: 'writing',
        created_by: user.id,
        ...result.data,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create test:', error)
      return { success: false, error: 'Failed to create test' }
    }

    revalidatePath('/app/modules/writing/tests')
    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error creating test:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateTest(formData: FormData) {
  try {
    const supabase = await createClient()
    const orgId = await getActiveOrgId()

    if (!orgId) {
      return { success: false, error: 'No active organization' }
    }

    // Parse and validate input
    const rawData = {
      id: formData.get('id'),
      title: formData.get('title') || undefined,
      description: formData.get('description') || undefined,
      prompt: formData.get('prompt') || undefined,
      instructions: formData.get('instructions') || undefined,
      time_limit_minutes: formData.get('time_limit_minutes')
        ? parseInt(formData.get('time_limit_minutes') as string)
        : undefined,
      status: formData.get('status') as 'draft' | 'active' | 'archived' | undefined,
    }

    const result = updateTestSchema.safeParse(rawData)
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || 'Invalid input',
      }
    }

    const { id, ...updates } = result.data

    // Update test
    const { data, error } = await supabase
      .from('tests')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update test:', error)
      return { success: false, error: 'Failed to update test' }
    }

    revalidatePath('/app/modules/writing/tests')
    revalidatePath(`/app/modules/writing/tests/${id}`)
    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error updating test:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteTest(testId: string) {
  try {
    const supabase = await createClient()
    const orgId = await getActiveOrgId()

    if (!orgId) {
      return { success: false, error: 'No active organization' }
    }

    const { error } = await supabase
      .from('tests')
      .delete()
      .eq('id', testId)
      .eq('organization_id', orgId)

    if (error) {
      console.error('Failed to delete test:', error)
      return { success: false, error: 'Failed to delete test' }
    }

    revalidatePath('/app/modules/writing/tests')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting test:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ============================================================================
// Candidate Invitation Actions
// ============================================================================

export async function inviteCandidate(formData: FormData) {
  try {
    const supabase = await createClient()
    const orgId = await getActiveOrgId()

    if (!orgId) {
      return { success: false, error: 'No active organization' }
    }

    // Parse and validate input
    const rawData = {
      test_id: formData.get('test_id'),
      email: formData.get('email'),
      name: formData.get('name') || undefined,
      expires_in_days: formData.get('expires_in_days')
        ? parseInt(formData.get('expires_in_days') as string)
        : 7,
      max_attempts: formData.get('max_attempts')
        ? parseInt(formData.get('max_attempts') as string)
        : 1,
    }

    const result = inviteCandidateSchema.safeParse(rawData)
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || 'Invalid input',
      }
    }

    const { test_id, email, name, expires_in_days, max_attempts } = result.data

    // Verify test exists and belongs to organization
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('id')
      .eq('id', test_id)
      .eq('organization_id', orgId)
      .single()

    if (testError || !test) {
      return { success: false, error: 'Test not found' }
    }

    // Create or get candidate
    let candidate: Candidate | null = null
    const { data: existingCandidate } = await supabase
      .from('candidates')
      .select('*')
      .eq('email', email)
      .eq('organization_id', orgId)
      .single()

    if (existingCandidate) {
      candidate = existingCandidate
      
      // Update name if provided
      if (name && name !== existingCandidate.name) {
        await supabase
          .from('candidates')
          .update({ name })
          .eq('id', existingCandidate.id)
      }
    } else {
      const { data: newCandidate, error: candidateError } = await supabase
        .from('candidates')
        .insert({
          organization_id: orgId,
          email,
          name: name || null,
          metadata: {},
        })
        .select()
        .single()

      if (candidateError) {
        console.error('Failed to create candidate:', candidateError)
        return { success: false, error: 'Failed to create candidate' }
      }

      candidate = newCandidate
    }

    // Generate test link
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expires_in_days)

    const { data: testLink, error: linkError } = await supabase
      .from('test_links')
      .insert({
        test_id,
        token,
        expires_at: expiresAt.toISOString(),
        max_attempts,
      })
      .select()
      .single()

    if (linkError) {
      console.error('Failed to create test link:', linkError)
      return { success: false, error: 'Failed to create test link' }
    }

    // TODO: Send email invitation
    // For now, just return the link

    revalidatePath('/app/modules/writing/tests')
    revalidatePath(`/app/modules/writing/tests/${test_id}`)
    
    return {
      success: true,
      data: {
        candidate,
        testLink,
        inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/test/${token}`,
      },
    }
  } catch (error) {
    console.error('Unexpected error inviting candidate:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ============================================================================
// Test Submission Actions (Public - No Auth Required)
// ============================================================================

export async function submitAttempt(formData: FormData) {
  try {
    const supabase = await createClient()

    // Parse and validate input
    const rawData = {
      token: formData.get('token'),
      content: formData.get('content'),
      candidate_email: formData.get('candidate_email') || undefined,
      candidate_name: formData.get('candidate_name') || undefined,
    }

    const result = submitAttemptSchema.safeParse(rawData)
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || 'Invalid input',
      }
    }

    const { token, content, candidate_email, candidate_name } = result.data

    // Get test link
    const { data: testLink, error: linkError } = await supabase
      .from('test_links')
      .select('*, test:tests(*)')
      .eq('token', token)
      .single()

    if (linkError || !testLink) {
      return { success: false, error: 'Invalid or expired test link' }
    }

    // Check if link is expired
    if (testLink.expires_at && new Date(testLink.expires_at) < new Date()) {
      return { success: false, error: 'This test link has expired' }
    }

    // Check max attempts
    if (testLink.max_attempts) {
      const { count } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .eq('test_link_id', testLink.id)

      if (count && count >= testLink.max_attempts) {
        return { success: false, error: 'Maximum attempts reached for this test' }
      }
    }

    // Handle candidate info
    let candidateId: string | null = null
    if (candidate_email) {
      const { data: candidate } = await supabase
        .from('candidates')
        .select('id')
        .eq('email', candidate_email)
        .eq('organization_id', testLink.test.organization_id)
        .single()

      if (candidate) {
        candidateId = candidate.id
      } else if (candidate_name) {
        const { data: newCandidate } = await supabase
          .from('candidates')
          .insert({
            organization_id: testLink.test.organization_id,
            email: candidate_email,
            name: candidate_name,
            metadata: {},
          })
          .select('id')
          .single()

        if (newCandidate) {
          candidateId = newCandidate.id
        }
      }
    }

    // Create attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .insert({
        test_link_id: testLink.id,
        candidate_id: candidateId,
        submitted_at: new Date().toISOString(),
        content,
        metadata: {},
      })
      .select()
      .single()

    if (attemptError) {
      console.error('Failed to submit attempt:', attemptError)
      return { success: false, error: 'Failed to submit your response' }
    }

    return { success: true, data: attempt }
  } catch (error) {
    console.error('Unexpected error submitting attempt:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
