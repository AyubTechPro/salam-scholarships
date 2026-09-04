/**
 * Test Email Script
 * Tests email functionality with configured SMTP or Resend
 * 
 * Usage: npm run test-email
 * Or: npx tsx scripts/test-email.ts
 */

// Load environment variables from .env file (must be first)
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from project root
config({ path: resolve(process.cwd(), '.env') });

import { sendEmail } from '../lib/mail';

async function main() {
  console.log('📧 Testing Email Service...\n');

  // Check environment variables
  const resendKey = process.env.RESEND_API_KEY;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = process.env.SMTP_PORT || '587';
  const fromEmail = process.env.FROM_EMAIL || 'noreply@salamconsulting.com';

  console.log('Environment Variables:');
  console.log(`  RESEND_API_KEY: ${resendKey ? '✅ Set (' + resendKey.substring(0, 5) + '...)' : '❌ Not set'}`);
  console.log(`  SMTP_USER: ${smtpUser ? '✅ Set (' + smtpUser + ')' : '❌ Not set'}`);
  console.log(`  SMTP_PASSWORD: ${smtpPass ? '✅ Set (' + '*'.repeat(smtpPass.length) + ')' : '❌ Not set'}`);
  console.log(`  SMTP_HOST: ${smtpHost}`);
  console.log(`  SMTP_PORT: ${smtpPort}`);
  console.log(`  FROM_EMAIL: ${fromEmail}\n`);

  if (!resendKey && (!smtpUser || !smtpPass)) {
    console.error('❌ Error: No email service configured!');
    console.error('   Please set either:');
    console.error('   - RESEND_API_KEY (recommended), or');
    console.error('   - SMTP_USER and SMTP_PASSWORD');
    process.exit(1);
  }

  // Get test email from command line or use a default
  const testEmail = process.argv[2] || process.env.TEST_EMAIL || 'test@example.com';

  if (!testEmail.includes('@')) {
    console.error('❌ Error: Invalid email address');
    console.error('   Usage: npm run test-email <your-email@example.com>');
    process.exit(1);
  }

  console.log(`📨 Sending test email to: ${testEmail}\n`);

  try {
    const result = await sendEmail({
      to: testEmail,
      subject: 'Test Email - Salam Consulting',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0a192f;">✅ Email Service Test</h2>
          <p>This is a test email from <strong>Salam Consulting</strong>.</p>
          <p>If you received this email, your email service is configured correctly!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            Service: ${resendKey ? 'Resend' : 'SMTP (Nodemailer)'}<br>
            Sent at: ${new Date().toISOString()}
          </p>
        </div>
      `,
      text: 'This is a test email from Salam Consulting. If you received this email, your email service is configured correctly!',
    });

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log(`   Check your inbox: ${testEmail}`);
      if (result.error) {
        console.warn('   Warning:', result.error);
      }
    } else {
      console.error('❌ Failed to send email:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

main();

