import { Content, ContentType, SubscriptionPlan, User, UserRole } from "./types";

export const APP_NAME = "VTV";
export const ADMIN_EMAIL = "victormelchior92@gmail.com";
export const ADMIN_PIN = "03/03/2008"; // Simple check for demo

export const INITIAL_CATEGORIES = [
  { id: '1', name: 'Action' },
  { id: '2', name: 'Romance' },
  { id: '3', name: 'Science-Fiction' },
  { id: '4', name: 'Comédie' },
  { id: '5', name: 'Horreur' },
];

export const MOCK_CONTENT: Content[] = [
  {
    id: 'c1',
    title: 'Cyber Chronicles',
    type: ContentType.MOVIE,
    category: 'Science-Fiction',
    posterUrl: 'https://picsum.photos/400/600?random=1',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    trailerUrl: '',
    description: 'In a neon-soaked future, one hacker fights for the truth.',
    releaseYear: 2024,
    duration: 7200,
    cast: ['Alex Cyber', 'Sarah Tech'],
    rating: 4.8,
    addedAt: Date.now(),
  },
  {
    id: 'c2',
    title: 'Lost in Libreville',
    type: ContentType.SERIES,
    category: 'Action',
    posterUrl: 'https://picsum.photos/400/600?random=2',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    trailerUrl: '',
    description: 'An action packed adventure through the streets of Libreville.',
    releaseYear: 2023,
    duration: 3000,
    cast: ['Jean Marc', 'Marie Paule'],
    rating: 4.5,
    addedAt: Date.now(),
  },
  {
    id: 'c3',
    title: 'Love at First Sight',
    type: ContentType.MOVIE,
    category: 'Romance',
    posterUrl: 'https://picsum.photos/400/600?random=3',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    trailerUrl: '',
    description: 'A beautiful story of unexpected love.',
    releaseYear: 2022,
    duration: 5400,
    cast: ['Romeo', 'Juliette'],
    rating: 4.2,
    addedAt: Date.now(),
  }
];

export const PLANS = {
  [SubscriptionPlan.BASIC]: { price: 5000, label: 'Basic' },
  [SubscriptionPlan.STANDARD]: { price: 10500, label: 'Standard' },
  [SubscriptionPlan.PREMIUM]: { price: 15000, label: 'Premium' },
};
