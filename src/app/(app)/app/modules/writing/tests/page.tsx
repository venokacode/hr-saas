import { Suspense } from 'react'
import Link from 'next/link'
import { getTests } from '@/features/writing/queries'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default async function WritingTestsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Writing Tests</h1>
          <p className="text-gray-600 mt-2">
            Create and manage writing assessment tests for candidates
          </p>
        </div>
        <Link href="/app/modules/writing/tests/new">
          <Button>Create Test</Button>
        </Link>
      </div>

      <Suspense fallback={<TestsListSkeleton />}>
        <TestsList />
      </Suspense>
    </div>
  )
}

async function TestsList() {
  const { data: tests, error } = await getTests()

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600">Failed to load tests</p>
        <p className="text-sm text-gray-500 mt-2">{typeof error === 'string' ? error : error.message}</p>
      </Card>
    )
  }

  if (!tests || tests.length === 0) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-lg font-semibold mb-2">No tests yet</h3>
        <p className="text-gray-600 mb-6">
          Create your first writing test to start assessing candidates
        </p>
        <Link href="/app/modules/writing/tests/new">
          <Button>Create Your First Test</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tests.map((test) => (
        <Link key={test.id} href={`/app/modules/writing/tests/${test.id}`}>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-lg line-clamp-2">{test.title}</h3>
              <StatusBadge status={test.status} />
            </div>
            
            {test.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {test.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500">
              {test.time_limit_minutes && (
                <span>⏱️ {test.time_limit_minutes} min</span>
              )}
              <span>
                {new Date(test.created_at).toLocaleDateString()}
              </span>
            </div>
          </Card>
        </Link>
      ))}
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
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function TestsListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="p-6 h-40 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </Card>
      ))}
    </div>
  )
}
