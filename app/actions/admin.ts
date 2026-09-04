"use server";

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

function checkAuth(session: any) {
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }
}

export async function createProgram(formData: FormData, locale: string) {
  const session = await getServerSession(authOptions);
  checkAuth(session);

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const institution = formData.get("institution") as string;
  const country = formData.get("country") as string;
  const level = formData.get("level") as any;
  const category = formData.get("category") as any;
  const fundingType = formData.get("fundingType") as any;
  const deadline = new Date(formData.get("deadline") as string);
  const imageUrl = formData.get("imageUrl") as string;
  const websiteUrl = formData.get("websiteUrl") as string;

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);

  await prisma.program.create({
    data: {
      title,
      description,
      institution,
      country,
      level,
      category,
      fundingType,
      deadline,
      slug,
      imageUrl: imageUrl || null,
      websiteUrl: websiteUrl || null,
      isActive: true,
      requiresEnglishCert: formData.get("requiresEnglishCert") === "on",
    }
  });

  revalidatePath(`/${locale}/admin/programs`);
  redirect(`/${locale}/admin/programs`);
}

export async function deleteProgram(id: string, locale: string) {
  const session = await getServerSession(authOptions);
  checkAuth(session);
  await prisma.program.delete({ where: { id } });
  revalidatePath(`/${locale}/admin/programs`);
}

export async function deleteSuccessStory(id: string, locale: string) {
  const session = await getServerSession(authOptions);
  checkAuth(session);
  await prisma.successStory.delete({ where: { id } });
  revalidatePath(`/${locale}/admin/success-stories`);
  revalidatePath(`/${locale}`);
}

export async function deleteHeroSlide(id: string, locale: string) {
  const session = await getServerSession(authOptions);
  checkAuth(session);
  await prisma.heroSlide.delete({ where: { id } });
  revalidatePath(`/${locale}/admin/hero-slider`);
  revalidatePath(`/${locale}`);
}

export async function updateProgram(id: string, formData: FormData, locale: string) {
  const session = await getServerSession(authOptions);
  checkAuth(session);

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const institution = formData.get("institution") as string;
  const country = formData.get("country") as string;
  const level = formData.get("level") as any;
  const category = formData.get("category") as any;
  const fundingType = formData.get("fundingType") as any;
  const deadline = new Date(formData.get("deadline") as string);
  const imageUrl = formData.get("imageUrl") as string;
  const websiteUrl = formData.get("websiteUrl") as string;

  await prisma.program.update({
    where: { id },
    data: {
      title,
      description,
      institution,
      country,
      level,
      category,
      fundingType,
      deadline,
      imageUrl: imageUrl || null,
      websiteUrl: websiteUrl || null,
      requiresEnglishCert: formData.get("requiresEnglishCert") === "on",
    }
  });

  revalidatePath(`/${locale}/admin/programs`);
  redirect(`/${locale}/admin/programs`);
}

export async function updateSiteSettings(formData: FormData, locale: string) {
  const session = await getServerSession(authOptions);
  checkAuth(session);

  const siteName = formData.get("siteName") as string;
  const supportEmail = formData.get("supportEmail") as string;
  const maintenanceMode = formData.get("maintenanceMode") === "on";
  const primaryColor = formData.get("primaryColor") as string;
  const telegramBotToken = formData.get("telegramBotToken") as string;
  const heroTickerText = formData.get("heroTickerText") as string;

  await prisma.siteSettings.upsert({
    where: { id: "global" },
    update: {
      siteName,
      supportEmail,
      maintenanceMode,
      primaryColor,
      telegramBotToken,
      heroTickerText,
    },
    create: {
      id: "global",
      siteName,
      supportEmail,
      maintenanceMode,
      primaryColor,
      telegramBotToken,
      heroTickerText,
    }
  });

  revalidatePath(`/${locale}/admin/settings`);
  revalidatePath(`/${locale}`);
}

export async function createHeroSlide(formData: FormData, locale: string) {
  const session = await getServerSession(authOptions);
  checkAuth(session);

  const title = formData.get("title") as string;
  const subtitle = formData.get("subtitle") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const buttonText = formData.get("buttonText") as string;
  const buttonLink = formData.get("buttonLink") as string;
  const isActive = formData.get("isActive") === "on";

  await prisma.heroSlide.create({
    data: {
      title,
      subtitle,
      imageUrl: imageUrl || null,
      buttonText,
      buttonLink,
      isActive,
    }
  });

  revalidatePath(`/${locale}/admin/hero-slider`);
  revalidatePath(`/${locale}`);
  redirect(`/${locale}/admin/hero-slider`);
}

export async function updateHeroSlide(id: string, formData: FormData, locale: string) {
  const session = await getServerSession(authOptions);
  checkAuth(session);

  const title = formData.get("title") as string;
  const subtitle = formData.get("subtitle") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const buttonText = formData.get("buttonText") as string;
  const buttonLink = formData.get("buttonLink") as string;
  const isActive = formData.get("isActive") === "on";

  await prisma.heroSlide.update({
    where: { id },
    data: {
      title,
      subtitle,
      imageUrl: imageUrl || null,
      buttonText,
      buttonLink,
      isActive,
    }
  });

  revalidatePath(`/${locale}/admin/hero-slider`);
  revalidatePath(`/${locale}`);
  redirect(`/${locale}/admin/hero-slider`);
}
