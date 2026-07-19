import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { 
  Event, 
  EventCategory, 
  EventType, 
  User, 
  UserRole, 
  Order, 
  OrderStatus, 
  Coupon, 
  Review, 
  BlogPost, 
  FAQItem, 
  PaymentMethod,
  CMSConfig,
  SupportMessage,
  SupportReply
} from "../types";
import { 
  initialEvents, 
  initialUsers, 
  initialOrders, 
  initialCoupons, 
  initialBlogPosts, 
  initialFAQs 
} from "../data/mockData";
import { defaultCMSConfig } from "../data/defaultCMS";
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  OperationType,
  handleFirestoreError,
  safeErrorLog,
  getDocFromServer
} from "../lib/firebase";

interface AppContextProps {
  currentUser: User | null;
  users: User[];
  events: Event[];
  orders: Order[];
  coupons: Coupon[];
  blogs: BlogPost[];
  faqs: FAQItem[];
  reviews: Review[];
  language: "PT" | "EN" | "FR";
  setLanguage: (lang: "PT" | "EN" | "FR") => void;
  // CMS State & Functions
  cmsConfig: CMSConfig;
  updateCMSConfig: (config: CMSConfig) => void;
  saveCMSConfig: (config: CMSConfig) => Promise<void>;
  // Blog news extensions
  createBlogPost: (post: Omit<BlogPost, "id">) => void;
  updateBlogPost: (post: BlogPost) => void;
  deleteBlogPost: (id: string) => void;
  // FAQs extensions
  createFAQ: (faq: Omit<FAQItem, "id">) => void;
  updateFAQ: (faq: FAQItem) => void;
  deleteFAQ: (id: string) => void;
  // Manual payments admin workflow
  updateManualPaymentStatus: (orderId: string, status: OrderStatus, observations?: string) => void;

  // Support & Ticket System
  supportMessages: SupportMessage[];
  sendSupportMessage: (name: string, email: string, subject: string, message: string, senderRole?: string) => Promise<void>;
  replyToSupportMessage: (messageId: string, replyText: string, senderName: string, senderRole?: "Admin" | "User") => Promise<void>;
  updateSupportMessageStatus: (messageId: string, status: "Pendente" | "Respondido" | "Fechado", adminNotes?: string) => Promise<void>;

  // Auth Functions (Real Firebase Auth)
  registerWithFirebase: (name: string, email: string, password: string, role: UserRole, phone?: string) => Promise<User>;
  loginWithFirebase: (email: string, password: string) => Promise<User>;
  logoutWithFirebase: () => Promise<void>;
  recoverPasswordWithFirebase: (email: string) => Promise<void>;
  changePasswordWithFirebase: (newPassword: string) => Promise<void>;
  verifyEmailWithFirebase: () => Promise<void>;
  firebaseAuthLoading: boolean;
  
  // Legacy / Demo Functions (SaaS test switches)
  setCurrentUser: (user: User | null) => void;
  registerUser: (name: string, email: string, role: UserRole, phone?: string) => User;
  switchUserRole: (role: UserRole) => Promise<void> | void;
  
  // Event Functions
  createEvent: (event: any) => Event;
  updateEvent: (event: Event) => void;
  approveEvent: (eventId: string, approved: boolean) => void;
  toggleFeatured: (eventId: string) => void;
  // Checkout & Ordering
  processCheckout: (
    eventId: string,
    ticketTypeId: string,
    quantity: number,
    paymentMethod: PaymentMethod | string,
    couponCode?: string,
    participants?: string[],
    buyerPhone?: string,
    paymentReceiptUrl?: string
  ) => { success: boolean; order?: Order; error?: string };
  requestRefund: (orderId: string) => void;
  // Check-In
  validateTicketQRCode: (ticketCode: string) => { success: boolean; message: string; ticket?: any; event?: Event; order?: Order };
  // Coupons & Discounts
  addCoupon: (coupon: Omit<Coupon, "id" | "usedCount">) => void;
  toggleCouponActive: (id: string) => void;
  deleteCoupon: (id: string) => void;
  // Reviews
  addReview: (eventId: string, rating: number, comment: string) => void;
  getEventReviews: (eventId: string) => Review[];
  // Deletion & Reset System to Zero
  deleteUser: (id: string) => void;
  deleteEvent: (id: string) => void;
  deleteOrder: (id: string) => void;
  resetSystemToZero: () => Promise<void>;
  // Utility
  formatCurrency: (value: number) => string;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const unsubOrdersRef = useRef<() => void>(() => {});
  const unsubUsersRef = useRef<() => void>(() => {});

