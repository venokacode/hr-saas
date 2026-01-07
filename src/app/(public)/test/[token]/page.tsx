import { notFound } from 'next/navigation'
import { getTestLinkByToken } from '@/features/writing/queries'
import { submitAttempt } from '@/features/writing/actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function TestSubmissionPage({ params }: PageProps) {
  const { token } = await params
  const { data: testLink, error } = await getTestLinkByToken(token)

  if (error || !testLink || !testLink.test) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Test Link</h1>
          <p className="text-gray-600">
            This test link is invalid or has expired. Please contact the test administrator.
          </p>
        </Card>
      </div>
    )
  }

  // Check if expired
  if (testLink.expires_at && new Date(testLink.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Link Expired</h1>
          <p className="text-gray-600">
            This test link has expired. Please contact the test administrator for a new link.
          </p>
        </Card>
      </div>
    )
  }

  const test = testLink.test

  async function handleSubmit(formData: FormData) {
    'use server'
    
    const result = await submitAttempt(formData)
    
    if (result.success) {
      // TODO: Redirect to success page
    }
    // TODO: Handle error
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <Card className="p-8 mb-8">
          <h1 className="text-3xl font-bold mb-4">{test.title}</h1>
          {test.description && (
            <p className="text-gray-600 mb-4">{test.description}</p>
          )}
          
          <div className="flex gap-6 text-sm text-gray-500">
            {test.time_limit_minutes && (
              <div>
                <span className="font-medium">Time Limit:</span> {test.time_limit_minutes} minutes
              </div>
            )}
            {testLink.max_attempts && (
              <div>
                <span className="font-medium">Attempts Allowed:</span> {testLink.max_attempts}
              </div>
            )}
          </div>
        </Card>

        {/* Instructions */}
        {test.instructions && (
          <Card className="p-6 mb-8">
            <h2 className="font-semibold mb-2">Instructions</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{test.instructions}</p>
          </Card>
        )}

        {/* Test Form */}
        <Card className="p-8">
          <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="token" value={token} />

            {/* Prompt */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Prompt</h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="whitespace-pre-wrap">{test.prompt}</p>
              </div>
            </div>

            {/* Candidate Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="candidate_email" className="block text-sm font-medium mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  id="candidate_email"
                  name="candidate_email"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="candidate_name" className="block text-sm font-medium mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="candidate_name"
                  name="candidate_name"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Response */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Your Response *
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={20}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Write your response here..."
              />
              <p className="text-sm text-gray-500 mt-2">
                Minimum 50 characters required
              </p>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button type="submit" className="w-full py-3 text-lg">
                Submit Response
              </Button>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Powered by HR SaaS</p>
        </div>
      </div>
    </div>
  )
}
