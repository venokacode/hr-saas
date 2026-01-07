import { Card } from '@/components/ui/card'

export default function TestSubmissionSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="p-12 max-w-2xl text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Test Submitted Successfully!
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-600 mb-8">
          Thank you for completing the writing assessment. Your response has been submitted and will be reviewed by our team.
        </p>

        {/* What's Next */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-semibold text-gray-900 mb-3">What happens next?</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">1.</span>
              <span>Your submission will be reviewed by our team</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">2.</span>
              <span>We will evaluate your writing based on grammar, vocabulary, coherence, and task achievement</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">3.</span>
              <span>You will receive feedback via email within 3-5 business days</span>
            </li>
          </ul>
        </div>

        {/* Tips */}
        <div className="text-sm text-gray-500">
          <p>You can now close this window.</p>
          <p className="mt-2">If you have any questions, please contact the test administrator.</p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400">Powered by HR SaaS</p>
        </div>
      </Card>
    </div>
  )
}
