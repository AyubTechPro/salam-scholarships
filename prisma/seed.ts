import { PrismaClient, ProgramLevel, FundingType, ProgramCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ============================================
  // PRIORITY #1: Ensure Ayub's SUPER_ADMIN Account
  // ============================================
  console.log('👤 Ensuring Ayub\'s SUPER_ADMIN account exists...');
  const ayubEmail = 'ayubtechpro@gmail.com';
  const ayubPassword = 'password123'; // Default password - change in production!
  const hashedPassword = await bcrypt.hash(ayubPassword, 10);

  const ayubUser = await prisma.user.upsert({
    where: { email: ayubEmail },
    update: {
      // Always ensure these fields are set correctly
      role: 'SUPER_ADMIN',
      emailVerified: new Date(), // Ensure email is verified
      name: 'Ayub Muhabbatzoda',
      // Update password only if it's the default (optional - for security, you might want to skip this)
      // password: hashedPassword, // Uncomment if you want to reset password on each seed
    },
    create: {
      email: ayubEmail,
      password: hashedPassword,
      name: 'Ayub Muhabbatzoda',
      role: 'SUPER_ADMIN',
      emailVerified: new Date(), // Verified immediately - no email verification needed
    },
  });

  console.log(`✅ Ayub's account: ${ayubUser.email} (${ayubUser.role}) - Ready to use!`);
  console.log(`   Password: ${ayubPassword} (change this in production!)`);

  // Initialize SiteSettings
  console.log('⚙️ Initializing SiteSettings...');
  await prisma.siteSettings.upsert({
    where: { id: 'global' },
    update: {
      siteName: 'Salam Scholarships',
      siteNameRu: 'Салам Консалтинг',
      siteNameTj: 'Салом Консалтинг',
      footerText: 'Connecting students worldwide with global educational opportunities, scholarships, and professional development programs.',
      footerTextRu: 'Соединяем студентов по всему миру с глобальными образовательными возможностями, стипендиями и программами профессионального развития.',
      footerTextTj: 'Пайванди донишҷӯён дар тамоми ҷаҳон бо имкониятҳои таълимии ҷаҳонӣ, стипендияҳо ва барномаҳои рушди касбӣ.',
    },
    create: {
      id: 'global',
      siteName: 'Salam Scholarships',
      siteNameRu: 'Салам Консалтинг',
      siteNameTj: 'Салом Консалтинг',
      footerText: 'Connecting students worldwide with global educational opportunities, scholarships, and professional development programs.',
      footerTextRu: 'Соединяем студентов по всему миру с глобальными образовательными возможностями, стипендиями и программами профессионального развития.',
      footerTextTj: 'Пайванди донишҷӯён дар тамоми ҷаҳон бо имкониятҳои таълимии ҷаҳонӣ, стипендияҳо ва барномаҳои рушди касбӣ.',
    },
  });
  console.log('✅ SiteSettings initialized');

  // Initialize SiteStats with marketing offsets
  console.log('📊 Initializing SiteStats...');
  await prisma.siteStats.upsert({
    where: { id: 'global' },
    update: {
      manualProgramsOffset: 150,
      manualCountriesOffset: 30,
      manualConsultationsBase: 2000,
      showLiveCounts: true,
    },
    create: {
      id: 'global',
      manualProgramsOffset: 150,
      manualCountriesOffset: 30,
      manualConsultationsBase: 2000,
      showLiveCounts: true,
    },
  });
  console.log('✅ SiteStats initialized');

  // Initialize Hero Slides (Safe: Only create if doesn't exist)
  console.log('🎨 Seeding Hero Slides...');
  const heroSlides = [
    {
      title: 'Welcome to Salam Scholarships',
      titleRu: 'Добро пожаловать в Salam Scholarships',
      titleTj: 'Хуш омадед ба Salam Scholarships',
      subtitle: 'Tajikistan\'s first educational consulting platform for international opportunities.',
      subtitleRu: 'Первая образовательная консалтинговая платформа Таджикистана для международных возможностей.',
      subtitleTj: 'Аввалин платформаи машваратии таълимии Тоҷикистон барои имкониятҳои байналмилалӣ.',
      imageUrl: 'https://i.postimg.cc/zGDPz2CK/Chat-GPT-Image-Sep-7-2025-11-22-34-PM.png',
      buttonText: 'Learn More',
      buttonTextRu: 'Узнать больше',
      buttonTextTj: 'Маълумоти бештар',
      buttonLink: '/opportunities',
      order: 0,
      isActive: true,
    },
    {
      title: 'Your Path to Success Starts Here',
      titleRu: 'Ваш путь к успеху начинается здесь',
      titleTj: 'Роҳи шумо ба муваффақият аз ин ҷо оғоз мешавад',
      subtitle: 'Discover scholarships, exchange programs, forums, and summer schools worldwide.',
      subtitleRu: 'Откройте для себя стипендии, программы обмена, форумы и летние школы по всему миру.',
      subtitleTj: 'Стипендияҳо, барномаҳои мубодила, форумҳо ва мактабҳои тобистонаро дар тамоми ҷаҳон кашф кунед.',
      imageUrl: 'https://i.postimg.cc/9F9m9HBr/IMG-6623.jpg',
      buttonText: 'View Programs',
      buttonTextRu: 'Программы',
      buttonTextTj: 'Барномаҳо',
      buttonLink: '/opportunities',
      order: 1,
      isActive: true,
    },
    {
      title: 'Book Your Free Consultation',
      titleRu: 'Запишитесь на бесплатную консультацию',
      titleTj: 'Барои машварати ройгон сабт кунед',
      subtitle: 'Get expert guidance on your educational journey. Connect with our consultants via Telegram.',
      subtitleRu: 'Получите экспертную поддержку на вашем образовательном пути. Свяжитесь с нашими консультантами через Telegram.',
      subtitleTj: 'Роҳнамоии мутахассис дар роҳи таълимии худро ба даст оред. Бо машваратчиёни мо тавассути Telegram пайванд шавед.',
      imageUrl: 'https://i.postimg.cc/htpKXg84/IMG-7703.jpg',
      buttonText: 'Get Consultation',
      buttonTextRu: 'Telegram',
      buttonTextTj: 'Telegram',
      buttonLink: 'telegram:',
      order: 2,
      isActive: true,
    },
  ];

  // Safe: Only create hero slides if they don't already exist (by title + order)
  let createdSlides = 0;
  let skippedSlides = 0;
  for (const slide of heroSlides) {
    const existing = await prisma.heroSlide.findFirst({
      where: {
        title: slide.title,
        order: slide.order,
      },
    });

    if (!existing) {
      await prisma.heroSlide.create({
        data: slide,
      });
      createdSlides++;
    } else {
      skippedSlides++;
    }
  }
  console.log(`✅ Hero Slides: ${createdSlides} created, ${skippedSlides} skipped (already exist)`);

  // Create sample opportunities
  const opportunities = [
    {
      title: 'Fulbright Scholarship Program 2024',
      titleRu: 'Программа стипендий Фулбрайт 2024',
      titleTj: 'Барномаи стипендияи Фулбрайт 2024',
      description: 'Full funding for Master\'s and PhD programs in the United States. Open to all fields of study. This prestigious program offers comprehensive financial support including tuition, living expenses, and travel costs.',
      descriptionRu: 'Полное финансирование программ магистратуры и докторантуры в Соединенных Штатах. Открыто для всех областей обучения. Эта престижная программа предлагает комплексную финансовую поддержку, включая плату за обучение, расходы на проживание и транспорт.',
      descriptionTj: 'Молиявии пурра барои барномаҳои магистратура ва докторантура дар Иёлоти Муттаҳида. Барои ҳамаи соҳаҳои таҳсил кушода аст. Ин барномаи эътиборнок дастгирии молиявии пурраро пешниҳод мекунад, аз ҷумла баҳаи таҳсил, хароҷоти зиндагӣ ва хароҷоти сафар.',
      slug: 'fulbright-scholarship-2024',
      level: ProgramLevel.MASTER,
      category: ProgramCategory.SCHOLARSHIP,
      fundingType: FundingType.FULL,
      country: 'United States',
      institution: 'Fulbright Commission',
      deadline: new Date('2024-12-31'),
      startDate: new Date('2025-08-01'),
      endDate: new Date('2027-05-31'),
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
      websiteUrl: 'https://fulbright.org',
      applicationUrl: 'https://apply.fulbright.org',
      isVerified: true,
      isActive: true,
      requiresEnglishCert: true,
    },
    {
      title: 'Erasmus+ Summer School',
      titleRu: 'Летняя школа Erasmus+',
      titleTj: 'Мактаби тобистонаи Erasmus+',
      description: 'Join students from across Europe for an intensive summer program in cultural studies. Experience diverse perspectives, build international networks, and enhance your academic profile.',
      descriptionRu: 'Присоединяйтесь к студентам со всей Европы для интенсивной летней программы по культурным исследованиям. Испытайте разнообразные перспективы, создайте международные сети и улучшите свой академический профиль.',
      descriptionTj: 'Ба донишҷӯёни тамоми Аврупо пайванд шавед барои барномаи тобистонаи фаъол дар омӯзиши фарҳанг. Таҷрибаи назароти гуногун, сохтани шабакаҳои байналмилалӣ ва беҳтар кардани профили академикии худ.',
      slug: 'erasmus-summer-school-2024',
      level: ProgramLevel.BACHELOR,
      category: ProgramCategory.SUMMER_SCHOOL,
      fundingType: FundingType.PARTIAL,
      country: 'Germany',
      institution: 'Erasmus+ Program',
      deadline: new Date('2024-06-15'),
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-08-15'),
      imageUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800',
      websiteUrl: 'https://erasmus-plus.ec.europa.eu',
      applicationUrl: 'https://apply.erasmus.eu',
      isVerified: true,
      isActive: true,
      requiresEnglishCert: true,
    },
    {
      title: 'Global Youth Forum 2024',
      titleRu: 'Глобальный молодежный форум 2024',
      titleTj: 'Форуми ҷавонони ҷаҳонӣ 2024',
      description: 'International forum for young leaders to discuss global challenges and solutions. Network with peers, attend workshops, and present your ideas to international audiences.',
      descriptionRu: 'Международный форум для молодых лидеров для обсуждения глобальных проблем и решений. Общайтесь с коллегами, посещайте мастер-классы и представляйте свои идеи международной аудитории.',
      descriptionTj: 'Форуми байналмилалӣ барои сарварони ҷавон барои муҳокимаи мушкилоти ҷаҳонӣ ва ҳалҳо. Бо ҳамтоён шабакасозӣ кунед, дар корхонаҳо иштирок кунед ва идеяҳои худро ба ҳадафи байналмилалӣ пешниҳод кунед.',
      slug: 'global-youth-forum-2024',
      level: ProgramLevel.BACHELOR,
      category: ProgramCategory.FORUM,
      fundingType: FundingType.FULL,
      country: 'Netherlands',
      institution: 'Global Youth Network',
      deadline: new Date('2024-08-20'),
      startDate: new Date('2024-09-15'),
      endDate: new Date('2024-09-20'),
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      websiteUrl: 'https://globalyouthforum.org',
      applicationUrl: 'https://apply.globalyouthforum.org',
      isVerified: false,
      isActive: true,
    },
    {
      title: 'Chevening Scholarships',
      titleRu: 'Стипендии Chevening',
      titleTj: 'Стипендияҳои Chevening',
      description: 'UK government\'s global scholarship programme. Funded by the Foreign, Commonwealth & Development Office and partner organisations. Offers fully-funded master\'s degrees at UK universities.',
      descriptionRu: 'Глобальная стипендиальная программа правительства Великобритании. Финансируется Министерством иностранных дел, по делам Содружества и развития и организациями-партнерами. Предлагает полностью финансируемые степени магистра в университетах Великобритании.',
      descriptionTj: 'Барномаи глобалии стипендияи ҳукумати Британияи Кабир. Аз ҷониби Вазорати корҳои хориҷӣ, Содружество ва рушд ва ташкилотҳои шарик молиявӣ мешавад. Дараҷаҳои магистратураи пурра молиявӣ дар донишгоҳҳои Британияро пешниҳод мекунад.',
      slug: 'chevening-scholarships-2024',
      level: ProgramLevel.MASTER,
      category: ProgramCategory.SCHOLARSHIP,
      fundingType: FundingType.FULL,
      country: 'United Kingdom',
      institution: 'UK Government',
      deadline: new Date('2024-11-01'),
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-09-01'),
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
      websiteUrl: 'https://www.chevening.org',
      applicationUrl: 'https://www.chevening.org/apply',
      isVerified: true,
      isActive: true,
      requiresEnglishCert: true,
    },
    {
      title: 'Türkiye Bursları Scholarship',
      titleRu: 'Стипендия Türkiye Bursları',
      titleTj: 'Стипендияи Türkiye Bursları',
      description: 'Comprehensive scholarship programme for international students. Covers tuition fees, accommodation, health insurance, and monthly stipend. Available for undergraduate, master\'s, and PhD programs.',
      descriptionRu: 'Комплексная стипендиальная программа для иностранных студентов. Покрывает плату за обучение, проживание, медицинскую страховку и ежемесячную стипендию. Доступна для программ бакалавриата, магистратуры и докторантуры.',
      descriptionTj: 'Барномаи пурраи стипендия барои донишҷӯёни хориҷӣ. Баҳаи таҳсил, ҷойгиршавӣ, бимномаи тиббӣ ва стипендияи моҳонаро фаро мегирад. Барои барномаҳои бакалавр, магистр ва доктор дастрас аст.',
      slug: 'turkiye-burslari-2024',
      level: ProgramLevel.BACHELOR,
      category: ProgramCategory.SCHOLARSHIP,
      fundingType: FundingType.FULL,
      country: 'Turkey',
      institution: 'Türkiye Scholarships',
      deadline: new Date('2024-02-20'),
      startDate: new Date('2024-09-01'),
      endDate: new Date('2028-06-30'),
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
      websiteUrl: 'https://www.turkiyeburslari.gov.tr',
      applicationUrl: 'https://tbbs.turkiyeburslari.gov.tr',
      isVerified: true,
      isActive: true,
      requiresEnglishCert: true,
    },
  ];

  console.log('📝 Creating opportunities...');
  for (const opp of opportunities) {
    await prisma.program.upsert({
      where: { slug: opp.slug },
      update: {},
      create: opp,
    });
  }

  console.log(`✅ Created ${opportunities.length} opportunities`);

  // Create categories
  const categories = [
    {
      name: 'Scholarships',
      nameRu: 'Стипендии',
      nameTj: 'Стипендияҳо',
      slug: 'scholarships',
      description: 'Fully and partially funded scholarship opportunities',
    },
    {
      name: 'Exchange Programs',
      nameRu: 'Программы обмена',
      nameTj: 'Барномаҳои мубодила',
      slug: 'exchange-programs',
      description: 'Student exchange and mobility programs',
    },
    {
      name: 'Forums & Conferences',
      nameRu: 'Форумы и конференции',
      nameTj: 'Форумҳо ва конференсияҳо',
      slug: 'forums-conferences',
      description: 'International forums and academic conferences',
    },
    {
      name: 'Summer Programs',
      nameRu: 'Летние программы',
      nameTj: 'Барномаҳои тобистона',
      slug: 'summer-programs',
      description: 'Summer schools and intensive programs',
    },
  ];

  console.log('📝 Creating categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log(`✅ Created ${categories.length} categories`);

  // Seed NavigationMenu (Safe: Only create if doesn't exist by location + href)
  console.log('🔗 Seeding NavigationMenu...');
  const navbarLinks = [
    { label: 'Home', labelRu: 'Главная', labelTj: 'Асосӣ', href: '/', location: 'navbar', order: 0, isActive: true },
    { label: 'Opportunities', labelRu: 'Возможности', labelTj: 'Имкониятҳо', href: '/opportunities', location: 'navbar', order: 1, isActive: true },
    { label: 'Achievements', labelRu: 'Достижения', labelTj: 'Муваффақиятҳо', href: '/achievements', location: 'navbar', order: 2, isActive: true },
    { label: 'Partners', labelRu: 'Партнеры', labelTj: 'Шарикон', href: '/partners', location: 'navbar', order: 3, isActive: true },
    { label: 'About', labelRu: 'О нас', labelTj: 'Лоиҳа', href: '/about', location: 'navbar', order: 4, isActive: true },
  ];

  const footerLinks = [
    // Quick Links
    { label: 'Opportunities', labelRu: 'Возможности', labelTj: 'Имкониятҳо', href: '/opportunities', location: 'footer', section: 'quickLinks', order: 1, isActive: true },
    { label: 'About Us', labelRu: 'О нас', labelTj: 'Дар бораи мо', href: '/about', location: 'footer', section: 'quickLinks', order: 2, isActive: true },
    { label: 'Contact', labelRu: 'Контакты', labelTj: 'Тамос', href: '/contact', location: 'footer', section: 'quickLinks', order: 3, isActive: true },
    // Support
    { label: 'Consulting', labelRu: 'Консультации', labelTj: 'Машварат', href: '/consulting', location: 'footer', section: 'support', order: 1, isActive: true },
    { label: 'FAQ', labelRu: 'Часто задаваемые вопросы', labelTj: 'Саволҳои зуд-зуд', href: '/faq', location: 'footer', section: 'support', order: 2, isActive: true },
    // Legal
    { label: 'Privacy Policy', labelRu: 'Политика конфиденциальности', labelTj: 'Сиёсати махфият', href: '/privacy', location: 'footer', section: 'legal', order: 1, isActive: true },
    { label: 'Terms of Service', labelRu: 'Условия использования', labelTj: 'Шартҳои истифода', href: '/terms', location: 'footer', section: 'legal', order: 2, isActive: true },
  ];

  let createdNavLinks = 0;
  let skippedNavLinks = 0;
  for (const link of navbarLinks) {
    const existing = await prisma.navigationMenu.findFirst({
      where: {
        location: link.location,
        href: link.href,
      },
    });

    if (!existing) {
      await prisma.navigationMenu.create({
        data: link,
      });
      createdNavLinks++;
    } else {
      skippedNavLinks++;
    }
  }

  let createdFooterLinks = 0;
  let skippedFooterLinks = 0;
  for (const link of footerLinks) {
    const existing = await prisma.navigationMenu.findFirst({
      where: {
        location: link.location,
        href: link.href,
        section: link.section,
      },
    });

    if (!existing) {
      await prisma.navigationMenu.create({
        data: link,
      });
      createdFooterLinks++;
    } else {
      skippedFooterLinks++;
    }
  }

  console.log(`✅ NavigationMenu: ${createdNavLinks} navbar links created, ${skippedNavLinks} skipped`);
  console.log(`✅ NavigationMenu: ${createdFooterLinks} footer links created, ${skippedFooterLinks} skipped`);

  // Seed UIDictionary (Safe: Use upsert since 'key' is unique)
  console.log('📖 Seeding UIDictionary...');
  const dictionaryEntries = [
    { key: 'navbar.consultation', en: 'Consultation', ru: 'Консультация', tj: 'Машварат', category: 'buttons', description: 'Main CTA button in navbar' },
    { key: 'auth.login', en: 'Log In', ru: 'Войти', tj: 'Ворид шудан', category: 'buttons', description: 'Login button text' },
    { key: 'auth.signup', en: 'Sign Up', ru: 'Регистрация', tj: 'Сабти ном', category: 'buttons', description: 'Sign up button text' },
    { key: 'footer.stayUpdated', en: 'Stay Updated', ru: 'Оставайтесь в курсе', tj: 'Бо мо боқӣ монед', category: 'labels', description: 'Newsletter heading' },
    { key: 'footer.subscribe', en: 'Subscribe', ru: 'Подписаться', tj: 'Обуна шудан', category: 'buttons', description: 'Newsletter subscribe button' },
    { key: 'opportunities.applyNow', en: 'Apply Now', ru: 'Подать заявку', tj: 'Ҳозир дархост диҳед', category: 'buttons', description: 'Apply button on opportunity pages' },
    { key: 'hero.search', en: 'Search', ru: 'Поиск', tj: 'Ҷустуҷӯ', category: 'buttons', description: 'Search button in hero' },
    { key: 'hero.getStarted', en: 'Get Started', ru: 'Начать', tj: 'Оғоз кардан', category: 'buttons', description: 'Hero CTA button' },
    { key: 'common.viewMore', en: 'View More', ru: 'Подробнее', tj: 'Маълумоти бештар', category: 'buttons', description: 'View more link' },
    { key: 'footer.aboutText', en: 'Connecting students worldwide with global educational opportunities, scholarships, and professional development programs.', ru: 'Соединяем студентов по всему миру с глобальными образовательными возможностями, стипендиями и программами профессионального развития.', tj: 'Пайванди донишҷӯён дар тамоми ҷаҳон бо имкониятҳои таълимии ҷаҳонӣ, стипендияҳо ва барномаҳои рушди касбӣ.', category: 'content', description: 'Footer about text' },
  ];

  let createdDict = 0;
  let updatedDict = 0;
  for (const entry of dictionaryEntries) {
    const result = await prisma.uIDictionary.upsert({
      where: { key: entry.key },
      update: {
        // Only update if entry doesn't exist or if you want to refresh values
        // For safety, we can choose to NOT update existing entries by using update: {}
        // Or update only if values are missing
        en: entry.en,
        ru: entry.ru,
        tj: entry.tj,
        category: entry.category,
        description: entry.description,
      },
      create: entry,
    });

    // Check if it was created or updated by comparing createdAt and updatedAt
    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      createdDict++;
    } else {
      updatedDict++;
    }
  }
  console.log(`✅ UIDictionary: ${createdDict} entries created, ${updatedDict} entries updated`);

  // ============================================
  // Seed Default FAQs (if missing)
  // ============================================
  console.log('❓ Seeding FAQs...');
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
    console.log('✅ Created 4 default FAQs');
  } else {
    console.log(`✅ FAQs already exist (${existingFAQs} found)`);
  }

  // ============================================
  // Seed How-It-Works Steps (if missing)
  // ============================================
  console.log('🎯 Seeding How-It-Works Steps...');
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
    console.log('✅ Created 3 default How-It-Works steps');
  } else {
    console.log(`✅ How-It-Works steps already exist (${existingSteps} found)`);
  }

  // ============================================
  // Update SiteSettings with Contact Info (if missing)
  // ============================================
  console.log('📞 Ensuring SiteSettings has contact info...');
  const siteSettings = await prisma.siteSettings.findUnique({
    where: { id: 'global' },
  });

  if (siteSettings && (!siteSettings.supportEmail || !siteSettings.supportPhone)) {
    await prisma.siteSettings.update({
      where: { id: 'global' },
      data: {
        supportEmail: siteSettings.supportEmail || 'info@salamconsulting.tj',
        supportPhone: siteSettings.supportPhone || '+992 98 765 4321',
      },
    });
    console.log('✅ Updated SiteSettings with contact info');
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ AYUB\'S ACCOUNT IS READY:');
  console.log(`   Email: ${ayubEmail}`);
  console.log(`   Password: ${ayubPassword}`);
  console.log(`   Role: SUPER_ADMIN`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

