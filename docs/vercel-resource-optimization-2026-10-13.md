# Vercel resurslarini tejash bo‘yicha o‘zgarishlar

Hujjat sanasi: **2026-10-13**.

Holat: quyidagi optimallashtirishlar lokal kodga qo‘llandi va tekshirildi. Ushbu ish doirasida commit, push yoki production deploy bajarilmadi. Production bazasiga sinov yozuvlari kiritilmadi. Vercel limitlaridagi haqiqiy tejam deploydan keyin o‘lchanishi kerak.

## Muammo va kuzatilgan dalillar

Foydalanuvchi yuborgan umumiy foydalanish skrinshotida Active CPU 6 soat 59 daqiqa / 4 soat, Fast Origin Transfer 10.74 GB / 10 GB, ISR Writes 198K / 200K edi. Bu yig‘ilgan sarf; kodni tuzatish avval sarflangan miqdorni kamaytirmaydi.

Production uchun yuborilgan 12 soatlik Observability skrinshotlari:

- 961 function chaqiruvi; error va timeout ko‘rsatkichlari 0%.
- ISR: taxminan 11K read units, 8.7K write units, 772 vaqt bo‘yicha revalidation, 0 tag revalidation.
- Bosh sahifa: 4.5K write units; maqola sahifalari: 1.4K; `/articles`: 1.3K. Yaxlitlangan sonlar bo‘yicha bu uch guruh yozish birliklarining taxminan 83% ini tashkil qilgan.
- CPU sarfi bo‘yicha ham bosh sahifa va alohida maqola sahifalari yetakchi bo‘lgan.

Bu davrda tez-tez qayta yaratiladigan va hajmi katta sahifalar ISR hamda CPU xarajatining muhim manbai bo‘lgan. `Count` va `Units` alohida ko‘rsatkichlar: yozish amallari sonini hisoblanadigan birliklar bilan tenglashtirish mumkin emas. Tag revalidation 0 bo‘lishi `revalidatePath` ishlamaganini isbotlamaydi.

**Chegara:** Fast Origin Transfer sarfining aniq route bo‘yicha manbasi ushbu skrinshotlar bilan tasdiqlanmagan. Fast Data Transfer boshqa ko‘rsatkich. TTFB kartasida ko‘rsatilgan “Demo Data” haqiqiy o‘lchov sifatida olinmadi.

## 1. Kesh muddatlari

| Qism | Yangi muddat / xatti-harakat |
| --- | --- |
| Bosh sahifa `/{locale}` | 3600 soniya; yangilik yozilganda tegishli kesh eskirtiriladi |
| `/{locale}/articles` | 3600 soniya; yangilik yozilganda kesh eskirtiriladi |
| `/{locale}/news/{slug}` | 86400 soniya; tegishli maqola o‘zgarganda alohida yangilanadi |
| Til layouti | 86400 soniya; bolalarining uzunroq kesh muddatini cheklamasligi uchun |
| Boshqa public sahifalar | Oldingi yangilanish tezligi saqlandi; zarur leaf sahifalarga 300 soniya aniq yozildi |
| Umumiy public ma’lumot keshi | 300 soniyadan 3600 soniyaga uzaytirildi |
| Alohida news-list ma’lumot keshi | Mavjud 60 soniyalik muddat saqlandi; uni ishlatadigan route’larda shu qisqaroq muddat amal qiladi |

Login, dashboard, user va saved kabi dinamik/shaxsiy sahifalar statik public keshga o‘tkazilmadi.

