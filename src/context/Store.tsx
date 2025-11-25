import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Content, Category, UserRole, SubscriptionPlan, Suggestion, ContentType } from '../types';
import { auth, db, storage } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { ADMIN_EMAIL, ADMIN_PIN, INITIAL_CATEGORIES } from '../constants';

interface StoreContextType {
  user: User | null;
  content: Content[];
  categories: Category[];
  users: User[]; // Admin sees all users
  suggestions: Suggestion[];
  loading: boolean;
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
  uploadFile: (file: File, path: string) => Promise<string>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [content, setContent] = useState<Content[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Auth State Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user details from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data() as User;
          // Check expiry
          if (userData.subscriptionStatus === 'ACTIVE' && userData.subscriptionExpiry && Date.now() > userData.subscriptionExpiry) {
             const updated = { ...userData, subscriptionStatus: 'EXPIRED' as const };
             await updateDoc(userDocRef, { subscriptionStatus: 'EXPIRED' });
             setUser(updated);
          } else {
             setUser(userData);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Data Listeners
  useEffect(() => {
    // Content
    const qContent = query(collection(db, 'content'), orderBy('addedAt', 'desc'));
    const unsubContent = onSnapshot(qContent, (snapshot) => {
      setContent(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Content)));
    });

    // Categories
    const qCats = query(collection(db, 'categories'));
    const unsubCats = onSnapshot(qCats, (snapshot) => {
      const cats = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Category));
      if (cats.length === 0) {
        // Initialize default categories if empty
        INITIAL_CATEGORIES.forEach(c => addDoc(collection(db, 'categories'), c));
      } else {
        setCategories(cats);
      }
    });

    // Suggestions
    const unsubSugg = onSnapshot(collection(db, 'suggestions'), (snapshot) => {
      setSuggestions(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Suggestion)));
    });

    // Users (Admin only ideally, but keeping simple)
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as User)));
    });

    return () => {
      unsubContent();
      unsubCats();
      unsubSugg();
      unsubUsers();
    };
  }, []);

  // --- Auth Functions ---

  const login = async (email: string, pin: string): Promise<boolean> => {
    try {
      // In this app, we use PIN as the password for Firebase Auth
      await signInWithEmailAndPassword(auth, email, pin);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const signup = async (email: string, phone: string, pin: string, plan: SubscriptionPlan): Promise<boolean> => {
    try {
      // Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, pin);
      
      // Determine Role
      const isAdmin = email === ADMIN_EMAIL && pin === ADMIN_PIN;
      
      const newUser: User = {
        id: userCredential.user.uid,
        email,
        phone,
        pin, // Note: Storing PIN/Password in DB is not secure in production, used here to match existing structure
        role: isAdmin ? UserRole.ADMIN : UserRole.CLIENT,
        name: email.split('@')[0],
        avatar: `https://ui-avatars.com/api/?name=${email}&background=random`,
        subscriptionPlan: isAdmin ? SubscriptionPlan.PREMIUM : plan,
        subscriptionStatus: isAdmin ? 'ACTIVE' : 'PENDING',
        subscriptionExpiry: isAdmin ? 9999999999999 : null,
        watchHistory: []
      };

      // Create Firestore Doc
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    // Optimistic update
    setUser({ ...user, ...updates });
    // Firestore update
    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, updates);
  };

  const adminSwitchToClient = () => {
    if (user?.role === UserRole.ADMIN) {
      setUser({ ...user, role: UserRole.CLIENT });
    }
  };

  // --- Content Functions ---

  const addContent = async (item: Content) => {
    // We ignore the ID passed in locally, Firestore generates one
    const { id, ...data } = item;
    await addDoc(collection(db, 'content'), data);
  };

  const deleteContent = async (id: string) => {
    await deleteDoc(doc(db, 'content', id));
  };

  // --- Category Functions ---

  const addCategory = async (name: string) => {
    await addDoc(collection(db, 'categories'), { name });
  };

  const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, 'categories', id));
  };

  // --- Suggestion Functions ---

  const addSuggestion = async (title: string, message: string) => {
    if (!user) return;
    const newSugg: Omit<Suggestion, 'id'> = {
      userId: user.id,
      userName: user.name,
      title,
      message,
      date: Date.now()
    };
    await addDoc(collection(db, 'suggestions'), newSugg);
  };

  const deleteSuggestion = async (id: string) => {
    await deleteDoc(doc(db, 'suggestions', id));
  };

  // --- Subscription Functions ---

  const requestSubscription = (plan: SubscriptionPlan) => {
    updateUser({ subscriptionPlan: plan, subscriptionStatus: 'PENDING' });
  };

  const validateSubscription = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
        const now = new Date();
        now.setDate(now.getDate() + 30);
        const updates = {
            subscriptionStatus: 'ACTIVE' as const,
            subscriptionExpiry: now.getTime()
        };
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, updates);
    }
  };

  // --- Storage Helper ---

  const uploadFile = async (file: File, path: string): Promise<string> => {
      const storageRef = ref(storage, path);
      const uploadTask = await uploadBytesResumable(storageRef, file);
      return getDownloadURL(uploadTask.ref);
  };

  return (
    <StoreContext.Provider value={{ 
      user, content, categories, users, suggestions, loading,
      login, signup, logout, updateUser, 
      addContent, deleteContent, 
      requestSubscription, validateSubscription, adminSwitchToClient,
      addCategory, deleteCategory,
      addSuggestion, deleteSuggestion,
      uploadFile
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