import type { FeaturedAlbum, FeaturedCreator, Genre, LandingTrack } from "./types";

const svgData = (svg: string) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const cover = (from: string, to: string, accent: string, label: string, variant = 1) =>
  svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
    <rect width="600" height="600" rx="32" fill="url(#g)"/>
    ${variant % 3 === 0
      ? `<circle cx="300" cy="278" r="178" fill="none" stroke="${accent}" stroke-width="52" opacity=".72"/><circle cx="300" cy="278" r="58" fill="${accent}" opacity=".9"/>`
      : variant % 3 === 1
        ? `<path d="M-30 380C100 210 170 530 315 315S520 120 660 268" fill="none" stroke="${accent}" stroke-width="80" stroke-linecap="round" opacity=".8"/>`
        : `<g fill="${accent}" opacity=".82"><rect x="105" y="185" width="68" height="230" rx="34"/><rect x="205" y="105" width="68" height="390" rx="34"/><rect x="305" y="150" width="68" height="300" rx="34"/><rect x="405" y="225" width="68" height="150" rx="34"/></g>`}
    <text x="42" y="535" fill="white" font-family="Arial,sans-serif" font-weight="700" font-size="38">${label}</text>
  </svg>`);

const avatar = (background: string, foreground: string, initials: string) =>
  svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" rx="100" fill="${background}"/><circle cx="100" cy="75" r="38" fill="${foreground}" opacity=".92"/><path d="M36 190c4-46 27-72 64-72s60 26 64 72" fill="${foreground}" opacity=".92"/><text x="100" y="108" text-anchor="middle" fill="white" font-family="Arial" font-weight="800" font-size="24">${initials}</text></svg>`);

export const covers = {
  dawn: cover("#0e7490", "#d4a373", "#67e8f9", "SỚM MAI", 1),
  city: cover("#111827", "#be185d", "#f9a8d4", "THÀNH PHỐ", 2),
  blue: cover("#0369a1", "#312e81", "#bae6fd", "BIỂN XANH", 3),
  warm: cover("#c2410c", "#7c2d12", "#fed7aa", "MÙA HẠ", 1),
  night: cover("#1e1b4b", "#4c1d95", "#c4b5fd", "ĐÊM TRÔI", 2),
  green: cover("#065f46", "#134e4a", "#99f6e4", "BÌNH YÊN", 3),
  rose: cover("#9f1239", "#581c87", "#fda4af", "CHẠM", 1),
  gold: cover("#92400e", "#b45309", "#fde68a", "GỌI NẮNG", 2),
};

const creators = {
  minh: { userId: 101, displayName: "Minh An", avatarUrl: avatar("#cffafe", "#0891b2", "MA") },
  lam: { userId: 102, displayName: "Lâm Mộc", avatarUrl: avatar("#fdf3e5", "#b4691e", "LM") },
  yen: { userId: 103, displayName: "Yên Chi", avatarUrl: avatar("#ffe4e6", "#e11d48", "YC") },
  kai: { userId: 104, displayName: "Kai Vũ", avatarUrl: avatar("#d1fae5", "#059669", "KV") },
  mck: { userId: 6, displayName: "MCK", avatarUrl: avatar("#fef08a", "#854d0e", "MCK") },
  hieuthuhai: { userId: 7, displayName: "HIEUTHUHAI ft. Marzuz", avatarUrl: avatar("#fed7aa", "#c2410c", "H22") },
  uyenlinh: { userId: 8, displayName: "Uyên Linh", avatarUrl: avatar("#fce7f3", "#be185d", "UL") },
  hngle: { userId: 9, displayName: "Hngle ft. Bảo Anh", avatarUrl: avatar("#e0e7ff", "#4338ca", "HB") },
  sontung: { userId: 10, displayName: "Sơn Tùng M-TP", avatarUrl: avatar("#dbeafe", "#1d4ed8", "ST") },
  yorushika: { userId: 11, displayName: "Yorushika", avatarUrl: avatar("#ccfbf1", "#0f766e", "YS") },
  yoko: { userId: 12, displayName: "Yoko Takahashi", avatarUrl: avatar("#ede9fe", "#6d28d9", "YT") },
  yoasobi: { userId: 13, displayName: "YOASOBI", avatarUrl: avatar("#fbcfe8", "#db2777", "YA") },
};

