# Setup: Google login (spendflo.com only) + real-time sync + Vercel

This app uses **Firebase** for two things:

- **Auth** — "Sign in with Google", restricted to `@spendflo.com` accounts.
- **Firestore** — the video/team/label data. Every client has a live listener, so any
  edit (title, status, assignee, etc.) appears on every other open tab within
  a second or two, with no refresh needed.

You don't need a separate Google Cloud OAuth client — enabling Google sign-in
in Firebase Console creates and manages that for you.

## 1. Create the Firebase project

1. Go to https://console.firebase.google.com → **Add project** → name it (e.g.
   `spendflo-videos`) → keep/disable Google Analytics, your call → **Create project**.

## 2. Enable Google sign-in

1. In the left sidebar: **Build → Authentication → Get started**.
2. Under **Sign-in method**, click **Google** → toggle **Enable** → set a
   support email → **Save**.

That's it — no manual OAuth client ID/secret needed.

## 3. Create the Firestore database

1. **Build → Firestore Database → Create database**.
2. Choose **Start in production mode** (we'll paste in our own rules next)
   and pick a region close to your team.

## 4. Lock down access with security rules

1. In Firestore, open the **Rules** tab.
2. Replace the contents with what's in [`firestore.rules`](./firestore.rules)
   in this repo (it restricts every read/write to a verified `@spendflo.com`
   Google account — this is the real enforcement, independent of the app's
   client-side check).
3. Click **Publish**.

## 5. Register a web app and grab the config

1. **Project settings** (gear icon, top left) → **General** → scroll to
   **Your apps** → click the **Web** icon (`</>`).
2. Give it a nickname (e.g. `web`) → **Register app**. You do *not* need
   Firebase Hosting.
3. Copy the `firebaseConfig` object it shows you — you'll need every value.

## 6. Set your environment variables

1. Copy `.env.local.example` to `.env.local`:
   ```
   cp .env.local.example .env.local
   ```
2. Fill in the six `NEXT_PUBLIC_FIREBASE_*` values from the config you copied
   in step 5.
3. Run it locally to confirm sign-in works:
   ```
   npm run dev
   ```
   Open http://localhost:3000 — you should see the sign-in screen. Signing in
   with a non-`@spendflo.com` account should show an error and sign you back out;
   signing in with a `@spendflo.com` account should land you in the tracker.

## 7. Deploy to Vercel

1. Push this project to a GitHub repo (or use the Vercel CLI directly from
   this folder: `npx vercel`).
2. In the Vercel dashboard, import the repo (or follow the CLI prompts).
3. Add the same six `NEXT_PUBLIC_FIREBASE_*` variables under **Project
   Settings → Environment Variables** (Production **and** Preview).
4. Deploy.

## 8. Allow your Vercel domain in Firebase

Google Sign-In only works from domains Firebase trusts:

1. **Authentication → Settings → Authorized domains**.
2. Add your production domain (e.g. `spendflo-videos.vercel.app`, or your
   custom domain once attached). `localhost` is already allowed by default.

## How the domain restriction works (defense in depth)

- The Google consent screen itself is hinted to `spendflo.com` (via the `hd`
  parameter), so most non-Spendflo accounts won't even see it as an option.
- After sign-in, the app checks `user.email` ends with `@spendflo.com` and is
  verified — anyone who slips past the hint is immediately signed out with an
  error.
- Firestore's security rules re-check the same thing server-side on every
  read/write, so even a modified client can't bypass it.

## Data model (for reference)

- `videos/{id}` — one doc per video: title, contentType, taskType, priority,
  status, deadline, publishDate, links[], assigneeId, createdAt.
- `team/{id}` — one doc per person: name, color.
- `calendarItems/{id}` — one doc per content calendar entry (LinkedIn post,
  event, video, etc.): title, format, date, links[], createdAt.
- `config/labels` — one doc holding the editable option lists (statuses,
  content types, task types, priorities, platforms, calendar formats) and
  renamed column headers. Platforms are shared between the video tracker's
  Links field and the calendar's Links field.
