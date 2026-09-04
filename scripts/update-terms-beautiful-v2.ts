import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const termsContentEn = `
<div class="p-6 bg-brand-navy/5 rounded-2xl border border-brand-navy/10 mb-10 shadow-sm hover:shadow-md transition-shadow">
  <p class="text-brand-navy font-semibold text-xl m-0 flex items-center gap-3">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-brand-gold"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    Terms of Service
  </p>
  <p class="text-gray-600 mt-3 mb-0 text-lg">By using Salam Consulting’s website and services, you agree to the following terms and conditions.</p>
</div>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">1</span> Nature of Services</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Salam Consulting provides consultation, guidance, and informational support regarding scholarships, exchange programs, and international opportunities.</p>
<div class="bg-red-50 border-l-4 border-red-500 p-4 mb-8 text-red-800 rounded-r-lg font-medium">
  We do not guarantee admission, acceptance, or scholarship awards.
</div>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">2</span> User Responsibility</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Users are responsible for:</p>
<ul class="list-disc pl-8 mb-8 text-lg text-gray-700 space-y-2">
  <li>Providing accurate and complete information</li>
  <li>Preparing and submitting their own applications</li>
  <li>Verifying all information independently</li>
</ul>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">3</span> Limitation of Liability</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Salam Consulting is not responsible for:</p>
<ul class="list-disc pl-8 mb-4 text-lg text-gray-700 space-y-2">
  <li>Rejection of applications</li>
  <li>Decisions made by universities or organizations</li>
  <li>Errors in information provided by users</li>
</ul>
<p class="text-gray-700 leading-relaxed mb-8 text-lg italic bg-gray-50 p-4 rounded-lg">All final decisions are made by the respective institutions and organizations.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">4</span> Information Disclaimer</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">The information published by Salam Consulting is provided for informational purposes only. We do not represent the respective institutions and do not claim ownership of the opportunities presented.</p>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">All information is based on official and publicly available sources and may be subject to change. We strongly recommend that applicants independently verify all details on official websites.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">5</span> Intellectual Property</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">All content on this website, including text, design, and materials, belongs to Salam Consulting and may not be copied or used without permission.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">6</span> Changes to Terms</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Salam Consulting reserves the right to modify these Terms of Service at any time. Continued use of the website means acceptance of any updates.</p>
`;

const termsContentRu = `
<div class="p-6 bg-brand-navy/5 rounded-2xl border border-brand-navy/10 mb-10 shadow-sm hover:shadow-md transition-shadow">
  <p class="text-brand-navy font-semibold text-xl m-0 flex items-center gap-3">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-brand-gold"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    Условия использования
  </p>
  <p class="text-gray-600 mt-3 mb-0 text-lg">Используя веб-сайт и услуги Salam Consulting, вы соглашаетесь со следующими условиями и положениями.</p>
</div>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">1</span> Характер услуг</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Salam Consulting предоставляет консультации, руководство и информационную поддержку по вопросам стипендий, программ обмена и международных возможностей.</p>
<div class="bg-red-50 border-l-4 border-red-500 p-4 mb-8 text-red-800 rounded-r-lg font-medium">
  Мы не гарантируем поступление, зачисление или получение стипендий.
</div>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">2</span> Ответственность пользователя</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Пользователи обязаны:</p>
<ul class="list-disc pl-8 mb-8 text-lg text-gray-700 space-y-2">
  <li>Предоставлять точную и полную информацию</li>
  <li>Самостоятельно подготавливать и подавать свои заявки</li>
  <li>Самостоятельно проверять всю информацию</li>
</ul>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">3</span> Ограничение ответственности</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Salam Consulting не несёт ответственности за:</p>
<ul class="list-disc pl-8 mb-4 text-lg text-gray-700 space-y-2">
  <li>Отказ в заявках</li>
  <li>Решения, принимаемые университетами или организациями</li>
  <li>Ошибки в информации, предоставленной пользователями</li>
</ul>
<p class="text-gray-700 leading-relaxed mb-8 text-lg italic bg-gray-50 p-4 rounded-lg">Все окончательные решения принимаются соответствующими учреждениями и организациями.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">4</span> Отказ от ответственности (дисклеймер)</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Информация, публикуемая Salam Consulting, предоставляется исключительно в информационных целях. Мы не представляем соответствующие учреждения и не заявляем о правах собственности на представленные возможности.</p>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Вся информация основана на официальных и общедоступных источниках и может быть изменена. Мы настоятельно рекомендуем заявителям самостоятельно проверять все детали на официальных сайтах.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">5</span> Интеллектуальная собственность</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Все материалы, размещённые на данном сайте, включая тексты, дизайн и контент, принадлежат Salam Consulting и не могут быть использованы или скопированы без разрешения.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">6</span> Изменения условий</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Salam Consulting оставляет за собой право изменять настоящие Условия использования в любое время. Продолжение использования сайта означает принятие обновлённых условий.</p>
`;

