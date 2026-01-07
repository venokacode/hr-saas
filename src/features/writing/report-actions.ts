'use server'

/**
 * Writing Module Report Actions
 * 
 * Server actions for report generation and scoring
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getActiveOrgId } from '@/lib/organization'
import { z } from 'zod'

// Score schema
const scoreSchema = z.object({
  attempt_id: z.string().uuid(),
  overall: z.number().min(0).max(100).optional(),
  grammar: z.number().min(0).max(100).optional(),
  vocabulary: z.number().min(0).max(100).optional(),
  coherence: z.number().min(0).max(100).optional(),
  task_achievement: z.number().min(0).max(100).optional(),
  feedback: z.string().max(5000).optional(),
})

export async function createOrUpdateReport(formData: FormData) {
  try {
    const supabase = await createClient()
    const orgId = await getActiveOrgId()

    if (!orgId) {
      return { success: false, error: 'No active organization' }
    }

    // Parse and validate input
    const rawData = {
      attempt_id: formData.get('attempt_id'),
      overall: formData.get('overall') ? parseFloat(formData.get('overall') as string) : undefined,
      grammar: formData.get('grammar') ? parseFloat(formData.get('grammar') as string) : undefined,
      vocabulary: formData.get('vocabulary') ? parseFloat(formData.get('vocabulary') as string) : undefined,
      coherence: formData.get('coherence') ? parseFloat(formData.get('coherence') as string) : undefined,
      task_achievement: formData.get('task_achievement') ? parseFloat(formData.get('task_achievement') as string) : undefined,
      feedback: formData.get('feedback') || undefined,
    }

    const result = scoreSchema.safeParse(rawData)
    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || 'Invalid input',
      }
    }

    const { attempt_id, feedback, ...scores } = result.data

    // Verify attempt belongs to organization
    const { data: attempt } = await supabase
      .from('attempts')
      .select(`
        id,
        test_link:test_links(
          test:tests(organization_id)
        )
      `)
      .eq('id', attempt_id)
      .single()

    if (!attempt || (attempt as any).test_link?.test?.organization_id !== orgId) {
      return { success: false, error: 'Attempt not found' }
    }

    // Check if report already exists
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('attempt_id', attempt_id)
      .single()

    const scoreData = Object.keys(scores).length > 0 ? scores : null

    if (existingReport) {
      // Update existing report
      const { data, error } = await supabase
        .from('reports')
        .update({
          score: scoreData,
          feedback: feedback || null,
          generated_at: new Date().toISOString(),
        })
        .eq('id', existingReport.id)
        .select()
        .single()

      if (error) {
        console.error('Failed to update report:', error)
        return { success: false, error: 'Failed to update report' }
      }

      revalidatePath('/app/modules/writing/reports')
      revalidatePath(`/app/modules/writing/reports/${attempt_id}`)
      return { success: true, data }
    } else {
      // Create new report
      const { data, error } = await supabase
        .from('reports')
        .insert({
          attempt_id,
          organization_id: orgId,
          score: scoreData,
          feedback: feedback || null,
          generated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create report:', error)
        return { success: false, error: 'Failed to create report' }
      }

      revalidatePath('/app/modules/writing/reports')
      revalidatePath(`/app/modules/writing/reports/${attempt_id}`)
      return { success: true, data }
    }
  } catch (error) {
    console.error('Unexpected error creating/updating report:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteReport(reportId: string) {
  try {
    const supabase = await createClient()
    const orgId = await getActiveOrgId()

    if (!orgId) {
      return { success: false, error: 'No active organization' }
    }

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)
      .eq('organization_id', orgId)

    if (error) {
      console.error('Failed to delete report:', error)
      return { success: false, error: 'Failed to delete report' }
    }

    revalidatePath('/app/modules/writing/reports')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting report:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// AI Auto-scoring
import { scoreWritingTest } from '@/lib/ai-scoring'
import { sendEmail } from '@/lib/email'

export async function generateAIScore(attemptId: string) {
  try {
    const supabase = await createClient()
    const orgId = await getActiveOrgId()

    if (!orgId) {
      return { success: false, error: 'No active organization' }
    }

    // Get attempt with test details
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .select(`
        *,
        test_link:test_links(
          test:tests(
            title,
            prompt,
            instructions,
            organization_id
          )
        ),
        candidate:candidates(
          name,
          email
        )
      `)
      .eq('id', attemptId)
      .single()

    if (attemptError || !attempt) {
      return { success: false, error: 'Attempt not found' }
    }

    // Verify belongs to organization
    if ((attempt as any).test_link?.test?.organization_id !== orgId) {
      return { success: false, error: 'Unauthorized' }
    }

    if (!attempt.content) {
      return { success: false, error: 'No content to score' }
    }

    // Generate AI scores
    const result = await scoreWritingTest({
      prompt: (attempt as any).test_link.test.prompt,
      instructions: (attempt as any).test_link.test.instructions,
      content: attempt.content,
    })

    // Create or update report with AI scores
    const scoreData = {
      overall: result.overall_score,
      grammar: result.grammar_score,
      vocabulary: result.vocabulary_score,
      coherence: result.coherence_score,
      task_achievement: result.task_achievement_score,
    }

    // Check if report exists
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('attempt_id', attemptId)
      .single()

    if (existingReport) {
      // Update existing
      await supabase
        .from('reports')
        .update({
          score: scoreData,
          feedback: result.feedback,
          generated_at: new Date().toISOString(),
        })
        .eq('id', existingReport.id)
    } else {
      // Create new
      await supabase
        .from('reports')
        .insert({
          attempt_id: attemptId,
          organization_id: orgId,
          score: scoreData,
          feedback: result.feedback,
          generated_at: new Date().toISOString(),
        })
    }

    // Send email notification
    if ((attempt as any).candidate?.email) {
      try {
        await sendEmail({
          to: (attempt as any).candidate.email,
          subject: `Your ${(attempt as any).test_link.test.title} results are ready`,
          html: `
            <h2>Test Results</h2>
            <p>Hi ${(attempt as any).candidate.name},</p>
            <p>Your test has been evaluated. Here are your results:</p>
            <ul>
              <li><strong>Overall Score:</strong> ${result.overall_score}/100</li>
              <li><strong>Grammar:</strong> ${result.grammar_score}/100</li>
              <li><strong>Vocabulary:</strong> ${result.vocabulary_score}/100</li>
              <li><strong>Coherence:</strong> ${result.coherence_score}/100</li>
              <li><strong>Task Achievement:</strong> ${result.task_achievement_score}/100</li>
            </ul>
            <h3>Feedback</h3>
            <p>${result.feedback}</p>
            ${result.strengths.length > 0 ? `
            <h3>Strengths</h3>
            <ul>
              ${result.strengths.map((s) => `<li>${s}</li>`).join('')}
            </ul>
            ` : ''}
            ${result.improvements.length > 0 ? `
            <h3>Areas for Improvement</h3>
            <ul>
              ${result.improvements.map((i) => `<li>${i}</li>`).join('')}
            </ul>
            ` : ''}
          `,
          text: `Test Results\n\nOverall Score: ${result.overall_score}/100\n\nFeedback: ${result.feedback}`,
        })
      } catch (emailError) {
        console.error('Failed to send result email:', emailError)
      }
    }

    revalidatePath('/app/modules/writing/reports')
    revalidatePath(`/app/modules/writing/reports/${attemptId}`)
    return { success: true, result }
  } catch (error) {
    console.error('AI scoring error:', error)
    return { success: false, error: 'Failed to generate AI assessment' }
  }
}
