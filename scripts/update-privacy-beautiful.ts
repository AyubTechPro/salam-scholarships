import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const privacyContentEn = `
<div class="p-6 bg-brand-navy/5 rounded-2xl border border-brand-navy/10 mb-10 shadow-sm hover:shadow-md transition-shadow">
  <p class="text-brand-navy font-semibold text-xl m-0 flex items-center gap-3">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-brand-gold"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    Privacy Policy
  </p>
  <p class="text-gray-600 mt-3 mb-0 text-lg">At Salam Consulting, we are committed to protecting your personal information and ensuring transparency in how we collect and use your data.</p>
</div>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">1</span> Information We Collect</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">We may collect the following personal information:</p>
<ul class="list-disc pl-8 mb-8 text-lg text-gray-700 space-y-2">
  <li>Full name</li>
  <li>Email address</li>
  <li>Phone number</li>
  <li>Educational background and preferences</li>
  <li>Any information you provide through forms or consultations</li>
</ul>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">2</span> How We Use Your Information</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">We use your information to:</p>
<ul class="list-disc pl-8 mb-8 text-lg text-gray-700 space-y-2">
  <li>Provide consultation and educational services</li>
  <li>Communicate with you regarding opportunities and applications</li>
  <li>Improve our services and user experience</li>
</ul>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">3</span> Data Protection</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">We take appropriate measures to protect your personal data from unauthorized access, disclosure, or misuse. Your information is stored securely and handled with care.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">4</span> Sharing of Information</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">We do not sell, trade, or share your personal information with third parties, except when required by law or with your consent.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">5</span> Your Rights</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">You have the right to:</p>
<ul class="list-disc pl-8 mb-8 text-lg text-gray-700 space-y-2">
  <li>Request access to your data</li>
  <li>Request correction or deletion of your personal information</li>
</ul>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">6</span> Changes to This Policy</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Salam Consulting reserves the right to update this Privacy Policy at any time. Updates will be posted on this page.</p>
`;

const privacyContentRu = `
<div class="p-6 bg-brand-navy/5 rounded-2xl border border-brand-navy/10 mb-10 shadow-sm hover:shadow-md transition-shadow">
  <p class="text-brand-navy font-semibold text-xl m-0 flex items-center gap-3">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-brand-gold"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    Политика конфиденциальности
  </p>
  <p class="text-gray-600 mt-3 mb-0 text-lg">В Salam Consulting мы стремимся защищать вашу личную информацию и обеспечивать прозрачность в том, как мы собираем и используем ваши данные.</p>
</div>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">1</span> Какие данные мы собираем</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Мы можем собирать следующую личную информацию:</p>
<ul class="list-disc pl-8 mb-8 text-lg text-gray-700 space-y-2">
  <li>Полное имя</li>
  <li>Адрес электронной почты</li>
  <li>Номер телефона</li>
  <li>Образование и предпочтения</li>
  <li>Любую информацию, которую вы предоставляете через формы или в ходе консультаций</li>
</ul>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">2</span> Как мы используем вашу информацию</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Мы используем вашу информацию для:</p>
<ul class="list-disc pl-8 mb-8 text-lg text-gray-700 space-y-2">
  <li>Предоставления консультационных и образовательных услуг</li>
  <li>Связи с вами по вопросам возможностей и подачи заявок</li>
  <li>Улучшения наших услуг и пользовательского опыта</li>
</ul>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">3</span> Защита данных</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Мы принимаем соответствующие меры для защиты ваших персональных данных от несанкционированного доступа, раскрытия или неправомерного использования. Ваша информация хранится безопасно и обрабатывается с должной ответственностью.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">4</span> Передача данных третьим лицам</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Мы не продаём, не обмениваем и не передаём вашу личную информацию третьим лицам, за исключением случаев, предусмотренных законом, или с вашего согласия.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">5</span> Ваши права</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Вы имеете право:</p>
<ul class="list-disc pl-8 mb-8 text-lg text-gray-700 space-y-2">
  <li>Запрашивать доступ к своим данным</li>
  <li>Требовать исправления или удаления вашей личной информации</li>
</ul>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">6</span> Изменения политики</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Salam Consulting оставляет за собой право обновлять данную Политику конфиденциальности в любое время. Все изменения будут опубликованы на этой странице.</p>
`;

