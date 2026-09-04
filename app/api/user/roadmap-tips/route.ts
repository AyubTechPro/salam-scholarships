/**
 * AI-Generated Tips for Roadmap Steps
 * Provides personalized tips based on user's current progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createChatCompletionWithFallback } from '@/lib/ai-service';

const TIPS_CACHE = new Map<string, { tips: string[]; expiresAt: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const stepId = searchParams.get('stepId');
    const locale = searchParams.get('locale') || 'en';

    if (!stepId) {
      return NextResponse.json(
        { success: false, error: 'Step ID is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${session.user.id}-${stepId}-${locale}`;
    const cached = TIPS_CACHE.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({
        success: true,
        data: { tips: cached.tips },
      });
    }

    // Fetch user's current progress
    const [user, applications, savedPrograms] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          profession: true,
          city: true,
          country: true,
          languageLevel: true,
          telegramOrPhone: true,
        },
      }),
      prisma.application.findMany({
        where: { userId: session.user.id },
        select: {
          cvUrl: true,
          motivationLetter: true,
          motivationScore: true,
        },
        take: 1,
      }),
      prisma.savedProgram.count({
        where: { userId: session.user.id },
      }),
    ]);

    // Generate tips based on step and user context
    const tips = await generateTipsForStep(stepId, user, applications, savedPrograms, locale);

    // Cache the tips
    TIPS_CACHE.set(cacheKey, {
      tips,
      expiresAt: Date.now() + CACHE_DURATION,
    });

    return NextResponse.json({
      success: true,
      data: { tips },
    });
  } catch (error) {
    console.error('Error generating roadmap tips:', error);
    const stepId = new URL(request.url).searchParams.get('stepId') || 'profile';
    const locale = new URL(request.url).searchParams.get('locale') || 'en';
    return NextResponse.json({
      success: true,
      data: { tips: getFallbackTips(stepId, locale) },
    });
  }
}

async function generateTipsForStep(
  stepId: string,
  user: any,
  applications: any[],
  savedPrograms: number,
  locale: string
): Promise<string[]> {
  const stepContext = getStepContext(stepId, user, applications, savedPrograms);
  const language = locale === 'ru' ? 'Russian' : locale === 'tj' ? 'Tajik' : 'English';

  const prompt = `You are an expert educational consultant helping students apply for international scholarships and programs. 

User Context:
- Name: ${user?.name || 'Student'}
- Profession: ${user?.profession || 'Not specified'}
- Location: ${user?.city || 'Unknown'}, ${user?.country || 'Unknown'}
- Language Level: ${user?.languageLevel || 'Not specified'}
- Saved Programs: ${savedPrograms}
- Has CV: ${applications[0]?.cvUrl ? 'Yes' : 'No'}
- Has Motivation Letter: ${applications[0]?.motivationLetter ? 'Yes' : 'No'}

Current Step: ${stepContext.title}
Step Description: ${stepContext.description}

Generate 3-5 practical, actionable tips in ${language} to help the user complete this step. Make the tips:
1. Specific and actionable
2. Relevant to their current situation
3. Encouraging and motivating
4. Professional but friendly

Format as a JSON array of tip strings. Example: ["Tip 1", "Tip 2", "Tip 3"]`;

  try {
    const result = await createChatCompletionWithFallback(
      {
        messages: [
          {
            role: 'system',
            content: 'You are a helpful educational consultant. Always respond with valid JSON arrays only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      'gemini'
    );

    // Parse AI response
    const content = result.content.trim();
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const tips = JSON.parse(jsonContent);

    if (Array.isArray(tips) && tips.length > 0) {
      return tips.slice(0, 5); // Limit to 5 tips
    }
  } catch (error) {
    console.error('Error parsing AI tips:', error);
  }

  // Fallback to default tips
  return getFallbackTips(stepId, locale);
}

function getStepContext(stepId: string, user: any, applications: any[], savedPrograms: number) {
  switch (stepId) {
    case 'profile':
      return {
        title: 'Complete Your Profile',
        description: `Help the user complete their profile. They currently have: profession=${!!user?.profession}, city=${!!user?.city}`,
      };
    case 'telegram':
      return {
        title: 'Connect Telegram',
        description: 'Help the user connect their Telegram account for notifications and support.',
      };
    case 'firstSave':
      return {
        title: 'Save Your First Program',
        description: `Help the user save their first program. They have ${savedPrograms} saved programs.`,
      };
    case 'application':
      return {
        title: 'Submit Your First Application',
        description: `Help the user submit their first application. They have ${applications.length} applications.`,
      };
    case 'cv':
      return {
        title: 'Upload Your CV',
        description: `Help the user upload their CV. They currently ${applications[0]?.cvUrl ? 'have' : 'do not have'} a CV uploaded.`,
      };
    case 'motivationLetter':
      return {
        title: 'Write Your Motivation Letter',
        description: `Help the user write their motivation letter. They currently ${applications[0]?.motivationLetter ? 'have' : 'do not have'} a motivation letter.`,
      };
    default:
      return {
        title: 'Complete This Step',
        description: 'Help the user complete this step in their journey.',
      };
  }
}

function getFallbackTips(stepId: string, locale: string): string[] {
  const tips: Record<string, Record<string, string[]>> = {
    profile: {
      en: [
        'Fill in your profession to help us match you with relevant opportunities',
        'Add your city location to see local events and programs',
        'Complete your bio to make your profile stand out to consultants',
      ],
      ru: [
        'Укажите вашу профессию, чтобы мы могли подобрать вам подходящие возможности',
        'Добавьте ваш город, чтобы видеть местные события и программы',
        'Заполните биографию, чтобы ваш профиль выделялся для консультантов',
      ],
      tj: [
        'Профессияи худро илова кунед, то мо имкониятҳои мувофиқро барои шумо пайдо кунем',
        'Шаҳри худро илова кунед, то рӯйдодҳо ва барномаҳои маҳаллиро бинед',
        'Биографияи худро пур кунед, то профили шумо барои машваратчиён ҷолиб бошад',
      ],
    },
    telegram: {
      en: [
        'Connect your Telegram to receive instant notifications about new opportunities',
        'Get real-time updates on application deadlines and status changes',
        'Chat directly with our consultants for personalized support',
      ],
      ru: [
        'Подключите Telegram, чтобы получать мгновенные уведомления о новых возможностях',
        'Получайте обновления в реальном времени о сроках подачи заявок и изменениях статуса',
        'Общайтесь напрямую с нашими консультантами для персональной поддержки',
      ],
      tj: [
        'Telegram-и худро пайванд кунед, то огоҳиҳои фаврӣ дар бораи имкониятҳои нав гиред',
        'Навсозиҳои вақти воқеиро дар бораи мӯҳлати дархостҳо ва тағйироти вазъият гиред',
        'Бо машваратчиёни мо мустақиман барои дастгирии шахсӣ чат кунед',
      ],
    },
    firstSave: {
      en: [
        'Browse opportunities and save programs that match your interests',
        'Saving programs helps you track deadlines and requirements',
        'You can apply directly from your saved programs list',
      ],
      ru: [
        'Просматривайте возможности и сохраняйте программы, которые соответствуют вашим интересам',
        'Сохранение программ помогает отслеживать сроки и требования',
        'Вы можете подать заявку напрямую из списка сохраненных программ',
      ],
      tj: [
        'Имкониятҳоро тамошо кунед ва барномаҳое, ки ба манфиатҳои шумо мувофиқанд, захира кунед',
        'Захира кардани барномаҳо ба шумо кӯмак мекунад, ки мӯҳлатҳо ва талаботҳоро пайгирӣ кунед',
        'Шумо метавонед аз рӯйхати барномаҳои захирашуда мустақиман дархост диҳед',
      ],
    },
    application: {
      en: [
        'Review the program requirements carefully before applying',
        'Prepare your CV and motivation letter in advance',
        'Submit your application before the deadline to avoid last-minute issues',
      ],
      ru: [
        'Внимательно ознакомьтесь с требованиями программы перед подачей заявки',
        'Подготовьте резюме и мотивационное письмо заранее',
        'Подайте заявку до истечения срока, чтобы избежать проблем в последнюю минуту',
      ],
      tj: [
        'Пеш аз дархост кардан, талаботҳои барномаро бодиққат баррасӣ кунед',
        'CV ва номаи мотиватсионии худро пешакӣ тайёр кунед',
        'Пеш аз мӯҳлат дархости худро пешниҳод кунед, то аз мушкилоти охирин давра пешгирӣ кунед',
      ],
    },
    cv: {
      en: [
        'Keep your CV updated with your latest education and experience',
        'Use a professional format and clear, concise language',
        'Highlight achievements relevant to the program you\'re applying for',
      ],
      ru: [
        'Обновляйте резюме с последним образованием и опытом',
        'Используйте профессиональный формат и четкий, лаконичный язык',
        'Выделите достижения, относящиеся к программе, на которую вы подаете заявку',
      ],
      tj: [
        'CV-и худро бо таълимоти ва таҷрибаи охирини худ навсозӣ кунед',
        'Формати касбӣ ва забони равшан ва мухтасарро истифода баред',
        'Достиженияҳое, ки ба барномае, ки шумо барои он дархост мекунед, мувофиқанд, намоён кунед',
      ],
    },
    motivationLetter: {
      en: [
        'Explain why you are interested in this specific program',
        'Show how your background aligns with the program requirements',
        'Be authentic and personal - tell your unique story',
      ],
      ru: [
        'Объясните, почему вас интересует именно эта программа',
        'Покажите, как ваш опыт соответствует требованиям программы',
        'Будьте аутентичными и личными - расскажите свою уникальную историю',
      ],
      tj: [
        'Тавзеҳ диҳед, ки чаро шумо ба ин барномаи мушаххас дилчасп ҳастед',
        'Нишон диҳед, ки таърихи шумо бо талаботҳои барнома мувофиқат мекунад',
        'Содиқ ва шахсӣ бошед - достони беназири худро нақл кунед',
      ],
    },
  };

  const stepTips = tips[stepId] || tips.profile;
  return stepTips[locale] || stepTips.en;
}

