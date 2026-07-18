import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  updatePassword,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
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
  getDocFromServer
} from "firebase/firestore";

const firebaseConfig = {
  projectId: "gen-lang-client-0534429336",
  appId: "1:814497919426:web:427373d4fdb9d5f3c3665b",
  apiKey: "AIzaSyASW5lkw-tvslf0lgiw9LduQip2KqxJRgA",
  authDomain: "gen-lang-client-0534429336.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-plataformadevend-bb181c5c-8aa8-48e6-bea5-990c44920ecd",
  storageBucket: "gen-lang-client-0534429336.firebasestorage.app",
  messagingSenderId: "814497919426"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, "ai-studio-plataformadevend-bb181c5c-8aa8-48e6-bea5-990c44920ecd");

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errCode = (error as any)?.code || "";

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  const isTransient = 
    errCode === "unavailable" || 
    errCode === "cancelled" || 
    errCode === "aborted" ||
    errCode === "deadline-exceeded" ||
    errMsg.toLowerCase().includes("aborted") ||
    errMsg.toLowerCase().includes("abort") ||
    errMsg.toLowerCase().includes("unavailable") ||
    errMsg.toLowerCase().includes("could not reach") ||
    errMsg.toLowerCase().includes("connection failed") ||
    errMsg.toLowerCase().includes("signal is aborted") ||
    errMsg.toLowerCase().includes("offline");

  if (isTransient) {
    console.warn("Firestore Transient/Offline Warning (handled gracefully):", JSON.stringify(errInfo));
    return; // Do not crash the application or throw unhandled exceptions for transient offline or abort events
  }

  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function safeErrorLog(error: any, context?: string) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errCode = error?.code || "";
  
  const isTransient = 
    errCode === "unavailable" || 
    errCode === "cancelled" || 
    errCode === "aborted" ||
    errCode === "deadline-exceeded" ||
    errMsg.toLowerCase().includes("aborted") ||
    errMsg.toLowerCase().includes("abort") ||
    errMsg.toLowerCase().includes("unavailable") ||
    errMsg.toLowerCase().includes("could not reach") ||
    errMsg.toLowerCase().includes("connection failed") ||
    errMsg.toLowerCase().includes("signal is aborted") ||
    errMsg.toLowerCase().includes("offline");

  if (isTransient) {
    console.warn(`[Transient Warning] ${context || "Operation"} handled gracefully (aborted/transient):`, errMsg);
    return;
  }
  
  console.error(`[Error] ${context || "Operation"} failed:`, error);
}

export {
  app,
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
  getDocFromServer
};
export type { FirebaseUser };