Asosiy fayllar: `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, `app/[locale]/articles/page.tsx`, `app/[locale]/news/[slug]/page.tsx`, [public-data-server.ts](../shared/server/public-data-server.ts).

## 2. Keshni maqsadli eskirtirish

[revalidate-public-cache.ts](../shared/server/revalidate-public-cache.ts) butun til layoutini eskirtirish o‘rniga sahifa va ma’lumot guruhlarini yangilaydi.

- Yangilik yaratish, tahrirlash, nashrdan olish va o‘chirish oqimlari mavjud helper orqali ishlaydi. Slug almashtirilsa eski va yangi manzil yangilanadi.
- Tegishli maqolaning `uz`, `uzb`, `ru`, `en` manzillari eskirtiriladi. Barcha maqola sahifalarini bir yo‘la eskirtirish yo‘q.
- Bosh sahifa, maqolalar, e’lonlar va yangilik ro‘yxatlari, sidebar endpointlari hamda sitemap yangilanadi.
- Kategoriya, mavzu va muallif ro‘yxatlarida route pattern bo‘yicha yangilash saqlangan. Bu hali faqat bitta kategoriya yoki muallifgacha toraytirilgan degani emas.
- Kategoriya va mavzu o‘zgarishlari tegishli ma’lumot tagi va ro‘yxatlarni; teglar o‘zgarishi tag ma’lumot keshini; reklama o‘zgarishi reklama keshi, bosh sahifa va e’lonlarni; jamoa o‘zgarishi jamoa keshi va sahifasini yangilaydi.

**Keyingi ishlab chiqish uchun:** yangilikni yozadigan yangi import, admin yoki API oqimi qo‘shilsa, muvaffaqiyatli yozuvdan keyin `revalidateNewsPublicCache(slug)` chaqirilishi kerak. Slug o‘zgarsa ikkala slug hisobga olinadi. Helper chetlab o‘tilsa, sahifa zaxira kesh muddati tugaguncha eski ma’lumotni ko‘rsatishi mumkin.

## 3. Maqola yon panelining yangilanishi

Maqola HTML’i umumiy so‘nggi yangiliklar keshiga bog‘lanib qolmasligi uchun ikki qism ajratildi:

1. [article-sidebar-snapshot.ts](../shared/server/article-sidebar-snapshot.ts) maqola yaratilayotgan paytda boshlang‘ich ro‘yxatni bazadan oladi. U umumiy `news` tagiga bog‘lanmagan. Faqat nashr qilingan, reklama/statistika bo‘lmagan yozuvlarning kerakli maydonlari olinadi.
2. [article-latest-news.tsx](../entities/news/lists/article-latest-news.tsx) desktopda `/api/news/sidebar/{locale}` orqali yangi kartalarni yuklaydi. Endpoint 11 ta public karta beradi; ochilgan maqola chiqarib tashlangach 10 ta qoladi.

Endpoint keshi 3600 soniya, yangilik yozilganda eskirtiriladi. Brauzerdagi query 5 daqiqa fresh hisoblanadi; davriy polling va oynaga qaytganda avtomatik refetch yo‘q. Mobil qurilmada yashirin sidebar uchun so‘rov yuborilmaydi. Yuklash muvaffaqiyatsiz bo‘lsa server bergan boshlang‘ich ro‘yxat ko‘rinib turadi.

**Muhim xatti-harakat:** ochiq turgan sahifaga yangiliklar real vaqtda push qilinmaydi. Sidebar qayta mount bo‘lganda, query eskirgan bo‘lsa yangilanadi. Boshqa maqola chop etilishi mavjud maqolaning to‘liq HTML’ini qayta yaratishni talab qilmaydi.

## 4. Bosh sahifa va `/articles` ma’lumot hajmi

[public-card-payload.ts](../features/news/lib/public-card-payload.ts) kartalar uchun kerakli maydonlargina qoladigan payload yaratadi:

- Joriy tilning matni mavjud fallback qoidalari bilan tanlanadi; boshqa tillarning nusxalari yuborilmaydi.
- To‘liq maqola matni va kartaga kerak bo‘lmagan admin/Telegram/yangilash maydonlari chiqariladi.
- Kartaga birinchi rasm va zarur media, muallif, sana, statistika hamda navigatsiya maydonlari qoldiriladi.

[home-news-selection.ts](../features/news/lib/home-news-selection.ts) filtrlash va saralashni limit qo‘yishdan oldin bajaradi. Bo‘lim limitlari: banner 9, row 28, slide 120, header 10, top 10, muallif tanlovi 6, breaking 7, video 8, statistika 8, reklama 24. Mavzu bo‘limida 8 ta yozuv tanlanadi. Slide uchun mavjud 120 yozuvli manba doirasidagi kategoriya slaydlari saqlandi.

Bir xil kartalar bo‘limlarga uzatilganda obyektlar qayta ishlatiladi. Bu RSC javobidagi takroriy serializatsiyani kamaytiradi. Lokal, qisqartirilgan ro‘yxatlar umumiy ko‘p tilli query keshiga yozilmaydi.

Server ro‘yxati berilgan komponentlar, shu jumladan bo‘sh `[]` berilganda ham, takroran to‘liq feed yuklamaydi. To‘liq qidiruv feed’i qidiruv oynasi ochilganda yuklanadi.

`/articles` so‘rovi to‘liq `content` maydonini olmaydi, kartalarni tanlangan tilga qisqartiradi. Pagination saqlandi; til almashtirilganda komponent holati tegishli tilga qayta boshlanadi.

## 5. Tekshiruv natijalari

Quyidagilar kod o‘zgarishlari yakunida bajarildi; hujjat yozilishi uchun qayta build qilinmadi.

| Tekshiruv | Natija va qamrov |
| --- | --- |
| `node --test tests/public-rendering.test.cjs` | 11 ta test o‘tdi: locale/fallback, kartalar va bo‘limlar, listing filtrlari/pagination, xatoliklar, sidebar, maqsadli invalidation va ortiqcha fetch’ni to‘xtatish |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | O‘tdi |
| O‘zgargan yangi modullar va kesh/query helperlari uchun ESLint | O‘tdi; butun repozitoriy lint’i toza degan xulosa emas |
| `npm run build` | Yakuniy production build o‘tdi |
| Lokal production serverda `scripts/check-isr.mjs` | O‘tdi: public HIT/TTL, to‘rt til, sidebar shakli, redirect/404 va shaxsiy route himoyasi |
| `git diff --check` | O‘tdi |

Buildning bir urinishida sandbox tarmoq cheklovi sabab sitemap uchun MongoDB ulanishi ishlamadi; tarmoq ruxsati bilan qayta build muvaffaqiyatli yakunlandi. Mavjud Mongoose duplicate-index va lokal `NEXTAUTH_URL` ogohlantirishlari ushbu ishda alohida tuzatilmadi.

Smoke tekshiruvlari sozlangan bazadan faqat o‘qidi. Mutatsiyalarni invalidation bilan bog‘lash testlarda mock orqali tekshirildi. Login qilingan brauzerda to‘liq create/edit/unpublish/delete sinovi productionda bajarilmadi.

### Lokal HTML hajmi taqqoslanishi

Bir xil kontent bilan lokal oldingi va yakuniy build solishtirildi. Bu siqilmagan HTML javob baytlari; Vercel billing yoki Fast Origin Transfer tejamining bevosita o‘lchovi emas.

| Sahifa | Oldin, bayt | Keyin, bayt | Kamayish |
| --- | ---: | ---: | ---: |
| `/uz` | 827 010 | 748 572 | 9.5% |
| `/ru` | 836 771 | 760 071 | 9.2% |
| `/en` | 826 123 | 747 602 | 9.5% |
| `/uz/articles` | 303 527 | 213 188 | 29.8% |

Solishtirilgan sahifalarda sarlavhalar ketma-ketligi saqlandi va yangilik havolalari yo‘qolmadi. `uzb` uchun yakuniy smoke tekshiruvi bajarildi, lekin ushbu jadvalda unga teng boshlang‘ich hajm o‘lchovi keltirilmagan.

## 6. Qayta tekshirish va deploydan keyingi kuzatuv

```bash
node --test tests/public-rendering.test.cjs
node node_modules/typescript/bin/tsc --noEmit --incremental false
npm run build
npm start -- -p 3107
```

Server ishlayotgan paytda boshqa terminalda:

```bash
node scripts/check-isr.mjs http://127.0.0.1:3107
```

Build va smoke tekshiruvi uchun loyihaning odatiy muhit sozlamalari hamda bazaga o‘qish imkoniyati kerak. Sirli qiymatlar bu hujjatga kiritilmaydi.

Release oldidan staging bazasida nashr qilish, tahrirlash, slug almashtirish, nashrdan olish va o‘chirish oqimlarini tekshirish kerak. Natijada bosh sahifa/ro‘yxatlar, eski-yangi maqola manzillari va desktop sidebar tekshiriladi. To‘rt til, til almashtirish, qidiruv va pagination ham ko‘riladi.

Deploydan keyin bir xil vaqt oralig‘i va imkon qadar o‘xshash trafik bilan quyidagilar solishtiriladi:

- ISR **write units**: bosh sahifa, `/articles`, maqolalar; vaqt bo‘yicha revalidation soni.
- Active CPU va function invocations: shu route’lar bo‘yicha.
- Fast Origin Transfer: alohida metric sifatida; uning route bo‘yicha dalili mavjud bo‘lsa eng katta manbalar.
- Kesh HIT/STALE/MISS, xatolar va yangi materialning ko‘rinish tezligi.

Oylik jami ko‘rsatkichning pasayishini kutish o‘rniga uning o‘sish tezligi kuzatiladi. Trafik, botlar va material nashr qilish chastotasi o‘zgarsa, sarf taqqoslashida ular ham hisobga olinadi. Hozircha productiondagi foizli tejam kafolatlanmagan.
