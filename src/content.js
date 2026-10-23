// Tüm metinler tek yerde. Her alan { en, tr } — dil düğmesi bunlardan seçer.
// Rakamlar ilgili reponun README / kaynak kodundan alındı; değiştirirken oradan doğrula.

export const studio = {
  name: 'Elsa',
  email: 'emre@elsacrob.com',
  founder: 'Emre Can Buhur',
  site: 'https://elsacrob.com/',
};

export const ui = {
  nav_home: { en: 'Studio', tr: 'Stüdyo' },
  nav_products: { en: 'Products', tr: 'Ürünler' },
  nav_web: { en: 'Websites', tr: 'Web siteleri' },
  scroll: { en: 'Scroll to explore', tr: 'Keşfetmek için kaydır' },
  explore: { en: 'Explore', tr: 'İncele' },
  back: { en: 'All work', tr: 'Tüm işler' },
  next: { en: 'Next', tr: 'Sıradaki' },
  chapter: { en: 'Chapter', tr: 'Bölüm' },
  gallery: { en: 'Inside the build', tr: 'İçeriden görüntüler' },
  gallery_note: {
    en: 'Real captures from the current builds — no mock-ups.',
    tr: 'Güncel sürümlerden gerçek ekran görüntüleri — maket yok.',
  },
  gallery_web: {
    en: 'Captured from the live build of the site.',
    tr: 'Sitenin çalışan sürümünden alınmış kareler.',
  },
  under_hood: { en: 'Under the hood', tr: 'Kaputun altı' },
  in_numbers: { en: 'In numbers', tr: 'Rakamlarla' },
  built_with: { en: 'Built with', tr: 'Teknoloji' },
  in_dev: { en: 'In development', tr: 'Geliştiriliyor' },
  concept: { en: 'Concept, not a real screen', tr: 'Konsept, gerçek ekran değil' },
  game: { en: 'Game', tr: 'Oyun' },
  app: { en: 'App', tr: 'Uygulama' },
  web: { en: 'Website', tr: 'Web sitesi' },
  visit: { en: 'Visit the site', tr: 'Siteyi ziyaret et' },
  client: { en: 'Client', tr: 'Müşteri' },
  loading: { en: 'Loading', tr: 'Yükleniyor' },
  drag: { en: 'Drag or scroll', tr: 'Kaydır' },
};

export const home = {
  eyebrow: { en: 'AI-native product studio', tr: 'Yapay zekâ odaklı ürün stüdyosu' },
  title: { en: 'We build worlds\npeople return to.', tr: 'İnsanların geri döndüğü\ndünyalar kuruyoruz.' },
  lead: {
    en: 'Elsa is an independent studio shipping mobile games, apps and immersive websites end to end — from the first prompt to the signed store build.',
    tr: 'Elsa; mobil oyunları, uygulamaları ve sürükleyici web sitelerini ilk istemden imzalı mağaza paketine kadar uçtan uca üreten bağımsız bir stüdyo.',
  },
  about: {
    label: { en: 'About the studio', tr: 'Stüdyo hakkında' },
    h: { en: 'Small team.\nWhole products.', tr: 'Küçük ekip.\nBütün ürünler.' },
    p: [
      {
        en: 'We are an independent product studio. We design, build, test and ship our own games and apps, and we build websites for local businesses that want to stand out.',
        tr: 'Bağımsız bir ürün stüdyosuyuz. Kendi oyunlarımızı ve uygulamalarımızı tasarlıyor, geliştiriyor, test ediyor ve yayınlıyoruz; öne çıkmak isteyen yerel işletmeler için de web siteleri kuruyoruz.',
      },
      {
        en: 'We write the code ourselves. Every repository carries its own spec and business rules alongside it; coding agents read, analyse and review that code, and suggest fixes and improvements — the final call, and the final line, are always ours. That discipline is how a small team keeps ten products moving without losing quality.',
        tr: 'Kodu biz yazarız. Her repo kendi spesifikasyonunu ve iş kurallarını da yanında taşır; kodlama ajanları bu kodu okur, analiz eder, gözden geçirir ve iyileştirme önerir — son kararı da son satırı da hep biz veririz. Küçük bir ekibin on ürünü kaliteden ödün vermeden yürütmesinin yolu bu disiplin.',
      },
    ],
    // kurucu: yalnız projelerden görünen bilgi — kişisel ayrıntı eklenecekse buraya
    founder: {
      label: { en: 'Founder', tr: 'Kurucu' },
      role: { en: 'Founder & product developer', tr: 'Kurucu ve ürün geliştirici' },
      p: [
        {
          en: 'Behind Elsa is Emre Can Buhur — a developer who carries a product himself from the first idea to the store: game design, mobile architecture, 3D on the web and the release process all sit on the same desk.',
          tr: 'Elsa\'nın arkasında Emre Can Buhur var — bir ürünü ilk fikirden mağazaya kadar kendisi taşıyan bir geliştirici: oyun tasarımı, mobil mimari, web\'de 3D ve yayın süreci aynı masada.',
        },
        {
          en: 'What ties his work together is pointing technology at problems that touch everyday life: a mesh network that keeps messages moving when cell towers fail in an earthquake, a passport that makes young people\'s volunteering visible, a path into society through volunteering for newcomers in Germany, a record for every sapling planted after a wildfire. Next to them sit the games — a puzzle that simulates every grain of sand, a shop where you solve orders by mixing colours, a toy-factory empire.',
          tr: 'İşlerini birbirine bağlayan şey, teknolojiyi gündelik hayata dokunan sorunlara yöneltmek: depremde baz istasyonları çöktüğünde mesajları taşımaya devam eden bir mesh ağı, gençlerin gönüllülüğünü görünür kılan bir pasaport, Almanya\'daki göçmenler için gönüllülükle topluma açılan bir yol, yangından sonra dikilen her fidan için bir kayıt. Yanlarında da oyunlar — her kum tanesini simüle eden bir bulmaca, siparişleri renk karıştırarak çözdüğün bir dükkân, bir oyuncak fabrikası imparatorluğu.',
        },
        {
          en: 'His way of working is simple: spec and business rules first, then small, tested steps. Privacy, offline support and language that never blames the user aren\'t features added later — they are where every project starts.',
          tr: 'Çalışma biçimi sade: önce spesifikasyon ve iş kuralları, sonra küçük ve test edilmiş adımlar. Gizlilik, çevrimdışı çalışma ve kullanıcıyı suçlamayan bir dil sonradan eklenen özellikler değil — her projenin başladığı yer.',
        },
      ],
    },
    values: [
      { h: { en: 'Privacy by default', tr: 'Varsayılan gizlilik' }, p: { en: 'Location that never leaves the phone. Health data encrypted at rest. Logs with PII masked.', tr: 'Telefondan çıkmayan konum. Şifreli sağlık verisi. Kişisel bilgisi maskelenmiş kayıtlar.' } },
      { h: { en: 'Offline first', tr: 'Önce çevrimdışı' }, p: { en: 'Attendance queues, prayer times, mesh packets — everything keeps working without a signal.', tr: 'Yoklama kuyruğu, namaz vakitleri, mesh paketleri — sinyal yokken de her şey çalışır.' } },
      { h: { en: 'No dark patterns', tr: 'Karanlık tasarım yok' }, p: { en: 'Core features never get locked. Language that encourages instead of blaming.', tr: 'Temel işlev asla kilitlenmez. Suçlamayan, cesaretlendiren bir dil.' } },
      { h: { en: 'Tested, not hoped', tr: 'Umulan değil, test edilen' }, p: { en: 'Over 1,300 automated tests across three apps. Simulators, economy models and level generators are code.', tr: 'Üç uygulamada 1.300\'ü aşkın otomatik test. Simülatörler, ekonomi modelleri ve bölüm üreticileri kodla yazılır.' } },
    ],
    process: {
      label: { en: 'How we build', tr: 'Nasıl üretiyoruz' },
      steps: [
        { h: { en: 'Spec', tr: 'Spesifikasyon' }, p: { en: 'Product brief, business rules and data model written into the repo first.', tr: 'Ürün özeti, iş kuralları ve veri modeli önce repoya yazılır.' } },
        { h: { en: 'Build', tr: 'İnşa' }, p: { en: 'Small, reviewed steps with coding agents that follow the repo rules.', tr: 'Repo kurallarına uyan kodlama ajanlarıyla küçük, gözden geçirilmiş adımlar.' } },
        { h: { en: 'Prove', tr: 'Kanıtla' }, p: { en: 'Unit, integration and golden tests; playthrough bots for games.', tr: 'Birim, entegrasyon ve görsel testler; oyunlar için otomatik oynanış botları.' } },
        { h: { en: 'Ship', tr: 'Yayınla' }, p: { en: 'Signed store builds, store copy and privacy forms prepared in the same repo.', tr: 'İmzalı mağaza paketleri, mağaza metinleri ve gizlilik formları aynı repoda hazırlanır.' } },
      ],
    },
  },
  stats: [
    { n: 7, l: { en: 'games & apps', tr: 'oyun ve uygulama' } },
    { n: 3, l: { en: 'immersive websites', tr: 'sürükleyici web sitesi' } },
    { n: 1300, plus: true, l: { en: 'automated tests', tr: 'otomatik test' } },
    { n: 240, l: { en: 'puzzle levels', tr: 'bulmaca bölümü' } },
  ],
  products_h: { en: 'Games & apps', tr: 'Oyunlar ve uygulamalar' },
  web_h: { en: 'Websites we built', tr: 'Yaptığımız web siteleri' },
  web_p: {
    en: 'Scroll-choreographed 3D sites for local brands — built on the same engine as our products.',
    tr: 'Yerel markalar için scroll ile ilerleyen 3D siteler — ürünlerimizle aynı motor üzerinde.',
  },
  contact_h: { en: 'Let’s talk.', tr: 'Konuşalım.' },
  contact_p: {
    en: 'Partnerships, publishing, a website of your own — write to us.',
    tr: 'Ortaklık, yayıncılık ya da kendi web siteniz — bize yazın.',
  },
};

