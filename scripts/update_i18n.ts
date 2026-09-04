import fs from 'fs';
import path from 'path';

function updateJson(filePath: string, updater: (data: any) => void) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  updater(data);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log('Updated:', path.basename(filePath));
}

const basePath = path.join(process.cwd(), 'messages');

// English
updateJson(path.join(basePath, 'en.json'), (data) => {
  data.home = data.home || {};
  
  data.home.about = {
    badge: "About Us",
    title: "The Pioneer of Global Education in Tajikistan",
    text: "Salam Consulting is not just an agency; it’s an ecosystem designed to launch the brightest minds into the world's most prestigious universities and global forums. Born out of a vision to bridge the gap between local talent and international opportunities, we provide end-to-end premium consulting that turns rejections into full-ride scholarships.\n\nOur approach is highly strategic, zero-friction, and profoundly personalized. We have engineered a revolutionary methodology that restructures a student's entire personal brand to meet Silicon Valley and Ivy League standards.",
    text1: "With over 2000+ successful consultations, we don't just fill out forms—we build profiles that stand out.",
    text2: "Our transparent tracking platform ensures that every applicant is securely guided from their first draft to their final admission letter, securing millions in funding."
  };

  data.home.mission = {
    badge: "Our Mission",
    title: "Empowering the Next Generation of Global Leaders",
    text: "Our core mission is to eradicate borders from education. We believe that financial constraints and complex bureaucracy should never stand in the way of true potential. Salam Consulting democratizes access to elite education, ensuring every talented individual has the strategic roadmap needed to claim their rightful place on the world stage."
  };
});

// Russian
updateJson(path.join(basePath, 'ru.json'), (data) => {
  data.home = data.home || {};

  data.home.about = {
    badge: "О Нас",
    title: "Пионер глобального образования в Таджикистане",
    text: "Salam Consulting — это не просто агентство; это экосистема, созданная для вывода самых ярких умов в самые престижные университеты и на мировые форумы. Основываясь на стремлении преодолеть разрыв между местными талантами и международными возможностями, мы предоставляем премиальный консалтинг полного цикла, превращающий отказы в полные стипендии.\n\nНаш подход — высокостратегический и глубоко персонализированный. Мы разработали революционную методологию модернизации личного бренда студента в соответствии со стандартами Кремниевой долины и Лиги плюща.",
    text1: "Проведя более 2000 успешных консультаций, мы не просто заполняем формы — мы создаем выдающиеся профили.",
    text2: "Наша прозрачная платформа гарантирует каждому кандидату надежное сопровождение от первого черновика до итогового письма о зачислении, обеспечивая миллионы в виде грантов."
  };

  data.home.mission = {
    badge: "Наша Миссия",
    title: "Расширение возможностей нового поколения мировых лидеров",
    text: "Наша главхная миссия — стереть границы в образовании. Мы считаем, что финансовые ограничения и сложная бюрократия никогда не должны стоять на пути к истинному потенциалу. Salam Consulting демократизирует доступ к элитному образованию, обеспечивая каждого талантливого человека стратегическим планом, необходимым для того, чтобы занять достойное место на мировой арене."
  };
});

// Tajik
updateJson(path.join(basePath, 'tj.json'), (data) => {
  data.home = data.home || {};

  data.home.about = {
    badge: "Дар бораи мо",
    title: "Пешвои Таълими Байналмилалӣ дар Тоҷикистон",
    text: "Salam Consulting на танҳо як оҷонсӣ, балки экосистемаест, ки барои роҳнамоии зеҳнҳои дурахшон ба беҳтарин донишгоҳҳо ва форумҳои ҷаҳонӣ сохта шудааст. Бо ҳадафи пайваст кардани истеъдодҳои маҳаллӣ бо имкониятҳои байналмилалӣ, мо машваратҳои сатҳи олиро (premium) пешниҳод менамоем, ки раддияҳоро ба стипендияҳои пурра (full-ride) табдил медиҳанд.\n\nРавиши мо комилан стратегӣ ва шахсӣ мебошад. Мо методологияи инқилобиеро таҳия кардаем, ки бренди шахсии донишҷӯро барои мувофиқат ба стандартҳои водии Силикон (Silicon Valley) ва Лигаи Плюш (Ivy League) аз нав месозад.",
    text1: "Бо беш аз 2000+ машваратҳои муваффақ, мо на танҳо ҳуҷҷатҳоро пур мекунем – мо профилҳои беназир месозем.",
    text2: "Платформаи шаффофи мо кафолат медиҳад, ки ҳар як довталаб аз дархости аввалия то гирифтани номаи қабул ба таври бехатар ҳамроҳӣ карда мешавад."
  };

  data.home.mission = {
    badge: "Миссияи мо",
    title: "Тавонмандсозии Насли Нави Роҳбарони Ҷаҳонӣ",
    text: "Миссияи асосии мо аз байн бурдани сарҳадҳо дар соҳаи маориф аст. Мо боварӣ дорем, ки маҳдудиятҳои молиявӣ ва бюрократияи мураккаб ҳеҷ гоҳ набояд дар роҳи потенсиали воқеӣ монеа шаванд. Salam Consulting дастрасӣ ба таҳсилоти элитаро демократӣ карда, кафолат медиҳад, ки ҳар як нафари боистеъдод харитаи роҳи стратегиро барои фатҳ кардани саҳнаи ҷаҳонӣ дошта бошад."
  };
});

console.log('✨ All translations successfully updated via AST modification.');
