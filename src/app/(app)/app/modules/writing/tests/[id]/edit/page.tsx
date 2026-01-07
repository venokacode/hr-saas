import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getTest } from '@/features/writing/queries'
import { updateTest } from '@/features/writing/actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTestPage({ params }: PageProps) {
  const { id } = await params
  const { data: test, error } = await getTest(id)

  if (error || !test) {
    notFound()
  }

  async function handleSubmit(formData: FormData) {
    'use server'
    
    formData.append('id', id)
    const result = await updateTest(formData)
    
    if (result.success) {
      redirect(`/app/modules/writing/tests/${id}`)
    }
    // TODO: Handle error
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Test</h1>
        <p className="text-gray-600 mt-2">
          Update test details and settings
        </p>
      </div>

      <Card className="p-6">
        <form action={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Test Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={test.title}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Senior Content Writer Assessment"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={test.description || ''}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of what this test evaluates"
            />
          </div>

          {/* Prompt */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
              Test Prompt <span className="text-red-500">*</span>
            </label>
            <textarea
              id="prompt"
              name="prompt"
              required
              rows={5}
              defaultValue={test.prompt}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Write a 500-word article about the future of remote work..."
            />
            <p className="text-sm text-gray-500 mt-1">
              This is the main writing task that candidates will see
            </p>
          </div>

          {/* Instructions */}
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium mb-2">
              Instructions
            </label>
            <textarea
              id="instructions"
              name="instructions"
              rows={4}
              defaultValue={test.instructions || ''}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional instructions or guidelines for candidates..."
            />
          </div>

          {/* Time Limit */}
          <div>
            <label htmlFor="time_limit_minutes" className="block text-sm font-medium mb-2">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              id="time_limit_minutes"
              name="time_limit_minutes"
              min="5"
              max="180"
              defaultValue={test.time_limit_minutes || ''}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="30"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty for no time limit
            </p>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              required
              defaultValue={test.status}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Only active tests can be used for invitations
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
            <Link href={`/app/modules/writing/tests/${id}`}>
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
