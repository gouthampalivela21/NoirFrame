import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider, isAuthorizedOwner, ADMIN_EMAIL, ADMIN_UID } from "../../lib/firebase.js";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  // Listen to Firebase Auth state with immediate single-owner verification
  useEffect(() => {
    const handleAuthError = (error) => {
      console.error("[Studio Auth Error]", error);
      setUser(null);
      setIsOwner(false);
      setAuthError(
        error?.code === "auth/invalid-api-key"
          ? "Studio sign-in is unavailable because the deployed Firebase API key is invalid. Update VITE_FIREBASE_API_KEY in Vercel and redeploy."
          : error?.message || "Studio sign-in could not connect to Firebase. Check the deployed Firebase configuration."
      );
      setLoading(false);
    };

    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        async (currentUser) => {
          setLoading(true);

          try {
            if (!currentUser) {
              setUser(null);
              setIsOwner(false);
              setLoading(false);
              return;
            }

            if (!currentUser.emailVerified) {
              await signOut(auth);
              setUser(null);
              setIsOwner(false);
              setAuthError(
                "Access Denied: Your admin email has not been verified. Please verify your email before accessing Studio OS."
              );
              setLoading(false);
              return;
            }

            const authorized = isAuthorizedOwner(currentUser);
            if (!authorized) {
              await signOut(auth);
              setUser(null);
              setIsOwner(false);
              setAuthError(
                `Access Denied: Account (${currentUser.email || currentUser.uid}) is not authorized as the Studio OS administrator.`
              );
              setLoading(false);
              return;
            }

            setUser(currentUser);
            setIsOwner(true);
            setAuthError("");
            setLoading(false);
          } catch (error) {
            handleAuthError(error);
          }
        },
        handleAuthError
      );
    } catch (error) {
      handleAuthError(error);
    }

    return () => unsubscribe();
  }, []);

  // Single-Owner Google OAuth Login
  const loginWithGoogle = useCallback(async () => {
    try {
      setAuthError("");
      setLoading(true);

      const credential = await signInWithPopup(auth, googleProvider);
      const signedInUser = credential.user;

      if (!signedInUser.emailVerified) {
        await signOut(auth);
        throw new Error("Access Denied: Unverified Google email address.");
      }

      if (!isAuthorizedOwner(signedInUser)) {
        await signOut(auth);
        throw new Error(
          `Access Denied: Google account (${signedInUser.email}) is not the authorized owner.`
        );
      }

      setUser(signedInUser);
      setIsOwner(true);
      return signedInUser;
    } catch (err) {
      setAuthError(err.message || "Google authentication failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out cleanly
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsOwner(false);
      setAuthError("");
    } catch (err) {
      console.error("[Logout Error]:", err);
    }
  }, []);

  const value = {
    user,
    isOwner,
    loading,
    authError,
    setAuthError,
    loginWithGoogle,
    logout,
    adminEmail: ADMIN_EMAIL,
    adminUid: ADMIN_UID,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
