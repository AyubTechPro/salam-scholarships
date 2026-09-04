import { PrismaClient, ProgramLevel, ProgramCategory, FundingType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Injecting Premium Success Story...");

  // Abdurahmonbek's Story
  const story = await prisma.successStory.upsert({
    where: { id: "abdurahmonbek-satyarthi-2025" },
    update: {
      name: "Abdurahmonbek Akhmedov",
      nameRu: "Абдурахмонбек Ахмедов",
      nameTj: "Абдураҳмонбек Аҳмедов",
      program: "Satyarthi Summer School",
      programRu: "Летняя школа Satyarthi",
      programTj: "Мактаби тобистонаи Satyarthi",
      country: "India",
      university: "Kailash Satyarthi Children's Foundation",
      keyToSuccess: "Strong leadership background, persistent networking, and a refined cover letter highlighting social impact in Tajikistan.",
      keyToSuccessRu: "Лидерские качества, упорство в нетворкинге и идеальное мотивационное письмо с акцентом на социальное влияние в Таджикистане.",
      keyToSuccessTj: "Қобилиятҳои роҳбарӣ, устуворӣ дар шабакасозӣ ва номаи мотиватсионии беҳамто бо тамаркуз ба таъсири иҷтимоӣ дар Тоҷикистон.",
      quote: "Salam Consulting didn't just help me with documents; they completely restructured my personal brand to meet global standards. India was a life-changing experience.",
      quoteRu: "Salam Consulting не просто помогли с документами; они полностью перестроили мой личный бренд под мировые стандарты. Индия стала опытом, изменившим жизнь.",
      quoteTj: "Salam Consulting на танҳо дар ҳуҷҷатгузорӣ кумак кард, балки бренди шахсии маро барои стандартҳои ҷаҳонӣ комилан аз нав сохт. Ҳиндустон як таҷрибаи ҳаётбунёд буд.",
      fullStory: "Abdurahmonbek applied to the highly competitive Satyarthi Summer School in India, a program honoring Nobel Peace Laureate Kailash Satyarthi. With Salam Consulting's premium mentorship, his application highlighted his grassroots social initiatives in Tajikistan. The result? A fully funded acceptance, giving him international exposure and networking opportunities with global changemakers.",
      fullStoryRu: "Абдурахмонбек подал заявку в высококонкурентную летнюю школу Satyarthi в Индии, программу в честь лауреата Нобелевской премии мира Кайлаша Сатьярти. Благодаря премиальному наставничеству Salam Consulting, его заявка подчеркнула его социальные инициативы в Таджикистане. Результат? Полностью профинансированное зачисление, открывшее ему международный опыт.",
      fullStoryTj: "Абдураҳмонбек ба Мактаби тобистонаи рақобатпазири Satyarthi дар Ҳиндустон, барномае ба ифтихори Барандаи Ҷоизаи Сулҳи Нобел Кайлаш Сатиартӣ, дархост дод. Бо роҳнамоии касбии Salam Consulting, дархости ӯ ташаббусҳои иҷтимоии ӯро дар Тоҷикистон нишон дод. Натиҷа? Қабули пурра молиявӣ, ки ба ӯ таҷрибаи байналмилалӣ дод.",
      photoUrl: "https://i.postimg.cc/zGDPz2CK/Chat-GPT-Image-Sep-7-2025-11-22-34-PM.png", 
      achievement: "Fully Funded Acceptance",
      achievementRu: "Полное финансирование",
      achievementTj: "Қабули Пурра Молиявӣ",
      isActive: true,
      order: 1,
      year: 2025
    },
    create: {
      id: "abdurahmonbek-satyarthi-2025",
      name: "Abdurahmonbek Akhmedov",
      nameRu: "Абдурахмонбек Ахмедов",
      nameTj: "Абдураҳмонбек Аҳмедов",
      program: "Satyarthi Summer School",
      programRu: "Летняя школа Satyarthi",
      programTj: "Мактаби тобистонаи Satyarthi",
      country: "India",
      university: "Kailash Satyarthi Children's Foundation",
      keyToSuccess: "Strong leadership background, persistent networking, and a refined cover letter highlighting social impact in Tajikistan.",
      keyToSuccessRu: "Лидерские качества, упорство в нетворкинге и идеальное мотивационное письмо с акцентом на социальное влияние в Таджикистане.",
      keyToSuccessTj: "Қобилиятҳои роҳбарӣ, устуворӣ дар шабакасозӣ ва номаи мотиватсионии беҳамто бо тамаркуз ба таъсири иҷтимоӣ дар Тоҷикистон.",
      quote: "Salam Consulting didn't just help me with documents; they completely restructured my personal brand to meet global standards. India was a life-changing experience.",
      quoteRu: "Salam Consulting не просто помогли с документами; они полностью перестроили мой личный бренд под мировые стандарты. Индия стала опытом, изменившим жизнь.",
      quoteTj: "Salam Consulting на танҳо дар ҳуҷҷатгузорӣ кумак кард, балки бренди шахсии маро барои стандартҳои ҷаҳонӣ комилан аз нав сохт. Ҳиндустон як таҷрибаи ҳаётбунёд буд.",
      fullStory: "Abdurahmonbek applied to the highly competitive Satyarthi Summer School in India, a program honoring Nobel Peace Laureate Kailash Satyarthi. With Salam Consulting's premium mentorship, his application highlighted his grassroots social initiatives in Tajikistan. The result? A fully funded acceptance, giving him international exposure and networking opportunities with global changemakers.",
      fullStoryRu: "Абдурахмонбек подал заявку в высококонкурентную летнюю школу Satyarthi в Индии, программу в честь лауреата Нобелевской премии мира Кайлаша Сатьярти. Благодаря премиальному наставничеству Salam Consulting, его заявка подчеркнула его социальные инициативы в Таджикистане. Результат? Полностью профинансированное зачисление, открывшее ему международный опыт.",
      fullStoryTj: "Абдураҳмонбек ба Мактаби тобистонаи рақобатпазири Satyarthi дар Ҳиндустон, барномае ба ифтихори Барандаи Ҷоизаи Сулҳи Нобел Кайлаш Сатиартӣ, дархост дод. Бо роҳнамоии касбии Salam Consulting, дархости ӯ ташаббусҳои иҷтимоии ӯро дар Тоҷикистон нишон дод. Натиҷа? Қабули пурра молиявӣ, ки ба ӯ таҷрибаи байналмилалӣ дод.",
      photoUrl: "https://i.postimg.cc/zGDPz2CK/Chat-GPT-Image-Sep-7-2025-11-22-34-PM.png", 
      achievement: "Fully Funded Acceptance",
      achievementRu: "Полное финансирование",
      achievementTj: "Қабули Пурра Молиявӣ",
      isActive: true,
      order: 1,
      year: 2025
    }
  });

  console.log("✅ Successfully injected story:", story.name);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
