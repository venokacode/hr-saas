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