export const projectTracks: LandingTrack[] = [
  {
    id: 6,
    title: "Baby",
    coverUrl: "https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-baby-mck.webp",
    audioUrl: "https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565312/soundwave/tracks/audio/project-track-baby-mck.mp3",
    durationMs: 173740,
    playCount: 285420,
    slug: "baby-mck",
    publicationStatus: "PUBLISHED",
    genreSlug: "rap-hip-hop",
    genreName: "Rap / Hip-hop",
    description: "Bản hit đầy cảm xúc từ album 99% của MCK.",
    lyrics: `Baby em là một giấc mơ\nMà anh không thể nào chạm tới...\nKhi màn đêm buông xuống nơi đây\nChỉ còn nỗi nhớ đong đầy.`,
    creator: creators.mck,
    album: { id: 6, title: "99%" },
  },
  {
    id: 7,
    title: "Exit Sign",
    coverUrl: "https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp",
    audioUrl: "https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565333/soundwave/tracks/audio/project-track-exit-sign-hieuthuhai.mp3",
    durationMs: 201718,
    playCount: 421890,
    slug: "exit-sign-hieuthuhai",
    publicationStatus: "PUBLISHED",
    genreSlug: "rap-hip-hop",
    genreName: "Rap / Hip-hop",
    description: "Ca khúc nổi bật trong album Ai Cũng Phải Bắt Đầu Từ Đâu Đó của HIEUTHUHAI kết hợp cùng marzuz và Kewtiie.",
    lyrics: `Em tìm lối ra nơi bảng exit sign\nĐể lại con tim anh vỡ tan trong đêm dài...\nLiệu có cơ hội nào cho đôi ta bắt đầu lại?`,
    creator: creators.hieuthuhai,
    album: { id: 7, title: "Ai Cũng Phải Bắt Đầu Từ Đâu Đó" },
  },
  {
    id: 8,
    title: "Giữa Đại Lộ Đông Tây",
    coverUrl: "https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-giua-dai-lo-dong-tay.webp",
    audioUrl: "https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565353/soundwave/tracks/audio/project-track-giua-dai-lo-dong-tay.mp3",
    durationMs: 226691,
    playCount: 356700,
    slug: "giua-dai-lo-dong-tay",
    publicationStatus: "PUBLISHED",
    genreSlug: "ballad",
    genreName: "Ballad",
    description: "Ca khúc ballad da diết sáng tác bởi Hứa Kim Tuyền qua giọng hát nội lực của Uyên Linh.",
    lyrics: `Giữa đại lộ đông tây\nCó ai nghe thấy nỗi cô đơn này...\nDòng xe vội vã lướt qua nhanh\nChỉ còn em đứng lặng thầm.`,
    creator: creators.uyenlinh,
    album: { id: 8, title: "Đại Lộ Đông Tây" },
  },
  {
    id: 9,
    title: "Tìm Em",
    coverUrl: "https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-tim-em-hngle-bao-anh.webp",
    audioUrl: "https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565382/soundwave/tracks/audio/project-track-tim-em-hngle-bao-anh.mp3",
    durationMs: 272170,
    playCount: 198400,
    slug: "tim-em-hngle-bao-anh",
    publicationStatus: "PUBLISHED",
    genreSlug: "rnb",
    genreName: "R&B",
    description: "Giai điệu R&B nhẹ nhàng, lãng mạn qua sự kết hợp ăn ý giữa Hngle và Bảo Anh.",
    lyrics: `Từng ngày tìm kiếm bóng hình em\nDù biết yêu thương đã khuất xa ngoài tầm tay...\nMột lời hứa gió thoảng bay đi.`,
    creator: creators.hngle,
    album: { id: 9, title: "Tìm Em Single" },
  },
  {
    id: 10,
    title: "Nơi Này Có Anh",
    coverUrl: "https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp",
    audioUrl: "https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565402/soundwave/tracks/audio/project-track-noi-nay-co-anh.mp3",
    durationMs: 278282,
    playCount: 892300,
    slug: "noi-nay-co-anh",
    publicationStatus: "PUBLISHED",
    genreSlug: "pop",
    genreName: "Pop",
    description: "Bản tình ca Pop ngọt ngào, lãng mạn đình đám của Sơn Tùng M-TP.",
    lyrics: `Em là ai từ đâu bước đến nơi đây dịu dàng chân phương\nCầm tay anh đi qua bao giông tố cuộc đời...\nCầm tay anh, dựa vai anh\nĐừng buông tay anh nhé!`,
    creator: creators.sontung,
    album: { id: 10, title: "Nơi Này Có Anh" },
  },
  {
    id: 11,
    title: "Haru (晴る)",
    coverUrl: "https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-haru-yorushika.webp",
    audioUrl: "https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565495/soundwave/tracks/audio/project-track-haru-yorushika.mp3",
    durationMs: 276715,
    playCount: 312500,
    slug: "haru-yorushika",
    publicationStatus: "PUBLISHED",
    genreSlug: "indie",
    genreName: "Indie",
    description: "Ca khúc chủ đề mở đầu của anime Frieren: Beyond Journey's End thực hiện bởi nhóm nhạc Yorushika.",
    lyrics: `貴方の目にいつか映る\n晴れた日の空のように...\n風が吹き抜けるこの丘で\n歩き続ける物語。`,
    creator: creators.yorushika,
    album: { id: 11, title: "Frieren OST" },
  },
  {
    id: 12,
    title: "A Cruel Angel's Thesis (残酷な天使のテーゼ)",
    coverUrl: "https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-a-cruel-angels-thesis.webp",
    audioUrl: "https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565521/soundwave/tracks/audio/project-track-a-cruel-angels-thesis.mp3",
    durationMs: 243905,
    playCount: 523100,
    slug: "a-cruel-angels-thesis",
    publicationStatus: "PUBLISHED",
    genreSlug: "pop",
    genreName: "Pop",
    description: "Bài hát chủ đề huyền thoại của anime Neon Genesis Evangelion trình bày bởi Yoko Takahashi.",
    lyrics: `残酷な天使のように\n少年よ 神話になれ...\n蒼い風がいま 胸のドアを叩いても\n私だけをただ見つめて\n微笑んでるあなた。`,
    creator: creators.yoko,
    album: { id: 12, title: "Evangelion OST" },
  },
  {
    id: 13,
    title: "Yoru ni Kakeru (夜に駆ける)",
    coverUrl: "https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp",
    audioUrl: "https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565419/soundwave/tracks/audio/project-track-yoru-ni-kakeru.mp3",
    durationMs: 275043,
    playCount: 689400,
    slug: "yoru-ni-kakeru",
    publicationStatus: "PUBLISHED",
    genreSlug: "pop",
    genreName: "Pop",
    description: "Bản hit đột phá toàn cầu của bộ đôi YOASOBI dựa trên tiểu thuyết Tanatosu no Yūwaku.",
    lyrics: `沈むように溶けてゆくように\n二人だけの空が広がる夜に...\n「さよなら」だけだった\nその一言で全てが分かった。`,
    creator: creators.yoasobi,
    album: { id: 13, title: "THE BOOK" },
  },
];

