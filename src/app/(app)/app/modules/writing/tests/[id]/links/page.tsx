import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTest, getTestLinks } from '@/features/writing/queries'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TestLinksPage({ params }: PageProps) {
  const { id } = await params
  const { data: test, error: testError } = await getTest(id)
  const { data: links, error: linksError } = await getTestLinks(id)

  if (testError || !test) {
    notFound()
  }

  const activeLinks = links?.filter((l) => l.status === 'active') || []
  const expiredLinks = links?.filter((l) => l.status === 'expired') || []
  const completedLinks = links?.filter((l) => l.status === 'completed') || []

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/app/modules/writing/tests" className="hover:text-gray-900">
            Tests
          </Link>
          <span>/</span>
          <Link
            href={`/app/modules/writing/tests/${id}`}
            className="hover:text-gray-900"
          >
            {test.title}
          </Link>
          <span>/</span>
          <span className="text-gray-900">Links</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Test Links</h1>
        <p className="text-gray-600">
          Manage all invitation links for this test
        </p>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <Link href={`/app/modules/writing/tests/${id}/invite`}>
          <Button>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Link
          </Button>
        </Link>
      </div>

      {/* Active Links */}
      {activeLinks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Links</h2>
          <div className="grid gap-4">
            {activeLinks.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Links */}
      {completedLinks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Completed Links</h2>
          <div className="grid gap-4">
            {completedLinks.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        </div>
      )}

      {/* Expired Links */}
      {expiredLinks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Expired Links</h2>
          <div className="grid gap-4">
            {expiredLinks.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {links?.length === 0 && (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <h3 className="text-lg font-semibold mb-2">No links yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first invitation link to start inviting candidates
            </p>
            <Link href={`/app/modules/writing/tests/${id}/invite`}>
              <Button>Create First Link</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}

function LinkCard({ link }: { link: any }) {
  const candidate = link.candidate
  const attempt = link.attempts?.[0]
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const fullUrl = `${baseUrl}/test/${link.token}`

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-semibold">{candidate?.name}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                statusColors[link.status as keyof typeof statusColors]
              }`}
            >
              {link.status}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div>
              <strong>Email:</strong> {candidate?.email}
            </div>
            <div>
              <strong>Expires:</strong>{' '}
              {new Date(link.expires_at).toLocaleString()}
            </div>
            <div>
              <strong>Max Attempts:</strong> {link.max_attempts}
            </div>
            {attempt && (
              <div>
                <strong>Submitted:</strong>{' '}
                {new Date(attempt.submitted_at).toLocaleString()}
              </div>
            )}
          </div>

          {link.status === 'active' && (
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={fullUrl}
                  className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(fullUrl)
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>

        {attempt && (
          <div className="ml-4">
            <Link href={`/app/modules/writing/reports/${attempt.id}`}>
              <Button variant="outline" size="sm">
                View Report
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  )
}