const termsContentTj = `
<div class="p-6 bg-brand-navy/5 rounded-2xl border border-brand-navy/10 mb-10 shadow-sm hover:shadow-md transition-shadow">
  <p class="text-brand-navy font-semibold text-xl m-0 flex items-center gap-3">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-brand-gold"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    Шартҳои Истифода
  </p>
  <p class="text-gray-600 mt-3 mb-0 text-lg">Бо истифода аз вебсайт ва хизматрасониҳои Salam Consulting, шумо ба шартҳо ва қоидаҳои зерин розӣ мешавед.</p>
</div>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">1</span> Табиати Хизматрасониҳо</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Salam Consulting машварат, роҳнамоӣ ва дастгирии иттилоотиро оид ба стипендияҳо, барномаҳои мубодила ва имкониятҳои байналмилалӣ пешниҳод мекунад.</p>
<div class="bg-red-50 border-l-4 border-red-500 p-4 mb-8 text-red-800 rounded-r-lg font-medium">
  Мо дохилшавӣ, қабул ё гирифтани стипендияро кафолат намедиҳем.
</div>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">2</span> Масъулияти Корбар</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Корбарон вазифадоранд:</p>
<ul class="list-disc pl-8 mb-8 text-lg text-gray-700 space-y-2">
  <li>Маълумоти дақиқ ва пурраро пешниҳод кунанд</li>
  <li>Аризаҳои худро мустақилона таҳия ва пешниҳод кунанд</li>
  <li>Тамоми маълумотро мустақилона тафтиш кунанд</li>
</ul>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">3</span> Маҳдудияти Масъулият</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Salam Consulting барои ҳолатҳои зерин масъулият ба дӯш намегирад:</p>
<ul class="list-disc pl-8 mb-4 text-lg text-gray-700 space-y-2">
  <li>Рад шудани аризаҳо барои таҳсил</li>
  <li>Қарорҳои қабулкардаи донишгоҳҳо ё ташкилотҳо</li>
  <li>Хатогиҳо дар маълумоти пешниҳодкардаи корбар</li>
</ul>
<p class="text-gray-700 leading-relaxed mb-8 text-lg italic bg-gray-50 p-4 rounded-lg">Тамоми қарорҳои ниҳоӣ аз ҷониби муассисаҳо ва ташкилотҳои дахлдор қабул карда мешаванд.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">4</span> Радди Масъулият (Дисклеймер)</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Маълумоти нашркардаи Salam Consulting танҳо бо мақсади огоҳӣ пешниҳод мешавад. Мо муассисаҳои дахлдорро намояндагӣ намекунем ва ба моликияти имкониятҳои пешниҳодшуда даъво надорем.</p>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Тамоми маълумот ба манбаъҳои расмӣ ва дастраси умум асос ёфтааст ва метавонад тағйир ёбад. Мо ба донишҷӯён тавсия медиҳем, ки тамоми тафсилотро дар вебсайтҳои расмӣ мустақилона тафтиш кунанд.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">5</span> Моликияти Зеҳнӣ</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Тамоми маводи ин вебсайт, аз ҷумла матн, дизайн ва контент ба Salam Consulting тааллуқ дорад ва бе иҷозат нусхабардорӣ ё истифода бурдани он манъ аст.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">6</span> Тағйироти Шартҳо</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Salam Consulting ҳуқуқ дорад ин Шартҳои Истифодаро дар ҳар вақт тағйир диҳад. Идомаи истифодаи вебсайт маънои қабули ҳамаи навсозиҳоро дорад.</p>
`;

async function main() {
  console.log('Seeding custom beautiful TERMS policy...');
  
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
      titleRu: 'Условия использования',
      titleTj: 'Шартҳои Истифода',
      content: termsContentEn,
      contentRu: termsContentRu,
      contentTj: termsContentTj,
      isActive: true,
    }
  });

  console.log('Successfully updated TERMS pages with custom beautiful HTML.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
