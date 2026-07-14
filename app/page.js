"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import {
  auth,
  db,
  googleProvider,
  isAllowedEmail,
  isFirebaseConfigured,
} from "@/lib/firebase";
import { mountTracker } from "@/lib/tracker";

function BrandMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0409C" />
          <stop offset="100%" stopColor="#C4145F" />
        </linearGradient>
      </defs>
      <path d="M50 10 L88 55 A6 6 0 0 1 82.5 64 L50 64 L17.5 64 A6 6 0 0 1 12 55 Z" fill="url(#brandGradient)" />
      <path d="M50 44 L80 79 A6 6 0 0 1 74.8 88 L25.2 88 A6 6 0 0 1 20 79 Z" fill="var(--pink-300)" opacity=".9" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20.4H24v7.2h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C33.9 6.2 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l5.9 4.3C13.8 15.1 18.5 12 24 12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C33.9 6.2 29.2 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.1 0 9.7-2 13.1-5.1l-6-5.1C29.1 35.4 26.7 36 24 36c-5.3 0-9.6-3.4-11.2-8.1l-6 4.6C9.6 39.7 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.2-2.2 4.1-4.2 5.5l6 5.1C40 34.9 44 30 44 24c0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}
function BoardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="6" height="16" rx="1.5" /><rect x="9.5" y="4" width="6" height="10" rx="1.5" /><rect x="16" y="4" width="6" height="13" rx="1.5" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function initialsOf(user) {
  var source = user.displayName || user.email || "?";
  return source.trim().slice(0, 2).toUpperCase();
}

export default function Page() {
  const [authState, setAuthState] = useState(
    isFirebaseConfigured ? "loading" : "unconfigured"
  ); // loading | signedOut | denied | signedIn | unconfigured
  const [user, setUser] = useState(null);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  const rootRef = useRef(null);
  const statsRef = useRef(null);
  const searchRef = useRef(null);
  const viewTableRef = useRef(null);
  const viewBoardRef = useRef(null);
  const addBtnRef = useRef(null);

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

  useEffect(() => {
    if (authState !== "signedIn") return;
    const cleanup = mountTracker(
      {
        root: rootRef.current,
        statsRow: statsRef.current,
        searchInput: searchRef.current,
        viewTableBtn: viewTableRef.current,
        viewBoardBtn: viewBoardRef.current,
        addVideoBtn: addBtnRef.current,
      },
      db
    );
    return cleanup;
  }, [authState]);

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
          <h1>Spendflo Videos</h1>
          <p>Video Marketing Master Tracker</p>
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
            <h1>Spendflo Videos</h1>
            <p>Video Marketing Master Tracker</p>
          </div>
        </div>
        <div className="top-actions">
          <div className="search">
            <SearchIcon />
            <input ref={searchRef} placeholder="Search videos..." />
          </div>
          <div className="view-toggle">
            <button ref={viewTableRef} type="button" className="active">
              <ListIcon /> List
            </button>
            <button ref={viewBoardRef} type="button">
              <BoardIcon /> Board
            </button>
          </div>
          <button className="btn-primary" ref={addBtnRef} type="button">
            <PlusIcon /> New video
          </button>
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

      <div className="stats" ref={statsRef} />
      <div ref={rootRef} />
    </div>
  );
}
