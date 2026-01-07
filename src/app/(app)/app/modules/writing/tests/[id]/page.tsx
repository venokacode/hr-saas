import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTest } from '@/features/writing/queries'
import { deleteTest } from '@/features/writing/actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TestDetailPage({ params }: PageProps) {
  const { id } = await params
  const { data: test, error } = await getTest(id)

  if (error || !test) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{test.title}</h1>
            <StatusBadge status={test.status} />
          </div>
          {test.description && (
            <p className="text-gray-600">{test.description}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Link href={`/app/modules/writing/tests/${test.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <form action={async () => {
            'use server'
            await deleteTest(test.id)
          }}>
            <Button type="submit" variant="outline" className="text-red-600">
              Delete
            </Button>
          </form>
        </div>
      </div>

      {/* Test Details */}
      <div className="grid gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Prompt</label>
              <p className="mt-1 whitespace-pre-wrap">{test.prompt}</p>
            </div>

            {test.instructions && (
              <div>
                <label className="text-sm font-medium text-gray-500">Instructions</label>
                <p className="mt-1 whitespace-pre-wrap">{test.instructions}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {test.time_limit_minutes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Time Limit</label>
                  <p className="mt-1">{test.time_limit_minutes} minutes</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="mt-1">
                  {new Date(test.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Invite Candidate */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Invite Candidates</h2>
          <p className="text-gray-600 mb-4">
            Send this test to candidates by email
          </p>
          <Link href={`/app/modules/writing/tests/${test.id}/invite`}>
            <Button>Invite Candidate</Button>
          </Link>
        </Card>

        {/* Test Links */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Links</h2>
          <p className="text-gray-600 mb-4">
            View all generated test links and their status
          </p>
          <Link href={`/app/modules/writing/tests/${test.id}/links`}>
            <Button variant="outline">View Links</Button>
          </Link>
        </Card>

        {/* Attempts */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Submissions</h2>
          <p className="text-gray-600 mb-4">
            View candidate submissions and generate reports
          </p>
          <Link href={`/app/modules/writing/tests/${test.id}/attempts`}>
            <Button variant="outline">View Submissions</Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: 'draft' | 'active' | 'archived' }) {
  const styles = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    archived: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
