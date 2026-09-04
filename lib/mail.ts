/**
 * Email Service Integration
 * Supports Resend and SendGrid
 */

import { Resend } from 'resend';

// Get Resend instance (lazy initialization to ensure env vars are loaded)
function getResend() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  return apiKey ? new Resend(apiKey) : null;
}

const FROM_EMAIL = process.env.FROM_EMAIL?.trim() || 'noreply@salamscholarships.com';
const FROM_NAME = process.env.FROM_NAME?.trim() || 'Salam Scholarships';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send email using Resend or fallback to nodemailer
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    // Try Resend first
    const resend = getResend();
    if (resend) {
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      
      for (const recipient of recipients) {
        await resend.emails.send({
          from: options.from || `${FROM_NAME} <${FROM_EMAIL}>`,
          to: recipient,
          subject: options.subject,
          html: options.html,
          text: options.text || options.html.replace(/<[^>]*>/g, ''),
          replyTo: options.replyTo,
        });
      }

      return { success: true };
    }

    // Fallback to nodemailer if Resend is not configured
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      const nodemailer = await import('nodemailer');
      
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      
      for (const recipient of recipients) {
        await transporter.sendMail({
          from: options.from || FROM_EMAIL,
          to: recipient,
          subject: options.subject,
          html: options.html,
          text: options.text || options.html.replace(/<[^>]*>/g, ''),
          replyTo: options.replyTo,
        });
      }

      return { success: true };
    }

    // No email service configured
    // No email service configured
    return { 
      success: false, 
      error: 'Email service not configured' 
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Personalize email content with variables
 */
export function personalizeEmail(content: string, variables: Record<string, string>): string {
  let personalized = content;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    personalized = personalized.replace(regex, value);
  }
  
  return personalized;
}