export const demoTracks: LandingTrack[] = [
  {
    id: 1,
    title: "Sớm Mai Dịu Dàng",
    coverUrl: covers.dawn,
    audioUrl: "/audio/soundwave-demo.wav",
    durationMs: 60000,
    playCount: 284521,
    publicationStatus: "APPROVED",
    genreSlug: "acoustic",
    lyrics: `Từng tia nắng ấm khẽ luồn qua ô cửa
Gió hát thì thầm bài ca mùa mới
Em nghe trong lòng những xốn xang đầu tiên
Chào ngày mới bình yên và trong trẻo.

Dù ngoài kia dòng đời vội vã
Vẫn có một góc nhỏ để trở về
Cùng giai điệu mộc mạc của sớm mai
Thả trôi hết âu lo muộn phiền.`,
    creator: creators.minh,
    album: { id: 1, title: "Những Ngày Trong Veo" },
  },
  {
    id: 2,
    title: "Thành Phố Sau Mưa",
    coverUrl: covers.city,
    audioUrl: "/audio/soundwave-demo.wav",
    durationMs: 421000,
    playCount: 198430,
    publicationStatus: "APPROVED",
    genreSlug: "pop",
    lyrics: `Mưa tạnh rồi trên những con phố quen
Ánh đèn vàng phản chiếu mặt hồ ướt đẫm
Bước chân ai nhẹ tênh qua từng góc nhỏ
Nghe tiếng còi xe dần xa vào màn đêm.

Thành phố vẫn thở nhịp thở của riêng mình
Sau cơn mưa gột rửa bụi mờ
Lại sáng lên những ước mơ chưa nguôi.`,
    creator: creators.lam,
    album: { id: 2, title: "Đi Qua Đêm" },
  },
  {
    id: 3,
    title: "Phía Bên Kia Biển",
    coverUrl: covers.blue,
    audioUrl: "/audio/soundwave-demo.wav",
    durationMs: 338000,
    playCount: 176092,
    publicationStatus: "APPROVED",
    genreSlug: "indie",
    lyrics: `Biển xanh ngút ngàn sóng vỗ về đâu
Có cánh chim bay phía chân trời xa thẳm
Lời yêu giấu kín trong từng cơn gió mặn
Gửi về phía bên kia biển rộng.`,
    creator: creators.yen,
    album: { id: 3, title: "Chạm Vào Mây" },
  },
  {
    id: 4,
    title: "Hạ Vẫn Ở Đây",
    coverUrl: covers.warm,
    audioUrl: "/audio/soundwave-demo.wav",
    durationMs: 312000,
    playCount: 154721,
    publicationStatus: "APPROVED",
    genreSlug: "lofi",
    lyrics: `Nắng vàng ươm rớt trên vai gầy
Ve râm ran khúc ca ngày hạ
Dù tháng năm trôi không trở lại
Mùa hạ ấy vẫn ở đây, trong tim mình.`,
    creator: creators.kai,
    album: { id: 4, title: "Gọi Nắng" },
  },
  {
    id: 5,
    title: "Đêm Trôi Rất Khẽ",
    coverUrl: covers.night,
    audioUrl: "/audio/soundwave-demo.wav",
    durationMs: 387000,
    playCount: 143885,
    publicationStatus: "APPROVED",
    genreSlug: "ballad",
    lyrics: `Đêm trôi rất khẽ qua từng kẽ tay
Không gian lắng lại chỉ còn tiếng thở
Một bản tình ca ru giấc ngủ say
Bình yên trở về sau giông bão.`,
    creator: creators.lam,
    album: { id: 2, title: "Đi Qua Đêm" },
  },
  {
    id: 6,
    title: "Một Khoảng Bình Yên",
    coverUrl: covers.green,
    audioUrl: "/audio/soundwave-demo.wav",
    durationMs: 356000,
    playCount: 121430,
    publicationStatus: "APPROVED",
    genreSlug: "acoustic",
    lyrics: `Tách trà thơm bên khung cửa sổ
Một cuốn sách đọc dở buổi chiều
Tìm lại chính mình giữa những xô bồ
Chỉ cần một khoảng bình yên thế này thôi.`,
    creator: creators.minh,
    album: { id: 1, title: "Những Ngày Trong Veo" },
  },
  {
    id: 7,
    title: "Chạm Vào Khoảng Không",
    coverUrl: covers.rose,
    audioUrl: "/audio/soundwave-demo.wav",
    durationMs: 329000,
    playCount: 98450,
    publicationStatus: "APPROVED",
    genreSlug: "rnb",
    lyrics: `Bàn tay với lấy những điều xa xôi
Chạm vào khoảng không nghẹn ngào
Thời gian xóa nhòa những dấu vết
Chỉ còn giai điệu ở lại.`,
    creator: creators.yen,
  },
  {
    id: 8,
    title: "Gọi Nắng Về",
    coverUrl: covers.gold,
    audioUrl: "/audio/soundwave-demo.wav",
    durationMs: 344000,
    playCount: 87320,
    publicationStatus: "APPROVED",
    genreSlug: "rap-hip-hop",
    lyrics: `Từng nhịp bass đánh thức buổi sáng
Mặt trời lên rọi sáng con đường
Vững bước đi về phía trước
Gọi nắng về thắp sáng ngày mai.`,
    creator: creators.kai,
    album: { id: 4, title: "Gọi Nắng" },
  },
];

