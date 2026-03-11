import type { LocaleMap } from "@/shared/common/lib/locale-types"

export const seed = {
  categories: [
    {
      slug: "sports",
      href: "/category/sports",
      name: {
        uz: "Sport",
        uzb: "Спорт",
        ru: "Спорт",
        en: "Sports",
      } satisfies LocaleMap,
    },
    {
      slug: "business",
      href: "/category/business",
      name: {
        uz: "Biznes",
        uzb: "Бизнес",
        ru: "Бизнес",
        en: "Business",
      } satisfies LocaleMap,
    },
    {
      slug: "economy",
      href: "/category/economy",
      name: {
        uz: "Iqtisodiyot",
        uzb: "Иқтисодиёт",
        ru: "Экономика",
        en: "Economy",
      } satisfies LocaleMap,
    },
    {
      slug: "technology",
      href: "/category/technology",
      name: {
        uz: "Texnologiya",
        uzb: "Технология",
        ru: "Технологии",
        en: "Technology",
      } satisfies LocaleMap,
    },
    {
      slug: "entertainment",
      href: "/category/entertainment",
      name: {
        uz: "Ko'ngilochar",
        uzb: "Кўнгилочар",
        ru: "Развлечения",
        en: "Entertainment",
      } satisfies LocaleMap,
    },
    {
      slug: "other",
      href: "/category/other",
      name: {
        uz: "Boshqa",
        uzb: "Бошқа",
        ru: "Другое",
        en: "Other",
      } satisfies LocaleMap,
    },
  ] as const,

  tags: [
    { slug: "nike", name: { uz: "Nike", uzb: "Нике", ru: "Найк", en: "Nike" } satisfies LocaleMap },
    { slug: "air-max", name: { uz: "Air Max", uzb: "Эйр Макс", ru: "Эйр Макс", en: "Air Max" } satisfies LocaleMap },
    { slug: "270", name: { uz: "270", uzb: "270", ru: "270", en: "270" } satisfies LocaleMap },
    { slug: "ai", name: { uz: "Sun'iy intellekt", uzb: "Сунъий интеллект", ru: "ИИ", en: "AI" } satisfies LocaleMap },
    { slug: "technology", name: { uz: "Texnologiya", uzb: "Технология", ru: "Технологии", en: "Technology" } satisfies LocaleMap },
    { slug: "research", name: { uz: "Tadqiqot", uzb: "Тадқиқот", ru: "Исследования", en: "Research" } satisfies LocaleMap },
    { slug: "climate", name: { uz: "Iqlim", uzb: "Иқлим", ru: "Климат", en: "Climate" } satisfies LocaleMap },
    { slug: "politics", name: { uz: "Siyosat", uzb: "Сиёсат", ru: "Политика", en: "Politics" } satisfies LocaleMap },
    { slug: "environment", name: { uz: "Atrof-muhit", uzb: "Атроф-муҳит", ru: "Окружающая среда", en: "Environment" } satisfies LocaleMap },
    { slug: "space", name: { uz: "Kosmik", uzb: "Космик", ru: "Космос", en: "Space" } satisfies LocaleMap },
    { slug: "nasa", name: { uz: "NASA", uzb: "NASA", ru: "NASA", en: "NASA" } satisfies LocaleMap },
    { slug: "mars", name: { uz: "Mars", uzb: "Марс", ru: "Марс", en: "Mars" } satisfies LocaleMap },
    { slug: "ev", name: { uz: "Elektromobil", uzb: "Электромобил", ru: "Электромобиль", en: "EV" } satisfies LocaleMap },
    { slug: "automotive", name: { uz: "Avtomobil", uzb: "Автомобил", ru: "Авто", en: "Automotive" } satisfies LocaleMap },
    { slug: "green", name: { uz: "Yashil", uzb: "Яшил", ru: "Зелёный", en: "Green" } satisfies LocaleMap },
    { slug: "olympics", name: { uz: "Olimpiada", uzb: "Олимпиада", ru: "Олимпиада", en: "Olympics" } satisfies LocaleMap },
    { slug: "events", name: { uz: "Tadbirlar", uzb: "Тадбирлар", ru: "События", en: "Events" } satisfies LocaleMap },
    { slug: "quantum", name: { uz: "Kvant", uzb: "Квант", ru: "Квант", en: "Quantum" } satisfies LocaleMap },
    { slug: "computing", name: { uz: "Hisoblash", uzb: "Хисоблаш", ru: "Вычисления", en: "Computing" } satisfies LocaleMap },
    { slug: "science", name: { uz: "Fan", uzb: "Фан", ru: "Наука", en: "Science" } satisfies LocaleMap },
    { slug: "health", name: { uz: "Sog'liq", uzb: "Соглик", ru: "Здоровье", en: "Health" } satisfies LocaleMap },
    { slug: "malaria", name: { uz: "Malariya", uzb: "Малярия", ru: "Малярия", en: "Malaria" } satisfies LocaleMap },
    { slug: "vaccine", name: { uz: "Vaksina", uzb: "Ваксина", ru: "Вакцина", en: "Vaccine" } satisfies LocaleMap },
    { slug: "film", name: { uz: "Kino", uzb: "Кино", ru: "Кино", en: "Film" } satisfies LocaleMap },
    { slug: "streaming", name: { uz: "Striming", uzb: "Стриминг", ru: "Стриминг", en: "Streaming" } satisfies LocaleMap },
    { slug: "economy", name: { uz: "Iqtisodiyot", uzb: "Иқтисодиёт", ru: "Экономика", en: "Economy" } satisfies LocaleMap },
    { slug: "central-bank", name: { uz: "Markaziy bank", uzb: "Марказий банк", ru: "Центробанк", en: "Central Bank" } satisfies LocaleMap },
    { slug: "rates", name: { uz: "Stavkalar", uzb: "Ставкалар", ru: "Ставки", en: "Rates" } satisfies LocaleMap },
    { slug: "future", name: { uz: "Kelajak", uzb: "Келажак", ru: "Будущее", en: "Future" } satisfies LocaleMap },
    { slug: "work", name: { uz: "Ish", uzb: "Иш", ru: "Работа", en: "Work" } satisfies LocaleMap },
    { slug: "highlights", name: { uz: "Asosiy voqealar", uzb: "Асосий воқеалар", ru: "Главное", en: "Highlights" } satisfies LocaleMap },
    { slug: "local", name: { uz: "Mahalliy", uzb: "Маҳаллий", ru: "Местный", en: "Local" } satisfies LocaleMap },
    { slug: "sport", name: { uz: "Sport", uzb: "Спорт", ru: "Спорт", en: "Sports" } satisfies LocaleMap },
    { slug: "entertainment", name: { uz: "Ko'ngilochar", uzb: "Кўнгилочар", ru: "Развлечения", en: "Entertainment" } satisfies LocaleMap },
  ] as const,

  socialMedia: [
    { slug: "telegram", name: "Telegram", href: "/telegram" },
    { slug: "instagram", name: "Instagram", href: "/instagram" },
    { slug: "facebook", name: "Facebook", href: "/facebook" },
    { slug: "youtube", name: "YouTube", href: "/youtube" },
  ] as const,

  copyright: {
    uz: "© 2026 Fergana Media. Barcha huquqlar himoyalangan.",
    uzb: "© 2026 Fergana Media. Барча ҳуқуқлар ҳимояланган.",
    ru: "© 2026 Fergana Media. Все права защищены.",
    en: "© 2026 Fergana Media. All rights reserved.",
  } satisfies LocaleMap,

  headline: {
    uz: "Sayt demo rejimida ishlamoqda!",
    uzb: "Сайт демо режимида ишламоқда!",
    ru: "Сайт работает в демо-режиме!",
    en: "Site is running in demo mode!",
  } satisfies LocaleMap,

  description: {
    uz: "Ferganamedia.uz 2024-yil 26-sentabrda Prezident administratsiyasi huzuridagi AOKA tomonidan elektron ommaviy axborot vositasi sifatida ro'yxatdan o'tkazilgan. Guvohnoma raqami: 414738. Tashkilotchi: «Fergana Media Press» MCHJ.",
    uzb: "Ferganamedia.uz 2024-йил 26-сентябрда Президент мақомоти ҳузуридаги АОКА томонидан электрон оммавий ахборот воситаси сифатида рўйхатдан ўтказилган. Гувоҳнома рақами: 414738. Ташкилотчи: «Fergana Media Press» МЧЖ.",
    ru: "Ferganamedia.uz зарегистрирован как электронное СМИ 26 сентября 2024 года АОКА при администрации Президента. Свидетельство № 414738. Учредитель: ООО «Fergana Media Press».",
    en: "Ferganamedia.uz is registered as an electronic mass media 26 September 2024 by the AOKA under the administration of the President. Certificate number: 414738. Founder: OOO «Fergana Media Press».",
  } satisfies LocaleMap,

  links: [
    {
      href: "/about-us",
      name: { uz: "Biz haqimizda", uzb: "Биз ҳақимизда", ru: "О нас", en: "About us" } satisfies LocaleMap,
    },
    {
      href: "/contact-us",
      name: { uz: "Bog'lanish", uzb: "Боғланиш", ru: "Контакты", en: "Contact us" } satisfies LocaleMap,
    },
    {
      href: "/terms-of-service",
      name: { uz: "Foydalanish shartlari", uzb: "Фойдаланиш шартлари", ru: "Условия использования", en: "Terms of service" } satisfies LocaleMap,
    },
    {
      href: "/privacy-policy",
      name: { uz: "Maxfiylik siyosati", uzb: "Махфийлик сиёсати", ru: "Политика конфиденциальности", en: "Privacy policy" } satisfies LocaleMap,
    },
    {
      href: "https://president.uz/uz",
      name: { uz: "Prezident portali", uzb: "Президент портали", ru: "Портал Президента", en: "President's portal" } satisfies LocaleMap,
    },
    {
      href: "https://stat.uz/uz/",
      name: { uz: "Statistika", uzb: "Статистика", ru: "Статистика", en: "Statistics" } satisfies LocaleMap,
    },
    {
      href: "https://prokuratura.uz/#/",
      name: { uz: "Prokuratura", uzb: "Прокуратура", ru: "Прокуратура", en: "Procuratorate" } satisfies LocaleMap,
    },
    {
      href: "https://gov.uz/oz/iiv",
      name: { uz: "Hukumat", uzb: "Ҳукумат", ru: "Правительство", en: "Government" } satisfies LocaleMap,
    },
  ] as const,

  siteConfig: {
    email: "info@ferganamedia.uz",
    phone: "+998 90 123 45 67",
    address: {
      uz: "Farg'ona viloyati, Farg'ona shahar, Mash'al, Alisher Navoiy ko'chasi, 32",
      uzb: "Фарғона вилояти, Фарғона шаҳар, Машъал, Алишер Навоий кўчаси, 32",
      ru: "Ферганская область, г. Фергана, Машъал, ул. Алишера Навои, 32",
      en: "Fergana region, Fergana city, Mashal, Alisher Navoi street, 32",
    } satisfies LocaleMap,
  } as const,

  telegram: {
    enabled: false,
    botToken: "",
    chatId: "",
    threadId: "",
  } as const,

  clientDelivery: {
    mode: "normal",
    title: "Texnik ishlar",
    description: "Hozir tizimda texnik ishlar olib borilmoqda. Iltimos, birozdan keyin qayta urinib ko'ring.",
    models: {
      news: true,
      categories: true,
      tags: true,
    },
  } as const,

  users: [
    {
      id: "ceo-1",
      full_name: "CEO Foydalanuvchi",
      image: null as string | null,
      role: "ceo",
      position: "Bosh direktor",
      login: "ceo",
      password: "ceo123",
    },
    {
      id: "admin-1",
      full_name: "Admin Foydalanuvchi",
      image: null as string | null,
      role: "administrator",
      position: "Tizim administratori",
      login: "admin",
      password: "admin123",
    },
    {
      id: "editor-1",
      full_name: "Tahrirchi User",
      image: null as string | null,
      role: "moderator",
      position: "Bosh muharrir",
      login: "editor",
      password: "editor123",
    },
  ] as const,
}

