import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const termsContentEn = `
<div class="p-6 bg-brand-navy/5 rounded-2xl border border-brand-navy/10 mb-10 shadow-sm">
  <p class="text-brand-navy font-semibold text-lg m-0 flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-brand-gold"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    Welcome to Salam Consulting
  </p>
  <p class="text-gray-600 mt-2 mb-0">By accessing and using our platform, you accept and agree to be bound by the terms and provisions of this premium service agreement.</p>
</div>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6"><span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">1</span> Description of Service</h2>
<p class="text-gray-700 leading-relaxed mb-8">Salam Consulting provides educational consulting, University matching, and scholarship guidance services. We act as an intermediary to help you navigate global educational opportunities. We do not guarantee admission or scholarship awards, as final decisions rest strictly with educational institutions.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6"><span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">2</span> User Responsibilities</h2>
<p class="text-gray-700 leading-relaxed mb-8">You agree to provide true, accurate, current, and complete information about yourself during any consultation or application process. Any falsification of details (academic records, language proficiency) may result in the termination of our services.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6"><span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">3</span> Communication and Lead Generation</h2>
<p class="text-gray-700 leading-relaxed mb-8">By interacting with our platform and initiating a consultation request, you explicitly agree to be contacted by our expert consultants via <strong class="text-blue-500">Telegram</strong>, WhatsApp, email, or telephone.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6"><span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">4</span> Modifications</h2>
<p class="text-gray-700 leading-relaxed mb-8">We reserve the right to modify these Terms of Service at any time. We will do so by posting and drawing attention to the updated terms on the Site. Your decision to continue to visit and make use of the Site after such changes constitutes your formal acceptance of the new Terms of Service.</p>
`;

const termsContentRu = `
<div class="p-6 bg-brand-navy/5 rounded-2xl border border-brand-navy/10 mb-10 shadow-sm">
  <p class="text-brand-navy font-semibold text-lg m-0 flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-brand-gold"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    Добро пожаловать в Salam Consulting
  </p>
  <p class="text-gray-600 mt-2 mb-0">Используя нашу платформу, вы соглашаетесь с условиями предоставления наших премиальных услуг.</p>
</div>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6"><span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">1</span> Описание Услуг</h2>
<p class="text-gray-700 leading-relaxed mb-8">Salam Consulting предоставляет услуги образовательного консалтинга, помощь в подборе университетов и стипендий. Мы не гарантируем 100% зачисление, так как окончательное решение всегда остается за приемной комиссией университета.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6"><span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">2</span> Обязанности пользователя</h2>
<p class="text-gray-700 leading-relaxed mb-8">Вы обязуетесь предоставлять правдивую, точную, актуальную и полную информацию о себе (оценки, сертификаты, уровень языка). Предоставление ложных данных приведет к прекращению сотрудничества.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6"><span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">3</span> Коммуникация и Контакты</h2>
<p class="text-gray-700 leading-relaxed mb-8">Отправляя заявку на нашем сайте, вы даете прямое согласие на то, чтобы наши эксперты связывались с вами через <strong class="text-blue-500">Telegram</strong>, WhatsApp, электронную почту или телефон.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6"><span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">4</span> Внесение изменений</h2>
<p class="text-gray-700 leading-relaxed mb-8">Мы оставляем за собой право изменять данные Условия в любое время. Продолжение использования сайта означает ваше согласие с обновленными Условиями.</p>
`;

const termsContentTj = `
<div class="p-6 bg-brand-navy/5 rounded-2xl border border-brand-navy/10 mb-10 shadow-sm hover:shadow-md transition-shadow">
  <p class="text-brand-navy font-semibold text-xl m-0 flex items-center gap-3">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-brand-gold"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    Хуш омадед ба Salam Consulting
  </p>
  <p class="text-gray-600 mt-3 mb-0 text-lg">Ҳангоми боздид ва истифодаи сайти мо, шумо бо шартҳои хизматрасониҳои премиалии мо розӣ мешавед. Мо хурсандем, ки дар роҳи расидан ба орзуҳои таълимии шумо ҳамроҳ ҳастем!</p>
</div>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">1</span> Хизматрасониҳо</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Salam Consulting шабакаи пешқадам барои машварати таълимӣ, интихоби донишгоҳҳои байналмилалӣ ва стипендияҳост. Мо ҳамчун роҳнамои касбии шумо амал мекунем, аммо ягон кафолати 100% барои дохил шудан ба донишгоҳ ё гирифтани стипендия намедиҳем, зеро қарори ниҳоӣ танҳо аз ҷониби худи донишгоҳҳо қабул карда мешавад.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">2</span> Ӯҳдадориҳои Корбар</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Шумо ӯҳдадор ҳастед, ки маълумоти пурра, дақиқ ва воқеии худро пешниҳод кунед. Ҳар гуна маълумоти бардурӯғ (баҳономаҳои қалбакӣ, сертификатҳои забондонӣ) метавонад сабаби фавран қатъ гардидани хизматрасонии мо гардад.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">3</span> Муошират ва Тамос</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Бо пахши тугмаи "Машварат" ё пур кардани форма дар сайти мо, шумо ба мо иҷозати расмӣ медиҳед, ки коршиносони мо тавассути шабакаҳои <strong class="text-blue-600 font-bold">Telegram</strong>, WhatsApp, почтаи электронӣ ё телефон бо шумо дар тамос шаванд ва ба шумо роҳнамоӣ кунанд.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">4</span> Иваз шудани Шартнома</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Мо ҳуқуқ дорем ин Шартҳои Хизматрасониро дар ҳар вақт бе огоҳии пешакӣ тағйир диҳем. Истифодаи сайти мо баъд аз ворид шудани тағйирот маънои пурра қабул кардани шартҳои навро дорад.</p>
`;

async function main() {
  console.log('Seeding BEAUTIFUL terms of service...');
  
  await prisma.staticPage.upsert({
    where: { slug: 'terms' },
    update: {
      content: termsContentEn,
      contentRu: termsContentRu,
      contentTj: termsContentTj,
      updatedAt: new Date(),
    },
    create: {
      slug: 'terms',
      title: 'Terms of Service',
      titleRu: 'Условия Обслуживания',
      titleTj: 'Шартҳои Хизматрасонӣ',
      content: termsContentEn,
      contentRu: termsContentRu,
      contentTj: termsContentTj,
      isActive: true,
    }
  });

  console.log('Successfully updated Terms of Service pages with beautiful HTML.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
