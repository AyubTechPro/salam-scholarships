/**
 * Email Template Database Utility
 * Fetches email templates from database and replaces variables
 */

import { prisma } from './prisma';
import { useLocale } from 'next-intl';

interface TemplateVariables {
  [key: string]: string | number | undefined;
}

/**
 * Replace template variables in content
 * Example: "Hello {{name}}" with {name: "John"} becomes "Hello John"
 */
export function replaceTemplateVariables(content: string, variables: TemplateVariables): string {
  let result = content;
  Object.keys(variables).forEach((key) => {
    const value = variables[key] || '';
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, String(value));
  });
  return result;
}

/**
 * Get email template from database by key
 */
export async function getEmailTemplate(
  templateKey: 'WELCOME' | 'PASSWORD_RESET' | 'OTP' | 'EVENT_REGISTRATION' | 'NEW_OPPORTUNITY',
  locale: string = 'en'
): Promise<{ subject: string; html: string; text: string } | null> {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { 
        templateKey,
        isActive: true,
      },
    });

    if (!template) {
      return null;
    }

    // Select locale-specific content
    const subject = (locale === 'ru' && template.subjectRu) 
      ? template.subjectRu 
      : (locale === 'tj' && template.subjectTj)
      ? template.subjectTj
      : template.subject;

    const html = (locale === 'ru' && template.htmlContentRu) 
      ? template.htmlContentRu 
      : (locale === 'tj' && template.htmlContentTj)
      ? template.htmlContentTj
      : template.htmlContent;

    const text = (locale === 'ru' && template.textContentRu) 
      ? template.textContentRu 
      : (locale === 'tj' && template.textContentTj)
      ? template.textContentTj
      : template.textContent;

    return {
      subject,
      html,
      text,
    };
  } catch (error) {
    console.error(`Error fetching email template ${templateKey}:`, error);
    return null;
  }
}

/**
 * Get formatted email with variables replaced
 */
export async function getFormattedEmail(
  templateKey: 'WELCOME' | 'PASSWORD_RESET' | 'OTP' | 'EVENT_REGISTRATION' | 'NEW_OPPORTUNITY',
  variables: TemplateVariables,
  locale: string = 'en'
): Promise<{ subject: string; html: string; text: string } | null> {
  const template = await getEmailTemplate(templateKey, locale);
  
  if (!template) {
    // Fallback to hardcoded templates if DB template not found
    const { getWelcomeEmail, getPasswordResetEmail, getEventRegistrationEmail, getNewOpportunityEmail } = await import('./email-templates');
    
    switch (templateKey) {
      case 'WELCOME':
        return getWelcomeEmail(variables);
      case 'PASSWORD_RESET':
        return getPasswordResetEmail(variables as any);
      case 'EVENT_REGISTRATION':
        return getEventRegistrationEmail(variables as any);
      case 'NEW_OPPORTUNITY':
        return getNewOpportunityEmail(variables as any);
      case 'OTP':
        // OTP template fallback
        return {
          subject: 'Verify Your Email - Salam Scholarships',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0a192f;">Welcome to Salam Scholarships, {{name}}!</h2>
              <p>Thank you for signing up. Please verify your email address using the OTP code below:</p>
              <div style="background: #ffd700; color: #0a192f; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; margin: 20px 0; border-radius: 8px;">
                {{otp}}
              </div>
              <p style="color: #666;">This code will expire in 10 minutes.</p>
            </div>
          `,
          text: `Welcome! Your OTP is: {{otp}}`,
        };
      default:
        return null;
    }
  }

  // Replace variables in all content
  return {
    subject: replaceTemplateVariables(template.subject, variables),
    html: replaceTemplateVariables(template.html, variables),
    text: replaceTemplateVariables(template.text, variables),
  };
}

