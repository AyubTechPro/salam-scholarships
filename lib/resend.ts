import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  // RESEND_API_KEY not configured
}

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.RESEND_FROM_EMAIL || 'Salam Scholarships <noreply@salamconsulting.com>',
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  if (!resend) {
    console.error('Resend not configured. Email not sent.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

