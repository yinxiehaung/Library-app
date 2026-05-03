export const API_BASE_URL = "";

export const USER_KEY = "hul.user";
export const TOKEN_KEY = "hul.token";
export const USERS_KEY = "hul.users";
export const VIEWS_KEY = "hul.views";

export const SEED_BOOKS = [
  {
    id: "bk-001",
    title: "小王子 (The Little Prince)",
    author: "Antoine de Saint-Exupéry",
    isbn: "9789861897280",
    year: 1943,
    language: "繁體中文",
    format: "紙本",
    cover: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400",
    subjects: ["童話", "哲思"],
    description: "一位飛行員與來自小行星B-612的小王子的邂逅，關於孤獨、愛與理解。",
    availability: [
      { lib: "花蓮總館", callno: "882.6 S137", floor: "3F A區", status: "Available", due: null },
      { lib: "吉安分館", callno: "882.6 S137", floor: "2F B區", status: "On hold", due: "2025-11-05" },
      { lib: "新城分館", callno: "882.6 S137", floor: "1F C區", status: "Checked out", due: "2025-11-12" },
    ],
  },
  {
    id: "bk-002",
    title: "解憂雜貨店",
    author: "東野圭吾",
    isbn: "9789863476537",
    year: 2011,
    language: "繁體中文",
    format: "紙本",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400",
    subjects: ["推理", "療癒"],
    description: "寫信到雜貨店的人們，收到了改變人生的回信。",
    availability: [
      { lib: "花蓮總館", callno: "861.57 H553", floor: "4F C區", status: "On shelf", due: null },
      { lib: "壽豐分館", callno: "861.57 H553", floor: "2F A區", status: "Available", due: null },
    ],
  },
  {
    id: "bk-003",
    title: "三體",
    author: "劉慈欣",
    isbn: "9789863479101",
    year: 2008,
    language: "繁體中文",
    format: "紙本",
    cover: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400",
    subjects: ["科幻", "宇宙"],
    description: "人類文明在宇宙尺度下的命運與抉擇。",
    availability: [
      { lib: "花蓮總館", callno: "857.7 L72", floor: "3F S區", status: "Available", due: null },
    ],
  },
  {
    id: "bk-004",
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "9780132350884",
    year: 2008,
    language: "English",
    format: "eBook",
    cover: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=400",
    subjects: ["Programming", "Software"],
    description: "A handbook of agile software craftsmanship.",
    availability: [
      { lib: "花蓮總館", callno: "005.1 M379", floor: "5F IT區", status: "Available", due: null },
    ],
  },
  {
    id: "bk-005",
    title: "挪威的森林 (Norwegian Wood)",
    author: "村上春樹",
    isbn: "9789861735148",
    year: 1987,
    language: "繁體中文",
    format: "有聲書",
    cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
    subjects: ["文學", "青春"],
    description: "青春、愛與失落的故事。",
    availability: [
      { lib: "吉安分館", callno: "861.57 M123", floor: "2F 文學區", status: "On hold", due: "2025-11-01" },
      { lib: "壽豐分館", callno: "861.57 M123", floor: "2F 文學區", status: "Available", due: null },
    ],
  },
];
