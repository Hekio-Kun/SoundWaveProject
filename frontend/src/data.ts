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
};

export const tracks: LandingTrack[] = [];

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

export const demoPlaylists: import("./types").Playlist[] = [];

export const initialStudioTracks: import("./types").StudioTrack[] = [];

export const demoUser: import("./types").CurrentUser = {
  id: 1,
  email: "lean@soundwave.vn",
  displayName: "Lê An",
  avatarUrl: avatar("#cffafe", "#0891b2", "LA"),
  role: "LISTENER",
  bio: "Creating mellow lofi and acoustic pop melodies.",
};