export const tracks: LandingTrack[] = [...projectTracks, ...demoTracks];

export const genres: Genre[] = [
  { id: 1, name: "Pop", slug: "pop", color: "#ecfeff", accent: "#0891b2", description: "Bright, catchy, and popular melodies." },
  { id: 2, name: "Ballad", slug: "ballad", color: "#fdf6ed", accent: "#b4691e", description: "Gentle, heartfelt songs rich in emotion." },
  { id: 3, name: "Rap / Hip-hop", slug: "rap-hip-hop", color: "#fff7ed", accent: "#ea580c", description: "Energetic beats with honest, expressive lyrics." },
  { id: 4, name: "R&B", slug: "rnb", color: "#fdf2f8", accent: "#db2777", description: "Smooth, warm, and soulful melodies." },
  { id: 5, name: "Acoustic", slug: "acoustic", color: "#f0fdf4", accent: "#16a34a", description: "Natural sounds from acoustic guitar and piano." },
  { id: 6, name: "EDM", slug: "edm", color: "#eff6ff", accent: "#2563eb", description: "High-energy modern electronic music." },
  { id: 7, name: "Indie", slug: "indie", color: "#fefce8", accent: "#ca8a04", description: "Independent music with a free and distinctive spirit." },
  { id: 8, name: "Lofi", slug: "lofi", color: "#fbf5ea", accent: "#8c5828", description: "Relaxing sounds for studying and working." },
];

