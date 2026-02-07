
export interface Movie {
  id: string;
  title: string;
  youtubeUrl: string;
  photoUrl: string;
  description: string;
  category: string;
  createdAt: number;
}

export const DEFAULT_CATEGORIES = [
  'Action',
  'Comedy',
  'Drama',
  'Sci-Fi',
  'Horror',
  'Documentary',
  'Animation',
  'Other'
];

export interface AIResponse {
  title?: string;
  description?: string;
  category?: string;
}