const privacyContentTj = `
<div class="p-6 bg-brand-navy/5 rounded-2xl border border-brand-navy/10 mb-10 shadow-sm hover:shadow-md transition-shadow">
  <p class="text-brand-navy font-semibold text-xl m-0 flex items-center gap-3">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-brand-gold"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
    Сиёсати Корбард
  </p>
  <p class="text-gray-600 mt-3 mb-0 text-lg">Дар Salam Consulting мо ӯҳдадорем, ки маълумоти шуморо ҳифз кунем ва шаффофияти ҷамъоварӣ ва истифодаи маълумотро таъмин намоем.</p>
</div>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">1</span> Маълумоте, ки мо ҷамъ меорем</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Мо метавонем маълумоти шахсии зеринро ҷамъоварӣ намоем:</p>
<ul class="list-disc pl-8 mb-8 text-lg text-gray-700 space-y-2">
  <li>Ному насаби пурра</li>
  <li>Суроғаи почтаи электронӣ (Email)</li>
  <li>Рақами телефон</li>
  <li>Маълумот дар бораи таҳсилот ва интихобҳо</li>
  <li>Ҳар гуна маълумоте, ки шумо ба воситаи формаҳо ё ҳангоми машваратҳо медиҳед</li>
</ul>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">2</span> Чӣ тавр мо маълумоти шуморо истифода мебарем</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Мо маълумоти шуморо бо мақсадҳои зерин истифода мебарем:</p>
<ul class="list-disc pl-8 mb-8 text-lg text-gray-700 space-y-2">
  <li>Пешниҳоди машваратҳо ва хизматрасониҳои таълимӣ</li>
  <li>Алоқа бо шумо оиди имкониятҳо ва фиристодани ҳуҷҷатҳо</li>
  <li>Такмил додани хизматрасониҳо ва роҳати корбарон</li>
</ul>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">3</span> Ҳифзи Маълумот</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Мо барои муҳофизати маълумоти шумо аз дастрасии беиҷозат чораҳои зарурӣ меандешем. Маълумоти шумо бехатар нигоҳ дошта мешавад ва бо эҳтиёт истифода мегардад.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">4</span> Пешниҳоди Маълумот ба Шахсони Сеюм</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Мо маълумоти шахсии шуморо ба тарафҳои сеюм намефурӯшем, иваз намекунем ё тақсим намесозем, ба истиснои ҳолатҳое, ки қонун талаб мекунад ё шумо худатон розигӣ медиҳед.</p>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">5</span> Ҳуқуқҳои Шумо</h2>
<p class="text-gray-700 leading-relaxed mb-4 text-lg">Шумо ҳуқуқҳои зеринро доред:</p>
<ul class="list-disc pl-8 mb-8 text-lg text-gray-700 space-y-2">
  <li>Талаб кардани дастрасӣ ба маълумоти худ</li>
  <li>Талаб кардани ислоҳ ё нест кардани маълумоти шахсӣ</li>
</ul>

<h2 class="text-2xl font-bold text-brand-navy flex items-center gap-3 border-b pb-4 mb-6 mt-12"><span class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg shadow-inner">6</span> Ивазшавии Сиёсат</h2>
<p class="text-gray-700 leading-relaxed mb-8 text-lg">Salam Consulting ҳуқуқ дорад дар ҳар вақт ба ин Сиёсати Махфият (Privacy Policy) тағйирот ворид кунад. Тамоми навсозиҳо дар ҳамин саҳифа нашр карда мешаванд.</p>
`;

async function main() {
  console.log('Seeding custom beautiful privacy policy...');
  
  await prisma.staticPage.upsert({
    where: { slug: 'privacy' },
    update: {
      content: privacyContentEn,
      contentRu: privacyContentRu,
      contentTj: privacyContentTj,
      updatedAt: new Date(),
    },
    create: {
      slug: 'privacy',
      title: 'Privacy Policy',
      titleRu: 'Политика Конфиденциальности',
      titleTj: 'Сиёсати Корбард',
      content: privacyContentEn,
      contentRu: privacyContentRu,
      contentTj: privacyContentTj,
      isActive: true,
    }
  });

  console.log('Successfully updated Privacy pages with custom beautiful HTML.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