export const albums: FeaturedAlbum[] = [
  { id: 1, title: "Những Ngày Trong Veo", coverUrl: covers.dawn, creatorName: "Minh An", releaseYear: 2026, tracksCount: 2, description: "A gentle acoustic collection for quiet mornings." },
  { id: 2, title: "Đi Qua Đêm", coverUrl: covers.night, creatorName: "Lâm Mộc", releaseYear: 2026, tracksCount: 2, description: "A sonic journey through the city after the night rain." },
  { id: 3, title: "Chạm Vào Mây", coverUrl: covers.blue, creatorName: "Yên Chi", releaseYear: 2025, tracksCount: 1, description: "Dream-pop melodies drifting between sea and sky." },
  { id: 4, title: "Gọi Nắng", coverUrl: covers.gold, creatorName: "Kai Vũ", releaseYear: 2026, tracksCount: 2, description: "Summer energy in every beat." },
];

export const featuredCreators: FeaturedCreator[] = [
  { ...creators.minh, avatarUrl: creators.minh.avatarUrl!, bio: "Acoustic melodies for slow, peaceful days.", publishedTracks: 12, followersCount: 4320 },
  { ...creators.lam, avatarUrl: creators.lam.avatarUrl!, bio: "Telling city stories through alternative pop.", publishedTracks: 9, followersCount: 3180 },
  { ...creators.yen, avatarUrl: creators.yen.avatarUrl!, bio: "Dream pop, blue seas, and distant skies.", publishedTracks: 7, followersCount: 2950 },
  { ...creators.kai, avatarUrl: creators.kai.avatarUrl!, bio: "Summer energy in every beat.", publishedTracks: 11, followersCount: 5120 },
];

export const heroCovers = [covers.dawn, covers.city, covers.blue];

export const demoPlaylists: import("./types").Playlist[] = [
  {
    id: 1,
    title: "Ngọt band",
    description: "Start the day with positive energy.",
    coverUrl: covers.dawn,
    trackCount: 3,
    isPrivate: false,
    ownerId: 5,
    ownerName: "Anh Tuan",
    trackIds: [1, 2, 10],
  },
  {
    id: 2,
    title: "Đêm muộn suy tư",
    description: "Gentle music for sleep and quiet reflection.",
    coverUrl: covers.night,
    trackCount: 3,
    isPrivate: true,
    ownerId: 5,
    ownerName: "Anh Tuan",
    trackIds: [2, 3, 5],
  },
];

export const initialStudioTracks: import("./types").StudioTrack[] = [
  {
    id: 101,
    title: "Gió Qua Thung Lũng (Demo)",
    coverUrl: covers.green,
    audioUrl: "/audio/soundwave-demo.wav",
    durationMs: 240000,
    genreSlug: "acoustic",
    genreName: "Acoustic",
    albumTitle: "Single",
    status: "DRAFT",
    createdAt: "2026-09-18",
  },
  {
    id: 102,
    title: "Ánh Sáng Nơi Chân Trời",
    coverUrl: covers.gold,
    audioUrl: "/audio/soundwave-demo.wav",
    durationMs: 310000,
    genreSlug: "pop",
    genreName: "Pop",
    albumTitle: "Single",
    status: "PENDING",
    createdAt: "2026-09-19",
  },
  {
    id: 103,
    title: "Vũ Điệu Đêm Hè",
    coverUrl: covers.warm,
    audioUrl: "/audio/soundwave-demo.wav",
    durationMs: 295000,
    genreSlug: "edm",
    genreName: "EDM",
    status: "REJECTED",
    latestRejectionReason: "The drop section is distorted and exceeds the accepted volume level. Check the mastering before resubmitting.",
    createdAt: "2026-09-15",
  },
];

export const demoUser: import("./types").CurrentUser = {
  id: 1,
  email: "lean@soundwave.vn",
  displayName: "Lê An",
  avatarUrl: avatar("#cffafe", "#0891b2", "LA"),
  role: "LISTENER",
  bio: "Creating mellow lofi and acoustic pop melodies.",
};