// accent: sahne vurgusu, bg: sayfa zemini. chapters: ürün sayfasının bölümleri.
export const products = [
  {
    slug: 'sores',
    code: 'EL-01',
    kind: 'game',
    name: 'Şoreş Toy Workshop',
    name_tr: 'Şoreş Oyuncak Atölyesi',
    icon: 'media/sores-w0.webp',
    cover: 'media/sores-f0.webp',
    accent: '#f5a524',
    bg: '#1a0f07',
    marquee: { en: 'Hire · Build · Sell · Grow · Prestige ·', tr: 'İşe al · Üret · Sat · Büyüt · Prestij ·' },
    tagline: {
      en: 'An idle toy-factory tycoon. Hire a crew, grow your boss, build an empire across five factories.',
      tr: 'Boşta-üretim oyuncak fabrikası. Ekibini kur, patronunu büyüt, beş fabrikada imparatorluk kur.',
    },
    tech: ['Phaser 3', 'Capacitor', 'WebAudio', 'Android'],
    sections: [
      {
        label: { en: 'The floor', tr: 'Atölye' },
        h: { en: 'Nine desks. Twelve characters.', tr: 'Dokuz masa. On iki karakter.' },
        p: {
          en: 'Tap an empty desk and pick a worker — the apprentice, the chef, the ninja, the astronaut… Each one has its own power and price. Stronger crews build faster, and cost more.',
          tr: 'Boş bir masaya dokun ve işçini seç — çırak, aşçı, ninja, astronot… Her birinin gücü ve fiyatı farklı. Güçlü ekip daha hızlı üretir, daha pahalıdır.',
        },
        points: [['×1 → ×202', { en: 'worker power range', tr: 'işçi gücü aralığı' }], ['5 → 100', { en: 'desk capacity', tr: 'masa kapasitesi' }]],
        shot: 0,
      },
      {
        label: { en: 'The boss', tr: 'Patron' },
        h: { en: 'A boss who grows with you', tr: 'Seninle büyüyen patron' },
        p: {
          en: 'Every toy you sell levels up the boss. The boss grows bigger, prices multiply ×1.32 per level, and a bow tie, a gold chain, then a crown follow. From level 8 the boss sells on autopilot.',
          tr: 'Sattığın her oyuncak patrona XP verir. Büyür, her seviyede satış fiyatı ×1.32 katlanır; papyon, altın zincir, sonra taç kazanır. 8. seviyede kendi satmaya başlar.',
        },
        points: [['×1.32', { en: 'price per boss level', tr: 'seviye başı fiyat' }], ['Lv 8', { en: 'auto-sell unlocks', tr: 'oto-satış açılır' }]],
        shot: 1,
      },
      {
        label: { en: 'The worlds', tr: 'Dünyalar' },
        h: { en: 'Five worlds of toys', tr: 'Beş oyuncak dünyası' },
        p: {
          en: 'Wood workshop → paint shop → pirate toys → circus → robot factory. Each world multiplies income — from ×1 up to ×120,000.',
          tr: 'Ahşap atölyesi → boya atölyesi → korsan oyuncak → sirk → robot fabrikası. Her dünya geliri katlar — ×1\'den ×120.000\'e.',
        },
        points: [['250K₺', { en: 'to open the paint shop', tr: 'boya atölyesi açılışı' }], ['500B₺', { en: 'to open the robot factory', tr: 'robot fabrikası açılışı' }]],
        shot: 2,
      },
      {
        label: { en: 'The long game', tr: 'Uzun oyun' },
        h: { en: 'Robots, prestige, collection', tr: 'Robotlar, prestij, koleksiyon' },
        p: {
          en: 'Max out a factory to unlock robot workers (×5). Sell the company for permanent stars (+50% each). Open badge boxes for lasting bonuses. Offline production keeps running for up to 8 hours.',
          tr: 'Fabrikayı doldur, robot işçileri aç (×5). Şirketi sat, kalıcı yıldız kazan (her biri +%50). Rozet kutuları aç, kalıcı bonus al. Çevrimdışı üretim 8 saate kadar sürer.',
        },
        points: [['√(sold/50k)', { en: 'stars per prestige', tr: 'prestij başı yıldız' }], ['8 h', { en: 'offline production', tr: 'çevrimdışı üretim' }]],
        shot: 4,
      },
    ],
    shots: ['media/sores-f0.webp', 'media/sores-f1.webp', 'media/sores-f2.webp', 'media/sores-f3.webp', 'media/sores-f4.webp'],
    // sıradaki nesil: şu anki değil, üzerinde çalıştığımız görsel yön — gerçek oyundan ayrı etiketli
    vision: {
      label: { en: 'Next generation', tr: 'Sıradaki nesil' },
      note: {
        en: 'Concept direction for the next version — not the shipped build.',
        tr: 'Şu anki oyunun değil, üzerinde çalıştığımız bir sonraki sürümün konsept yönü.',
      },
      shots: ['media/sores-vision-0.webp', 'media/sores-vision-1.webp', 'media/sores-vision-2.webp'],
    },
    facts: [
      { n: 5, l: { en: 'factories', tr: 'fabrika' } },
      { n: 12, l: { en: 'workers', tr: 'işçi' } },
      { n: 0, l: { en: 'audio files — all sound is synthesised', tr: 'ses dosyası — tüm sesler sentez' } },
    ],
    specs: [
      { k: { en: 'Engine', tr: 'Motor' }, v: 'Phaser 3.90' },
      { k: { en: 'Art', tr: 'Görseller' }, v: { en: '31 hand-directed sprites, AI-assisted drafts, green-screen sliced', tr: '31 sprite — elle yönetilen tasarım, yapay zekâ destekli taslak, yeşil fondan ayrıştırılmış' } },
      { k: { en: 'Sound', tr: 'Ses' }, v: { en: 'Procedural WebAudio tones', tr: 'WebAudio ile anlık üretilen tonlar' } },
      { k: { en: 'Save', tr: 'Kayıt' }, v: { en: 'Local autosave + 8 h offline catch-up', tr: 'Yerel otomatik kayıt + 8 saat çevrimdışı telafi' } },
    ],
  },
  {
    slug: 'kum-tuvali',
    code: 'EL-02',
    kind: 'game',
    name: 'Sand Canvas',
    name_tr: 'Kum Tuvali',
    icon: 'media/sand-icon.webp',
    cover: 'media/sc-pour.webp',
    accent: '#e8c48a',
    bg: '#070c1c',
    marquee: { en: 'Pour · Settle · Sort · Paint ·', tr: 'Dök · Otur · Ayıkla · Boya ·' },
    tagline: {
      en: 'A colour-sort puzzle with real sand physics. Every grain is simulated — pour it, watch it arc, settle and pile.',
      tr: 'Gerçek kum fiziğiyle renk sıralama bulmacası. Her tane ayrı simüle edilir — dök, yay çizişini, oturuşunu, yığılışını izle.',
    },
    tech: ['TypeScript', 'Three.js', 'Vite', 'Capacitor'],
    sections: [
      {
        label: { en: 'Physics', tr: 'Fizik' },
        h: { en: 'Not rectangles. Grains.', tr: 'Dikdörtgen değil. Tane.' },
        p: {
          en: 'In every other sort game a “pour” is a rectangle sliding up and down. Here, grains leave the lip of the tube, fly through the air, land and pile up — one by one.',
          tr: 'Bu türdeki her oyunda “dökmek” bir dikdörtgenin inip çıkmasıdır. Burada taneler tüpün ağzından fırlar, havada yay çizer, düşer ve yığılır — tek tek.',
        },
        points: [['1:1', { en: 'simulated grains', tr: 'simüle tane' }], ['9', { en: 'sand colours', tr: 'kum rengi' }]],
        shot: 0,
      },
      {
        label: { en: 'The story', tr: 'Hikâye' },
        h: { en: 'Paint the masterpiece back', tr: 'Tabloyu geri boya' },
        p: {
          en: 'One night a wind swept through the museum and every colour turned to sand. Each solved tube returns a pure colour to the canvas — and the painting comes back to life, grain by grain.',
          tr: 'Bir gece müzeye rüzgâr girdi, bütün renkler kuma döndü. Çözdüğün her tüp tuvale saf bir renk taşır — ve tablo tane tane yeniden canlanır.',
        },
        points: [['12', { en: 'masterpieces', tr: 'başyapıt' }], ['dark → light', { en: 'palette order', tr: 'palet sırası' }]],
        shot: 1,
      },
      {
        label: { en: 'The museum', tr: 'Müze' },
        h: { en: 'A museum of halls', tr: 'Salon salon bir müze' },
        p: {
          en: '120 levels across themed halls — Paper Moon, Silent North, Golden Room, Starry Room. Japanese prints in the first hall, Van Gogh in the second.',
          tr: 'Temalı salonlara yayılmış 120 bölüm — Kâğıt Ay, Sessiz Kuzey, Altın Oda, Yıldızlı Oda. İlk salonda Japon baskıları, ikincide Van Gogh.',
        },
        points: [['120', { en: 'levels', tr: 'bölüm' }], ['4+', { en: 'themed halls', tr: 'temalı salon' }]],
        shot: 2,
      },
    ],
    shots: ['media/sc-pour.webp', 'media/sc-tubes.webp', 'media/sc-museum.webp'],
    art: ['media/art-fuji-kirmizi.webp', 'media/art-buyuk-dalga.webp', 'media/art-yildizli-gece.webp', 'media/art-inci-kupe.webp'],
    facts: [
      { n: 120, l: { en: 'levels', tr: 'bölüm' } },
      { n: 12, l: { en: 'paintings to restore', tr: 'onarılacak tablo' } },
      { n: 2, l: { en: 'languages, more ready to plug in', tr: 'dil, yenisi eklemeye hazır' } },
    ],
    specs: [
      { k: { en: 'Render', tr: 'Çizim' }, v: 'Three.js · WebGL' },
      { k: { en: 'Sim', tr: 'Simülasyon' }, v: { en: 'Per-grain sand, deterministic', tr: 'Tane başına kum, deterministik' } },
      { k: { en: 'Architecture', tr: 'Mimari' }, v: { en: 'Typed event bus between engine and UI', tr: 'Motor ile arayüz arasında tip güvenli olay yolu' } },
      { k: { en: 'Palettes', tr: 'Paletler' }, v: { en: 'Clustered from each artwork, dark to light', tr: 'Her eserden kümelenmiş, koyudan açığa' } },
    ],
  },
  {
    slug: 'renk-simyacisi',
    code: 'EL-03',
    kind: 'game',
    name: 'Colour Alchemist',
    name_tr: 'Renk Simyacısı',
    icon: 'media/alchemy-icon.webp',
    cover: 'media/rs-title.webp',
    accent: '#ff5c8a',
    bg: '#140a1c',
    marquee: { en: 'Red + Yellow = Orange · Yellow + Blue = Green · Red + Blue = Purple ·', tr: 'Kırmızı + Sarı = Turuncu · Sarı + Mavi = Yeşil · Kırmızı + Mavi = Mor ·' },
    tagline: {
      en: 'The sort puzzle, inverted: the target colour isn’t on the board — you have to create it.',
      tr: 'Sort bulmacası, tersine: hedef renk tahtada yok — onu sen doğuruyorsun.',
    },
    tech: ['TypeScript', 'SVG', 'Vite', 'Capacitor'],
    sections: [
      {
        label: { en: 'The rule', tr: 'Kural' },
        h: { en: 'Mix, don’t just match', tr: 'Eşleştirme değil, karıştırma' },
        p: {
          en: 'Red + Yellow = Orange. Yellow + Blue = Green. Red + Blue = Purple. Anything else turns to mud — and mud never comes back.',
          tr: 'Kırmızı + Sarı = Turuncu. Sarı + Mavi = Yeşil. Kırmızı + Mavi = Mor. Başka her temas çamur olur — ve çamurun dönüşü yok.',
        },
        points: [['6 × 3', { en: 'colours × tones', tr: 'renk × ton' }], ['18', { en: 'order items', tr: 'sipariş kalemi' }]],
        shot: 1,
      },
      {
        label: { en: 'Tones', tr: 'Tonlar' },
        h: { en: 'Lighter, darker, exact', tr: 'Açık, koyu, tam isabet' },
        p: {
          en: 'Clear Water lightens a colour by one tone, Charcoal Essence darkens it. Light orange and orange are different orders; telling them apart is half the game after level 25.',
          tr: 'Berrak Su rengi bir ton açar, Kömür Özü bir ton koyultur. Açık turuncu ile turuncu ayrı siparişlerdir; 25. bölümden sonra bunu ayırt etmek oyunun yarısı.',
        },
        points: [['25', { en: 'Clear Water unlocks', tr: 'Berrak Su açılır' }], ['45', { en: 'Charcoal unlocks', tr: 'Kömür Özü açılır' }]],
        shot: 1,
      },
      {
        label: { en: 'The shop', tr: 'Dükkân' },
        h: { en: 'A ruin becomes a master’s shop', tr: 'Harabe, usta dükkânına dönüşür' },
        p: {
          en: 'Puzzles are part of a working day. Shutters open, customers walk in, queue, get impatient, drop their orders. Twelve quests turn a boarded-up ruin into a master’s shop.',
          tr: 'Bulmaca bir iş gününün parçası. Kepenk açılır, müşteriler girer, sıra bekler, sabırsızlanır, fişini bırakır. On iki görev, tahtalanmış harabeyi usta dükkânına çevirir.',
        },
        points: [['5', { en: 'shop stages', tr: 'dükkân evresi' }], ['12', { en: 'quests', tr: 'görev' }]],
        shot: 0,
      },
      {
        label: { en: 'Mechanics', tr: 'Mekanikler' },
        h: { en: 'Four mechanics, unlocked by story', tr: 'Hikâyeyle açılan dört mekanik' },
        p: {
          en: '120 orders, 18 bottle designs. Seal Wax at 65 locks a finished bottle; the Fire Hearth at 85 stirs the top two layers on every move. Each arrives with a hand-designed teaching level.',
          tr: '120 sipariş, 18 şişe tasarımı. 65\'te Mühür Mumu bitmiş şişeyi kilitler; 85\'te Ateş Ocağı her hamlede üst iki katmanı kendiliğinden karıştırır. Her biri elle tasarlanmış bir öğretici bölümle gelir.',
        },
        points: [['120', { en: 'orders', tr: 'sipariş' }], ['4', { en: 'mechanics', tr: 'mekanik' }]],
        shot: 1,
      },
    ],
    shots: ['media/rs-title.webp', 'media/rs-puzzle.webp'],
    facts: [
      { n: 120, l: { en: 'orders', tr: 'sipariş' } },
      { n: 18, l: { en: 'colour tones to tell apart', tr: 'ayırt edilecek renk tonu' } },
      { n: 4, l: { en: 'unlockable mechanics', tr: 'açılan mekanik' } },
    ],
    specs: [
      { k: { en: 'Scene', tr: 'Sahne' }, v: { en: 'One-point perspective SVG diorama', tr: 'Tek nokta perspektifli SVG diorama' } },
      { k: { en: 'Levels', tr: 'Bölümler' }, v: { en: 'Generator + playthrough bot + economy sim', tr: 'Üretici + oynanış botu + ekonomi simülasyonu' } },
      { k: { en: 'Characters', tr: 'Karakterler' }, v: { en: '7 cast members with mood portraits', tr: 'Ruh hâli portreleriyle 7 karakter' } },
      { k: { en: 'Tests', tr: 'Testler' }, v: 'node:test · e2e' },
    ],
  },
  {
    slug: 'sincere-salah',
    code: 'EL-04',
    kind: 'app',
    name: 'Sincere Salah',
    icon: 'media/salah-icon.webp',
    cover: 'media/garden-5.webp',
    accent: '#e9c46a',
    bg: '#06101c',
    marquee: { en: 'Fajr · Dhuhr · Asr · Maghrib · Isha ·', tr: 'Sabah · Öğle · İkindi · Akşam · Yatsı ·' },
    tagline: {
      en: 'A privacy-first, ad-free, offline-first prayer habit companion. Your location never leaves your phone.',
      tr: 'Gizliliğe saygılı, reklamsız, çevrimdışı öncelikli namaz alışkanlığı arkadaşı. Konumun telefonundan hiç çıkmaz.',
    },
    tech: ['Flutter', 'Drift / SQLite', 'TFLite', 'FastAPI'],
    sections: [
      {
        label: { en: 'The garden', tr: 'Bahçe' },
        h: { en: 'A garden that grows with you', tr: 'Seninle büyüyen bir bahçe' },
        p: {
          en: 'Every prayer you keep waters a garden — a seedling becomes a sapling, then a tree. Lanterns, fountains and jasmine slowly fill the garden — progress you can see, without streak guilt.',
          tr: 'Kıldığın her namaz bir bahçeyi sular — fide fidan olur, fidan ağaç. Fenerler, çeşmeler, yaseminler bahçeyi yavaş yavaş doldurur — suçlamadan, görünür bir ilerleme.',
        },
        points: [['6', { en: 'growth stages', tr: 'büyüme evresi' }], ['0', { en: 'guilt messages', tr: 'suçlayıcı mesaj' }]],
      },
      {
        label: { en: 'The times', tr: 'Vakitler' },
        h: { en: 'Five times, computed on device', tr: 'Beş vakit, cihazda hesaplanır' },
        p: {
          en: 'Prayer times are calculated on the phone from your coordinates — no server call, no location upload. The sky in the app follows the actual time of day.',
          tr: 'Namaz vakitleri koordinatlarından telefonda hesaplanır — sunucuya istek yok, konum yüklemesi yok. Uygulamadaki gökyüzü günün gerçek saatini izler.',
        },
        points: [['5', { en: 'daily times', tr: 'günlük vakit' }], ['0', { en: 'network calls', tr: 'ağ isteği' }]],
      },
      {
        label: { en: 'Privacy', tr: 'Gizlilik' },
        h: { en: 'Your data stays home', tr: 'Verin evde kalır' },
        p: {
          en: 'Logs, garden and analytics all live on the device. The server only knows one thing: who is entitled to free access — through three endpoints, nothing more.',
          tr: 'Kayıtlar, bahçe ve analitik tamamen cihazda yaşar. Sunucunun bildiği tek şey kimin ücretsiz erişim hakkı olduğu — üç uç nokta, fazlası yok.',
        },
        points: [['3', { en: 'server endpoints', tr: 'sunucu uç noktası' }], ['SQLite', { en: 'on-device store', tr: 'cihaz içi veri' }]],
      },
      {
        label: { en: 'Focus', tr: 'Odak' },
        h: { en: 'Focus when it matters', tr: 'Odak, en gerekli anda' },
        p: {
          en: 'An optional shield gently locks distractions at prayer time — Android Accessibility and iOS Screen Time, natively. A precise Qibla with on-device magnetic-declination correction.',
          tr: 'İsteğe bağlı kalkan, vakitte dikkat dağıtıcıları nazikçe kilitler — Android ve iOS\'ta yerel olarak. Manyetik sapması cihazda düzeltilen hassas kıble.',
        },
        points: [['WMM', { en: 'magnetic model', tr: 'manyetik model' }], ['2', { en: 'native shields', tr: 'yerel kalkan' }]],
      },
      {
        label: { en: 'Community', tr: 'Topluluk' },
        h: { en: 'Pay it forward', tr: 'Askıda Premium' },
        p: {
          en: 'Anyone can fund premium for someone who can’t afford it — a suspended-premium pool, like a suspended coffee. Ten languages from day one. The habit-plus-privacy model isn’t Islam-specific — a sister app for Christian habit-building, reading the Bible on the same private, ad-free engine, is on our roadmap.',
          tr: 'Herkes, gücü yetmeyen biri için premium bırakabilir — askıda kahve gibi, askıda premium havuzu. İlk günden on dil. Alışkanlık + gizlilik modeli yalnızca İslam\'a özgü değil — aynı gizli, reklamsız motor üzerinde İncil okuma ve Hristiyan alışkanlık takibi için bir kardeş uygulama da yol haritamızda.',
        },
        points: [['10', { en: 'languages', tr: 'dil' }], ['0', { en: 'ads', tr: 'reklam' }]],
      },
      {
        label: { en: 'Qur’an', tr: 'Kur’an' },
        h: { en: 'Read like a real Mushaf', tr: 'Gerçek bir Mushaf gibi oku' },
        p: {
          en: 'Swipe through the same page layout as the printed Madinah Mushaf, listen to eight reciters, and long-press any word for its translation and the Surah’s place of revelation. Your last page is remembered automatically — and it never leaves the device.',
          tr: 'Basılı Medine Mushaf\'ıyla aynı sayfa düzeninde kaydır, sekiz hafızdan dinle, herhangi bir kelimeye basılı tutarak çevirisini ve surenin iniş yerini gör. Son sayfan otomatik hatırlanır — ve cihazdan hiç çıkmaz.',
        },
        points: [['8', { en: 'reciters', tr: 'hafız' }], ['604', { en: 'Mushaf pages', tr: 'Mushaf sayfası' }]],
      },
    ],
    shots: [],
    facts: [
      { n: 256, l: { en: 'unit tests', tr: 'birim testi' } },
      { n: 10, l: { en: 'languages', tr: 'dil' } },
      { n: 0, l: { en: 'ads, trackers, location uploads', tr: 'reklam, izleyici, konum yüklemesi' } },
    ],
    specs: [
      { k: { en: 'App', tr: 'Uygulama' }, v: 'Flutter · Riverpod · Drift' },
      { k: { en: 'Native', tr: 'Yerel' }, v: { en: 'AccessibilityService · FamilyControls', tr: 'AccessibilityService · FamilyControls' } },
      { k: { en: 'On-device ML', tr: 'Cihazda ML' }, v: 'TFLite' },
      { k: { en: 'Backend', tr: 'Sunucu' }, v: { en: 'FastAPI + Postgres + Redis, JWT licences only', tr: 'FastAPI + Postgres + Redis, yalnız JWT lisans' } },
    ],
    futureApp: {
      label: { en: 'Next up · a sister app for Christianity', tr: 'Sıradaki · Hristiyanlık için kardeş uygulama' },
      note: {
        en: 'The habit-plus-privacy engine behind Sincere Salah isn’t Islam-specific. On our roadmap: the same offline, ad-free engine turned toward daily Bible reading and devotion. Nothing below is a real screen — these are design concepts for a future app, shown honestly as sketches, not screenshots.',
        tr: 'Sincere Salah\'ın alışkanlık + gizlilik motoru yalnızca İslam\'a özgü değil. Yol haritamızda: aynı çevrimdışı, reklamsız motorun günlük İncil okuma ve ibadete uyarlanmış hali. Aşağıdakilerin hiçbiri gerçek bir ekran değil — bunlar gelecekteki bir uygulama için tasarım taslakları, dürüstçe eskiz olarak gösteriliyor.',
      },
      cards: [
        {
          type: 'streak',
          title: { en: 'Daily reading', tr: 'Günlük okuma' },
          verse: { en: '“The Lord is my shepherd; I shall not want.”', tr: '“Rab çobanımdır, eksiğim olmaz.”' },
          ref: 'Psalm 23:1',
          streak: 12,
          streakLabel: { en: 'day streak', tr: 'gün serisi' },
        },
        {
          type: 'shield',
          title: { en: 'Quiet devotion', tr: 'Sessiz ibadet' },
          verse: { en: 'Same focus shield, new faith — distractions lock gently at devotion time.', tr: 'Aynı odak kalkanı, farklı inanç — ibadet vakti dikkat dağıtıcılar nazikçe kilitlenir.' },
        },
      ],
    },
  },
  {
    slug: 'bazaltgo',
    code: 'EL-05',
    kind: 'app',
    name: 'BazaltGo',
    icon: 'media/bazaltgo-icon.webp',
    cover: 'media/bazaltgo-icon.webp',
    accent: '#ff7a3d',
    bg: '#120a24',
    marquee: { en: 'Find · Apply · Check in · Level up ·', tr: 'Bul · Başvur · Yoklama ver · Seviye atla ·' },
    tagline: {
      en: 'One place for young people to find projects, join, check in with a QR — and watch their Volunteer Passport fill up.',
      tr: 'Gençlerin projeleri bulup katıldığı, QR ile yoklama verdiği ve Gönüllü Pasaportu\'nun dolduğunu gördüğü tek platform.',
    },
    tech: ['React', 'TypeScript', 'Firebase', 'Capacitor', 'Cloud Run'],
    sections: [
      {
        label: { en: 'Attendance', tr: 'Yoklama' },
        h: { en: 'Rotating-QR attendance', tr: 'Dönen QR ile yoklama' },
        p: {
          en: 'Organisers start a session and a QR code rotates on screen. No signal? The scan is queued offline and sent the moment you’re back. Manual codes for anyone whose camera fails.',
          tr: 'Yönetici yoklamayı başlatır, ekranda periyodik değişen bir QR döner. Sinyal yok mu? Tarama çevrimdışı kuyruğa girer, bağlanınca gönderilir. Kamerası çalışmayana manuel kod.',
        },
        points: [['4', { en: 'error codes, all explained', tr: 'hata kodu, hepsi açıklanır' }], ['offline', { en: 'scan queue', tr: 'tarama kuyruğu' }]],
      },
      {
        label: { en: 'Passport', tr: 'Pasaport' },
        h: { en: 'The Volunteer Passport', tr: 'Gönüllü Pasaportu' },
        p: {
          en: 'Every confirmed participation lands in your passport: hours, categories, a downloadable PDF and a shareable report card.',
          tr: 'Onaylanan her katılım pasaportuna işlenir: saatler, kategoriler, indirilebilir PDF ve paylaşılabilir karne.',
        },
        points: [['PDF', { en: 'passport export', tr: 'pasaport çıktısı' }], ['hours', { en: 'tracked per event', tr: 'etkinlik başı saat' }]],
      },
      {
        label: { en: 'Progress', tr: 'İlerleme' },
        h: { en: 'Levels and badges', tr: 'Seviyeler ve rozetler' },
        p: {
          en: 'Volunteer → Active Volunteer → Project Ambassador → Senior Ambassador → Bazalt Leader. Badges for first steps, streaks and exploring new categories.',
          tr: 'Gönüllü → Aktif Gönüllü → Proje Elçisi → Kıdemli Elçi → Bazalt Lideri. İlk adım, düzen ve yeni kategoriler için rozetler.',
        },
        points: [['1·3·6·12·25', { en: 'participation thresholds', tr: 'katılım eşikleri' }], ['5', { en: 'levels', tr: 'seviye' }]],
      },
      {
        label: { en: 'Advisor', tr: 'Danışman' },
        h: { en: 'An AI advisor in your pocket', tr: 'Cebinde bir yapay zekâ danışmanı' },
        p: {
          en: 'Project matches with a reason for each suggestion, an advisor chat, motivation-letter drafts and auto-filled project pages from a single link.',
          tr: 'Her öneriye gerekçesiyle proje eşleştirme, danışman sohbeti, motivasyon mektubu taslağı ve tek bir linkten otomatik dolan proje sayfaları.',
        },
        points: [['5', { en: 'AI endpoints', tr: 'yapay zekâ ucu' }], ['1 link', { en: 'to a full project page', tr: 'ile tam proje sayfası' }]],
      },
    ],
    shots: [],
    facts: [
      { n: 5, l: { en: 'volunteer levels', tr: 'gönüllü seviyesi' } },
      { n: 13, l: { en: 'server test suites', tr: 'sunucu test takımı' } },
      { n: 2, l: { en: 'platforms + PWA', tr: 'platform + PWA' } },
    ],
    specs: [
      { k: { en: 'Client', tr: 'İstemci' }, v: 'React · Vite · Capacitor' },
      { k: { en: 'Backend', tr: 'Sunucu' }, v: 'Firebase · Cloud Run (Node)' },
      { k: { en: 'Security', tr: 'Güvenlik' }, v: { en: 'App Check + tested Firestore rules', tr: 'App Check + test edilmiş Firestore kuralları' } },
      { k: { en: 'Extras', tr: 'Ekstralar' }, v: { en: 'Push, calendar, offline cache, account deletion', tr: 'Bildirim, takvim, çevrimdışı önbellek, hesap silme' } },
    ],
  },
  {
    slug: 'deprem-mesh',
    code: 'EL-06',
    kind: 'app',
    name: 'Deprem Mesh',
    icon: 'media/mesh-icon.webp',
    cover: 'media/mesh-icon.webp',
    accent: '#ff3b3b',
    bg: '#05070d',
    marquee: { en: 'No towers · No internet · Still connected ·', tr: 'Baz istasyonu yok · İnternet yok · Yine de bağlı ·' },
    tagline: {
      en: 'An emergency mesh network for when cell towers and the internet are gone. Messages hop phone to phone until one of them reaches the outside.',
      tr: 'Baz istasyonları ve internet çöktüğünde çalışan acil durum mesh ağı. Mesajlar telefondan telefona atlar, biri dışarıya ulaşana kadar.',
    },
    tech: ['React Native', 'BLE', 'Wi-Fi Direct', 'Ed25519', 'Node'],
    sections: [
      {
        label: { en: 'Impact', tr: 'Sarsıntı' },
        h: { en: 'The network goes down first', tr: 'Önce ağ çöker' },
        p: {
          en: 'In a major earthquake, base stations lose power and backhaul within minutes. The people who most need to send a message — the ones under the rubble — are the ones left with no signal.',
          tr: 'Büyük bir depremde baz istasyonları dakikalar içinde enerjisini ve bağlantısını kaybeder. Mesaj göndermeye en çok ihtiyacı olanlar — enkaz altındakiler — sinyalsiz kalanlardır.',
        },
        points: [['7', { en: 'storeys simulated', tr: 'kat simülasyonu' }], ['40', { en: 'trapped people', tr: 'mahsur kişi' }]],
      },
      {
        label: { en: 'Mesh', tr: 'Mesh' },
        h: { en: 'Hop by hop', tr: 'Atlaya atlaya' },
        p: {
          en: 'Bluetooth Low Energy and Wi-Fi Direct carry status packets device to device. The first phone that touches the internet syncs everything to the rescue server automatically.',
          tr: 'Bluetooth Low Energy ve Wi-Fi Direct, durum paketlerini cihazdan cihaza taşır. İnternete ilk dokunan telefon her şeyi kurtarma sunucusuna kendiliğinden aktarır.',
        },
        points: [['BLE', { en: '+ Wi-Fi Direct', tr: '+ Wi-Fi Direct' }], ['auto', { en: 'sync on first uplink', tr: 'ilk bağlantıda eşitleme' }]],
      },
      {
        label: { en: 'Trust', tr: 'Güven' },
        h: { en: 'Signed, trusted, battery-aware', tr: 'İmzalı, güvenilir, pil dostu' },
        p: {
          en: 'Every packet is Ed25519-signed so nobody can forge a cry for help. A smart sleep cycle stretches the battery for days. Position is estimated without GPS.',
          tr: 'Her paket Ed25519 ile imzalı; kimse sahte bir yardım çağrısı üretemez. Akıllı uyku döngüsü pili günlere yayar. Konum GPS olmadan kestirilir.',
        },
        points: [['Ed25519', { en: 'packet signatures', tr: 'paket imzası' }], ['no GPS', { en: 'position estimate', tr: 'konum kestirimi' }]],
      },
      {
        label: { en: 'Rescue', tr: 'Kurtarma' },
        h: { en: 'A triage board for rescuers', tr: 'Kurtarıcılar için triyaj panosu' },
        p: {
          en: 'Rescue teams see every verified victim on one dashboard — signature checked, status colour-coded, last known floor. A built-in simulator runs five disaster scenarios against it.',
          tr: 'Kurtarma ekipleri doğrulanmış her kazazedeyi tek panoda görür — imzası kontrol edilmiş, durumu renk kodlu, son bilinen katıyla. Dahili simülatör buna karşı beş afet senaryosu koşar.',
        },
        points: [['5', { en: 'scenarios', tr: 'senaryo' }], ['3', { en: 'triage colours', tr: 'triyaj rengi' }]],
      },
    ],
    shots: [],
    facts: [
      { n: 208, l: { en: 'tests, ~3 seconds', tr: 'test, ~3 saniye' } },
      { n: 0, l: { en: 'towers or internet needed', tr: 'baz istasyonu ya da internet gereksinimi' } },
      { n: 5, l: { en: 'disaster scenarios simulated', tr: 'simüle afet senaryosu' } },
    ],
    specs: [
      { k: { en: 'Transport', tr: 'Taşıma' }, v: 'BLE · Wi-Fi Direct' },
      { k: { en: 'Crypto', tr: 'Kriptografi' }, v: 'Ed25519' },
      { k: { en: 'Core', tr: 'Çekirdek' }, v: { en: 'Zero-dependency Node core + simulator', tr: 'Sıfır bağımlılıklı Node çekirdeği + simülatör' } },
      { k: { en: 'Server', tr: 'Sunucu' }, v: { en: 'Collector + rescue dashboard', tr: 'Toplayıcı + kurtarma paneli' } },
    ],
  },
  {
    slug: 'fitkoc',
    code: 'EL-07',
    kind: 'app',
    name: 'FitKoç',
    icon: 'media/fitkoc/icon.webp',
    cover: 'media/fitkoc/01_bugun.webp',
    accent: '#ff5a1f',
    bg: '#0c0d14',
    marquee: { en: 'Find a coach · Train · Track · Eat right ·', tr: 'Hocanı bul · Antrenman yap · Takip et · Doğru beslen ·' },
    tagline: {
      en: 'A coaching marketplace for Türkiye: find a verified trainer, train together on video, and track workouts and calories in the same app.',
      tr: 'Türkiye için koçluk pazaryeri: doğrulanmış antrenörünü bul, görüntülü birlikte çalış, antrenmanını ve kalorini aynı uygulamada takip et.',
    },
    tech: ['Flutter', 'NestJS', 'PostgreSQL', 'LiveKit', 'iyzico'],
    sections: [
      {
        label: { en: 'Today', tr: 'Bugün' },
        h: { en: 'Know what to do today', tr: 'Bugün ne yapacağını bil' },
        p: {
          en: 'Programme, sessions and nutrition on one screen. The next live session, today’s workout and what is left of your calories — at a glance.',
          tr: 'Program, seans ve beslenme tek ekranda. Bir sonraki canlı seans, bugünkü antrenman ve kalan kalorin — tek bakışta.',
        },
        points: [['1', { en: 'screen for the whole day', tr: 'ekranda bütün gün' }], ['live', { en: 'video sessions', tr: 'görüntülü seans' }]],
        shot: 0,
      },
      {
        label: { en: 'Coaches', tr: 'Koçlar' },
        h: { en: 'The right coach, verified', tr: 'Doğru koç, doğrulanmış' },
        p: {
          en: 'Price, experience and reply time are shown up front. Certificate and ID badges, a free 15-minute intro call, and every package includes at least one live one-to-one session.',
          tr: 'Fiyat, deneyim ve yanıt süresi baştan yazılı. Sertifika ve kimlik rozetleri, ücretsiz 15 dakikalık tanışma ve her pakette en az bir birebir canlı seans.',
        },
        points: [['≥1', { en: 'live session per package', tr: 'paket başı canlı seans' }], ['15 min', { en: 'free intro call', tr: 'ücretsiz tanışma' }]],
        shot: 1,
      },
      {
        label: { en: 'Library', tr: 'Kütüphane' },
        h: { en: 'See how it’s done', tr: 'Nasıl yapıldığını gör' },
        p: {
          en: 'An animated exercise library you can explore without signing up — start from a muscle map, filter by equipment, watch the move, read the common mistakes.',
          tr: 'Kayıt olmadan keşfedilen animasyonlu hareket kütüphanesi — kas haritasından başla, ekipmana göre süz, hareketi izle, sık hataları oku.',
        },
        points: [['0', { en: 'sign-up walls', tr: 'kayıt duvarı' }], ['muscle', { en: 'map navigation', tr: 'haritasıyla gezinme' }]],
        shot: 4,
      },
      {
        label: { en: 'Nutrition', tr: 'Beslenme' },
        h: { en: 'Turkish food, real portions', tr: 'Türk mutfağı, gerçek porsiyon' },
        p: {
          en: 'Calories and macros tracked against a Turkish food database with local portion units. Language that encourages: “You are 180 kcal over your target”, never a red alarm.',
          tr: 'Kalori ve makrolar, yerel porsiyon birimleriyle Türk mutfağı veritabanına göre izlenir. Cesaretlendiren dil: kırmızı alarm yerine “Hedefin 180 kcal üzerindesin”.',
        },
        points: [['TR', { en: 'food database', tr: 'yemek veritabanı' }], ['kuruş', { en: 'integer money, never float', tr: 'tam sayı para, asla ondalık' }]],
        shot: 0,
      },
    ],
    shots: ['media/fitkoc/01_bugun.webp', 'media/fitkoc/02_koc_bul.webp', 'media/fitkoc/03_koc_profili.webp', 'media/fitkoc/04_kutuphane.webp', 'media/fitkoc/05_hareket.webp', 'media/fitkoc/06_sohbet.webp'],
    videos: ['video/squat.mp4', 'video/lunge.mp4', 'video/plank.mp4', 'video/jumping_jack.mp4', 'video/mountain_climber.mp4'],
    facts: [
      { n: 842, l: { en: 'mobile tests', tr: 'mobil test' } },
      { n: 4, l: { en: 'pillars: market, library, nutrition, premium', tr: 'sütun: pazar, kütüphane, beslenme, premium' } },
      { n: 3, l: { en: 'apps: mobile, coach web, admin', tr: 'uygulama: mobil, koç paneli, yönetim' } },
    ],
    specs: [
      { k: { en: 'Mobile', tr: 'Mobil' }, v: 'Flutter' },
      { k: { en: 'API', tr: 'API' }, v: 'NestJS · PostgreSQL · Redis' },
      { k: { en: 'Calls & pay', tr: 'Görüşme ve ödeme' }, v: 'LiveKit · iyzico · RevenueCat' },
      { k: { en: 'Health data', tr: 'Sağlık verisi' }, v: { en: 'AES-256-GCM, versioned keys', tr: 'AES-256-GCM, sürümlü anahtar' } },
    ],
  },
  {
    slug: 'ehrenweg',
    code: 'EL-08',
    kind: 'app',
    dev: {
      phase: { en: 'Phase 2 / 9 · not launched yet', tr: 'Faz 2 / 9 · henüz yayında değil' },
      note: {
        en: 'In active development, not released. Screens below are the planned app, visualised honestly as concept — not screenshots.',
        tr: 'Aktif geliştirmede, henüz yayınlanmadı. Aşağıdaki ekranlar planlanan uygulama — dürüstçe konsept olarak görselleştirildi, ekran görüntüsü değil.',
      },
    },
    name: 'Ehrenweg',
    icon: 'media/ehrenweg-icon.svg',
    cover: 'media/ehrenweg-icon.svg',
    accent: '#f59e0b',
    bg: '#0b1220',
    marquee: { en: 'Find an activity · Check in · Earn trust · Give back ·', tr: 'Aktivite bul · Yoklama ver · Güven kazan · Karşılığını ver ·' },
    tagline: {
      en: 'Integration through volunteering for refugees and newcomers in Germany — QR check-ins, an Integration Passport, and a plain-language assistant. Same architecture as BazaltGo, a new audience and purpose.',
      tr: 'Almanya\'daki mülteci ve göçmenler için gönüllülükle entegrasyon — QR yoklama, Entegrasyon Pasaportu ve sade dil asistanı. Mimarisi BazaltGo ile aynı, kitlesi ve amacı farklı.',
    },
    tech: ['React', 'TypeScript', 'Capacitor', 'Firebase', 'Tailwind'],
    sections: [
      {
        label: { en: 'Activities', tr: 'Aktiviteler' },
        h: { en: 'What your city actually needs', tr: 'Şehrinin gerçekten ihtiyacı olan şey' },
        p: {
          en: 'Municipalities, authorities and approved NGOs publish real volunteering activities and courses — garden clean-ups, helping the elderly, German/English classes, neighbourhood events.',
          tr: 'Belediyeler, valilikler ve onaylı STK\'lar gerçek gönüllülük aktiviteleri ve eğitimler yayınlar — bahçe/park temizliği, yaşlılara yardım, Almanca/İngilizce dersi, mahalle etkinlikleri.',
        },
        points: [['DE', { en: 'first, then EU-wide', tr: 'önce, sonra tüm AB' }], ['2', { en: 'interface languages', tr: 'arayüz dili' }]],
      },
      {
        label: { en: 'Passport', tr: 'Pasaport' },
        h: { en: 'QR check-in, Integration Passport', tr: 'QR yoklama, Entegrasyon Pasaportu' },
        p: {
          en: 'Show up, scan a QR on site, and it lands on your Integration Passport — the same reverse-engineered attendance core as BazaltGo\'s Volunteer Passport, rebuilt for this audience.',
          tr: 'Aktiviteye git, yerinde QR\'ı okut, Entegrasyon Pasaportu\'na işlensin — BazaltGo\'nun Gönüllü Pasaportu\'ndaki yoklama çekirdeği, bu kitle için yeniden kurgulandı.',
        },
        points: [['QR', { en: 'on-site attendance', tr: 'yerinde yoklama' }], ['PDF', { en: 'passport export', tr: 'pasaport çıktısı' }]],
      },
      {
        label: { en: 'Rewards', tr: 'Kazanım' },
        h: { en: 'Three ways it pays off', tr: 'Karşılığını üç şekilde alırsın' },
        p: {
          en: 'An integration score that builds reputation, store and café discounts from partner businesses, and cash or in-kind vouchers that municipalities can fund directly.',
          tr: 'İtibar kazandıran bir entegrasyon puanı, partner işletmelerden mağaza/kafe indirimi, ve belediyenin doğrudan fonlayabileceği nakit veya ayni kuponlar.',
        },
        points: [['3', { en: 'reward types', tr: 'kazanım türü' }], ['0', { en: 'point cash-outs', tr: 'puan nakite çevrimi' }]],
      },
    ],
    shots: [],
    facts: [
      { n: 2, l: { en: 'phases shipped of 9', tr: 'tamamlanan faz / 9' } },
      { n: 3, l: { en: 'reward tiers', tr: 'kazanım katmanı' } },
      { n: 0, l: { en: 'app stores live yet', tr: 'canlı mağaza yayını' } },
    ],
    specs: [
      { k: { en: 'Client', tr: 'İstemci' }, v: 'React · Vite · Capacitor' },
      { k: { en: 'Backend', tr: 'Sunucu' }, v: { en: 'Firebase (Frankfurt region)', tr: 'Firebase (Frankfurt bölgesi)' } },
      { k: { en: 'Security', tr: 'Güvenlik' }, v: { en: 'App Check + Firestore rules, tested', tr: 'App Check + test edilmiş Firestore kuralları' } },
      { k: { en: 'Status', tr: 'Durum' }, v: { en: 'In development — not released', tr: 'Geliştiriliyor — yayınlanmadı' } },
    ],
  },
  {
    slug: 'greenact',
    code: 'EL-09',
    kind: 'app',
    dev: {
      phase: { en: 'Concept · not coded yet', tr: 'Konsept · henüz kodlanmadı' },
      note: {
        en: 'There is no app yet — only the EU-funded reforestation project it would serve. Everything below is a concept design for the tracking app we plan to build, shown honestly as sketches.',
        tr: 'Henüz bir uygulama yok — sadece hizmet edeceği AB destekli ağaçlandırma projesi var. Aşağıdakilerin tamamı yapmayı planladığımız takip uygulaması için konsept tasarım, dürüstçe eskiz olarak gösteriliyor.',
      },
    },
    name: 'GreenAct',
    icon: 'media/greenact-icon.svg',
    cover: 'media/greenact-icon.svg',
    accent: '#c17a45',
    bg: '#0c1b14',
    marquee: { en: 'Plant · Assign · Water · Survive ·', tr: 'Dik · Görevlendir · Sula · Hayatta kal ·' },
    tagline: {
      en: 'After a 2025 wildfire near Diyarbakır, volunteer-planted saplings had no record of who’d water or check them — so nobody ever did. GreenAct\'s app turns every sapling into a tracked record for 3–5 years.',
      tr: 'Diyarbakır\'da 2025 yangınının ardından gönüllülerin diktiği fidanların kimin sulayıp kontrol edeceğine dair hiçbir kaydı yoktu — bu yüzden kimse yapmadı. GreenAct\'in uygulaması her fidanı 3-5 yıl takip edilen bir kayda dönüştürür.',
    },
    tech: ['Flutter (planned)', 'A simple server (planned)', 'QR tags'],
    sections: [
      {
        label: { en: 'Record', tr: 'Kayıt' },
        h: { en: 'Every sapling, a record', tr: 'Her fidan, bir kayıt' },
        p: {
          en: 'Plant a sapling, tag it, log it — species, spot, planting date. No more volunteer days that leave nothing behind but a photo.',
          tr: 'Fidanı dik, etiketle, kaydet — tür, konum, dikim tarihi. Arkasında bir fotoğraftan başka hiçbir şey bırakmayan gönüllü günleri artık yok.',
        },
        points: [['GPS', { en: 'planting spot', tr: 'dikim konumu' }], ['QR', { en: 'per-sapling tag', tr: 'fidan başı etiket' }]],
      },
      {
        label: { en: 'Rotation', tr: 'Nöbet' },
        h: { en: 'A watering rotation that sticks', tr: 'Aksamayan bir sulama nöbeti' },
        p: {
          en: 'Each sapling gets an assigned volunteer and a reminder — the gap the founders learned about the hard way, after planting trees they could never find again.',
          tr: 'Her fidana görevli bir gönüllü ve hatırlatma atanır — kurucuların, diktikleri fidanları bir daha bulamayınca zor yoldan öğrendiği boşluk bu.',
        },
        points: [['1', { en: 'caretaker per sapling', tr: 'fidan başı görevli' }], ['0', { en: 'untracked plantings', tr: 'takipsiz dikim' }]],
      },
      {
        label: { en: 'Survival', tr: 'Canlılık' },
        h: { en: '3–5 years of survival checks', tr: '3-5 yıllık canlılık kontrolü' },
        p: {
          en: 'FAO data says success depends on tracking, not planting counts. A simple scan-and-rate check-in, repeated for years, turns tree-planting into tree-growing.',
          tr: 'FAO verisi, başarının dikim sayısında değil takipte olduğunu söylüyor. Yıllarca tekrarlanan basit bir tara-ve-değerlendir kontrolü, fidan dikmeyi fidan büyütmeye çevirir.',
        },
        points: [['3-5', { en: 'years tracked', tr: 'yıl takip' }], ['70-90%', { en: 'survival with tracking (FAO)', tr: 'takiple canlılık oranı (FAO)' }]],
      },
    ],
    shots: [],
    facts: [
      { n: 12, l: { en: 'interviews behind the idea', tr: 'fikrin arkasındaki görüşme' } },
      { n: 96, l: { en: 'volunteers surveyed', tr: 'ankete katılan gönüllü' } },
      { n: 0, l: { en: 'lines of app code yet', tr: 'yazılmış kod satırı' } },
    ],
    specs: [
      { k: { en: 'Status', tr: 'Durum' }, v: { en: 'Concept — not built', tr: 'Konsept — yapılmadı' } },
      { k: { en: 'Origin', tr: 'Kökeni' }, v: { en: 'An EU Solidarity Project (ESC30)', tr: 'Bir AB Dayanışma Projesi (ESC30)' } },
      { k: { en: 'Planned client', tr: 'Planlanan istemci' }, v: { en: 'Flutter, offline-first', tr: 'Flutter, çevrimdışı öncelikli' } },
      { k: { en: 'Planned data', tr: 'Planlanan veri' }, v: { en: 'Per-sapling records, public survival stats', tr: 'Fidan başı kayıt, açık canlılık istatistiği' } },
    ],
  },
];

