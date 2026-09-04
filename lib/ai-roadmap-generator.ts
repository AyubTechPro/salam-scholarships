import { User, Program } from '@prisma/client';
import { createChatCompletionWithFallback } from '@/lib/ai-service';

export interface ApplicationRoadmapStep {
  week: number;
  title: string;
  description: string;
  isCompleted: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ApplicationRoadmap {
  programId: string;
  estimatedWeeks: number;
  strategySummary: string;
  steps: ApplicationRoadmapStep[];
}

/**
 * Generates a personalized application roadmap/timeline for a user applying to a specific program.
 * Calculates exactly what the user needs based on their target level, country, and program requirements.
 */
export async function generateApplicationRoadmap(user: Partial<User>, program: Partial<Program>, locale: string = 'en'): Promise<ApplicationRoadmap | null> {
  const languagePrompt = locale === 'tj' ? 'Respond in Tajik' : locale === 'ru' ? 'Respond in Russian' : 'Respond in English';

  const systemPrompt = `You are SALAM's Expert Educational Strategist. Your job is to create a weekly roadmap for a student applying to a scholarship/educational program.
You MUST output valid JSON only, exactly matching this structure:
{
  "estimatedWeeks": number,
  "strategySummary": "string",
  "steps": [
    {
      "week": number,
      "title": "string",
      "description": "string",
      "priority": "HIGH" | "MEDIUM" | "LOW"
    }
  ]
}

- "estimatedWeeks" should be realistic based on the deadline.
- "strategySummary" is 1-2 positive sentences of encouragement.
- Provide 4 to 8 clear, chronological weekly steps. 
- The very first step should ALWAYS be "Analyze Official Requirements & Eligibility".
- The very last step should ALWAYS be "Final Review & Submission".
- Focus heavily on motivation letters, language certificates, and gathering recommendations.
- Keep descriptions under 2 sentences.
${languagePrompt}. Do NOT wrap JSON in Markdown blocks, output RAW JSON only.`;

  const userPrompt = `Student Profile:
- Home Country: ${user.country || 'Unknown'}
- Primary Language: ${user.preferredLanguage || 'en'}

Target Program Details:
- Title: ${program.title}
- Country: ${program.country}
- Level: ${program.level}
- Deadline: ${program.deadline ? new Date(program.deadline).toDateString() : 'Unknown'}

Create the strategic roadmap JSON now.`;

  try {
    const result = await createChatCompletionWithFallback({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, // Low temperature for consistent JSON
      max_tokens: 1500,
      model: 'gpt-4o-mini' // Standard lightweight model
    });

    const cleanJson = result.content.replace(/```json\n?|\n?```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    // Validate and attach status
    const roadmap: ApplicationRoadmap = {
      programId: program.id || '',
      estimatedWeeks: parsedData.estimatedWeeks || 4,
      strategySummary: parsedData.strategySummary || 'Here is your personalized roadmap to success.',
      steps: Array.isArray(parsedData.steps) ? parsedData.steps.map((step: any, index: number) => ({
        week: step.week || index + 1,
        title: step.title || `Week ${index + 1}`,
        description: step.description || '',
        isCompleted: false,
        priority: step.priority || 'MEDIUM'
      })) : []
    };

    return roadmap;
  } catch (error) {
    console.error('[AI Roadmap Generator Error]', error);
    return null;
  }
}
