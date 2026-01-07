import { redirect } from 'next/navigation'
import { createTest } from '@/features/writing/actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function NewTestPage() {
  async function handleSubmit(formData: FormData) {
    'use server'
    
    const result = await createTest(formData)
    
    if (result.success && result.data) {
      redirect(`/app/modules/writing/tests/${result.data.id}`)
    }
    
    // TODO: Handle error (need client component for toast)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Writing Test</h1>
        <p className="text-gray-600 mt-2">
          Set up a new writing assessment test for candidates
        </p>
      </div>

      <Card className="p-8">
        <form action={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Test Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the test purpose and expectations"
            />
          </div>

          {/* Prompt */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
              Writing Prompt *
            </label>
            <textarea
              id="prompt"
              name="prompt"
              required
              rows={6}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter the writing prompt or topic for candidates..."
            />
            <p className="text-sm text-gray-500 mt-1">
              This is what candidates will see and respond to
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional instructions for candidates (word count, format, etc.)"
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
              max="480"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 30"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty for no time limit
            </p>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Only active tests can be assigned to candidates
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              Create Test
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
