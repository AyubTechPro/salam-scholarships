/**
 * Professional Email Templates
 * All templates support HTML and plain text fallback
 */

export interface EmailTemplateData {
  name?: string;
  email?: string;
  [key: string]: any;
}

/**
 * Welcome Email Template
 */
export function getWelcomeEmail(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const name = data.name || 'Student';
  
  return {
    subject: 'Welcome to Salam Scholarships! 🌍',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0a192f 0%, #1e3a5f 100%); color: #ffd700; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
            .button { display: inline-block; background: #ffd700; color: #0a192f; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Salam Scholarships! 🌍</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Welcome to <strong>Salam Scholarships</strong> - your gateway to global education!</p>
              <p>We're thrilled to have you join our community of ambitious students seeking international opportunities.</p>
              <h3>What's Next?</h3>
              <ul>
                <li>Complete your profile to get personalized program recommendations</li>
                <li>Explore thousands of scholarships, forums, and exchange programs</li>
                <li>Connect with our expert consultants for guidance</li>
              </ul>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://salamconsulting.com'}/dashboard" class="button">Go to Dashboard</a>
              <p>If you have any questions, don't hesitate to reach out to our support team.</p>
              <p>Best regards,<br><strong>The Salam Scholarships Team</strong></p>
            </div>
            <div class="footer">
              <p>Salam Scholarships | Empowering Global Education</p>
              <p>© ${new Date().getFullYear()} All rights reserved</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to Salam Scholarships!

Dear ${name},

Welcome to Salam Scholarships - your gateway to global education!

We're thrilled to have you join our community of ambitious students seeking international opportunities.

What's Next?
- Complete your profile to get personalized program recommendations
- Explore thousands of scholarships, forums, and exchange programs
- Connect with our expert consultants for guidance

Visit your dashboard: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://salamconsulting.com'}/dashboard

If you have any questions, don't hesitate to reach out to our support team.

Best regards,
The Salam Scholarships Team

---
Salam Scholarships | Empowering Global Education
© ${new Date().getFullYear()} All rights reserved
    `,
  };
}

/**
 * Password Reset Email Template
 */
export function getPasswordResetEmail(data: EmailTemplateData & { resetLink: string }): { subject: string; html: string; text: string } {
  const name = data.name || 'User';
  
  return {
    subject: 'Reset Your Password - Salam Scholarships',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0a192f 0%, #1e3a5f 100%); color: #ffd700; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
            .button { display: inline-block; background: #ffd700; color: #0a192f; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request 🔒</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>We received a request to reset your password for your Salam Scholarships account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${data.resetLink}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${data.resetLink}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Never share your password reset link with anyone</li>
                </ul>
              </div>
              <p>Best regards,<br><strong>The Salam Scholarships Team</strong></p>
            </div>
            <div class="footer">
              <p>Salam Scholarships | Empowering Global Education</p>
              <p>© ${new Date().getFullYear()} All rights reserved</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Password Reset Request

Dear ${name},

We received a request to reset your password for your Salam Scholarships account.

Click the link below to reset your password:
${data.resetLink}

⚠️ Security Notice:
- This link will expire in 1 hour
- If you didn't request this, please ignore this email
- Never share your password reset link with anyone

Best regards,
The Salam Scholarships Team

---
Salam Scholarships | Empowering Global Education
© ${new Date().getFullYear()} All rights reserved
    `,
  };
}

/**
 * Event Registration Confirmation Template
 */
export function getEventRegistrationEmail(data: EmailTemplateData & { eventTitle: string; eventDate: string; eventLink?: string }): { subject: string; html: string; text: string } {
  const name = data.name || 'Participant';
  
  return {
    subject: `Registration Confirmed: ${data.eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0a192f 0%, #1e3a5f 100%); color: #ffd700; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
            .event-info { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #ffd700; color: #0a192f; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Registration Confirmed!</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Your registration for the following event has been confirmed:</p>
              <div class="event-info">
                <h2>${data.eventTitle}</h2>
                <p><strong>Date:</strong> ${data.eventDate}</p>
              </div>
              ${data.eventLink ? `<a href="${data.eventLink}" class="button">Join Event</a>` : ''}
              <p>We look forward to seeing you there!</p>
              <p>If you have any questions, please contact our support team.</p>
              <p>Best regards,<br><strong>The Salam Scholarships Team</strong></p>
            </div>
            <div class="footer">
              <p>Salam Scholarships | Empowering Global Education</p>
              <p>© ${new Date().getFullYear()} All rights reserved</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Registration Confirmed!

Dear ${name},

Your registration for the following event has been confirmed:

Event: ${data.eventTitle}
Date: ${data.eventDate}

${data.eventLink ? `Join Event: ${data.eventLink}` : ''}

We look forward to seeing you there!

If you have any questions, please contact our support team.

Best regards,
The Salam Scholarships Team

---
Salam Scholarships | Empowering Global Education
© ${new Date().getFullYear()} All rights reserved
    `,
  };
}

/**
 * New Opportunity Alert Template
 */
export function getNewOpportunityEmail(data: EmailTemplateData & { programTitle: string; programLink: string; deadline: string }): { subject: string; html: string; text: string } {
  const name = data.name || 'Student';
  
  return {
    subject: `🎓 New Opportunity: ${data.programTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0a192f 0%, #1e3a5f 100%); color: #ffd700; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
            .opportunity-card { background: #f8f9fa; padding: 20px; border-left: 4px solid #ffd700; margin: 20px 0; }
            .button { display: inline-block; background: #ffd700; color: #0a192f; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 New Opportunity Available!</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>We found a new opportunity that might interest you:</p>
              <div class="opportunity-card">
                <h2>${data.programTitle}</h2>
                <p><strong>Application Deadline:</strong> ${data.deadline}</p>
              </div>
              <a href="${data.programLink}" class="button">View Opportunity</a>
              <p>Don't miss out on this chance to advance your education!</p>
              <p>Best regards,<br><strong>The Salam Scholarships Team</strong></p>
            </div>
            <div class="footer">
              <p>Salam Scholarships | Empowering Global Education</p>
              <p>© ${new Date().getFullYear()} All rights reserved</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Opportunity Available!

Dear ${name},

We found a new opportunity that might interest you:

${data.programTitle}
Application Deadline: ${data.deadline}

View Opportunity: ${data.programLink}

Don't miss out on this chance to advance your education!

Best regards,
The Salam Scholarships Team

---
Salam Scholarships | Empowering Global Education
© ${new Date().getFullYear()} All rights reserved
    `,
  };
}

