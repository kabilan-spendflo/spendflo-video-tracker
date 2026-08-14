export const DEFAULT_PLATFORM_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

export function defaultPlatforms(){
  return [
    { key: "youtube", label: "YouTube", icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.6-.46-5.3a3 3 0 0 0-2.1-2.1C18.9 4 12 4 12 4s-6.9 0-8.44.6a3 3 0 0 0-2.1 2.1C1 8.4 1 12 1 12s0 3.6.46 5.3a3 3 0 0 0 2.1 2.1C5.1 20 12 20 12 20s6.9 0 8.44-.6a3 3 0 0 0 2.1-2.1C23 15.6 23 12 23 12z"/><path d="M9.75 15.5v-7l6 3.5z" fill="var(--bg-1)"/></svg>' },
    { key: "instagram", label: "Instagram", icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>' },
    { key: "linkedin", label: "LinkedIn", icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5zM3 9.5h4V21H3zM9.5 9.5H13v1.57h.05c.5-.9 1.72-1.85 3.54-1.85 3.79 0 4.41 2.4 4.41 5.53V21h-4v-5.24c0-1.25-.02-2.86-1.75-2.86-1.76 0-2.03 1.36-2.03 2.77V21h-4z"/></svg>' },
    { key: "tiktok", label: "TikTok", icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.4 2.2 1.9 3.7 4.5 3.9v3.1c-1.6.1-3-.4-4.5-1.4v6.6c0 3.4-2.4 5.8-5.6 5.8-3.3 0-5.9-2.5-5.9-5.7 0-3.4 2.9-6 6.5-5.6v3.2c-.3-.1-.7-.2-1.1-.2-1.4 0-2.6 1.1-2.6 2.6 0 1.5 1.2 2.6 2.6 2.6 1.5 0 2.8-1.2 2.8-2.9V3z"/></svg>' },
    { key: "x", label: "X", icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 3H22l-7.6 8.7L23 21h-6.9l-5.4-6.6L4.4 21H1.3l8.1-9.3L1 3h7l4.9 6z"/></svg>' },
    { key: "website", label: "Website", icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/></svg>' },
  ];
}
