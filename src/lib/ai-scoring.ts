import OpenAI from 'openai'
import { env } from './env'

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

export interface ScoringCriteria {
  prompt: string
  instructions: string
  content: string
}

export interface ScoringResult {
  overall_score: number
  grammar_score: number
  vocabulary_score: number
  coherence_score: number
  task_achievement_score: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

export async function scoreWritingTest(
  criteria: ScoringCriteria
): Promise<ScoringResult> {
  const systemPrompt = `You are an expert English writing assessor. Your task is to evaluate writing samples based on multiple criteria and provide detailed, constructive feedback.

Scoring Guidelines:
- Overall Score: 0-100 (holistic assessment)
- Grammar: 0-100 (accuracy, sentence structure, punctuation)
- Vocabulary: 0-100 (range, appropriateness, precision)
- Coherence: 0-100 (organization, flow, logical connections)
- Task Achievement: 0-100 (how well the response addresses the prompt)

Provide your assessment in JSON format with the following structure:
{
  "overall_score": number,
  "grammar_score": number,
  "vocabulary_score": number,
  "coherence_score": number,
  "task_achievement_score": number,
  "feedback": "detailed paragraph explaining the assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area for improvement 1", "area 2", "area 3"]
}`

  const userPrompt = `Test Prompt: ${criteria.prompt}

Instructions: ${criteria.instructions}

Candidate's Response:
${criteria.content}

Please evaluate this writing sample and provide scores and feedback.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      throw new Error('No response from AI')
    }

    const parsed = JSON.parse(result) as ScoringResult

    // Validate scores are within range
    const validateScore = (score: number) =>
      Math.max(0, Math.min(100, score))

    return {
      overall_score: validateScore(parsed.overall_score),
      grammar_score: validateScore(parsed.grammar_score),
      vocabulary_score: validateScore(parsed.vocabulary_score),
      coherence_score: validateScore(parsed.coherence_score),
      task_achievement_score: validateScore(parsed.task_achievement_score),
      feedback: parsed.feedback || 'No feedback provided',
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
    }
  } catch (error) {
    console.error('AI scoring error:', error)
    throw new Error('Failed to generate AI assessment')
  }
}