// Yaptığımız web siteleri — ayrı sayfaları var (#/web/<slug>)
export const websites = [
  {
    slug: 'hevsel',
    code: 'WB-01',
    kind: 'web',
    tone: 'light',
    name: 'Hevsel Turizm',
    client: { en: 'School & staff shuttle company · Diyarbakır', tr: 'Okul ve personel servis firması · Diyarbakır' },
    icon: 'media/web/hev-0.webp',
    cover: 'media/web/hev-1.webp',
    accent: '#d99500',
    bg: '#c9d2d7',
    marquee: { en: 'School · Factory · Mall staff · Same time, every day ·', tr: 'Okul · Fabrika · AVM personeli · Her gün aynı saatte ·' },
    tagline: {
      en: 'A scroll-driven 3D city model of Diyarbakır: the shuttle drives its route as you read, with the river, the city walls and the bridge built in.',
      tr: 'Scroll ile sürülen 3D Diyarbakır maketi: siz okudukça servis aracı güzergâhını sürer; Dicle, surlar ve köprü maketin içinde.',
    },
    tech: ['React Three Fiber', 'GSAP ScrollTrigger', 'Postprocessing', 'Vite'],
    sections: [
      {
        label: { en: 'Arrival', tr: 'Giriş' },
        h: { en: 'A city you can scroll through', tr: 'İçinde kaydırılan bir şehir' },
        p: {
          en: 'The whole site is one miniature city — the walls, the Tigris, the bridge — with the company’s promise written across it in giant type.',
          tr: 'Sitenin tamamı tek bir minyatür şehir — surlar, Dicle, köprü — ve firmanın vaadi dev harflerle üzerinde.',
        },
        shot: 0,
      },
      {
        label: { en: 'The vehicle', tr: 'Araç' },
        h: { en: 'The shuttle comes apart', tr: 'Servis aracı katmanlarına ayrılır' },
        p: {
          en: 'Driver, seating, seat belts, door, maintenance — the vehicle explodes into its five parts, each answering a real question parents and businesses ask.',
          tr: 'Şoför, koltuk düzeni, kemer, kapı, bakım — araç beş katmanına ayrılır; her biri velinin ve işletmenin sorduğu gerçek bir soruyu cevaplar.',
        },
        shot: 1,
      },
      {
        label: { en: 'Routes', tr: 'Hatlar' },
        h: { en: 'Three services, three routes', tr: 'Üç hizmet, üç hat' },
        p: {
          en: 'School, factory and mall-staff lines light up on the model in their own colours while the HUD reads out the route, capacity and stop.',
          tr: 'Okul, fabrika ve AVM personel hatları maketin üzerinde kendi renkleriyle yanar; HUD hattı, kapasiteyi ve durağı okur.',
        },
        shot: 3,
      },
      {
        label: { en: 'Fleet', tr: 'Filo' },
        h: { en: 'From 18 to 24 seats', tr: '18\'den 24 koltuğa' },
        p: {
          en: 'Only facts the client confirmed go on the page — no invented fleet sizes or founding years. Capacity range, timetable and one phone number.',
          tr: 'Sayfaya yalnız firmanın doğruladığı bilgiler girer — uydurma araç sayısı ya da kuruluş yılı yok. Kapasite aralığı, saatler ve tek telefon numarası.',
        },
        shot: 5,
      },
    ],
    shots: ['media/web/hev-0.webp', 'media/web/hev-1.webp', 'media/web/hev-2.webp', 'media/web/hev-3.webp', 'media/web/hev-4.webp', 'media/web/hev-5.webp'],
    facts: [
      { n: 6, l: { en: 'scroll chapters', tr: 'scroll bölümü' } },
      { n: 3, l: { en: 'service routes on the model', tr: 'maketteki hizmet hattı' } },
      { n: 0, l: { en: 'invented numbers', tr: 'uydurma rakam' } },
    ],
    specs: [
      { k: { en: 'Scene', tr: 'Sahne' }, v: { en: 'Procedural city + environment, no HDRI download', tr: 'Prosedürel şehir + ortam, HDRI indirmesi yok' } },
      { k: { en: 'Scroll', tr: 'Scroll' }, v: 'GSAP ScrollTrigger' },
      { k: { en: 'Mobile', tr: 'Mobil' }, v: { en: 'Separate mobile choreography', tr: 'Ayrı mobil koreografi' } },
    ],
    url: '',
  },
  {
    slug: 'valeon',
    code: 'WB-02',
    kind: 'web',
    name: 'Valeon',
    client: { en: 'Premium car air freshener brand', tr: 'Premium araç kokusu markası' },
    icon: 'media/web/val-premium.webp',
    cover: 'media/web/val-0.webp',
    accent: '#3fd2ff',
    bg: '#06070c',
    marquee: { en: 'Savage · Invic · Ocean · VIP ·', tr: 'Savage · Invic · Ocean · VIP ·' },
    tagline: {
      en: 'A cinematic, dark 3D landing page: the scent card floats, explodes into its five layers, spins through the collection and finally swings from a rear-view mirror.',
      tr: 'Sinematik, karanlık bir 3D tanıtım sayfası: koku kartı süzülür, beş katmanına ayrılır, koleksiyonda döner ve sonunda dikiz aynasından sarkar.',
    },
    tech: ['React Three Fiber', 'Drei', 'GSAP ScrollTrigger', 'GLSL'],
    sections: [
      {
        label: { en: 'Hero', tr: 'Giriş' },
        h: { en: 'Just a car scent?', tr: 'Sadece bir araç kokusu mu?' },
        p: {
          en: 'The card hangs in a neon grid world at its true size — 110 × 62 mm, eyelet and all — slowly turning in the dark.',
          tr: 'Kart, neon ızgaralı bir dünyada gerçek ölçüsünde asılı — 110 × 62 mm, kuşgözüyle birlikte — karanlıkta yavaşça döner.',
        },
        shot: 0,
      },
      {
        label: { en: 'Anatomy', tr: 'Anatomi' },
        h: { en: 'Five layers, exploded', tr: 'Beş katman, açılmış hâlde' },
        p: {
          en: 'Scroll and the card separates into its layers — cover, scent core, barrier film — while 4,000 GPU particles carry the scent out.',
          tr: 'Kaydırdıkça kart katmanlarına ayrılır — kapak, esans çekirdeği, koruyucu film — ve 4.000 GPU parçacığı kokuyu dışarı taşır.',
        },
        shot: 1,
      },
      {
        label: { en: 'Collection', tr: 'Koleksiyon' },
        h: { en: 'Every turn, a new variant', tr: 'Her turda yeni bir varyant' },
        p: {
          en: 'The card spins 360° and swaps variants while it is edge-on, so the change is invisible. The HUD reads out top, heart and base notes for each.',
          tr: 'Kart 360° döner ve varyantı tam profildeyken değiştirir — geçiş görünmez. HUD her birinin üst, kalp ve dip notalarını okur.',
        },
        shot: 3,
      },
      {
        label: { en: 'The drive', tr: 'Sürüş' },
        h: { en: 'Real pendulum physics', tr: 'Gerçek sarkaç fiziği' },
        p: {
          en: 'In the last chapter the card hangs from a rear-view mirror and swings with a damped two-degree-of-freedom pendulum, over a city-at-night bokeh.',
          tr: 'Son bölümde kart dikiz aynasından sarkar ve sönümlü, iki serbestlik dereceli bir sarkaçla sallanır; arkada gece şehri bokeh\'i.',
        },
        shot: 4,
      },
    ],
    shots: ['media/web/val-0.webp', 'media/web/val-1.webp', 'media/web/val-2.webp', 'media/web/val-3.webp', 'media/web/val-4.webp', 'media/web/val-5.webp'],
    facts: [
      { n: 4000, l: { en: 'GPU scent particles', tr: 'GPU koku parçacığı' } },
      { n: 5, l: { en: 'card layers', tr: 'kart katmanı' } },
      { n: 0, l: { en: 'external images or HDRIs', tr: 'harici görsel ya da HDRI' } },
    ],
    specs: [
      { k: { en: 'Cards', tr: 'Kartlar' }, v: { en: 'Printed procedurally with Canvas2D', tr: 'Canvas2D ile prosedürel basılıyor' } },
      { k: { en: 'Effects', tr: 'Efektler' }, v: { en: 'Bloom, scroll-speed chromatic aberration, grain', tr: 'Bloom, scroll hızına bağlı kromatik sapma, grain' } },
      { k: { en: 'Perf', tr: 'Performans' }, v: { en: 'Zero React renders while scrolling', tr: 'Scroll sırasında sıfır React render\'ı' } },
    ],
    url: 'https://valeon-tr.web.app/',
  },
  {
    slug: 'florium',
    code: 'WB-03',
    kind: 'web',
    name: 'Florium',
    client: { en: 'Florist & landscape studio · Diyarbakır', tr: 'Çiçekçi ve peyzaj stüdyosu · Diyarbakır' },
    icon: 'media/web/flo-0.webp',
    cover: 'media/web/flo-0.webp',
    accent: '#c9a24a',
    bg: '#0d1a14',
    marquee: { en: 'Landscape · Bouquets · Vertical gardens · Event décor ·', tr: 'Peyzaj · Buket · Dikey bahçe · Etkinlik süsleme ·' },
    tagline: {
      en: 'A warm editorial site for a florist: a living green hero, services as cards that open their own photo galleries, and an auto-updating gallery.',
      tr: 'Bir çiçekçi için sıcak, editoryal bir site: yaşayan yeşil bir giriş, kendi foto galerisini açan hizmet kartları ve kendiliğinden güncellenen galeri.',
    },
    tech: ['HTML', 'CSS', 'JavaScript', 'Firebase Hosting'],
    sections: [
      {
        label: { en: 'Hero', tr: 'Giriş' },
        h: { en: 'Bringing green indoors', tr: 'Mekânlara yeşili taşımak' },
        p: {
          en: 'The shop’s own flower wall becomes the hero. Two call buttons sit right under the headline — the shortest path from visitor to customer.',
          tr: 'Dükkânın kendi çiçek duvarı giriş görseli olur. Başlığın hemen altında iki arama düğmesi — ziyaretçiden müşteriye en kısa yol.',
        },
        shot: 0,
      },
      {
        label: { en: 'Services', tr: 'Hizmetler' },
        h: { en: 'Every corner, a solution', tr: 'Her köşeye bir çözüm' },
        p: {
          en: 'Landscaping, artificial flowers, indoor plants, cut flowers, wreaths, decorative pots — each card opens a gallery of real projects.',
          tr: 'Peyzaj, yapay çiçek, iç mekân bitkileri, kesme çiçek, çelenk, dekoratif saksı — her kart gerçek projelerden oluşan bir galeri açar.',
        },
        shot: 2,
      },
      {
        label: { en: 'Gallery', tr: 'Galeri' },
        h: { en: 'A gallery that fills itself', tr: 'Kendini dolduran galeri' },
        p: {
          en: 'The owner drops photos into a folder; a watcher script rebuilds the gallery list. No CMS to learn.',
          tr: 'Sahibi fotoğrafları klasöre bırakır; bir izleyici betik galeri listesini yeniden kurar. Öğrenilecek bir yönetim paneli yok.',
        },
        shot: 3,
      },
      {
        label: { en: 'Visit', tr: 'Ziyaret' },
        h: { en: 'Find us, call us', tr: 'Bizi bulun, arayın' },
        p: {
          en: 'Address, two phone lines, opening hours and a map — set in the same warm serif and gold as the rest of the brand.',
          tr: 'Adres, iki telefon hattı, çalışma saatleri ve harita — markanın geri kalanıyla aynı sıcak serif ve altın tonunda.',
        },
        shot: 5,
      },
    ],
    shots: ['media/web/flo-0.webp', 'media/web/flo-1.webp', 'media/web/flo-2.webp', 'media/web/flo-3.webp', 'media/web/flo-4.webp', 'media/web/flo-5.webp'],
    tall: 'media/web/flo-mobile-tall.webp',
    facts: [
      { n: 10, l: { en: 'gallery categories', tr: 'galeri kategorisi' } },
      { n: 2, l: { en: 'call buttons above the fold', tr: 'ilk ekranda arama düğmesi' } },
      { n: 1, l: { en: 'folder to update the gallery', tr: 'klasörle galeri güncelleme' } },
    ],
    specs: [
      { k: { en: 'Stack', tr: 'Yığın' }, v: { en: 'Static HTML/CSS/JS, no framework', tr: 'Statik HTML/CSS/JS, çatı yok' } },
      { k: { en: 'Gallery', tr: 'Galeri' }, v: { en: 'Folder watcher + generated list', tr: 'Klasör izleyici + üretilen liste' } },
      { k: { en: 'Hosting', tr: 'Barındırma' }, v: 'Firebase Hosting · floriumdiyarbakir.com' },
    ],
    url: 'https://floriumdiyarbakir.com/',
  },
];

export const allPages = [...products, ...websites];
