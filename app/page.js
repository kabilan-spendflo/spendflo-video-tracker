"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import {
  auth,
  googleProvider,
  isAllowedEmail,
  isFirebaseConfigured,
} from "@/lib/firebase";
import { BrandMark, GoogleIcon, initialsOf } from "./icons";
import VideosPanel from "./VideosPanel";
import CalendarPanel from "./CalendarPanel";

export default function Page() {
  const [authState, setAuthState] = useState(
    isFirebaseConfigured ? "loading" : "unconfigured"
  ); // loading | signedOut | denied | signedIn | unconfigured
  const [user, setUser] = useState(null);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("calendar"); // calendar | videos

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUser(null);
        setAuthState("signedOut");
        return;
      }
      if (!isAllowedEmail(u.email) || !u.emailVerified) {
        signOut(auth);
        setUser(null);
        setError("Only verified @spendflo.com Google accounts can access this tracker.");
        setAuthState("denied");
        return;
      }
      setUser(u);
      setAuthState("signedIn");
    });
    return () => unsub();
  }, []);

  async function handleSignIn() {
    setError("");
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      if (e && e.code !== "auth/popup-closed-by-user") {
        setError("Sign-in failed. Please try again.");
      }
    } finally {
      setSigningIn(false);
    }
  }

  function handleSignOut() {
    signOut(auth);
  }

  if (authState === "unconfigured") {
    return (
      <div className="center-screen">
        <div className="login-card">
          <BrandMark className="login-mark" />
          <h1>Firebase not configured</h1>
          <p>Add your Firebase web config to .env.local (see SETUP.md), then restart the dev server.</p>
        </div>
      </div>
    );
  }

  if (authState === "loading") {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (authState !== "signedIn") {
    return (
      <div className="center-screen">
        <div className="login-card">
          <BrandMark className="login-mark" />
          <h1>Kabilan&apos;s Board</h1>
          <p>Video and Brand Marketing Master Tracker</p>
          {error ? <div className="login-error">{error}</div> : null}
          <button className="google-btn" onClick={handleSignIn} disabled={signingIn}>
            <GoogleIcon />
            {signingIn ? "Signing in…" : "Sign in with Google"}
          </button>
          <div className="login-hint">Access is limited to @spendflo.com Google accounts.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">
          <BrandMark className="brand-mark" />
          <div className="brand-text">
            <h1>Kabilan&apos;s Board</h1>
            <p>Video and Brand Marketing Master Tracker</p>
          </div>
        </div>
        <div className="top-actions">
          <div className="main-tabs">
            <button
              type="button"
              className={activeTab === "calendar" ? "active" : ""}
              onClick={() => setActiveTab("calendar")}
            >
              Calendar
            </button>
            <button
              type="button"
              className={activeTab === "videos" ? "active" : ""}
              onClick={() => setActiveTab("videos")}
            >
              Videos
            </button>
          </div>
          <div className="top-user">
            <div className="avatar" style={{ background: "#E31C79" }} title={user.email}>
              {initialsOf(user)}
            </div>
            <button className="signout-btn" onClick={handleSignOut} type="button">
              Sign out
            </button>
          </div>
        </div>
      </div>

      {activeTab === "calendar" ? <CalendarPanel /> : <VideosPanel />}
    </div>
  );
}
