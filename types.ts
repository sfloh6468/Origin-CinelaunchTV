
export interface Movie {
  id: string;
  title: string;
  youtubeUrl: string;
  photoUrl: string;
  description: string;
  language: string;
  category: string;
  createdAt: number;
  lastUpdated?: number; // For sync tracking
}

export interface CloudConfig {
  remoteUrl: string;
  isAdmin: boolean;
  syncInterval: number; // in minutes
  lastSync: number;
}

export const ROOT_LANGUAGES = ['English', 'Chinese', 'Malay', 'India'];

export const GENRE_MAP: Record<string, Record<string, string>> = {
  English: {
    'All': 'All Collections',
    'Action': 'Action',
    'Comedy': 'Comedy',
    'Drama': 'Drama',
    'Sci-Fi': 'Sci-Fi',
    'Horror': 'Horror',
    'Documentary': 'Documentary',
    'Animation': 'Animation',
    'Other': 'Other'
  },
  Chinese: {
    'All': '所有收藏',
    'Action': '动作',
    'Comedy': '喜剧',
    'Drama': '剧情',
    'Sci-Fi': '科幻',
    'Horror': '恐怖',
    'Documentary': '纪录片',
    'Animation': '动画',
    'Other': '其他'
  },
  Malay: {
    'All': 'Semua Koleksi',
    'Action': 'Aksi',
    'Comedy': 'Komedi',
    'Drama': 'Drama',
    'Sci-Fi': 'Sains Fiksyen',
    'Horror': 'Seram',
    'Documentary': 'Dokumentari',
    'Animation': 'Animasi',
    'Other': 'Lain-lain'
  },
  India: {
    'All': 'All Indian',
    'Action': 'Action',
    'Comedy': 'Comedy',
    'Drama': 'Drama',
    'Sci-Fi': 'Sci-Fi',
    'Horror': 'Horror',
    'Documentary': 'Documentary',
    'Animation': 'Animation',
    'Other': 'Other'
  }
};

export const DEFAULT_GENRES = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Documentary', 'Animation', 'Other'];