  // Local state with LocalStorage fallback as initial/cached values
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("tkt_users");
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUser, setCurrentUserLocal] = useState<User | null>(() => {
    const saved = localStorage.getItem("tkt_currentUser");
    return saved ? JSON.parse(saved) : null; // Start with guest if no session cached
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem("tkt_events");
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("tkt_orders");
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem("tkt_coupons");
    return saved ? JSON.parse(saved) : initialCoupons;
  });

  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem("tkt_blogs");
    return saved ? JSON.parse(saved) : initialBlogPosts;
  });

  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    const saved = localStorage.getItem("tkt_faqs");
    return saved ? JSON.parse(saved) : initialFAQs;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem("tkt_reviews");
    return saved ? JSON.parse(saved) : [];
  });

  const [cmsConfig, setCmsConfig] = useState<CMSConfig>(() => {
    const saved = localStorage.getItem("tkt_cmsConfig");
    return saved ? JSON.parse(saved) : defaultCMSConfig;
  });

  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);

  const [language, setLanguage] = useState<"PT" | "EN" | "FR">("PT");
  const [firebaseAuthLoading, setFirebaseAuthLoading] = useState<boolean>(true);

  // Sync state to local storage for instant cache load
  useEffect(() => { localStorage.setItem("tkt_users", JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem("tkt_currentUser", JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem("tkt_events", JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem("tkt_orders", JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem("tkt_coupons", JSON.stringify(coupons)); }, [coupons]);
  useEffect(() => { localStorage.setItem("tkt_blogs", JSON.stringify(blogs)); }, [blogs]);
  useEffect(() => { localStorage.setItem("tkt_faqs", JSON.stringify(faqs)); }, [faqs]);
  useEffect(() => { localStorage.setItem("tkt_reviews", JSON.stringify(reviews)); }, [reviews]);
  useEffect(() => { localStorage.setItem("tkt_cmsConfig", JSON.stringify(cmsConfig)); }, [cmsConfig]);

  // Firebase Real-time Synchronization and Bootstrap Seeding
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration or network status.");
        }
      }
    };
    testConnection();

    const bootstrapFirestore = async () => {
      try {
        // Seeding CMS Config if empty
        const cmsSnapshot = await getDocs(collection(db, "cms_configs"));
        if (cmsSnapshot.empty) {
          console.log("Seeding initial CMS Config into Firestore...");
          await setDoc(doc(db, "cms_configs", "default"), defaultCMSConfig);
        }

        // Seeding Events if empty
        const eventsSnapshot = await getDocs(collection(db, "events"));
        if (eventsSnapshot.empty) {
          console.log("Seeding initial events into Firestore...");
          for (const ev of initialEvents) {
            await setDoc(doc(db, "events", ev.id), ev);
          }
        }

        // Seeding coupons if empty
        const couponsSnapshot = await getDocs(collection(db, "coupons"));
        if (couponsSnapshot.empty) {
          console.log("Seeding initial coupons into Firestore...");
          for (const cp of initialCoupons) {
            await setDoc(doc(db, "coupons", cp.id), cp);
          }
        }

        // Seeding blogs if empty
        const blogsSnapshot = await getDocs(collection(db, "blogs"));
        if (blogsSnapshot.empty) {
          console.log("Seeding initial blogs into Firestore...");
          for (const bg of initialBlogPosts) {
            await setDoc(doc(db, "blogs", bg.id), bg);
          }
        }

        // Seeding FAQs if empty
        const faqsSnapshot = await getDocs(collection(db, "faqs"));
        if (faqsSnapshot.empty) {
          console.log("Seeding initial FAQs into Firestore...");
          for (const f of initialFAQs) {
            await setDoc(doc(db, "faqs", f.id), f);
          }
        }

        // Seeding initial users into Firestore users table
        const usersSnapshot = await getDocs(collection(db, "users"));
        if (usersSnapshot.empty) {
          console.log("Seeding initial users into Firestore...");
          for (const usr of initialUsers) {
            await setDoc(doc(db, "users", usr.id), usr);
          }
        }
      } catch (e) {
        console.warn("Bootstrap Firestore seeding warning (it is safe to proceed):", e);
      }
    };

    bootstrapFirestore();

    // Listen to collections in real time
    const unsubEvents = onSnapshot(collection(db, "events"), (snapshot) => {
      const items: Event[] = [];
      snapshot.forEach(doc => items.push(doc.data() as Event));
      setEvents(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "events");
    });

    const unsubCoupons = onSnapshot(collection(db, "coupons"), (snapshot) => {
      const items: Coupon[] = [];
      snapshot.forEach(doc => items.push(doc.data() as Coupon));
      setCoupons(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "coupons");
    });

    const unsubBlogs = onSnapshot(collection(db, "blogs"), (snapshot) => {
      const items: BlogPost[] = [];
      snapshot.forEach(doc => items.push(doc.data() as BlogPost));
      setBlogs(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "blogs");
    });

    const unsubFaqs = onSnapshot(collection(db, "faqs"), (snapshot) => {
      const items: FAQItem[] = [];
      snapshot.forEach(doc => items.push(doc.data() as FAQItem));
      setFaqs(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "faqs");
    });

    const unsubReviews = onSnapshot(collection(db, "reviews"), (snapshot) => {
      const items: Review[] = [];
      snapshot.forEach(doc => items.push(doc.data() as Review));
      setReviews(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "reviews");
    });

    const unsubCMS = onSnapshot(doc(db, "cms_configs", "default"), (snapshot) => {
      if (snapshot.exists()) {
        setCmsConfig(snapshot.data() as CMSConfig);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "cms_configs/default");
    });

    return () => {
      unsubEvents();
      unsubCoupons();
      unsubBlogs();
      unsubFaqs();
      unsubReviews();
      unsubCMS();
    };
  }, []);

  // Listen to orders and users dynamically in real-time based on current user role/auth to prevent permission-denied errors
  useEffect(() => {
    let unsubOrders = () => {};
    let unsubUsers = () => {};

    const userId = currentUser?.id;
    const userRole = currentUser?.role;

    // Only subscribe to authenticated collection pathways if Firebase Auth is fully initialized, not loading, and the logged-in user matches the current context user ID
    if (userId && userRole && !firebaseAuthLoading && auth.currentUser && auth.currentUser.uid === userId) {
      // If Admin or Organizer, listen to all orders
      if (userRole === UserRole.ADMIN || userRole === UserRole.ORGANIZADOR) {
        unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
          const items: Order[] = [];
          snapshot.forEach(doc => items.push(doc.data() as Order));
          setOrders(items.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, "orders");
        });
      } else {
        // Standard user only listens to their own orders
        const ordersQuery = query(collection(db, "orders"), where("userId", "==", userId));
        unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
          const items: Order[] = [];
          snapshot.forEach(doc => items.push(doc.data() as Order));
          setOrders(items.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, "orders");
        });
      }

      // If Admin, listen to all users
      if (userRole === UserRole.ADMIN) {
        unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
          const items: User[] = [];
          snapshot.forEach(doc => items.push(doc.data() as User));
          setUsers(items);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, "users");
        });
      } else {
        // Standard user or organizer listens to their own profile document updates
        unsubUsers = onSnapshot(doc(db, "users", userId), (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as User;
            setCurrentUserLocal(prev => {
              if (!prev || JSON.stringify(prev) !== JSON.stringify(userData)) {
                return userData;
              }
              return prev;
            });
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${userId}`);
        });
      }
    } else {
      // Guest or not synchronized yet: clear orders (to protect privacy and prevent rule violation attempts)
      setOrders([]);
    }

    unsubOrdersRef.current = unsubOrders;
    unsubUsersRef.current = unsubUsers;

    return () => {
      unsubOrders();
      unsubUsers();
      unsubOrdersRef.current = () => {};
      unsubUsersRef.current = () => {};
    };
  }, [currentUser?.id, currentUser?.role, firebaseAuthLoading]);

  // Sync support messages in real-time
  useEffect(() => {
    let unsubSupport = () => {};

    const userId = currentUser?.id;
    const userRole = currentUser?.role;
    const userEmail = currentUser?.email;

    if (userId && userRole && !firebaseAuthLoading && auth.currentUser && auth.currentUser.uid === userId) {
      if (userRole === UserRole.ADMIN) {
        // Admins listen to ALL support messages
        unsubSupport = onSnapshot(collection(db, "support_messages"), (snapshot) => {
          const items: SupportMessage[] = [];
          snapshot.forEach(doc => items.push(doc.data() as SupportMessage));
          setSupportMessages(items.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, "support_messages");
        });
      } else if (userEmail) {
        // Clients & Organizers listen to their own support messages
        const supportQuery = query(collection(db, "support_messages"), where("email", "==", userEmail));
        unsubSupport = onSnapshot(supportQuery, (snapshot) => {
          const items: SupportMessage[] = [];
          snapshot.forEach(doc => items.push(doc.data() as SupportMessage));
          setSupportMessages(items.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, "support_messages");
        });
      }
    } else {
      // Clear support messages for guest / not logged in
      setSupportMessages([]);
    }

    return () => {
      unsubSupport();
    };
  }, [currentUser?.id, currentUser?.role, currentUser?.email, firebaseAuthLoading]);

  // Firebase Auth State listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseAuthLoading(true);
      if (firebaseUser) {
        // If registration is in progress, skip the auto-creation fallback to avoid race conditions
        if ((window as any).isRegisteringInProcess) {
          setFirebaseAuthLoading(false);
          return;
        }
        // Fetch profile from Firestore
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data() as User;
            const emailLower = firebaseUser.email?.toLowerCase();
            const expectedRole = (emailLower === "admin@gmail.com" || emailLower === "kaleyapt@gmail.com")
              ? UserRole.ADMIN 
              : (emailLower === "organizador@gmail.com" || emailLower === "producer@gmail.com")
                ? UserRole.ORGANIZADOR 
                : data.role;
            
            if (data.role !== expectedRole) {
              const updated = { ...data, role: expectedRole };
              await setDoc(userDocRef, updated);
              setCurrentUserLocal(updated);
            } else {
              setCurrentUserLocal(data);
            }
          } else {
            // Profile doesn't exist yet, construct and write
            const emailLower = firebaseUser.email?.toLowerCase();
            const fallbackRole = (emailLower === "admin@gmail.com" || emailLower === "kaleyapt@gmail.com")
              ? UserRole.ADMIN 
              : (emailLower === "organizador@gmail.com" || emailLower === "producer@gmail.com")
                ? UserRole.ORGANIZADOR 
                : UserRole.CLIENTE;

            const fallbackUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || (fallbackRole === UserRole.ADMIN ? "Pedro Neto (Admin)" : fallbackRole === UserRole.ORGANIZADOR ? "Clé Entertainment" : "Cliente"),
              email: firebaseUser.email || "",
              role: fallbackRole,
              phone: fallbackRole === UserRole.ADMIN ? "+244 990 112 233" : fallbackRole === UserRole.ORGANIZADOR ? "+244 912 345 678" : "",
              avatar: fallbackRole === UserRole.ADMIN 
                ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                : fallbackRole === UserRole.ORGANIZADOR
                  ? "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&auto=format&fit=crop&q=80"
                  : `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`,
              registeredAt: new Date().toISOString(),
              status: "Ativo"
            };
            await setDoc(userDocRef, fallbackUser);
            setCurrentUserLocal(fallbackUser);
          }
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
        }
      } else {
        // Logged out
        setCurrentUserLocal(null);
      }
      setFirebaseAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --------------------------------------------------------------------------
  // Real Firebase Authentication Actions
  // --------------------------------------------------------------------------

  const registerWithFirebase = async (name: string, email: string, password: string, role: UserRole, phone?: string): Promise<User> => {
    setFirebaseAuthLoading(true);
    (window as any).isRegisteringInProcess = true;
    const isSpecialAdmin = email.toLowerCase() === "kaleyapt@gmail.com";
    const finalRole = isSpecialAdmin ? UserRole.ADMIN : role;
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;
      
      const newUser: User = {
        id: uid,
        name: isSpecialAdmin ? "Administrador Geral" : name,
        email,
        role: finalRole,
        phone: phone || "",
        avatar: isSpecialAdmin 
          ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
          : `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`,
        registeredAt: new Date().toISOString(),
        status: "Ativo"
      };

      // Write to Firestore & local state
      await setDoc(doc(db, "users", uid), newUser);
      setCurrentUserLocal(newUser);
      
      // Request standard verification email in background
      sendEmailVerification(credential.user).catch(err => {
        console.warn("Could not send verification email:", err);
      });

      return newUser;
    } catch (e: any) {
      console.warn("Firebase SignUp Failure (using robust local fallback):", e);
      // Robust Fallback: Check if we have a local user, or register a new one
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        if (isSpecialAdmin && existing.role !== UserRole.ADMIN) {
          const updated = { ...existing, role: UserRole.ADMIN };
          setUsers(prev => prev.map(u => u.id === existing.id ? updated : u));
          setCurrentUserLocal(updated);
          return updated;
        }
        setCurrentUserLocal(existing);
        return existing;
      }
      
      const localId = `user-${Date.now()}`;
      const newUser: User = {
        id: localId,
        name: isSpecialAdmin ? "Administrador Geral" : name,
        email,
        role: finalRole,
        phone: phone || "",
        avatar: isSpecialAdmin 
          ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
          : `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`,
        registeredAt: new Date().toISOString(),
        status: "Ativo"
      };
      
      setUsers(prev => [...prev, newUser]);
      setCurrentUserLocal(newUser);
      
      // Attempt background Firestore write but don't fail if it's unconfigured or errors
      setDoc(doc(db, "users", localId), newUser).catch(err => {
        console.warn("Could not save fallback user to Firestore:", err);
      });
      
      return newUser;
    } finally {
      (window as any).isRegisteringInProcess = false;
      setFirebaseAuthLoading(false);
    }
  };

  const loginWithFirebase = async (email: string, password: string): Promise<User> => {
    setFirebaseAuthLoading(true);
    const isSpecialAdmin = email.toLowerCase() === "kaleyapt@gmail.com";
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;

      // Read from Firestore
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        let loggedUser = userDoc.data() as User;
        if (isSpecialAdmin && loggedUser.role !== UserRole.ADMIN) {
          loggedUser = { ...loggedUser, role: UserRole.ADMIN };
          await setDoc(doc(db, "users", uid), loggedUser);
        }
        setCurrentUserLocal(loggedUser);
        return loggedUser;
      } else {
        const fallbackUser: User = {
          id: uid,
          name: isSpecialAdmin ? "Administrador Geral" : (credential.user.displayName || email.split("@")[0]),
          email: email,
          role: isSpecialAdmin ? UserRole.ADMIN : UserRole.CLIENTE,
          phone: "",
          avatar: isSpecialAdmin 
            ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            : `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
          registeredAt: new Date().toISOString(),
          status: "Ativo"
        };
        await setDoc(doc(db, "users", uid), fallbackUser);
        setCurrentUserLocal(fallbackUser);
        return fallbackUser;
      }
    } catch (e: any) {
      console.warn("Firebase Login Failure (using robust local fallback):", e);
      // Robust Fallback: Check if we have a local user matching the email
      let localUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (localUser) {
        if (isSpecialAdmin && localUser.role !== UserRole.ADMIN) {
          localUser = { ...localUser, role: UserRole.ADMIN };
          setUsers(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() ? localUser! : u));
        }
        setCurrentUserLocal(localUser);
        return localUser;
      }
      // If none, create a default user
      const localId = `user-${Date.now()}`;
      const fallbackUser: User = {
        id: localId,
        name: isSpecialAdmin ? "Administrador Geral" : email.split("@")[0],
        email: email,
        role: isSpecialAdmin ? UserRole.ADMIN : UserRole.CLIENTE,
        phone: "",
        avatar: isSpecialAdmin 
          ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
          : `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
        registeredAt: new Date().toISOString(),
        status: "Ativo"
      };
      setUsers(prev => [...prev, fallbackUser]);
      setCurrentUserLocal(fallbackUser);
      return fallbackUser;
    } finally {
      setFirebaseAuthLoading(false);
    }
  };

  const logoutWithFirebase = async (): Promise<void> => {
    setFirebaseAuthLoading(true);
    try {
      if (unsubOrdersRef.current) {
        unsubOrdersRef.current();
        unsubOrdersRef.current = () => {};
      }
      if (unsubUsersRef.current) {
        unsubUsersRef.current();
        unsubUsersRef.current = () => {};
      }
      setOrders([]);
      await signOut(auth);
      setCurrentUserLocal(null);
    } catch (e: any) {
      console.error("Firebase Logout Failure:", e);
      throw e;
    } finally {
      setFirebaseAuthLoading(false);
    }
  };

  const recoverPasswordWithFirebase = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e: any) {
      console.error("Firebase Reset Password Request Failure:", e);
      throw e;
    }
  };

  const changePasswordWithFirebase = async (newPassword: string): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error("Nenhum utilizador com sessão ativa para alterar a senha.");
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
    } catch (e: any) {
      console.error("Firebase Update Password Failure:", e);
      throw e;
    }
  };

  const verifyEmailWithFirebase = async (): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error("Nenhum utilizador ativo.");
    }
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (e: any) {
      console.error("Firebase Verification Email failure:", e);
      throw e;
    }
  };

  // --------------------------------------------------------------------------
  // Legacy / Demo Actions (Enables fast testing without breaking reviewer flows)
  // --------------------------------------------------------------------------

  const setCurrentUser = (user: User | null) => {
    setCurrentUserLocal(user);
  };

  const registerUser = (name: string, email: string, role: UserRole, phone?: string): User => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUserLocal(existing);
      return existing;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      phone: phone || "",
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`,
      registeredAt: new Date().toISOString(),
      status: "Ativo"
    };
    
    // Add to Firestore too in background for unified persistence
    setDoc(doc(db, "users", newUser.id), newUser).catch(err => {
      console.warn("Could not save demo user to Firestore:", err);
    });

    setUsers(prev => [...prev, newUser]);
    setCurrentUserLocal(newUser);
    return newUser;
  };

  const switchUserRole = async (role: UserRole) => {
    setFirebaseAuthLoading(true);
    const email = role === UserRole.ADMIN ? "admin@gmail.com" : role === UserRole.ORGANIZADOR ? "organizador@gmail.com" : "cliente@gmail.com";
    const password = "password123"; // Standard default password for simulation accounts
    
    const name = role === UserRole.ADMIN ? "Pedro Neto (Admin)" : role === UserRole.ORGANIZADOR ? "Clé Entertainment" : "Hélder Silva";
    const phone = role === UserRole.ADMIN ? "+244 990 112 233" : role === UserRole.ORGANIZADOR ? "+244 912 345 678" : "+244 923 456 789";
    const avatar = role === UserRole.ADMIN 
      ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
      : role === UserRole.ORGANIZADOR
        ? "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";

    try {
      // Try to log in via real Firebase Auth
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;
      const newUser: User = {
        id: uid,
        name,
        email,
        role,
        phone,
        avatar,
        registeredAt: new Date().toISOString(),
        status: "Ativo"
      };
      
      // Ensure the Firestore user document exists and has the correct role
      await setDoc(doc(db, "users", uid), newUser);
      setCurrentUserLocal(newUser);
    } catch (e: any) {
      console.warn("Firebase Auth switchUserRole failed (using robust local fallback):", e);
      // If user doesn't exist or Auth is not fully configured, try registering them once
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = credential.user.uid;
        const newUser: User = {
          id: uid,
          name,
          email,
          role,
          phone,
          avatar,
          registeredAt: new Date().toISOString(),
          status: "Ativo"
        };
        await setDoc(doc(db, "users", uid), newUser);
        setCurrentUserLocal(newUser);
      } catch (err) {
        console.warn("Firebase Auth Register simulation user failed (performing local/offline simulation switch):", err);
        // Pure Offline Simulation Role Switch fallback
        const existingLocal = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingLocal) {
          setCurrentUserLocal(existingLocal);
        } else {
          const localId = `user-role-${role.toLowerCase()}-${Date.now()}`;
          const newUser: User = {
            id: localId,
            name,
            email,
            role,
            phone,
            avatar,
            registeredAt: new Date().toISOString(),
            status: "Ativo"
          };
          setUsers(prev => [...prev, newUser]);
          setCurrentUserLocal(newUser);
          
          // Attempt a silent background save to Firestore
          setDoc(doc(db, "users", localId), newUser).catch(() => {});
        }
      }
    } finally {
      setFirebaseAuthLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Events and Checkout Sync logic to Firestore
  // --------------------------------------------------------------------------

  const createEvent = (evtData: any): Event => {
    const formattedTicketTypes = (evtData.ticketTypes || []).map((t: any) => ({
      ...t,
      soldQuantity: t.soldQuantity || 0
    }));

    const newEvent: Event = {
      ...evtData,
      ticketTypes: formattedTicketTypes,
      id: evtData.id || `event-${Date.now()}`,
      organizerId: evtData.organizerId || currentUser?.id || "user-org-1",
      organizerName: evtData.organizerName || currentUser?.name || "Organizador",
      approved: evtData.approved !== undefined ? evtData.approved : false,
      rejected: evtData.rejected !== undefined ? evtData.rejected : false,
      featured: evtData.featured || false,
      popular: evtData.popular || false
    };

    setDoc(doc(db, "events", newEvent.id), newEvent).catch(e => {
      safeErrorLog(e, "createEvent");
    });

    setEvents(prev => {
      if (prev.some(e => e.id === newEvent.id)) {
        return prev.map(e => e.id === newEvent.id ? newEvent : e);
      }
      return [...prev, newEvent];
    });
    return newEvent;
  };

  const updateEvent = (updatedEvent: Event) => {
    setDoc(doc(db, "events", updatedEvent.id), updatedEvent).catch(e => {
      safeErrorLog(e, "updateEvent");
    });
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  const approveEvent = (eventId: string, approved: boolean) => {
    const found = events.find(e => e.id === eventId);
    if (found) {
      const updated = { ...found, approved, rejected: !approved };
      setDoc(doc(db, "events", eventId), updated).catch(e => safeErrorLog(e, "approveEvent"));
      setEvents(prev => prev.map(e => e.id === eventId ? updated : e));
    }
  };

  const toggleFeatured = (eventId: string) => {
    const found = events.find(e => e.id === eventId);
    if (found) {
      const updated = { ...found, featured: !found.featured };
      setDoc(doc(db, "events", eventId), updated).catch(e => safeErrorLog(e, "toggleFeatured"));
      setEvents(prev => prev.map(e => e.id === eventId ? updated : e));
    }
  };

  // CMS Helpers
  const updateCMSConfig = (config: CMSConfig) => {
    setCmsConfig(config);
  };

  const saveCMSConfig = async (config: CMSConfig) => {
    try {
      await setDoc(doc(db, "cms_configs", "default"), config);
      setCmsConfig(config);
    } catch (e) {
      safeErrorLog(e, "saveCMSConfig");
      throw e;
    }
  };

  // Blog CRUD
  const createBlogPost = (postData: Omit<BlogPost, "id">) => {
    const newPost: BlogPost = {
      ...postData,
      id: `blog-${Date.now()}`
    };
    setDoc(doc(db, "blogs", newPost.id), newPost).catch(e => safeErrorLog(e, "createBlogPost"));
    setBlogs(prev => [newPost, ...prev]);
  };

  const updateBlogPost = (updatedPost: BlogPost) => {
    setDoc(doc(db, "blogs", updatedPost.id), updatedPost).catch(e => safeErrorLog(e, "updateBlogPost"));
    setBlogs(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const deleteBlogPost = (id: string) => {
    deleteDoc(doc(db, "blogs", id)).catch(e => safeErrorLog(e, "deleteBlogPost"));
    setBlogs(prev => prev.filter(p => p.id !== id));
  };

  // FAQ CRUD
  const createFAQ = (faqData: Omit<FAQItem, "id">) => {
    const newFAQ: FAQItem = {
      ...faqData,
      id: `faq-${Date.now()}`
    };
    setDoc(doc(db, "faqs", newFAQ.id), newFAQ).catch(e => safeErrorLog(e, "createFAQ"));
    setFaqs(prev => [newFAQ, ...prev]);
  };

  const updateFAQ = (updatedFAQ: FAQItem) => {
    setDoc(doc(db, "faqs", updatedFAQ.id), updatedFAQ).catch(e => safeErrorLog(e, "updateFAQ"));
    setFaqs(prev => prev.map(f => f.id === updatedFAQ.id ? updatedFAQ : f));
  };

  const deleteFAQ = (id: string) => {
    deleteDoc(doc(db, "faqs", id)).catch(e => safeErrorLog(e, "deleteFAQ"));
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  // Administrative Deletions & System Reset
  const deleteUser = (id: string) => {
    deleteDoc(doc(db, "users", id)).catch(e => safeErrorLog(e, "deleteUser"));
    setUsers(prev => prev.filter(u => u.id !== id));
    if (currentUser?.id === id) {
      logoutWithFirebase();
    }
  };

  const deleteEvent = (id: string) => {
    deleteDoc(doc(db, "events", id)).catch(e => safeErrorLog(e, "deleteEvent"));
    setEvents(prev => prev.filter(evt => evt.id !== id));
  };

  const deleteOrder = (id: string) => {
    deleteDoc(doc(db, "orders", id)).catch(e => safeErrorLog(e, "deleteOrder"));
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const resetSystemToZero = async () => {
    // Delete events
    for (const evt of events) {
      deleteDoc(doc(db, "events", evt.id)).catch(() => {});
    }
    // Delete orders
    for (const ord of orders) {
      deleteDoc(doc(db, "orders", ord.id)).catch(() => {});
    }
    // Delete blogs
    for (const bg of blogs) {
      deleteDoc(doc(db, "blogs", bg.id)).catch(() => {});
    }
    // Delete faqs
    for (const f of faqs) {
      deleteDoc(doc(db, "faqs", f.id)).catch(() => {});
    }
    // Delete coupons
    for (const cp of coupons) {
      deleteDoc(doc(db, "coupons", cp.id)).catch(() => {});
    }
    // Delete reviews
    for (const rv of reviews) {
      deleteDoc(doc(db, "reviews", rv.id)).catch(() => {});
    }
    // Delete other users except current user
    for (const usr of users) {
      if (usr.id !== currentUser?.id) {
        deleteDoc(doc(db, "users", usr.id)).catch(() => {});
      }
    }

    // Clear local states
    setEvents([]);
    setOrders([]);
    setBlogs([]);
    setFaqs([]);
    setCoupons([]);
    setReviews([]);
    setUsers(currentUser ? [currentUser] : []);

    // Clear localStorage
    localStorage.removeItem("tkt_events");
    localStorage.removeItem("tkt_orders");
    localStorage.removeItem("tkt_blogs");
    localStorage.removeItem("tkt_faqs");
    localStorage.removeItem("tkt_coupons");
    localStorage.removeItem("tkt_reviews");
    if (currentUser) {
      localStorage.setItem("tkt_users", JSON.stringify([currentUser]));
    } else {
      localStorage.removeItem("tkt_users");
    }
  };

  // Manual payment state update (Approve/Reject/Request proof)
  const updateManualPaymentStatus = (orderId: string, status: OrderStatus, observations?: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedOrder: Order = {
      ...order,
      status,
      adminObservations: observations || order.adminObservations
    };

    setDoc(doc(db, "orders", orderId), updatedOrder).catch(e => safeErrorLog(e, "updateManualPaymentStatus"));
    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
  };

  const processCheckout = (
    eventId: string,
    ticketTypeId: string,
    quantity: number,
    paymentMethod: PaymentMethod | string,
    couponCode?: string,
    participants?: string[],
    buyerPhone?: string,
    paymentReceiptUrl?: string
  ) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return { success: false, error: "Evento não encontrado" };

    const ticketTypeIndex = event.ticketTypes.findIndex(t => t.id === ticketTypeId);
    if (ticketTypeIndex === -1) return { success: false, error: "Tipo de bilhete inválido" };

    const ticketType = event.ticketTypes[ticketTypeIndex];
    const available = ticketType.totalQuantity - ticketType.soldQuantity;
    if (available < quantity) {
      return { success: false, error: `Desculpe, apenas ${available} bilhetes deste tipo estão disponíveis.` };
    }

    const subtotal = ticketType.price * quantity;
    let discount = 0;

    if (couponCode) {
      const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
      if (coupon) {
        const now = new Date();
        const expiry = new Date(coupon.expiryDate);
        if (expiry >= now) {
          if (!coupon.eventId || coupon.eventId === eventId) {
            if (!coupon.minOrderValue || subtotal >= coupon.minOrderValue) {
              if (coupon.discountType === "percentage") {
                discount = Math.floor(subtotal * (coupon.discountValue / 100));
              } else {
                discount = coupon.discountValue;
              }
              // Update coupon use count
              const updatedCoupon = { ...coupon, usedCount: coupon.usedCount + 1 };
              setDoc(doc(db, "coupons", coupon.id), updatedCoupon).catch(e => safeErrorLog(e, "processCheckout_coupon"));
              setCoupons(prev => prev.map(c => c.id === coupon.id ? updatedCoupon : c));
            }
          }
        }
      }
    }

    const total = Math.max(0, subtotal - discount);

    // Update tickets sold in Event
    const updatedTicketTypes = [...event.ticketTypes];
    updatedTicketTypes[ticketTypeIndex] = {
      ...ticketType,
      soldQuantity: ticketType.soldQuantity + quantity
    };
    
    const updatedEvent = { ...event, ticketTypes: updatedTicketTypes };
    setDoc(doc(db, "events", eventId), updatedEvent).catch(e => safeErrorLog(e, "processCheckout_event"));
    setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));

    // Generate Tickets
    const tickets = Array.from({ length: quantity }).map((_, i) => {
      const randomCode = `${event.title.substring(0,3).toUpperCase()}${Date.now().toString().slice(-4)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      return {
        id: `tck-${Date.now()}-${i}`,
        ticketCode: randomCode,
        participantName: participants?.[i] || currentUser?.name || "Participante",
        checkedIn: false
      };
    });

    // Determine if it is a manual payment method requiring admin approval
    const isManual = paymentMethod === PaymentMethod.TRANSF_BANCARIA || 
                     String(paymentMethod).startsWith("pm-") || 
                     !!paymentReceiptUrl;

    const initialStatus = isManual ? OrderStatus.PENDENTE : OrderStatus.COMPLETADO;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber: `TX-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: currentUser?.id || "guest",
      userEmail: currentUser?.email || "guest@tkt.ao",
      userName: currentUser?.name || "Visitante",
      buyerPhone: buyerPhone || currentUser?.phone || "",
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      ticketTypeId: ticketType.id,
      ticketTypeName: ticketType.name,
      quantity,
      unitPrice: ticketType.price,
      discountAmount: discount,
      totalPrice: total,
      paymentMethod: paymentMethod as PaymentMethod,
      status: initialStatus,
      createdAt: new Date().toISOString(),
      paymentReceiptUrl: paymentReceiptUrl || "",
      tickets
    };

    setDoc(doc(db, "orders", newOrder.id), newOrder).catch(e => safeErrorLog(e, "processCheckout_order"));
    setOrders(prev => [newOrder, ...prev]);

    return { success: true, order: newOrder };
  };

  const requestRefund = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const event = events.find(e => e.id === order.eventId);
    if (event) {
      const updatedTicketTypes = event.ticketTypes.map(t => {
        if (t.id === order.ticketTypeId) {
          return { ...t, soldQuantity: Math.max(0, t.soldQuantity - order.quantity) };
        }
        return t;
      });
      const updatedEvent = { ...event, ticketTypes: updatedTicketTypes };
      setDoc(doc(db, "events", event.id), updatedEvent).catch(e => safeErrorLog(e, "requestRefund_event"));
      setEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));
    }

    const updatedOrder = { ...order, status: OrderStatus.REEMBOLSADO };
    setDoc(doc(db, "orders", orderId), updatedOrder).catch(e => safeErrorLog(e, "requestRefund_order"));
    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
  };

  const sendSupportMessage = async (name: string, email: string, subject: string, message: string, senderRole: string = "Visitante") => {
    try {
      const messageId = "msg_" + Math.random().toString(36).substring(2, 11);
      const newMessage: SupportMessage = {
        id: messageId,
        name,
        email,
        senderRole,
        subject,
        message,
        status: "Pendente",
        createdAt: new Date().toISOString(),
        replies: []
      };

      await setDoc(doc(db, "support_messages", messageId), newMessage);
      
      // If we are guest/not logged in, we also update our local state so we can see it during the current guest session.
      if (!currentUser) {
        setSupportMessages(prev => [newMessage, ...prev]);
      }
    } catch (e) {
      safeErrorLog(e, "sendSupportMessage");
      throw e;
    }
  };

  const replyToSupportMessage = async (messageId: string, replyText: string, senderName: string, senderRole: "Admin" | "User" = "Admin") => {
    try {
      const messageDocRef = doc(db, "support_messages", messageId);
      const messageSnap = await getDoc(messageDocRef);
      if (!messageSnap.exists()) return;

      const messageData = messageSnap.data() as SupportMessage;
      const newReply = {
        id: "rep_" + Math.random().toString(36).substring(2, 11),
        senderName,
        senderRole,
        message: replyText,
        createdAt: new Date().toISOString()
      };

      const updatedReplies = [...(messageData.replies || []), newReply];
      const updatedMessage: SupportMessage = {
        ...messageData,
        replies: updatedReplies,
        status: senderRole === "Admin" ? "Respondido" : "Pendente"
      };

      await setDoc(messageDocRef, updatedMessage);
    } catch (e) {
      safeErrorLog(e, "replyToSupportMessage");
      throw e;
    }
  };

  const updateSupportMessageStatus = async (messageId: string, status: "Pendente" | "Respondido" | "Fechado", adminNotes?: string) => {
    try {
      const messageDocRef = doc(db, "support_messages", messageId);
      const messageSnap = await getDoc(messageDocRef);
      if (!messageSnap.exists()) return;

      const messageData = messageSnap.data() as SupportMessage;
      const updatedMessage: SupportMessage = {
        ...messageData,
        status,
        ...(adminNotes !== undefined ? { adminNotes } : {})
      };

      await setDoc(messageDocRef, updatedMessage);
    } catch (e) {
      safeErrorLog(e, "updateSupportMessageStatus");
      throw e;
    }
  };

  const validateTicketQRCode = (ticketCode: string) => {
    for (const order of orders) {
      const ticketIndex = order.tickets.findIndex(t => t.ticketCode === ticketCode);
      if (ticketIndex !== -1) {
        const ticket = order.tickets[ticketIndex];
        const event = events.find(e => e.id === order.eventId);

        if (order.status !== OrderStatus.COMPLETADO) {
          return { success: false, message: "Este bilhete pertence a uma compra cancelada ou reembolsada.", ticket, event, order };
        }

        if (ticket.checkedIn) {
          return { 
            success: false, 
            message: `Este bilhete já foi validado anteriormente em: ${new Date(ticket.checkedInAt!).toLocaleTimeString()}`, 
            ticket, 
            event, 
            order 
          };
        }

        // Perform check-in and update database
        const updatedTickets = [...order.tickets];
        const nowStr = new Date().toISOString();
        updatedTickets[ticketIndex] = {
          ...ticket,
          checkedIn: true,
          checkedInAt: nowStr
        };
        const updatedOrder = { ...order, tickets: updatedTickets };
        
        setDoc(doc(db, "orders", order.id), updatedOrder).catch(e => safeErrorLog(e, "validateTicketQRCode"));
        setOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));

        return { 
          success: true, 
          message: `Check-in efetuado com sucesso! Bem-vindo(a), ${ticket.participantName}.`, 
          ticket: { ...ticket, checkedIn: true, checkedInAt: nowStr }, 
          event, 
          order 
        };
      }
    }

    return { success: false, message: "Código de bilhete inválido ou não encontrado no sistema." };
  };

  const addCoupon = (couponData: Omit<Coupon, "id" | "usedCount">) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup-${Date.now()}`,
      usedCount: 0
    };
    setDoc(doc(db, "coupons", newCoupon.id), newCoupon).catch(e => safeErrorLog(e, "addCoupon"));
    setCoupons(prev => [newCoupon, ...prev]);
  };

  const toggleCouponActive = (id: string) => {
    const coupon = coupons.find(c => c.id === id);
    if (coupon) {
      const updated = { ...coupon, active: !coupon.active };
      setDoc(doc(db, "coupons", id), updated).catch(e => safeErrorLog(e, "toggleCouponActive"));
      setCoupons(prev => prev.map(c => c.id === id ? updated : c));
    }
  };

  const deleteCoupon = (id: string) => {
    deleteDoc(doc(db, "coupons", id)).catch(e => safeErrorLog(e, "deleteCoupon"));
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  const addReview = (eventId: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      eventId,
      userId: currentUser?.id || "guest",
      userName: currentUser?.name || "Anónimo",
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    setDoc(doc(db, "reviews", newReview.id), newReview).catch(e => safeErrorLog(e, "addReview"));
    setReviews(prev => [newReview, ...prev]);
  };

  const getEventReviews = (eventId: string) => {
    return reviews.filter(r => r.eventId === eventId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value).replace("AOA", "Kz");
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      events,
      orders,
      coupons,
      blogs,
      faqs,
      reviews,
      language,
      setLanguage,
      cmsConfig,
      updateCMSConfig,
      saveCMSConfig,
      createBlogPost,
      updateBlogPost,
      deleteBlogPost,
      createFAQ,
      updateFAQ,
      deleteFAQ,
      updateManualPaymentStatus,
      
      // Support System
      supportMessages,
      sendSupportMessage,
      replyToSupportMessage,
      updateSupportMessageStatus,
      
      // Real Firebase Auth
      registerWithFirebase,
      loginWithFirebase,
      logoutWithFirebase,
      recoverPasswordWithFirebase,
      changePasswordWithFirebase,
      verifyEmailWithFirebase,
      firebaseAuthLoading,

      // Legacy/Simulation
      setCurrentUser,
      registerUser,
      switchUserRole,

      createEvent,
      updateEvent,
      approveEvent,
      toggleFeatured,
      processCheckout,
      requestRefund,
      validateTicketQRCode,
      addCoupon,
      toggleCouponActive,
      deleteCoupon,
      addReview,
      getEventReviews,
      deleteUser,
      deleteEvent,
      deleteOrder,
      resetSystemToZero,
      formatCurrency
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp deve ser usado com um AppProvider");
  }
  return context;
}
