import { Suspense } from 'react'
import Link from 'next/link'
import { getAttempts } from '@/features/writing/queries'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default async function WritingReportsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Test Submissions</h1>
        <p className="text-gray-600 mt-2">
          View and evaluate candidate submissions
        </p>
      </div>

      <Suspense fallback={<ReportsListSkeleton />}>
        <ReportsList />
      </Suspense>
    </div>
  )
}

async function ReportsList() {
  const { data: attempts, error } = await getAttempts({ submitted: true })

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600">Failed to load submissions</p>
        <p className="text-sm text-gray-500 mt-2">{typeof error === 'string' ? error : error.message}</p>
      </Card>
    )
  }

  if (!attempts || attempts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
        <p className="text-gray-600 mb-6">
          Submissions will appear here once candidates complete tests
        </p>
        <Link href="/app/modules/writing/tests">
          <Button>View Tests</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {attempts.map((attempt: any) => (
        <Link key={attempt.id} href={`/app/modules/writing/reports/${attempt.id}`}>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  {attempt.test_link?.test?.title || 'Unknown Test'}
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {attempt.candidate && (
                    <span>
                      👤 {attempt.candidate.name || attempt.candidate.email}
                    </span>
                  )}
                  {attempt.submitted_at && (
                    <span>
                      📅 {new Date(attempt.submitted_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {attempt.content && (
                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                    {attempt.content.substring(0, 200)}...
                  </p>
                )}
              </div>

              <div className="ml-4">
                {attempt.report ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Reviewed
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    Pending
                  </span>
                )}
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

function ReportsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="p-6 h-32 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-3 w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </Card>
      ))}
    </div>
  )
}
