import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      if (!currentUser) {
        setUser(null);
        setIsOwner(false);
        setLoading(false);
        return;
      }

      // 1. Strict Email Verification Check
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

      // 2. Strict Single-Owner Identity Match (UID and/or designated admin email)
      const authorized = isAuthorizedOwner(currentUser);

      if (!authorized) {
        // Immediately kick unauthorized accounts out
        await signOut(auth);
        setUser(null);
        setIsOwner(false);
        setAuthError(
          `Access Denied: Account (${currentUser.email || currentUser.uid}) is not authorized as the Studio OS administrator.`
        );
        setLoading(false);
        return;
      }

      // Validated single-owner admin session
      setUser(currentUser);
      setIsOwner(true);
      setAuthError("");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Strict Single-Owner Login (Email & Password) — ZERO signup logic
  const loginWithEmail = useCallback(async (email, password) => {
    try {
      setAuthError("");
      setLoading(true);

      // Verify email matches target admin before even invoking Firebase if configured
      if (
        ADMIN_EMAIL &&
        String(email).toLowerCase().trim() !== String(ADMIN_EMAIL).toLowerCase().trim()
      ) {
        throw new Error(
          "Access Denied: Login is strictly restricted to the designated Studio Owner."
        );
      }

      const credential = await signInWithEmailAndPassword(auth, email, password);
      const signedInUser = credential.user;

      if (!signedInUser.emailVerified) {
        await signOut(auth);
        throw new Error(
          "Access Denied: Please verify your administrator email before logging in."
        );
      }

      if (!isAuthorizedOwner(signedInUser)) {
        await signOut(auth);
        throw new Error(
          "Access Denied: This account is not recognized as the Studio OS administrator."
        );
      }

      setUser(signedInUser);
      setIsOwner(true);
      return signedInUser;
    } catch (err) {
      setAuthError(err.message || "Failed to authenticate with Studio OS.");
      throw err;
    } finally {
      setLoading(false);
    }
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

  // Destructive Action Re-Authentication (Confirms admin password before critical deletions)
  const reauthenticate = useCallback(
    async (password) => {
      if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error("No active administrator session found.");
      }

      const cred = EmailAuthProvider.credential(auth.currentUser.email, password);
      await reauthenticateWithCredential(auth.currentUser, cred);
      return true;
    },
    []
  );

  const value = {
    user,
    isOwner,
    loading,
    authError,
    setAuthError,
    loginWithEmail,
    loginWithGoogle,
    logout,
    reauthenticate,
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
