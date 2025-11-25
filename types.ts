export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export enum SubscriptionPlan {
  NONE = 'NONE',
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  pin?: string; // Encrypted in real app
  name: string;
  avatar: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry: number | null; // Timestamp
  subscriptionStatus: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'NONE';
  watchHistory: { contentId: string; progress: number }[];
}

export enum ContentType {
  MOVIE = 'MOVIE',
  SERIES = 'SERIES',
  DOC = 'DOC',
  ANIME = 'ANIME',
}

export interface Episode {
  id: string;
  title: string;
  season: number;
  episodeNumber: number;
  videoUrl: string;
  duration: number;
}

export interface Content {
  id: string;
  title: string;
  type: ContentType;
  category: string;
  posterUrl: string;
  videoUrl: string; // Main video for movies, or first ep for series logic fallback
  trailerUrl: string;
  description: string;
  releaseYear: number;
  duration: number; // in seconds
  cast: string[];
  rating: number; // 1-10 (Admin Note)
  addedAt: number;
  episodes?: Episode[]; // Optional, for series
}

export interface Category {
  id: string;
  name: string;
}

export interface Suggestion {
  id: string;
  userId: string;
  userName: string;
  title: string;
  message: string;
  date: number;
}

// Gemini Live Types
export interface LiveConfig {
    model: string;
    systemInstruction?: string;
}