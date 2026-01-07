import { notFound, redirect } from 'next/navigation'
import { getAttempt } from '@/features/writing/queries'
import { createOrUpdateReport } from '@/features/writing/report-actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params
  const { data: attempt, error } = await getAttempt(id)

  if (error || !attempt) {
    notFound()
  }

  const testLink = (attempt as any).test_link
  const test = testLink?.test
  const candidate = (attempt as any).candidate
  const report = (attempt as any).report

  async function handleSubmit(formData: FormData) {
    'use server'
    
    const result = await createOrUpdateReport(formData)
    
    if (result.success) {
      redirect(`/app/modules/writing/reports/${id}`)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test Submission Review</h1>
        <p className="text-gray-600">
          Test: <strong>{test?.title || 'Unknown Test'}</strong>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Submission Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Candidate Information</h2>
            <div className="space-y-2">
              {candidate && (
                <>
                  {candidate.name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">{candidate.name}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{candidate.email}</p>
                  </div>
                </>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Submitted At</label>
                <p className="text-gray-900">
                  {(attempt as any).submitted_at 
                    ? new Date((attempt as any).submitted_at).toLocaleString()
                    : 'Not submitted'}
                </p>
              </div>
            </div>
          </Card>

          {/* Test Prompt */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test Prompt</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="whitespace-pre-wrap">{test?.prompt}</p>
            </div>
          </Card>

          {/* Candidate Response */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Candidate Response</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap text-gray-900">
                {(attempt as any).content || 'No response provided'}
              </p>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Word count: {(attempt as any).content?.split(/\s+/).length || 0} words
            </div>
          </Card>
        </div>

        {/* Right Column - Scoring */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Evaluation</h2>
            
            <form action={handleSubmit} className="space-y-4">
              <input type="hidden" name="attempt_id" value={id} />

              {/* Overall Score */}
              <div>
                <label htmlFor="overall" className="block text-sm font-medium mb-2">
                  Overall Score (0-100)
                </label>
                <input
                  type="number"
                  id="overall"
                  name="overall"
                  min="0"
                  max="100"
                  step="1"
                  defaultValue={report?.score?.overall || ''}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="85"
                />
              </div>

              {/* Grammar */}
              <div>
                <label htmlFor="grammar" className="block text-sm font-medium mb-2">
                  Grammar (0-100)
                </label>
                <input
                  type="number"
                  id="grammar"
                  name="grammar"
                  min="0"
                  max="100"
                  step="1"
                  defaultValue={report?.score?.grammar || ''}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="80"
                />
              </div>

              {/* Vocabulary */}
              <div>
                <label htmlFor="vocabulary" className="block text-sm font-medium mb-2">
                  Vocabulary (0-100)
                </label>
                <input
                  type="number"
                  id="vocabulary"
                  name="vocabulary"
                  min="0"
                  max="100"
                  step="1"
                  defaultValue={report?.score?.vocabulary || ''}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="90"
                />
              </div>

              {/* Coherence */}
              <div>
                <label htmlFor="coherence" className="block text-sm font-medium mb-2">
                  Coherence (0-100)
                </label>
                <input
                  type="number"
                  id="coherence"
                  name="coherence"
                  min="0"
                  max="100"
                  step="1"
                  defaultValue={report?.score?.coherence || ''}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="85"
                />
              </div>

              {/* Task Achievement */}
              <div>
                <label htmlFor="task_achievement" className="block text-sm font-medium mb-2">
                  Task Achievement (0-100)
                </label>
                <input
                  type="number"
                  id="task_achievement"
                  name="task_achievement"
                  min="0"
                  max="100"
                  step="1"
                  defaultValue={report?.score?.task_achievement || ''}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="88"
                />
              </div>

              {/* Feedback */}
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium mb-2">
                  Feedback
                </label>
                <textarea
                  id="feedback"
                  name="feedback"
                  rows={6}
                  defaultValue={report?.feedback || ''}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide detailed feedback for the candidate..."
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full">
                {report ? 'Update Evaluation' : 'Save Evaluation'}
              </Button>
            </form>
          </Card>

          {/* Status */}
          {report && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Evaluated</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Last updated: {new Date(report.generated_at).toLocaleString()}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
