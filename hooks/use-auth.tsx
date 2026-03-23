'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithRedirect, 
  getRedirectResult,
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    // Handle the result of a redirect sign-in
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect Result Error:", error);
    });
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const loginWithGoogle = async () => {
    if (!auth) {
      toast.error("Firebase Auth not initialized. Check your environment variables.");
      return;
    }

    // Double check for Secure Context (HTTPS requirement for Firebase Auth)
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      const msg = "Google Login requires a secure connection (HTTPS). Please access your site via https://";
      toast.error(msg);
      throw new Error(msg);
    }

    const provider = new GoogleAuthProvider();
    // Use Redirect instead of Popup to avoid COOP/COEP header issues in Next.js
    try {
      setLoading(true);
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Login Error:", error);
      const errorMessage = error.code 
        ? `Auth Error (${error.code}): ${error.message}`
        : "Failed to initiate login. Please check your connection.";
      toast.error(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
