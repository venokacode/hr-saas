/**
 * Email Service
 * 
 * Handles sending emails via Resend
 */

import { Resend } from 'resend'

// Initialize Resend client
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Default sender email
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com'

export interface SendTestInvitationParams {
  to: string
  candidateName?: string
  testTitle: string
  testLink: string
  expiresAt: string
  maxAttempts: number
}

export async function sendTestInvitation(params: SendTestInvitationParams) {
  if (!resend) {
    console.warn('Resend API key not configured. Email not sent.')
    return {
      success: false,
      error: 'Email service not configured',
    }
  }

  const {
    to,
    candidateName,
    testTitle,
    testLink,
    expiresAt,
    maxAttempts,
  } = params

  const greeting = candidateName ? `Hi ${candidateName}` : 'Hello'

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `You've been invited to take a writing assessment: ${testTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Writing Assessment Invitation</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
              <h1 style="color: #2563eb; margin-top: 0;">Writing Assessment Invitation</h1>
              
              <p style="font-size: 16px;">${greeting},</p>
              
              <p style="font-size: 16px;">
                You have been invited to complete a writing assessment: <strong>${testTitle}</strong>
              </p>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Test Details</h2>
                <ul style="list-style: none; padding: 0;">
                  <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <strong>Test:</strong> ${testTitle}
                  </li>
                  <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <strong>Attempts Allowed:</strong> ${maxAttempts}
                  </li>
                  <li style="padding: 8px 0;">
                    <strong>Link Expires:</strong> ${new Date(expiresAt).toLocaleDateString()}
                  </li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${testLink}" 
                   style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  Start Test
                </a>
              </div>
              
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px;">
                  <strong>⚠️ Important:</strong> This link will expire on ${new Date(expiresAt).toLocaleDateString()}. 
                  Please complete the test before this date.
                </p>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                If you have any questions or issues accessing the test, please contact the test administrator.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                This is an automated email from HR SaaS. Please do not reply to this email.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
${greeting},

You have been invited to complete a writing assessment: ${testTitle}

Test Details:
- Test: ${testTitle}
- Attempts Allowed: ${maxAttempts}
- Link Expires: ${new Date(expiresAt).toLocaleDateString()}

Click the link below to start the test:
${testLink}

⚠️ Important: This link will expire on ${new Date(expiresAt).toLocaleDateString()}. Please complete the test before this date.

If you have any questions or issues accessing the test, please contact the test administrator.

---
This is an automated email from HR SaaS. Please do not reply to this email.
      `.trim(),
    })

    if (error) {
      console.error('Failed to send email:', error)
      return {
        success: false,
        error: error.message || 'Failed to send email',
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Unexpected error sending email:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

export interface SendReportNotificationParams {
  to: string
  candidateName?: string
  testTitle: string
  overallScore?: number
  feedback?: string
}

export async function sendReportNotification(params: SendReportNotificationParams) {
  if (!resend) {
    console.warn('Resend API key not configured. Email not sent.')
    return {
      success: false,
      error: 'Email service not configured',
    }
  }

  const {
    to,
    candidateName,
    testTitle,
    overallScore,
    feedback,
  } = params

  const greeting = candidateName ? `Hi ${candidateName}` : 'Hello'

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your writing assessment results: ${testTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Assessment Results</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
              <h1 style="color: #2563eb; margin-top: 0;">Assessment Results</h1>
              
              <p style="font-size: 16px;">${greeting},</p>
              
              <p style="font-size: 16px;">
                Your writing assessment for <strong>${testTitle}</strong> has been evaluated.
              </p>
              
              ${overallScore !== undefined ? `
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                  <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Overall Score</h2>
                  <div style="font-size: 48px; font-weight: bold; color: #2563eb;">
                    ${overallScore}/100
                  </div>
                </div>
              ` : ''}
              
              ${feedback ? `
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Feedback</h2>
                  <p style="white-space: pre-wrap; font-size: 14px;">${feedback}</p>
                </div>
              ` : ''}
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Thank you for completing the assessment. If you have any questions about your results, please contact the test administrator.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                This is an automated email from HR SaaS. Please do not reply to this email.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
${greeting},

Your writing assessment for ${testTitle} has been evaluated.

${overallScore !== undefined ? `Overall Score: ${overallScore}/100\n` : ''}
${feedback ? `\nFeedback:\n${feedback}\n` : ''}

Thank you for completing the assessment. If you have any questions about your results, please contact the test administrator.

---
This is an automated email from HR SaaS. Please do not reply to this email.
      `.trim(),
    })

    if (error) {
      console.error('Failed to send email:', error)
      return {
        success: false,
        error: error.message || 'Failed to send email',
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Unexpected error sending email:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}
