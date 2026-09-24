export interface MilestoneItem {
  id: string;
  year: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  badgeAr: string;
  badgeEn: string;
}

export interface GalleryItem {
  id: string;
  titleAr: string;
  titleEn: string;
  category: "cantatas" | "rehearsals" | "liturgy" | "fellowship";
  categoryAr: string;
  imageUrl: string;
  date: string;
  captionAr?: string;
  captionEn?: string;
}

export interface VocalSectionInfo {
  key: string;
  titleAr: string;
  titleEn: string;
  symbol: string;
  rangeAr: string;
  rangeEn: string;
  descAr: string;
  descEn: string;
  color: string;
}

export interface FeaturedHymnItem {
  id: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  duration: string;
  isCantata?: boolean;
}

export interface ChoirProfileData {
  general: {
    nameAr: string;
    nameEn: string;
    churchAr: string;
    churchEn: string;
    mottoAr: string;
    mottoEn: string;
    foundationYear: string;
    verseAr: string;
    verseEn: string;
    shortBioAr: string;
    shortBioEn: string;
    fullBioAr: string;
    fullBioEn: string;
    logoUrl: string;
    coverUrl: string;
  };
  stats: {
    years: string;
    members: string;
    hymns: string;
    concerts: string;
  };
  history: MilestoneItem[];
  gallery: GalleryItem[];
  vocalSections: VocalSectionInfo[];
  featuredHymns: FeaturedHymnItem[];
  contact: {
    churchAr: string;
    churchEn: string;
    addressAr: string;
    addressEn: string;
    rehearsalTimesAr: string;
    rehearsalTimesEn: string;
    email: string;
    phone: string;
  };
}

