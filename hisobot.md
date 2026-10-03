**Sarfni oshirayotgan muammolar topildi. Eng kattasi — ommaviy sahifalar har tashrifda serverda qayta tayyorlanadi va ortiqcha katta ma’lumot yuboriladi.** Kodni ham, haqiqiy `www.ferganamedia.uz` javoblarini ham tekshirdim.

Ketma-ket so‘rovlarda quyidagini o‘lchadim:

| Tekshirilgan joy | Siqilmagan javob hajmi | Kesh holati |
|---|---:|---|
| Bosh sahifa `/uz` | **1,19 MB** | Ikkala so‘rovda ham `MISS`, `no-store` |
| Bitta maqola sahifasi | **717 KB** | Ikkala so‘rovda ham `MISS`, `no-store` |
| Yangiliklar API, 100 ta yozuv | **312 KB** | Keyingi so‘rovda `HIT` |

Bu javob hajmlari; Vercel hisoblagan billing hajmi bilan aynan tenglashtirib bo‘lmaydi.

1. **Sahifa keshi ishlamayapti — CPU va Origin Transfer uchun asosiy muammo.**
   [Root layout](app/layout.tsx#L31) tilni `getLocale()` orqali oladi. Hozirgi sozlamada bu so‘rov sarlavhalariga bog‘lanib, dinamik renderni yoqadi. Ma’lumotlar keshlangan bo‘lsa ham, sahifaning HTML’i qayta yaratiladi. Jonli saytdagi `no-store` buni tasdiqladi. [next-intl izohi](https://next-intl.dev/docs/routing/setup#static-rendering)

2. **Yon paneldagi 10 ta yangilik uchun 120 tagacha yozuv yuboriladi, keyin yana ro‘yxat so‘raladi.**
   [Maqola sahifasi](app/[locale]/news/[slug]/page.tsx#L103) katta ro‘yxatni brauzerga uzatadi. [LatestNews](entities/news/lists/latest-news.tsx#L17) undan 10 tasini ko‘rsatadi, ammo `usePublicNewsQuery()`ni ham chaqiradi. Maqolani yangi ochgan foydalanuvchida bu yana **100 ta yangiliklik API javobini** yuklatadi. Yon panel telefonda yashirilgan bo‘lsa ham komponent ishlaydi.

3. **API javobida keraksiz maydonlar ko‘p.**
   [Projection](features/news/lib/news-list-projection.ts#L5) faqat `content`ni chiqarib tashlaydi. Qolgan to‘rt tildagi sarlavha va tavsiflar, Telegram holatlari, yaratgan foydalanuvchi ma’lumotlari ham yuboriladi. Tekshirilgan **312 KB javobning taxminan 166 KB’i tavsiflar** edi.

4. **Izoh va reaksiyalar bir maqola uchun ikki joydan yuklanadi.**
   [Maqola komponenti](entities/news/slug/_components/page-content.tsx#L110) ikkita so‘rov yuboradi; [NewsEngagement](features/news/ui/news-engagement.tsx#L157) yana ikkitani yuboradi. Bu endpointlar `private` keshlangan, shuning uchun turli tashrifchilar umumiy CDN keshidan foydalanmaydi. Umumiy sayt sozlamalari `/api/configs` ham har yangi tashrifchida serverga boradi.

5. **Serverda takroriy ish bor.**
   [Maqola kodi](app/[locale]/news/[slug]/page.tsx#L27) ayni maqolani metadata va sahifa uchun alohida o‘qiydi. Ro‘yxat sahifalari esa server ichidan o‘z `/api/news` manziliga HTTP so‘rov yuboradi. Bular qo‘shimcha ishlov va ma’lumot uzatishni oshiradi. **Bazani kutish vaqti Active CPUga kirmaydi**, lekin render, JSON tayyorlash va boshqa hisoblashlar kiradi. [Vercel izohi](https://vercel.com/docs/functions/usage-and-pricing)

Birinchi tuzatishlar: **ommaviy sahifalarni ISR keshlashga o‘tkazish, yon panel ma’lumotini 10 ta kerakli yozuvgacha qisqartirish va takroriy so‘rovlarni birlashtirish**. Bu CPU hamda Fast Origin Transfer sarfini kamaytirishga bevosita xizmat qiladi. [Vercel tavsiyasi](https://vercel.com/docs/manage-cdn-usage#optimizing-fast-origin-transfer)

Hozircha kod o‘zgartirilmadi. Vercel Usage’dagi route bo‘yicha sarflarni ko‘rmaganim uchun har bir sababning umumiy sarfdagi foizini ayta olmayman; yuqoridagi muammolar esa kod va jonli HTTP tekshiruvlari bilan tasdiqlandi.
