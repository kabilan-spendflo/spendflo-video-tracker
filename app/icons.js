export function BrandMark({ className }) {
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

export function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20.4H24v7.2h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C33.9 6.2 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l5.9 4.3C13.8 15.1 18.5 12 24 12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C33.9 6.2 29.2 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.1 0 9.7-2 13.1-5.1l-6-5.1C29.1 35.4 26.7 36 24 36c-5.3 0-9.6-3.4-11.2-8.1l-6 4.6C9.6 39.7 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.2-2.2 4.1-4.2 5.5l6 5.1C40 34.9 44 30 44 24c0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
export function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}
export function BoardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="6" height="16" rx="1.5" /><rect x="9.5" y="4" width="6" height="10" rx="1.5" /><rect x="16" y="4" width="6" height="13" rx="1.5" />
    </svg>
  );
}
export function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
export function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
export function ChevronLeftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
export function ChevronRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function initialsOf(user) {
  var source = user.displayName || user.email || "?";
  return source.trim().slice(0, 2).toUpperCase();
}