export const defaultChoirProfile: ChoirProfileData = {
  general: {
    nameAr: "كورال ثمر شفاه",
    nameEn: "Thamar Shefah Choir",
    churchAr: "كنيسة الشهيد العظيم مارجرجس — مطرانية سوهاج",
    churchEn: "St. George Coptic Orthodox Church — Diocese of Sohag",
    mottoAr: "ذبيحة تسبيح • منذ عام 2000",
    mottoEn: "Sacrifice of Praise • Established 2000",
    foundationYear: "2000",
    verseAr: "«فَلْنُقَدِّمْ بِهِ فِي كُلِّ حِينٍ لِلَّهِ ذَبِيحَةَ التَّسْبِيحِ، أَيْ ثَمَرَ شِفَاهٍ مُعْتَرِفَةٍ بِاسْمِهِ» (عبرانيين 13: 15)",
    verseEn: "«By Him therefore let us offer the sacrifice of praise to God continually, that is, the fruit of our lips giving thanks to His name.» (Hebrews 13:15)",
    shortBioAr: "كورال كنسي طقسي وروحي تأسس عام 2000 برعاية كنيسة الشهيد العظيم مارجرجس بمطرانية سوهاج، يكرس أصواته لتقديم ذبيحة تسبيح نقية بالتوزيع الهارموني الرباعي والكنتاتات الروحية والألحان التراثية.",
    shortBioEn: "An ecclesiastical sacred choir established in 2000 under the auspices of St. George Church — Diocese of Sohag, dedicated to offering pure sacrifice of praise through four-part harmony and liturgical cantatas.",
    fullBioAr: "انطلقت مسيرة كورال 'ثمر شفاه' برعاية كنيسة الشهيد العظيم مارجرجس بمطرانية سوهاج في مطلع عام 2000، حاملاً رسالة روحية عميقة عنوانها التكريس والوحدانية في التسبيح. على مدار أكثر من ربع قرن، تميز الكورال بتقديم التوزيعات الهارمونية الرباعية البوليفونية (سوبرانو، ألتو، تينور، باص)، والكنتاتات الكنسية في الأعياد السيدية والمناسبات الروحية الكبرى، مع الحفاظ على أصالة اللحن القبطي وعذوبة الترانيم المعاصرة، ليشهد بنعمة المسيح على أجيال متعاقبة من المرنمين والخدام المكرسين.",
    fullBioEn: "The spiritual voyage of Thamar Shefah Choir began at St. George Church — Diocese of Sohag in the year 2000, anchored in the calling of spiritual consecration and unity in worship. For over a quarter of a century, the choir has distinguished itself through four-part polyphonic ecclesiastical arrangements (SATB) and seasonal cantatas, harmonizing timeless Coptic melodies with contemporary spiritual hymns.",
    logoUrl: "/images/logo.jpg",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80",
  },
  stats: {
    years: "26+",
    members: "70+",
    hymns: "120+",
    concerts: "50+",
  },
  history: [
    {
      id: "m1",
      year: "2000",
      titleAr: "التأسيس وانطلاق بذرة التسبيح الأولى",
      titleEn: "Foundation & First Chants",
      descAr: "تأسيس الكورال بمباركة آباء كنيسة الشهيد مارجرجس بسوهاج بمجموعة واعدة من الخدام لتقديم ذبيحة تسبيح نقية ومميزة.",
      descEn: "Establishment of the choir with the blessing of the parish priests, gathering dedicated youth to offer a pure sacrifice of praise.",
      badgeAr: "البداية المباركة",
      badgeEn: "The Beginning",
    },
    {
      id: "m2",
      year: "2005",
      titleAr: "أول إنتاج موسيقي وكنتاتا كنسية ميلادية",
      titleEn: "First Liturgical Christmas Cantata",
      descAr: "تقديم أول كنتاتا كنسية متكاملة بتوزيع بوليفوني كنسي ومشاركة واسعة في احتفالات عيد الميلاد المجيد بمطرانية سوهاج.",
      descEn: "Premiere of the first full liturgical Christmas cantata featuring sacred polyphonic arrangement.",
      badgeAr: "كنتاتا طقسية",
      badgeEn: "Cantata Milestone",
    },
    {
      id: "m3",
      year: "2012",
      titleAr: "اعتماد التوزيع الهارموني الرباعي الأكاديمي (SATB)",
      titleEn: "Adopting Four-Part Polyphony (SATB)",
      descAr: "الانتقال الكامل لمنظومة الأصوات الأربعة المتناغمة (سوبرانو، ألتو، تينور، باص) وتدريب الكوادر الصوتية وفق المعايير الفنية والروحية.",
      descEn: "Complete transition to structured four-part SATB harmony with specialized vocal development.",
      badgeAr: "التوزيع الهارموني",
      badgeEn: "Harmonic Mastery",
    },
    {
      id: "m4",
      year: "2018",
      titleAr: "مهرجانات الكرازة والنهضات الروحية الكبرى",
      titleEn: "Major Diocese Festivals & Revivals",
      descAr: "قيادة الترانيم والصلوات في الاحتفالات السنوية والنهضات الروحية الكبرى على مستوى إيبارشية سوهاج والإيبارشيات المجاورة.",
      descEn: "Leading sacred praises at major diocese revivals, spiritual conferences, and festive liturgical celebrations.",
      badgeAr: "حفلات كبرى",
      badgeEn: "Grand Concerts",
    },
    {
      id: "m5",
      year: "2024 - 2026",
      titleAr: "التحول الرقمي الشامل ومنظومة الإدارة الذكية",
      titleEn: "Digital Ecosystem & Smart Management Era",
      descAr: "إطلاق المنظومة الرقمية الشاملة لإدارة البروفات والحضور الذكي بالـ GPS وأرشيف الترانيم السحابي وتقييم الأداء بالذكاء الاصطناعي.",
      descEn: "Inaugurating the digital choir cloud management platform with GPS geofencing, cloud R2 media library, and AI intelligence.",
      badgeAr: "التحول الرقمي",
      badgeEn: "Smart Era",
    },
  ],
  gallery: [
    {
      id: "g1",
      titleAr: "احتفالية الكنتاتا السنوية لعيد الميلاد المجيد",
      titleEn: "Nativity Feast Cantata Concert",
      category: "cantatas",
      categoryAr: "كنتاتات وحفلات",
      imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
      date: "يناير 2024",
      captionAr: "تقديم التوزيع الكنسي لكورال ثمر شفاه في احتفالية عيد الميلاد بمطرانية سوهاج.",
      captionEn: "Presentation of sacred polyphonic cantatas at St. George Church, Sohag.",
    },
    {
      id: "g2",
      titleAr: "بروفة صوتية مكثفة وتدريب توازن الهارموني",
      titleEn: "Intensive SATB Vocal Rehearsal",
      category: "rehearsals",
      categoryAr: "بروفات وتحضير",
      imageUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
      date: "نوفمبر 2024",
      captionAr: "تدريبات الأقسام الصوتية وتوافق الطبقات الأربع قبل الاحتفالات الروحية الكبرى.",
      captionEn: "Vocal section balance and harmonic blending before major concerts.",
    },
    {
      id: "g3",
      titleAr: "تسبيح وصلوات القداس الإلهي للأعياد السيدية",
      titleEn: "Divine Liturgy Praise",
      category: "liturgy",
      categoryAr: "صلوات وطقوس",
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
      date: "أغسطس 2024",
      captionAr: "مشاركة الكورال في أعياد القديسين ونهضة الشهيد العظيم مارجرجس.",
      captionEn: "Liturgical praise participation during feast seasons.",
    },
    {
      id: "g4",
      titleAr: "لقاء الخدام والمرنمين الروحي السنوي",
      titleEn: "Choir Servants Fellowship",
      category: "fellowship",
      categoryAr: "لقاءات وخدمة",
      imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
      date: "فبراير 2024",
      captionAr: "بروح واحدة ومحبة أخوية تجمع كل أفراد أسرة كورال ثمر شفاه.",
      captionEn: "Spiritual fellowship gathering uniting choir servants in love and dedication.",
    },
    {
      id: "g5",
      titleAr: "أوتار القيثارة والألحان القبطية البوليفونية",
      titleEn: "Coptic Liturgical Chants",
      category: "liturgy",
      categoryAr: "صلوات وطقوس",
      imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80",
      date: "أكتوبر 2024",
      captionAr: "مزيج الأصالة والتراث القبطي مع التوزيعات الكنسية المعاصرة.",
      captionEn: "Harmonizing timeless heritage with reverent acoustic expression.",
    },
    {
      id: "g6",
      titleAr: "أرشفة الترانيم وتدوين النوت الموسيقية",
      titleEn: "Sheet Music & Audio Archives",
      category: "rehearsals",
      categoryAr: "بروفات وتحضير",
      imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
      date: "سبتمبر 2024",
      captionAr: "حفظ وتوثيق النوت الموسيقية والتوزيعات الهارمونية لخدمة الأجيال.",
      captionEn: "Documenting musical notation and arrangement scores.",
    },
  ],
  vocalSections: [
    {
      key: "soprano",
      titleAr: "سوبرانو",
      titleEn: "Soprano",
      symbol: "S",
      rangeAr: "الطبقة العليا (C4 – A5)",
      rangeEn: "High Range (C4 – A5)",
      descAr: "صوت نسائي حاد ومشرق، يقود اللحن الأساسي (Melody) بصفاء ملائكي ونقاء معبّر في التسابيح المبهجة والكنتاتات.",
      descEn: "Bright, high female vocal range carrying the primary melody with angelic clarity and expressive reverence.",
      color: "from-amber-400 to-amber-600",
    },
    {
      key: "alto",
      titleAr: "ألتو",
      titleEn: "Alto",
      symbol: "A",
      rangeAr: "الطبقة المتوسطة العميقة (F3 – D5)",
      rangeEn: "Warm Range (F3 – D5)",
      descAr: "صوت نسائي دافئ ووقور، ينسج التوافق الهارموني الداخلي ويمنح الأداء ثراءً وعمقاً وجدانياً مؤثراً.",
      descEn: "Rich, warm lower female range providing harmonious inner voice textures and solemn resonance.",
      color: "from-rose-500 to-burgundy",
    },
    {
      key: "tenor",
      titleAr: "تينور",
      titleEn: "Tenor",
      symbol: "T",
      rangeAr: "الطبقة الرجالية العليا (C3 – G4)",
      rangeEn: "Tenor Range (C3 – G4)",
      descAr: "صوت رجالي رخيم ولامع، يتألق في الترانيم التعبيرية والطبقات الحيوية معززاً قوة الرسالة الروحية.",
      descEn: "Bright, expressive male upper range delivering poignant spiritual resonance and melodic lift.",
      color: "from-gold to-yellow-600",
    },
    {
      key: "bass",
      titleAr: "باص",
      titleEn: "Bass",
      symbol: "B",
      rangeAr: "الطبقة الرخيمة العميقة (E2 – C4)",
      rangeEn: "Deep Foundation (E2 – C4)",
      descAr: "صوت الأساس والعمق، يشكل القاعدة والأساس الموسيقي الراسخ لكل البناء الهارموني البوليفوني.",
      descEn: "Deep, solemn foundation anchoring chord progressions and complete harmonic balance.",
      color: "from-burgundy-900 to-stone-900",
    },
  ],
  featuredHymns: [
    {
      id: "h1",
      titleAr: "كنتاتا ذبيحة تسبيح (كنتاتا الميلاد)",
      titleEn: "Sacrifice of Praise Cantata",
      categoryAr: "كنتاتا ميلادية",
      categoryEn: "Christmas Cantata",
      duration: "06:45",
      isCantata: true,
    },
    {
      id: "h2",
      titleAr: "أسبحك يا ربي يسوع (توزيع رباعي SATB)",
      titleEn: "I Praise You, Lord Jesus (SATB)",
      categoryAr: "تسبيح وتعبد",
      categoryEn: "Worship & Praise",
      duration: "04:20",
    },
    {
      id: "h3",
      titleAr: "لحن إي بارثينوس (توزيع كنسي معاصر)",
      titleEn: "E Parthenos Polyphonic Chant",
      categoryAr: "ألحان طقسية",
      categoryEn: "Liturgical Chants",
      duration: "05:10",
    },
    {
      id: "h4",
      titleAr: "كنتاتا القيامة والظفر",
      titleEn: "Resurrection & Victory Cantata",
      categoryAr: "كنتاتا القيامة",
      categoryEn: "Pascha & Resurrection",
      duration: "07:30",
      isCantata: true,
    },
  ],
  contact: {
    churchAr: "كنيسة الشهيد العظيم مارجرجس — مطرانية سوهاج",
    churchEn: "St. George Coptic Orthodox Church — Diocese of Sohag",
    addressAr: "شارع المحطة، سوهاج، مصر",
    addressEn: "El-Mahatta Street, Sohag, Egypt",
    rehearsalTimesAr: "الجمعة ٦:٠٠ م – ٨:٣٠ م | الأحد ٧:٠٠ م – ٩:٠٠ م",
    rehearsalTimesEn: "Friday 6:00 PM – 8:30 PM | Sunday 7:00 PM – 9:00 PM",
    email: "contact@thamar-shefah.org",
    phone: "+20 100 000 0000",
  },
};
