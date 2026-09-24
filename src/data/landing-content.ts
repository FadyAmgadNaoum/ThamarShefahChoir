export interface RoleItem {
  id: string;
  name: string;
  badge: string;
  summary: string;
  permissions: string[];
  responsibilities: string[];
}

export interface PhaseItem {
  phaseNumber: number;
  title: string;
  badge: string;
  status: 'current' | 'upcoming';
  description: string;
  deliverables: string[];
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge: string;
}

export const landingContent = {
  ar: {
    dir: 'rtl' as const,
    brand: {
      name: 'كورال ثمر شفاه',
      motto: 'ذبيحة تسبيح',
      since: 'منذ عام 2000',
      subtitle: 'المنظومة الرقمية الشاملة لإدارة الكورال والخدمة',
    },
    nav: {
      home: 'الرئيسية',
      about: 'عن المنظومة',
      roles: 'الأدوار والرتب',
      phases: 'مراحل المشروع',
      features: 'الميزات',
      login: 'تسجيل الدخول',
      register: 'طلب انضمام',
      languageSwitch: 'English',
    },
    hero: {
      badge: 'المنظومة الرقمية الرسمية • ذبيحة تسبيح منذ 2000',
      titlePrimary: 'خدمة منظمة بروح واحدة،',
      titleAccent: 'وتسبيح يعلو بنظام ذكي',
      description:
        'منظومة سحابية متكاملة مصممة خصيصاً لكورال "ثمر شفاه" لإدارة الحضور الذكي بالـ GPS، واشتراكات الخدمة، ومحرك النقاط الفصلي، ومكتبة الألحان السحابية — خفيفة، دقيقة، ومبنية وفق أعلى معايير الأمان والتجاوب مع الهواتف الذكية.',
      primaryCta: 'تسجيل الدخول للمنظومة',
      secondaryCta: 'استكشف أدوار وميزات الخدمة',
      metrics: [
        { value: '+24 سنة', label: 'خدمة وتسبيح مستمر' },
        { value: '4 أصوات', label: 'سوبرانو، آلتو، تينور، باص' },
        { value: '100% موثوق', label: 'حضور جغرافي عبر السيرفر' },
        { value: 'صفر تكلفة', label: 'مستضاف مجاناً على Cloudflare' },
      ],
    },
    demo: {
      title: 'معاينة حية لبوابة المرنم الذكية',
      subtitle: 'شاهد كيف تسير تجربة المرنم من الهاتف المحمول بضغطة زر واحدة',
      rehearsalTitle: 'البروفة الأسبوعية القادمة',
      rehearsalTime: 'الجمعة 26 سبتمبر • 07:00 مساءً',
      rehearsalLocation: 'قاعة الكورال الرئيسية • كنيسة العذراء',
      radiusBadge: 'نطاق التواجد: داخل الكنيسة (100 متر)',
      checkInButton: 'سجل حضورك الآن عبر GPS',
      checkingInText: 'جاري التحقق من الموقع الجغرافي...',
      checkedInSuccess: 'تم تسجيل حضورك بنجاح! (حاضر في ميعادك)',
      distanceCalculated: 'المسافة المحسوبة من القاعة: 24 متراً (ضمن النطاق المسموح)',
      stats: {
        attendanceRate: 'نسبة الحضور',
        attendanceValue: '96%',
        points: 'رصيد النقاط الفصلي',
        pointsValue: '145 نقطة',
        voicePart: 'طبقة الصوت',
        voicePartValue: 'تينور (Tenor)',
        tier: 'الفئة',
        tierValue: 'خريجين وعاملين',
      },
    },
    rolesSection: {
      title: 'أدوار وصلاحيات المنظومة',
      subtitle: 'صممت المنظومة بأدوار مرنة ومتكاملة تخدم كل خادم ومرنم حسب اختصاصه بدقة متناهية وبدون تعقيد',
      roles: [
        {
          id: 'member',
          name: 'المرنم / العضو (MEMBER)',
          badge: 'المستخدم الأساسي',
          summary: 'تجربة موبايل فائقة السهولة والسرعة تمكن المرنم من متابعة كل ما يخص خدمته لحظة بلحظة.',
          permissions: [
            'تسجيل الحضور والانصراف بالـ GPS أثناء البروفة',
            'تقديم طلبات الغياب والتأخير المسبقة مع ذكر السبب',
            'متابعة رصيد النقاط الفصلي وسجل البروفات السابقة',
            'الاستماع والتدرّب على مكتبة الألحان والتسجيلات الصوتية',
            'الاطلاع على سجل الاشتراكات الشهرية والرصيد المستحق',
          ],
          responsibilities: [
            'الالتزام بمواعيد البروفات والتواجد الجغرافي في النطاق المحدد',
            'تقديم طلبات الأعذار قبل بدء البروفة بوقت كافٍ',
          ],
        },
        {
          id: 'admin',
          name: 'الخادم الإداري (ADMIN)',
          badge: 'إدارة العمليات',
          summary: 'لوحة تحكم إدارية مرنة لإدارة شؤون الكورال الأسبوعية والفصلية بقرارات واضحة وسريعة.',
          permissions: [
            'جدولة البروفات وتحديد الإحداثيات الجغرافية ونطاق الحضور',
            'مراجعة واعتماد أو رفض طلبات الأعذار والتأخير',
            'إدارة قائمة الأعضاء وحسابات التسجيل الجديدة',
            'إجراء التعديلات اليدوية المبررة مع توثيق أسبابها',
            'تكوين الفصول السنوية (Quarters) وقواعد احتساب النقاط',
            'استخراج تقارير نسب الحضور والانضباط والتسبيح',
          ],
          responsibilities: [
            'متابعة انضباط الحضور والغياب أسبوعياً',
            'التنسيق الدوري مع أمين الصندوق والمشرف العام',
          ],
        },
        {
          id: 'subscription_manager',
          name: 'أمين الصندوق (SUBSCRIPTION_MANAGER)',
          badge: 'الإدارة المالية',
          summary: 'دور مالي مركّز لإدارة الاشتراكات الشهرية للخدمة دون التداخل مع صلاحيات الحضور أو قواعد النقاط.',
          permissions: [
            'استعراض قائمة المرنمين والاشتراكات الشهرية المستحقة',
            'تسجيل الدفعات الكاملة والجزئية بصورة فورية وسهلة',
            'إدارة تراكم الاشتراكات الشهرية المتأخرة بنظام FIFO المالي',
            'إضافة الملاحظات المسموحة على المدفوعات وتصدير الكشوفات',
          ],
          responsibilities: [
            'تحصيل الاشتراكات وفق فئات المرنمين (طلبة / عاملين)',
            'حفظ الشفافية المالية التامة وسجلات التوريد',
          ],
        },
        {
          id: 'super_admin',
          name: 'المشرف العام (SUPER_ADMIN)',
          badge: 'الإشراف والأمان',
          summary: 'أعلى صلاحيات حوكمة النظام والأمان، مع تتبع تاريخي كامل لكل العمليات والتغييرات الحساسة.',
          permissions: [
            'ترقية وتعيين الخُدام إلى رتبة أدمن أو أمين صندوق',
            'الاطلاع على سجل التدقيق الأمني الشامل (Audit Trail)',
            'إدارة التهيئة العامة وسياسات النظام على سحابة Cloudflare',
            'تعديل المبالغ الشهرية والقرارات المالية الاستثنائية',
          ],
          responsibilities: [
            'حماية بيانات الكورال والحسابات من التلاعب',
            'ضمان سلامة العمليات ومراجعة سجلات التدقيق بانتظام',
          ],
        },
      ] as RoleItem[],
    },
    phasesSection: {
      title: 'خارطة طريق المشروع (10 مراحل متكاملة)',
      subtitle: 'نتبع خطة هندسية واضحة ومدروسة تبدأ من البنية التحتية حتى الإطلاق النهائي والتشغيل الكامل',
      currentStageBadge: 'المرحلة الحالية: المرحلة 1 - واجهة الهبوط والأساس التقني',
      phases: [
        {
          phaseNumber: 1,
          title: 'البنية التحتية والتعريب (Infrastructure & Localization)',
          badge: 'قيد التنفيذ الآن',
          status: 'current',
          description: 'إعداد مشروع Next.js وTypeScript وTailwind CSS، وضبط محولات Cloudflare Workers وD1 وR2، ودعم اللغة العربية RTL كخيار أساسي.',
          deliverables: ['واجهة الهبوط التفاعلية', 'نظام الألوان والخطوط الرسمية للكورال', 'تهيئة Cloudflare D1 & R2', 'دعم RTL/LTR'],
        },
        {
          phaseNumber: 2,
          title: 'دورة حياة العضوية والأمان (Authentication & Lifecycle)',
          badge: 'المرحلة القادمة',
          status: 'upcoming',
          description: 'تسجيل المرنمين مع بوابة الانتظار والمراجعة الإدارية (Pending Approval)، وتشفير الجلسات وحماية الأدوار المركبة.',
          deliverables: ['صفحات التسجيل والدخول', 'شاشة انتظار المراجعة', 'لوحة مراجعة الأعضاء للمشرفين', 'تأمين الصلاحيات في السيرفر'],
        },
        {
          phaseNumber: 3,
          title: 'الفصول السنوية والبروفات (Quarters & Rehearsals)',
          badge: 'قريباً',
          status: 'upcoming',
          description: 'إدارة الفصول (قادمة / نشطة / مغلقة) مع الحفاظ على البيانات التاريخية، وجدولة البروفات وتحديد الإحداثيات الجغرافية.',
          deliverables: ['نظام الفصول السنوية المستقلة', 'جدولة البروفات الذكية', 'حساب نوافذ الحضور تلقائياً'],
        },
        {
          phaseNumber: 4,
          title: 'محرك الحضور بالـ GPS (Server-Authoritative Attendance)',
          badge: 'قريباً',
          status: 'upcoming',
          description: 'التحقق من إحداثيات المرنم عبر معادلة Haversine بالسيرفر لمنع أي تلاعب، وتصنيف الحضور (في الميعاد، متأخر، تأخير كبير).',
          deliverables: ['زر تسجيل حضور موثوق بالـ GPS', 'حساب المسافة بدقة بالسيرفر', 'لوحة حضور تفاعلية للمرنم'],
        },
        {
          phaseNumber: 5,
          title: 'نظام إدارة الأعذار والتأخير (Excuse Management Subsystem)',
          badge: 'قريباً',
          status: 'upcoming',
          description: 'تقديم طلبات الاعتذار عن الحضور أو التنبيه بالتأخير المسبق، وصندوق وارد للمشرفين لقبولها أو رفضها.',
          deliverables: ['نموذج طلب عذر ذكي', 'إشعار تأخير مسبق', 'صندوق وارد للأعذار للإداريين'],
        },
        {
          phaseNumber: 6,
          title: 'محرك النقاط الديناميكي (Points Rule Engine)',
          badge: 'قريباً',
          status: 'upcoming',
          description: 'محرك نقاط مبني على عدد مرات الحدوث (مثلاً أول 3 غيابات بدون خصم، ثم خصم محدد) مع سجل تعديلات يدوية مبررة وتدقيق كامل.',
          deliverables: ['قواعد نقاط قابلة للتعديل', 'محرك حساب تلقائي', 'إمكانية التعديل اليدوي المبرر للأدمن'],
        },
        {
          phaseNumber: 7,
          title: 'إدارة الاشتراكات الشهرية (Subscriptions & FIFO Debt)',
          badge: 'قريباً',
          status: 'upcoming',
          description: 'نظام محاسبي مبسط لتتبع الاشتراكات الشهرية حسب الفئات (طلبة / عاملين)، وسداد الديون المتراكمة بأولوية الأقدم (FIFO).',
          deliverables: ['لوحة أمين الصندوق المالية', 'تسجيل الدفعات الجزئية والكاملة', 'كشف حساب اشتراكات المرنم'],
        },
        {
          phaseNumber: 8,
          title: 'مكتبة الألحان والتسجيلات (Choir Audio Library via R2)',
          badge: 'قريباً',
          status: 'upcoming',
          description: 'تخزين ملفات الصوت ونوتات الألحان على Cloudflare R2، مع مشغل صوت مخصص لتدريب المرنمين حسب طبقات الصوت.',
          deliverables: ['مشغل صوت سحابي للألحان', 'توزيعات الطبقات (S, A, T, B)', 'نوتات وكلمات التسابيح'],
        },
        {
          phaseNumber: 9,
          title: 'التقارير وسجل التدقيق والتحصين (Reporting & Security Hardening)',
          badge: 'قريباً',
          status: 'upcoming',
          description: 'تقارير بيانية تفاعلية لحضور الكورال والالتزام المالي، وسجل تدقيق للعمليات الحساسة، وتحسين أداء استعلامات Cloudflare D1.',
          deliverables: ['تقارير فضلية شاملة', 'سجل تدقيق المشرف العام', 'تحسين الاستعلامات والفهارس'],
        },
        {
          phaseNumber: 10,
          title: 'الإطلاق النهائي وضمان الجودة (Production Verification & Go-Live)',
          badge: 'قريباً',
          status: 'upcoming',
          description: 'اختبارات تكامل شاملة، ربط النطاق الرسمي وتفعيل شهادات الأمان وتطبيق الترحيلات على قاعدة بيانات الإنتاج.',
          deliverables: ['اختبارات التكامل الشاملة', 'الربط بالنطاق الرسمي', 'جاهزية كاملة لخدمة الكورال'],
        },
      ] as PhaseItem[],
    },
    featuresSection: {
      title: 'أهم مميزات المنظومة',
      subtitle: 'مبنية لخدمة حقيقية: بساطة في الاستخدام للمرنمين، وقوة ودقة للمسؤولين دون تكاليف خفية',
      features: [
        {
          id: 'gps-attendance',
          title: 'حضور جغرافي ذكي موثوق',
          description: 'التحقق من تواجد المرنم داخل الكنيسة يتم حصرياً عبر خوادم Cloudflare، دون الاعتماد على قيم المتصفح لمنع التلاعب.',
          iconName: 'MapPin',
          badge: 'حماية موثوقة',
        },
        {
          id: 'quarter-history',
          title: 'فصول سنوية وسجلات تاريخية محفوظة',
          description: 'تقسيم السنة إلى فصول (Quarters) مستقلة مع قواعد ونقاط خاصة بكل فصل، دون تعديل أو مسح نتائج الفصول السابقة إطلاقاً.',
          iconName: 'Calendar',
          badge: 'حفظ التاريخ',
        },
        {
          id: 'smart-excuses',
          title: 'نظام أعذار مرن وواضح',
          description: 'إمكانية إرسال اعتذار مسبق عن الغياب أو إشعار بالتأخير قبل بدء البروفة، مع نظام مراجعة إداري بنقرة زر.',
          iconName: 'Clock',
          badge: 'تنظيم مريح',
        },
        {
          id: 'transparent-finance',
          title: 'محاسبة اشتراكات شفافة (FIFO)',
          description: 'تتبع رسوم الخدمة والاشتراكات الشهرية مع تسوية تلقائية للشهور الأقدم أولاً وسجل فوري للدفعات الجزئية.',
          iconName: 'Receipt',
          badge: 'شفافية كاملة',
        },
        {
          id: 'cloud-hymns',
          title: 'مكتبة تسبيح سحابية متعددة الطبقات',
          description: 'استماع مباشر لتسجيلات البروفات ونوتات الألحان مقسمة حسب أصوات الكورال الأربعة عبر سحابة R2 المجانية.',
          iconName: 'Music',
          badge: 'تدريب صوتي',
        },
        {
          id: 'mobile-first',
          title: 'تصميم فائق السرعة للهواتف',
          description: 'واجهة خفيفة تفتح في أجزاء من الثانية على أي هاتف، تدعم الوضع الليلي والنهاري وتعمل بسلاسة تامة.',
          iconName: 'Smartphone',
          badge: 'موبايل أولاً',
        },
      ] as FeatureItem[],
    },
    testimonials: {
      title: 'أصوات من الخدمة',
      subtitle: 'شهادات وانطباعات من فريق خدمة كورال ثمر شفاه',
      items: [
        {
          quote: 'المنظومة غيرت شكل البروفة تماماً؛ كل مرنم أصبح عارف موقفه ونقاطه لحظة بلحظة، والحضور بالـ GPS وفر علينا وقت كبير كنا بنضيعه في الكشوفات الورقية.',
          author: 'خادم إداري بالكورال',
          role: 'فريق الإدارة والتنظيم',
          badge: 'إدارة البروفات',
        },
        {
          quote: 'أجمل حاجة إني بقدر أسمع تسجيل لحني الخاص كـ Tenor في أي وقت وأنا راجع من الشغل قبل البروفة مباشرة.',
          author: 'مرنم صوت تينور',
          role: 'عضو بالكورال منذ 2018',
          badge: 'قسم الأصوات',
        },
        {
          quote: 'إدارة الاشتراكات بقت واضحة جداً وبدون أي إحراج، وكل شخص عارف الشهور المسددة والمتبقية بوضوح وأمانة.',
          author: 'مسؤول الاشتراكات',
          role: 'أمانة الصندوق',
          badge: 'الإدارة المالية',
        },
      ],
    },
    cta: {
      title: 'مستعدون لرفع ذبيحة تسبيح نقية بنظام وروح واحدة؟',
      subtitle: 'انضم الآن إلى منظومة كورال ثمر شفاه واستمتع بتجربة خدمة حديثة صممت لتبسيط كل خطوة.',
      primaryBtn: 'تسجيل الدخول للمنظومة',
      secondaryBtn: 'تقديم طلب انضمام جديد',
    },
    footer: {
      aboutText: 'كورال ثمر شفاه (ذبيحة تسبيح) — تأسس عام 2000 لخدمة التسبيح الكنسي والألحان الروحية بروح المحبة والانضباط.',
      sections: {
        links: 'روابط سريعة',
        system: 'أركان المنظومة',
        contact: 'التواصل والخدمة',
      },
      copyright: 'جميع الحقوق محفوظة © 2026 كورال ثمر شفاه. تم التطوير بنعمة ربنا لخدمة التسبيح.',
      edgeStatus: 'مستضاف بالكامل على شبكة Cloudflare Edge السحابية فائقة السرعة',
    },
  },
  en: {
    dir: 'ltr' as const,
    brand: {
      name: 'Thamar Shefah Choir',
      motto: 'Sacrifice of Praise',
      since: 'Since 2000',
      subtitle: 'Unified Digital Choir & Community Management System',
    },
    nav: {
      home: 'Home',
      about: 'About',
      roles: 'System Roles',
      phases: 'Roadmap',
      features: 'Features',
      login: 'Sign In',
      register: 'Join Choir',
      languageSwitch: 'العربية',
    },
    hero: {
      badge: 'Official Choir Platform • Sacrifice of Praise Since 2000',
      titlePrimary: 'Organized in One Spirit,',
      titleAccent: 'Singing with Smart Harmony',
      description:
        'A comprehensive cloud system custom-built for "Thamar Shefah" Choir: server-authoritative GPS attendance, transparent subscriptions, quarter-scoped points, and an R2 audio library — agile, secure, and mobile-first.',
      primaryCta: 'Access Member Portal',
      secondaryCta: 'Explore Roles & Roadmap',
      metrics: [
        { value: '24+ Years', label: 'Spiritual Praise & Service' },
        { value: '4 Voices', label: 'Soprano, Alto, Tenor, Bass' },
        { value: '100% Reliable', label: 'Server-Validated Geofencing' },
        { value: '$0 Cloud Cost', label: 'Cloudflare Free Tiers' },
      ],
    },
    demo: {
      title: 'Interactive Live Member Portal Preview',
      subtitle: 'Experience how members check in with single-tap GPS validation right from their mobile device',
      rehearsalTitle: 'Upcoming Weekly Rehearsal',
      rehearsalTime: 'Friday, Sep 26 • 07:00 PM',
      rehearsalLocation: 'Main Choir Hall • Virgin Mary Church',
      radiusBadge: 'Geofence: Inside Church Hall (100m radius)',
      checkInButton: 'Check In via Live GPS',
      checkingInText: 'Verifying GPS Coordinates on Server...',
      checkedInSuccess: 'Checked in successfully! (Classified: ON TIME)',
      distanceCalculated: 'Distance from Hall: 24 meters (Permitted inside radius)',
      stats: {
        attendanceRate: 'Attendance Rate',
        attendanceValue: '96%',
        points: 'Quarter Points',
        pointsValue: '145 pts',
        voicePart: 'Voice Section',
        voicePartValue: 'Tenor',
        tier: 'Member Tier',
        tierValue: 'Working Graduate',
      },
    },
    rolesSection: {
      title: 'System Roles & Permissions',
      subtitle: 'Crafted with composable, low-friction roles to empower every singer and administrator with dignity and precision',
      roles: [
        {
          id: 'member',
          name: 'Choir Singer (MEMBER)',
          badge: 'Core Participant',
          summary: 'A friction-free mobile experience allowing singers to stay on top of attendance, excuses, points, and rehearsals.',
          permissions: [
            'GPS-based rehearsal check-in and check-out',
            'Absence and delay notifications submitted in advance',
            'Quarterly points ledger and rehearsal history access',
            'Multi-part audio rehearsal streaming & sheet music',
            'Personal monthly dues and payment ledger review',
          ],
          responsibilities: [
            'Punctual arrival within designated physical geofence',
            'Advance submission of genuine excuse requests',
          ],
        },
        {
          id: 'admin',
          name: 'Choir Administrator (ADMIN)',
          badge: 'Operations & Management',
          summary: 'Responsive control console to oversee rehearsal scheduling, excuse requests, member rosters, and quarterly policies.',
          permissions: [
            'Rehearsal creation with custom coordinates and radius',
            'Review, approval, or rejection of pending excuses',
            'New member application review and approval',
            'Manual adjustments with mandatory justification logging',
            'Quarter policy management (points, excuse thresholds)',
            'Comprehensive attendance and disciplinary reporting',
          ],
          responsibilities: [
            'Weekly attendance reconciliation and servant coordination',
            'Quarterly review with Subscription Manager & Super Admin',
          ],
        },
        {
          id: 'subscription_manager',
          name: 'Treasurer (SUBSCRIPTION_MANAGER)',
          badge: 'Financial Oversight',
          summary: 'A focused financial role tracking monthly dues and cumulative arrears without complicating rehearsal or attendance workflows.',
          permissions: [
            'Roster view with member debt badges and monthly dues',
            'Instant recording of partial and full subscription payments',
            'Deterministic FIFO debt allocation for historical balances',
            'Payment audit notes and financial statement exports',
          ],
          responsibilities: [
            'Tiered dues collection (Student / Working / Other)',
            'Accurate financial record-keeping and transparent reporting',
          ],
        },
        {
          id: 'super_admin',
          name: 'General Overseer (SUPER_ADMIN)',
          badge: 'Governance & Security',
          summary: 'Ultimate governance authority with full administrative oversight, role promotions, and complete audit trail visibility.',
          permissions: [
            'Promote or revoke Admin and Subscription Manager roles',
            'Comprehensive security and action Audit Trail inspection',
            'Cloudflare infrastructure parameters and environment policies',
            'Special financial adjustments and fee schedule alterations',
          ],
          responsibilities: [
            'Safeguarding choir privacy, integrity, and spiritual trust',
            'Regular verification of critical audit logs',
          ],
        },
      ] as RoleItem[],
    },
    phasesSection: {
      title: 'Project Roadmap (10 Verified Phases)',
      subtitle: 'An incremental, verified engineering plan from core infrastructure to production launch on Cloudflare',
      currentStageBadge: 'Current Milestone: Phase 1 — Landing Page & Frontend Foundation',
      phases: [
        {
          phaseNumber: 1,
          title: 'Infrastructure & Localization Foundation',
          badge: 'In Progress Now',
          status: 'current',
          description: 'Next.js, TypeScript, Tailwind CSS, Cloudflare Workers/D1/R2 bindings, brand design tokens, and first-class Arabic RTL.',
          deliverables: ['Interactive Landing Page', 'Choir Brand Token Palette', 'Cloudflare Emulation Setup', 'RTL/LTR Switcher'],
        },
        {
          phaseNumber: 2,
          title: 'Member Lifecycle & Pending Barrier',
          badge: 'Next Up',
          status: 'upcoming',
          description: 'Egyptian Arabic registration, session security, pending review barrier screen, and admin approval console.',
          deliverables: ['Registration & Login', 'Pending Approval Barrier', 'Admin Member Approval Roster', 'Server Session Validation'],
        },
        {
          phaseNumber: 3,
          title: 'Quarters & Rehearsals Scheduling',
          badge: 'Upcoming',
          status: 'upcoming',
          description: 'Quarters state machine (UPCOMING, ACTIVE, CLOSED) with isolated historical rules and geofenced rehearsals.',
          deliverables: ['Quarter Lifecycle Engine', 'Rehearsal Geofence Creator', 'Automated Check-in Windows'],
        },
        {
          phaseNumber: 4,
          title: 'Server-Authoritative GPS Attendance',
          badge: 'Upcoming',
          status: 'upcoming',
          description: 'Backend Haversine distance calculation to prevent spoofing, arrival tiers (On Time, Late, Very Late, Extreme Late).',
          deliverables: ['Tamper-proof GPS Check-in', 'Server Distance Calculation', 'Member Attendance Dashboard'],
        },
        {
          phaseNumber: 5,
          title: 'Excuse Management Subsystem',
          badge: 'Upcoming',
          status: 'upcoming',
          description: 'Absence requests and advance delay notifications with an administrative review inbox and attendance status synchronization.',
          deliverables: ['Absence Request Modal', 'Advance Delay Notification', 'Admin Excuse Approval Inbox'],
        },
        {
          phaseNumber: 6,
          title: 'Points Rule Engine & Manual Overrides',
          badge: 'Upcoming',
          status: 'upcoming',
          description: 'Occurrence-based points tiers (e.g. 3 free absences, then -10 pts) and manual adjustments with complete audit trails.',
          deliverables: ['Configurable Points Matrix', 'Automated Transaction Ledger', 'Admin Manual Adjustment Tool'],
        },
        {
          phaseNumber: 7,
          title: 'Subscriptions & FIFO Debt Engine',
          badge: 'Upcoming',
          status: 'upcoming',
          description: 'Monthly dues generation by tier, payment entry drawer, and automated FIFO clearing of past overdue months.',
          deliverables: ['Subscription Manager Console', 'Partial & Full Payment Entry', 'Member Subscription Statement'],
        },
        {
          phaseNumber: 8,
          title: 'Choir Audio Library (Cloudflare R2)',
          badge: 'Upcoming',
          status: 'upcoming',
          description: 'Cloudflare R2 storage for hymn audio files, lyrics, and vocal part recordings (Soprano, Alto, Tenor, Bass).',
          deliverables: ['Cloud Audio Streamer', 'Vocal Section Filtering', 'Hymn Sheet PDF Viewer'],
        },
        {
          phaseNumber: 9,
          title: 'Reporting, Auditing & Performance Hardening',
          badge: 'Upcoming',
          status: 'upcoming',
          description: 'Attendance analytics, financial recovery summaries, Super Admin audit log viewer, and Cloudflare D1 query optimization.',
          deliverables: ['Quarterly Executive Reports', 'Audit Trail Viewer', 'D1 Index Tuning & Pagination'],
        },
        {
          phaseNumber: 10,
          title: 'Production Verification & Go-Live',
          badge: 'Upcoming',
          status: 'upcoming',
          description: 'End-to-end integration tests, custom domain routing, SSL termination, and production database migrations.',
          deliverables: ['Automated User Flow Tests', 'Production DNS & SSL', 'Live System Ready for Choir'],
        },
      ] as PhaseItem[],
    },
    featuresSection: {
      title: 'Architected for Choir Excellence',
      subtitle: 'Engineered specifically for community choirs: high trust, zero clutter, and zero unnecessary cost',
      features: [
        {
          id: 'gps-attendance',
          title: 'Server-Authoritative GPS Check-in',
          description: 'Singer proximity is computed securely on Cloudflare Edge via Haversine geometry, never trusting browser booleans.',
          iconName: 'MapPin',
          badge: 'Tamper Proof',
        },
        {
          id: 'quarter-history',
          title: 'Independent Quarters & Frozen History',
          description: 'Choir operates in distinct 4-month quarters; closing a quarter freezes its policies and attendance points forever.',
          iconName: 'Calendar',
          badge: 'Data Integrity',
        },
        {
          id: 'smart-excuses',
          title: 'Intuitive Excuses & Delay Notifications',
          description: 'Members submit delays or absences ahead of time; actual attendance tier is always decided by actual check-in.',
          iconName: 'Clock',
          badge: 'Orderly Service',
        },
        {
          id: 'transparent-finance',
          title: 'FIFO Subscription Accounting',
          description: 'Every payment transparently settles the oldest unpaid month first, keeping member balances auditable and debt-free.',
          iconName: 'Receipt',
          badge: 'Full Clarity',
        },
        {
          id: 'cloud-hymns',
          title: 'Multi-Part Cloud Audio Library',
          description: 'Singers rehearse their specific voice parts (Soprano, Alto, Tenor, Bass) anywhere using Cloudflare R2 streaming.',
          iconName: 'Music',
          badge: 'Vocal Practice',
        },
        {
          id: 'mobile-first',
          title: 'Ultra-Fast Mobile Architecture',
          description: 'Loads instantaneously on iOS and Android with touch-optimized targets and graceful responsiveness.',
          iconName: 'Smartphone',
          badge: 'Mobile First',
        },
      ] as FeatureItem[],
    },
    testimonials: {
      title: 'Voices from the Service',
      subtitle: 'Reflections from choir servants and vocalists on order, harmony, and peace of mind',
      items: [
        {
          quote: 'This system transformed our weekly rehearsal routine. Every singer knows their standing, and automated GPS attendance saved 20 minutes of paper roll calls.',
          author: 'Choir Operations Leader',
          role: 'Administration & Logistics',
          badge: 'Rehearsal Management',
        },
        {
          quote: 'Being able to stream my Tenor rehearsal track directly while heading back from work is an absolute blessing.',
          author: 'Tenor Vocalist',
          role: 'Choir Member Since 2018',
          badge: 'Vocal Section',
        },
        {
          quote: 'Collecting dues is now dignified, transparent, and respectful. Every member clearly sees past payments and remaining months.',
          author: 'Choir Treasurer',
          role: 'Financial Steward',
          badge: 'Treasury & Subscriptions',
        },
      ],
    },
    cta: {
      title: 'Ready to Offer a True Sacrifice of Praise with Harmony & Order?',
      subtitle: 'Join the Thamar Shefah Choir platform today and experience a modern, purpose-built spiritual management experience.',
      primaryBtn: 'Sign In to Portal',
      secondaryBtn: 'Submit Membership Request',
    },
    footer: {
      aboutText: 'Thamar Shefah Choir ("Sacrifice of Praise") — Founded in 2000 to offer ecclesiastical praise and spiritual hymns in love and harmony.',
      sections: {
        links: 'Quick Links',
        system: 'System Pillars',
        contact: 'Fellowship & Support',
      },
      copyright: 'All rights reserved © 2026 Thamar Shefah Choir. Developed for spiritual service.',
      edgeStatus: '100% Serverless on Cloudflare Global Edge Network',
    },
  },
};

