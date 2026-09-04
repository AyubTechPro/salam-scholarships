import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const privacyContentEn = `
<h2>1. Introduction</h2>
<p>Welcome to Salam Consulting. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>

<h2>2. The Data We Collect About You</h2>
<p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
<ul>
  <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
  <li><strong>Contact Data:</strong> includes email address, telephone numbers, and Telegram IDs.</li>
  <li><strong>Educational Data:</strong> includes your academic background, transcripts, language levels, and preferred destinations.</li>
  <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
</ul>

<h2>3. How We Use Your Personal Data</h2>
<p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
<ul>
  <li>To provide you with educational consulting services.</li>
  <li>To apply to our partner universities and scholarship programs on your behalf.</li>
  <li>To manage our relationship with you, including notifying you about changes to our terms or privacy policy.</li>
</ul>

<h2>4. Data Security</h2>
<p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.</p>

<h2>5. Your Legal Rights</h2>
<p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, or restriction of processing of your personal data.</p>
`;

const privacyContentRu = `
<h2>1. Введение</h2>
<p>Добро пожаловать в Salam Consulting. Мы уважаем вашу конфиденциальность и обязуемся защищать ваши личные данные. Эта политика конфиденциальности расскажет вам о том, как мы заботимся о ваших данных, когда вы посещаете наш веб-сайт, а также о ваших правах на конфиденциальность.</p>

<h2>2. Данные, которые мы собираем</h2>
<p>Мы можем собирать, использовать, хранить и передавать различные виды персональных данных, которые мы сгруппировали следующим образом:</p>
<ul>
  <li><strong>Идентификационные данные:</strong> имя, фамилия и аналогичные идентификаторы.</li>
  <li><strong>Контактные данные:</strong> адрес электронной почты, номера телефонов и идентификаторы Telegram.</li>
  <li><strong>Образовательные данные:</strong> ваша академическая успеваемость, оценки, уровень владения языками и предпочтительные страны для обучения.</li>
</ul>

<h2>3. Как мы используем ваши данные</h2>
<p>Мы используем ваши личные данные только в рамках закона, в основном в следующих случаях:</p>
<ul>
  <li>Для предоставления вам услуг в сфере образовательного консалтинга.</li>
  <li>Для подачи заявлений в партнерские университеты и на стипендиальные программы от вашего имени.</li>
  <li>Для связи с вами (в том числе через Telegram).</li>
</ul>

<h2>4. Безопасность данных</h2>
<p>Мы приняли соответствующие меры безопасности, чтобы предотвратить случайную потерю ваших персональных данных, их использование или доступ к ним несанкционированным образом.</p>

<h2>5. Ваши законные права</h2>
<p>При определенных обстоятельствах у вас есть права в соответствии с законами о защите данных в отношении ваших персональных данных (например, право на удаление или исправление).</p>
`;

const privacyContentTj = `
<h2>1. Муқаддима</h2>
<p>Хуш омадед ба Salam Consulting. Мо ба махфияти шумо эҳтиром мегузорем ва кафолат медиҳем, ки маълумоти шахсии шуморо муҳофизат мекунем. Ин Сиёсати Махфият (Privacy Policy) ба шумо мефаҳмонад, ки мо чӣ гуна маълумоти шуморо ҳангоми боздид аз сайти мо ҷамъоварӣ ва истифода мебарем.</p>

<h2>2. Кадом маълумотро мо ҷамъ меорем?</h2>
<p>Мо танҳо он маълумотро ҷамъ меорем, ки барои пешниҳоди хизматрасониҳои беҳтарин ба шумо лозим аст:</p>
<ul>
  <li><strong>Маълумоти Шахсӣ:</strong> Ном, насаб ва дигар идентификаторҳо.</li>
  <li><strong>Маълумоти Тамос:</strong> Рақами телефон, почтаи электронӣ (Email) ва Telegram ID.</li>
  <li><strong>Маълумоти Таълимӣ:</strong> Баҳономаҳо, сатҳи забондонӣ, шаҳодатномаҳо ва давлатҳои интихобкардаи шумо.</li>
</ul>

<h2>3. Мо маълумоти шуморо чӣ тавр истифода мебарем?</h2>
<p>Маълумоти шумо асосан барои мақсадҳои зерин истифода бурда мешавад:</p>
<ul>
  <li>Барои расонидани машваратҳои таълимӣ ҳангоми муошират тавассути Telegram.</li>
  <li>Барои фиристодани ҳуҷҷатҳои шумо ба донишгоҳҳои шарик ва барномаҳои стипендия.</li>
  <li>Барои бо шумо дар тамос будан ва хабар додани навигариҳо.</li>
</ul>

<h2>4. Амнияти Маълумот</h2>
<p>Мо чораҳои ҷиддии амниятиро мебинем, то маълумоти шахсии шумо беиҷозат истифода нашавад, гум нашавад ё дастраси одамони бегона нагардад. Ҳуҷҷатҳои шумо дар махзани бехатар (Vault) нигоҳ дошта мешаванд.</p>

<h2>5. Ҳуқуқҳои Шумо</h2>
<p>Шумо ҳуқуқ доред, ки ҳар вақт маълумоти худро бинед, ислоҳ кунед ё аз мо талаб кунед, ки маълумоти шуморо аз система пурра нест кунем.</p>
`;

async function main() {
  console.log('Seeding privacy policy...');
  
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

  console.log('Successfully updated Privacy Policy pages.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
