import { notFound, redirect } from 'next/navigation'
import { getTest } from '@/features/writing/queries'
import { inviteCandidate } from '@/features/writing/actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InviteCandidatePage({ params }: PageProps) {
  const { id } = await params
  const { data: test, error } = await getTest(id)

  if (error || !test) {
    notFound()
  }

  async function handleSubmit(formData: FormData) {
    'use server'
    
    const result = await inviteCandidate(formData)
    
    if (result.success) {
      redirect(`/app/modules/writing/tests/${id}`)
    }
    
    // TODO: Handle error
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Invite Candidate</h1>
        <p className="text-gray-600 mt-2">
          Send test invitation to: <strong>{test.title}</strong>
        </p>
      </div>

      <Card className="p-8">
        <form action={handleSubmit} className="space-y-6">
          <input type="hidden" name="test_id" value={test.id} />

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Candidate Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="candidate@example.com"
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Candidate Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          {/* Expires In Days */}
          <div>
            <label htmlFor="expires_in_days" className="block text-sm font-medium mb-2">
              Link Expires In (days)
            </label>
            <input
              type="number"
              id="expires_in_days"
              name="expires_in_days"
              min="1"
              max="90"
              defaultValue="7"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              The test link will expire after this many days
            </p>
          </div>

          {/* Max Attempts */}
          <div>
            <label htmlFor="max_attempts" className="block text-sm font-medium mb-2">
              Maximum Attempts
            </label>
            <input
              type="number"
              id="max_attempts"
              name="max_attempts"
              min="1"
              max="10"
              defaultValue="1"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              How many times the candidate can take this test
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              Send Invitation
            </Button>
            <Button 
              type="button" 
              variant="outline"
              className="flex-1"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
