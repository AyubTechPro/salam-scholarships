/**
 * Seed Content API
 * Creates default FAQs and How-It-Works steps for initial setup
 * Run once after migration: POST /api/admin/seed-content
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminAPI } from '@/lib/rbac-api';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireSuperAdminAPI();
    if (error) return error;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Seed FAQs
    const existingFAQs = await prisma.fAQ.count();
    if (existingFAQs === 0) {
      await prisma.fAQ.createMany({
        data: [
          {
            question: 'How do I apply for a scholarship?',
            questionRu: 'Как подать заявку на стипендию?',
            questionTj: 'Чӣ тавр барои стипендия дархост диҳам?',
            answer: 'To apply for a scholarship, first create an account on our platform. Then browse available opportunities and click "Apply Now" on any program that interests you. You\'ll need to provide your academic documents, motivation letter, and other required materials.',
            answerRu: 'Чтобы подать заявку на стипендию, сначала создайте учетную запись на нашей платформе. Затем просмотрите доступные возможности и нажмите "Подать заявку" на любую программу, которая вас интересует. Вам нужно будет предоставить ваши академические документы, мотивационное письмо и другие необходимые материалы.',
            answerTj: 'Барои дархост кардани стипендия, аввал ҳисоби худро дар платформаи мо эҷод кунед. Сипас имкониятҳои дастрасро тамошо кунед ва дар ҳар як барномае, ки шуморо таваҷҷуҳ медиҳад, "Ҳозир дархост диҳед"-ро пахш кунед. Шумо бояд ҳуҷҷатҳои таълимӣ, номаи мотиватсионӣ ва материалҳои дигари заруриро таъмин кунед.',
            category: 'APPLICATION',
            order: 1,
            isActive: true,
          },
          {
            question: 'What documents do I need?',
            questionRu: 'Какие документы мне нужны?',
            questionTj: 'Кадом ҳуҷҷатҳо ба ман лозим аст?',
            answer: 'Typically, you\'ll need: academic transcripts, diploma/degree certificates, passport copy, CV/resume, motivation letter, recommendation letters, and proof of English proficiency (IELTS/TOEFL). Requirements vary by program, so check each opportunity\'s specific requirements.',
            answerRu: 'Обычно вам понадобятся: академические справки, дипломы/степени, копия паспорта, резюме, мотивационное письмо, рекомендательные письма и подтверждение знания английского языка (IELTS/TOEFL). Требования различаются в зависимости от программы, поэтому проверьте конкретные требования каждой возможности.',
            answerTj: 'Одатан, ба шумо лозим меояд: транскриптҳои таълимӣ, сертификатҳои диплом/дараҷа, нусхаи паспорт, CV/резюме, номаи мотиватсионӣ, номаҳои тавсиянома ва исботи донистани забони англисӣ (IELTS/TOEFL). Талабоҳо аз рӯи барнома фарқ мекунанд, бинобар ин талаботи мушаххаси ҳар як имкониятро санҷед.',
            category: 'APPLICATION',
            order: 2,
            isActive: true,
          },
          {
            question: 'Is there an application fee?',
            questionRu: 'Есть ли плата за подачу заявки?',
            questionTj: 'Оё барои дархост кардан пардохт вуҷуд дорад?',
            answer: 'Our platform is free to use. However, some universities or programs may charge application fees directly. Always check the official program website for fee information. We provide free consultations to help you navigate the application process.',
            answerRu: 'Наша платформа бесплатна для использования. Однако некоторые университеты или программы могут взимать плату за подачу заявки напрямую. Всегда проверяйте официальный веб-сайт программы для получения информации о плате. Мы предоставляем бесплатные консультации, чтобы помочь вам ориентироваться в процессе подачи заявки.',
            answerTj: 'Платформаи мо ройгон аст. Аммо, баъзе донишгоҳҳо ё барномаҳо метавонанд пардохти дархостро бевосита гиранд. Ҳамеша вебсайти расмии барномаро барои маълумот дар бораи пардохт санҷед. Мо машваратҳои ройгонро таъмин мекунем, то ба шумо кӯмак кунем дар раванди дархост.',
            category: 'GENERAL',
            order: 3,
            isActive: true,
          },
          {
            question: 'How long does the application process take?',
            questionRu: 'Сколько времени занимает процесс подачи заявки?',
            questionTj: 'Раванди дархост чанд вақт мегирад?',
            answer: 'Application processing times vary by program and university. Typically, it takes 2-6 weeks for initial review, and 4-12 weeks for final decisions. We recommend applying at least 3-6 months before program deadlines to ensure you have time to gather all documents.',
            answerRu: 'Время обработки заявок варьируется в зависимости от программы и университета. Обычно первоначальный обзор занимает 2-6 недель, а окончательные решения - 4-12 недель. Мы рекомендуем подавать заявки как минимум за 3-6 месяцев до крайних сроков программы, чтобы у вас было время собрать все документы.',
            answerTj: 'Вақти коркарди дархостҳо аз рӯи барнома ва донишгоҳ фарқ мекунад. Одатан, барои санҷиши ибтидоӣ 2-6 ҳафта ва барои қарорҳои ниҳоӣ 4-12 ҳафта лозим аст. Мо тавсия медиҳем, ки ҳадди ақалл 3-6 моҳ пеш аз охири мӯҳлати барнома дархост диҳед, то вақт дошта бошед барои гирдоварии ҳамаи ҳуҷҷатҳо.',
            category: 'APPLICATION',
            order: 4,
            isActive: true,
          },
        ],
      });
    }

    // Seed How-It-Works Steps
    const existingSteps = await prisma.howItWorksStep.count();
    if (existingSteps === 0) {
      await prisma.howItWorksStep.createMany({
        data: [
          {
            stepNumber: 1,
            title: 'What is your education level?',
            titleRu: 'Какой у вас уровень образования?',
            titleTj: 'Сатҳи таҳсилоти шумо чист?',
            description: 'Select your current or desired education level',
            descriptionRu: 'Выберите ваш текущий или желаемый уровень образования',
            descriptionTj: 'Сатҳи ҷории ё мақсади таҳсилоти худро интихоб кунед',
            icon: 'GraduationCap',
            order: 0,
            isActive: true,
          },
          {
            stepNumber: 2,
            title: 'Which country interests you?',
            titleRu: 'Какая страна вас интересует?',
            titleTj: 'Кадом кишвар шуморо таваҷҷуҳ медиҳад?',
            description: 'Choose the country where you want to study',
            descriptionRu: 'Выберите страну, где вы хотите учиться',
            descriptionTj: 'Кишвареро интихоб кунед, ки дар он таҳсил кардан мехоҳед',
            icon: 'Globe',
            order: 1,
            isActive: true,
          },
          {
            stepNumber: 3,
            title: 'What field of study?',
            titleRu: 'Какая область обучения?',
            titleTj: 'Кадом соҳаи таҳсилот?',
            description: 'Enter your field of interest or study area',
            descriptionRu: 'Введите вашу область интересов или обучения',
            descriptionTj: 'Соҳаи манфиат ё таҳсилоти худро ворид кунед',
            icon: 'BookOpen',
            order: 2,
            isActive: true,
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Content seeded successfully',
      data: {
        faqsCreated: existingFAQs === 0,
        stepsCreated: existingSteps === 0,
      },
    });
  } catch (error) {
    console.error('Error seeding content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed content' },
      { status: 500 }
    );
  }
}

