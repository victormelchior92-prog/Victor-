import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Content, Category, UserRole, SubscriptionPlan, Suggestion, ContentType } from '../types';
import { INITIAL_CATEGORIES, MOCK_CONTENT, ADMIN_EMAIL, ADMIN_PIN } from '../constants';

interface StoreContextType {
  user: User | null;
  content: Content[];
  categories: Category[];
  users: User[]; // Admin sees all users
  suggestions: Suggestion[];
  login: (email: string, pin: string) => Promise<boolean>;
  signup: (email: string, phone: string, pin: string, plan: SubscriptionPlan) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addContent: (item: Content) => void;
  deleteContent: (id: string) => void;
  requestSubscription: (plan: SubscriptionPlan) => void;
  validateSubscription: (userId: string) => void;
  adminSwitchToClient: () => void;
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;
  addSuggestion: (title: string, message: string) => void;
  deleteSuggestion: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Enhanced Mock Data for Series
const ENHANCED_MOCK_CONTENT: Content[] = [
  ...MOCK_CONTENT.map(c => ({ ...c, rating: c.rating ? c.rating * 2 : 5 })), // Normalize old 5-star to 10
  {
    id: 'c4_series_top',
    title: 'La Casa de Papel',
    type: ContentType.SERIES,
    category: 'Action',
    posterUrl: 'https://picsum.photos/400/600?random=10',
    videoUrl: '', // Series container
    trailerUrl: '',
    description: 'Eight thieves take hostages and lock themselves in the Royal Mint of Spain as a criminal mastermind manipulates the police to carry out his plan.',
    releaseYear: 2017,
    duration: 0,
    cast: ['Úrsula Corberó', 'Álvaro Morte'],
    rating: 9.8, // High rating for Top 10
    addedAt: Date.now(),
    episodes: [
      { id: 'ep1', title: 'Partie 1: Épisode 1', season: 1, episodeNumber: 1, duration: 3000, videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
      { id: 'ep2', title: 'Partie 1: Épisode 2', season: 1, episodeNumber: 2, duration: 2800, videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    ]
  },
  {
    id: 'c5_movie_top',
    title: 'Inception',
    type: ContentType.MOVIE,
    category: 'Science-Fiction',
    posterUrl: 'https://picsum.photos/400/600?random=11',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    trailerUrl: '',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    releaseYear: 2010,
    duration: 8800,
    cast: ['Leonardo DiCaprio'],
    rating: 9.5,
    addedAt: Date.now(),
  }
];

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vtv_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [content, setContent] = useState<Content[]>(() => {
    const saved = localStorage.getItem('vtv_content');
    return saved ? JSON.parse(saved) : ENHANCED_MOCK_CONTENT;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('vtv_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('vtv_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [suggestions, setSuggestions] = useState<Suggestion[]>(() => {
      const saved = localStorage.getItem('vtv_suggestions');
      return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vtv_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('vtv_content', JSON.stringify(content));
  }, [content]);

  useEffect(() => {
    localStorage.setItem('vtv_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('vtv_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('vtv_suggestions', JSON.stringify(suggestions));
  }, [suggestions]);

  // Check Subscription Expiry
  useEffect(() => {
    if (user && user.subscriptionStatus === 'ACTIVE' && user.subscriptionExpiry) {
      if (Date.now() > user.subscriptionExpiry) {
        // Subscription has expired
        const updatedUser = { ...user, subscriptionStatus: 'EXPIRED' as const };
        setUser(updatedUser);
        // Also update the user in the main users list
        setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      }
    }
  }, [user, users]); // Depend on user to re-check when loaded

  const login = async (email: string, pin: string) => {
    // Admin Check
    if (email === ADMIN_EMAIL && pin === ADMIN_PIN) {
      const adminUser: User = {
        id: 'admin',
        email,
        role: UserRole.ADMIN,
        name: 'Administrateur',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=00f2ea&color=fff',
        subscriptionPlan: SubscriptionPlan.PREMIUM,
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiry: 9999999999999,
        watchHistory: []
      };
      setUser(adminUser);
      return true;
    }

    // Client Check
    const foundUser = users.find(u => u.email === email && u.pin === pin);
    if (foundUser) {
      // Check expiry on login as well
      if (foundUser.subscriptionStatus === 'ACTIVE' && foundUser.subscriptionExpiry && Date.now() > foundUser.subscriptionExpiry) {
         foundUser.subscriptionStatus = 'EXPIRED';
         // Update in users list
         setUsers(users.map(u => u.id === foundUser.id ? foundUser : u));
      }
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const signup = async (email: string, phone: string, pin: string, plan: SubscriptionPlan) => {
    if (users.find(u => u.email === email)) return false;

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      phone,
      pin,
      role: UserRole.CLIENT,
      name: email.split('@')[0],
      avatar: `https://ui-avatars.com/api/?name=${email}&background=random`,
      subscriptionPlan: plan,
      subscriptionStatus: 'PENDING',
      subscriptionExpiry: null,
      watchHistory: []
    };

    setUsers([...users, newUser]);
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    setUsers(users.map(u => u.id === user.id ? updated : u));
  };

  const addContent = (item: Content) => {
    setContent(prev => [item, ...prev]);
  };

  const deleteContent = (id: string) => {
    setContent(prev => prev.filter(c => c.id !== id));
  };

  const requestSubscription = (plan: SubscriptionPlan) => {
    updateUser({ subscriptionPlan: plan, subscriptionStatus: 'PENDING' });
  };

  const validateSubscription = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      const now = new Date();
      now.setDate(now.getDate() + 30); // 30 days
      const updatedUser: User = {
        ...targetUser,
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiry: now.getTime()
      };
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      // Update current user if it's them
      if (user?.id === userId) setUser(updatedUser);
    }
  };

  const adminSwitchToClient = () => {
     if(user?.role === UserRole.ADMIN) {
         // Create a temporary client-like session for the admin
         setUser({
             ...user,
             role: UserRole.CLIENT
         });
     }
  };

  const addCategory = (name: string) => {
    const newCat = { id: Math.random().toString(36).substr(2, 9), name };
    setCategories([...categories, newCat]);
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const addSuggestion = (title: string, message: string) => {
      if (!user) return;
      const newSugg: Suggestion = {
          id: Math.random().toString(36).substr(2, 9),
          userId: user.id,
          userName: user.name,
          title,
          message,
          date: Date.now()
      };
      setSuggestions(prev => [newSugg, ...prev]);
  };

  const deleteSuggestion = (id: string) => {
      setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <StoreContext.Provider value={{ 
      user, content, categories, users, suggestions,
      login, signup, logout, updateUser, 
      addContent, deleteContent, 
      requestSubscription, validateSubscription, adminSwitchToClient,
      addCategory, deleteCategory,
      addSuggestion, deleteSuggestion
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};