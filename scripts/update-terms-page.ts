import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const termsContentEn = `
<h2>1. Acceptance of Terms</h2>
<p>By accessing and using Salam Consulting, you accept and agree to be bound by the terms and provision of this agreement. Any participation in this service will constitute acceptance of this agreement.</p>

<h2>2. Description of Service</h2>
<p>Salam Consulting provides educational consulting, University matching, and scholarship guidance services. We act as an intermediary to help you navigate global educational opportunities. We do not guarantee admission or scholarship awards, as final decisions rest strictly with educational institutions.</p>

<h2>3. User Responsibilities</h2>
<p>You agree to provide true, accurate, current, and complete information about yourself during any consultation or application process. Any falsification of details (academic records, language proficiency) may result in the termination of our services.</p>

<h2>4. Communication and Lead Generation</h2>
<p>By interacting with our platform and initiating a consultation request, you explicitly agree to be contacted by our consultants via Telegram, WhatsApp, email, or telephone.</p>

<h2>5. Modifications</h2>
<p>We reserve the right to modify these Terms of Service at any time. We will do so by posting and drawing attention to the updated terms on the Site. Your decision to continue to visit and make use of the Site after such changes have been made constitutes your formal acceptance of the new Terms of Service.</p>
`;

const termsContentRu = `
<h2>1. Принятие условий</h2>
<p>Заходя на сайт Salam Consulting и используя его, вы принимаете и соглашаетесь соблюдать условия данного соглашения. Любое использование наших услуг означает ваше согласие с этими условиями.</p>

<h2>2. Описание Услуг</h2>
<p>Salam Consulting предоставляет услуги в сфере образовательного консалтинга: подбор университетов и консультации по стипендиям. Мы не гарантируем зачисление или получение стипендии, так как окончательное решение принимается исключительно учебными заведениями.</p>

<h2>3. Обязанности пользователя</h2>
<p>Вы обязуетесь предоставлять правдивую, точную, актуальную и полную информацию о себе во время консультаций или процесса подачи заявок. Любая фальсификация данных (академические справки, уровень владения языком) может привести к прекращению наших услуг.</p>

<h2>4. Коммуникация</h2>
<p>Взаимодействуя с нашей платформой и отправляя запрос на консультацию, вы даете явное согласие на то, чтобы наши консультанты связывались с вами через Telegram, WhatsApp, email или по телефону.</p>

<h2>5. Изменения</h2>
<p>Мы оставляем за собой право изменять данные Условия обслуживания в любое время. Если вы продолжите использовать сайт после внесения изменений, это будет означать ваше формальное согласие с новыми условиями.</p>
`;

const termsContentTj = `
<h2>1. Қабули Шартҳо</h2>
<p>Ҳангоми боздид ва истифодаи сайти Salam Consulting, шумо бо шартҳои ин созишнома розӣ мешавед. Ҳар гуна истифодаи хизматрасониҳои мо маънои пурра қабул кардани ин шартномаро дорад.</p>

<h2>2. Хизматрасониҳо</h2>
<p>Salam Consulting шабакаест барои машварати таълимӣ, интихоби донишгоҳҳо ва стипендияҳо дар тамоми ҷаҳон. Мо ҳамчун роҳнамои шумо амал мекунем, аммо ягон кафолати 100% барои дохил шудан ба донишгоҳ ё гирифтани степендия намедиҳем, зеро қарори ниҳоӣ танҳо аз ҷониби донишгоҳҳо қабул карда мешавад.</p>

<h2>3. Ӯҳдадориҳои Корбар</h2>
<p>Шумо ӯҳдадор ҳастед, ки маълумоти дуруст, дақиқ ва пурраи худро (аз қабили баҳономаҳо, сатҳи забондонӣ ва ҳуҷҷатҳо) пешниҳод кунед. Ҳар гуна маълумоти бардурӯғ метавонад сабаби қатъи хизматрасонӣ гардад.</p>

<h2>4. Муошират ва Тамос</h2>
<p>Бо пахши тугмаи "Машварат" ё пур кардани форма дар сайти мо, шумо ба мо иҷозат медиҳед, ки коршиносони мо тавассути Telegram, WhatsApp, почта ё телефон бо шумо тамос гиранд.</p>

<h2>5. Иваз шудани Шартнома</h2>
<p>Мо ҳуқуқ дорем ин Шартҳои Хизматрасониро дар ҳар вақт бе огоҳии пешакӣ тағйир диҳем. Истифодаи сайти мо баъд аз тағйирот маънои қабули шартҳои навро дорад.</p>
`;

async function main() {
  console.log('Seeding terms of service...');
  
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

  console.log('Successfully updated Terms of Service pages.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
