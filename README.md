# Aynu Web — Frontend

Next.js (App Router) + TypeScript + Tailwind. This first slice covers the
**auth flow**, wired to the real `fann-api` backend.

## What's here

```
src/
  app/
    auth/
      register/page.tsx        POST /auth/register
      login/page.tsx           POST /auth/login (+ Google/Apple buttons)
      verify-email/page.tsx    GET  /auth/verify-email?token=…  (emailed link lands here)
      forgot-password/page.tsx POST /auth/forgot-password
      reset-password/page.tsx  POST /auth/reset-password       (emailed link lands here)
      verify-phone/page.tsx    POST /auth/send-otp, /auth/verify-otp (WhatsApp OTP)
      callback/page.tsx        Lands here after Google/Apple OAuth — cookies are already set by
                                 then, this just asks GET /auth/me who they belong to
    (app)/                      Route GROUP — folder name in parens is invisible in the URL.
      layout.tsx                Auth-gates every page below + wraps it in <AppShell>
      dashboard/page.tsx         → /dashboard   (placeholder "you're logged in" home)
      messages/page.tsx          → /messages    (real inbox — see "Messaging" below)
      calendar/page.tsx          → /calendar    (real, artist only — see "Availability calendar" below)
      bookings/page.tsx           → /bookings    (real — see "Bookings" below)
      bookings/[id]/page.tsx      → /bookings/[id]
      admin/page.tsx               → /admin       (admin dashboard — see "Admin" below)
      admin/panel/page.tsx         → /admin/panel (tabbed management)
      admin/users/[id]/page.tsx    → /admin/users/[id]
      saved/page.tsx              → /saved       (planner only, real — see "Saved artists" below)
      profile/page.tsx            → /profile     (your own artist/planner profile, real data)
      profile/edit/page.tsx        → /profile/edit (edit form, both roles)
      notifications/page.tsx      → /notifications (real — see "Notifications" below)
      account/page.tsx            → /account     (real — see "Account settings" below)
    artists/[id]/page.tsx        Full artist profile (public)
    planners/[id]/page.tsx       Full planner/booker profile (public)
    messages/[id]/page.tsx       Chat thread (outside the (app) group — see "Messaging" below)
    search/page.tsx              Public search/browse (both directions — see below)
    page.tsx                    Root — sends you to /dashboard or /search
  components/
    auth/                       Shared auth-page pieces: AuthShell, FormField, Button, Banner, OtpInput, RoleToggle, Waveform
    shell/                      AppShell, TopNav, BottomNav, ComingSoon — the logged-in chrome
    search/                     ArtistCard, PlannerCard, SearchFilters, PlannerFilters, PublicHeader
    profile/                    ArtistProfileView, PlannerProfileView, ReviewList, SocialLinks, MediaStrip, MediaManager, ChipInput, LiveStatusBanner
    messaging/                  MessageList (date-grouped bubbles + read receipts)
    calendar/                   CalendarGrid, AddBlockForm, BlockedDatesList
    bookings/                   StatusBadge, ProposeBookingForm, ReviewForm
    admin/                      UserStatusBadge, Pagination, tabs/ (Users, Documents, Payments, Flags, Categories, Reviews, Audit)
  lib/
    api.ts                       fetch wrapper — sends/receives the httpOnly auth cookies
                                   (`credentials: "include"`), retries once on 401 via /auth/refresh
    auth-context.tsx             React context holding the logged-in user; every page reads/writes through this
    nav-config.ts                Per-role bottom-nav items (artist vs planner vs admin)
    use-nav-badges.ts            Polls real unread counts for the Messages/notification badges
    use-party-directory.ts       Best-effort user_id → name/avatar lookup (see "Bookings" gap below)
    artists-api.ts, planners-api.ts   Search, detail, own-profile get/update, availability CRUD;
                                       planners-api.ts also has getEventTypes() for the chip row
    bookings-api.ts               Bookings CRUD — list/create/respond/cancel
    reviews-api.ts                Public review lists + submission (note the user-id vs profile-id gotcha inside)
    messaging-api.ts              Conversations + messages — list/create/send/read
    notifications-api.ts          List/mark-read/mark-all-read
    notification-style.ts         Icon/color per notification type
    admin-api.ts                  Every /admin/* endpoint — stats, users, documents, payments, flags, categories, reviews, audit log
    media-api.ts                   Presign/upload-to-S3/confirm flow + set-primary/delete
    account-api.ts                 changePassword(), changeEmail(), deleteAccount()
    saved-api.ts                   Saved-artists list/save/unsave for planners
    users-api.ts                   getUserPublicInfo() — GET /users/:id/public-info
    use-public-info-map.ts         Batched, deduped version for lists (bookings)
    format.ts                     Relative time, date dividers, name initials — shared by inbox + thread
    calendar.ts                   Month-grid building + date-range formatting for the calendar
  types/                        auth.ts, artists.ts, planners.ts, reviews.ts, messaging.ts, bookings.ts, notifications.ts, admin.ts
```

## The logged-in shell

Every page under `(app)/` gets, for free:
- A **top bar** — wordmark, a notification bell (live unread dot from `GET /notifications/unread-count`),
  and a role-colored avatar (initials from your email until real profile display names are wired up).
- A **bottom nav** — artist gets Home/Search/Messages/Calendar/Profile, planner gets
  Home/Search/Messages/Saved/Profile (matching `05_artist_dashboard.html` / `06_booker_dashboard.html`
  exactly), admin gets none (the admin mockups don't have one either).
- The **Messages badge is real data** — it sums `unreadCount` across `GET /conversations`, not a
  placeholder number.
- **Auth gating** — the group's `layout.tsx` redirects to `/auth/login` if you're not logged in, so
  individual pages don't need to repeat that check.

The destination pages themselves (search, messages, profile, etc.) are intentionally just
"coming soon" placeholders for now — this slice was about the navigation chrome, not the screens
behind it.

## Why it's built this way (quick notes)

- **One place for API calls.** `lib/api.ts` is the only file that calls `fetch` against the
  backend. Every page goes through it, so if something about the backend changes (a header,
  the retry logic), there's one spot to fix.
- **Auth cookies, not localStorage.** The backend sets `accessToken`/`refreshToken` as httpOnly
  cookies now (see "Auth: httpOnly cookies" below for the full migration) — there's nothing for
  this frontend to store or attach client-side anymore. `lib/api.ts` just sends
  `credentials: "include"` on every request and lets the browser handle the rest.
- **OTP is phone *verification*, not passwordless login.** `/auth/send-otp` and
  `/auth/verify-otp` both require you to already be logged in — so the flow is
  register → verify email → log in → optionally verify phone, not "log in with WhatsApp code."
- **Design.** Colors, spacing, and the OTP-box pattern are lifted straight from
  `design/screens/*.html` so this doesn't look like a different product. The one new thing is
  the split-screen layout with a small waveform motif on the brand panel — nothing else in the
  mockups covered "logged-out" screens, so this was a free space to add one deliberate touch.

## Running it locally

### Option A — Docker (whole stack, no local Node needed)

The `fann-api` repo carries a `docker-compose.yml` that builds and runs
**both** repos plus Postgres and Redis. Clone the two repos side by side and
run everything from there:

```bash
# <parent>/fann-api  +  <parent>/Fann---Web  side by side
cd ../fann-api
docker compose up -d --build
```

Web lands on `http://localhost:3000`, talking to the API on
`http://localhost:4000/api/v1`. This repo's `Dockerfile` bakes
`NEXT_PUBLIC_API_URL` in at **build** time (Next.js inlines `NEXT_PUBLIC_*`
into the client bundle), so point it elsewhere with a build arg, not a
runtime env var.

### Option B — natively (Node ≥ 20 required — the build refuses Node 18)

1. Make sure the backend (`fann-api`) is running — by default on `http://localhost:4000`.
2. In this folder:
   ```bash
   npm install
   cp .env.local.example .env.local
   npm run dev
   ```
3. Open `http://localhost:3000`. You'll land on `/auth/login`.
4. To test with a seeded user: any of the 11 seeded accounts, password `Fann@dev2025`.
   (Check `migrations/009_fann_seed_data.sql` for the seeded emails.)

**A small gotcha fixed along the way:** `.gitignore`'s `.env*` pattern was also excluding
`.env.local.example` itself — the template step 2 above tells you to copy. It's fixed now
(`!.env.local.example` added), but if you ever find this repo missing that file again, that's why.

Two things that need real credentials before they'll work end-to-end:
- **Google/Apple login** — needs `GOOGLE_CLIENT_ID`/`APPLE_*` set in the backend's `.env`.
  Without them the backend still boots normally and everything else works; those two routes just
  answer 503, and the buttons surface that message rather than hanging.
- **WhatsApp OTP** — needs the Meta-approved template (see backend README's "known gaps").
  Until then, `/auth/verify-phone` will show whatever error the backend returns.

## Auth: httpOnly cookies

Auth tokens used to be plain JSON in the login response, stored in `localStorage` and attached
manually as an `Authorization: Bearer` header (see `lib/tokens.ts`, now deleted). That's been
migrated to httpOnly cookies set directly by the backend — a real security improvement, not a
refactor for its own sake: a token sitting in `localStorage` is readable by any JS that runs on
the page, including an XSS payload; an httpOnly cookie isn't readable by JS at all, so an XSS bug
elsewhere in the app can no longer walk off with a live session token.

**What changed here, concretely:**
- `lib/api.ts` sends `credentials: "include"` instead of an `Authorization` header, and no longer
  reads or writes any token value — there's nothing left to read, since httpOnly cookies aren't
  visible to JS by design.
- `AuthProvider`'s bootstrap check can no longer short-circuit locally ("no token in storage, skip
  the network call") — that was only possible because JS could see the token before. Now it always
  calls `GET /auth/me` on first load and lets a 401 mean "not logged in." Slightly more network
  chatter on first paint, in exchange for a real security property.
- `/auth/callback` (the OAuth landing page) no longer reads `accessToken`/`refreshToken` from the
  URL — the backend sets the cookies directly on the OAuth redirect now, so this page just asks
  `GET /auth/me` who that cookie belongs to. (Tokens in a redirect URL were a real, if minor, leak
  vector of their own — they end up in browser history and server access logs.)
- `lib/tokens.ts` is gone entirely; nothing replaces it, since there's nothing left to manage
  client-side.

**One behavior change worth knowing if you're testing this:** logging in from a REST client like
Postman/Insomnia now requires cookie jar support enabled (most have it), since the tokens don't
come back in the response body anymore.

See the backend README's matching section for the `SameSite`/CSRF reasoning behind this — it's a
backend-side decision, but it constrains what topology this frontend can be deployed under (same
parent domain as the API, not a fully unrelated one) unless that gets revisited later.

## Public search/browse

`/search` and `/artists/[id]` / `/planners/[id]` are **top-level, public routes** — reachable
whether or not you're logged in — because browsing the marketplace shouldn't require an account.
`/` sends logged-out visitors here instead of straight to `/auth/login`.

**A naming trap worth knowing about, in case it comes up again:** the two search mockups aren't
what their filenames suggest.
- `04_artist_search.html` ("Artist Search") is actually the **planner's** view — searching for
  *artists* to book. Category chips: Singers, Bands, DJs, Dancers, Comedians.
- `03_booker_search.html` ("Booker Search") is actually the **artist's** view — searching for
  *bookers* (venues/agencies/individuals) to reach out to. Filter chips are cities, not categories.

Both directions are wired to real data now:

| Route | Who sees it | Backed by |
|---|---|---|
| `/search` | Logged-out visitors, planners | `GET /artists`, `GET /categories` |
| `/search` | Artists | `GET /planners` (added specifically for this) |

`/search` includes debounced name/keyword search, a filter panel, and pagination against the
real `meta.total`/`meta.pages` for both directions. Both sides' chip rows are now backed by real
data: the artist side's category chips come from `GET /categories` (a reference table), and the
planner side's event-type chips come from the new `GET /planners/event-types` (distinct values
actually in use across `planner_profiles.event_types`, which is free-text JSONB with no reference
table of its own — this was a curated static list before). Both chip rows hide themselves
gracefully if the list comes back empty, rather than showing an empty row.

`/artists/[id]` and `/planners/[id]` now use the full profile layout — see below.

## Profile pages

`/artists/[id]` and `/planners/[id]` are the real `01_artist_profile.html` / `02_booker_profile.html`
layouts now, and `/profile` (bottom nav) shows the same view for your own profile, with an
"Edit profile" button → `/profile/edit`.

**What's real vs. what the mockups made up:** both mockups include several things with no backing
data — a heart/"Save" toggle, a fake "Hiring" status badge, a "Past events" gallery, an
"Artists we book" chip list on the booker side. None of that exists as real columns or endpoints,
so rather than fake a toggle that resets on refresh, these were left out. What's shown instead is
everything that *is* real:
- **Availability badge** — computed live: today's date checked against the artist's actual
  `availability_blocks` (which mean *unavailable*, not available — worth remembering if this comes
  up again; see `ArtistProfileView.tsx`'s `isUnavailableToday`).
- **Media** — split into real Photos/Videos only. The mockup shows four types (Photos/Videos/
  Reels/Audio), but the `media_type` column only has two values (`photo`, `video`) — there's no
  reels/audio distinction in the schema.
- **Reviews** — a real list from `GET /artists/:id/reviews` / `GET /planners/:id/reviews`, star
  ratings, reviewer name, date, "show more" past 5. **Gotcha:** these two endpoints key off the
  person's `users.id`, not the `artist_profiles.id` / `planner_profiles.id` used in the URL —
  `reviews-api.ts` has a comment flagging this, easy to get backwards.
- **Connect (social links)** — renders whatever platforms exist in `social_links` dynamically,
  not a fixed Instagram/YouTube/Spotify list.
- **Message CTA** — only shown to planners viewing an artist, since that's the only conversation
  direction the backend supports (`POST /conversations` 403s everyone else). It actually calls
  the API now rather than just linking to the still-placeholder `/messages`. Anonymous visitors
  get a "log in to message" prompt instead. The planner profile page has no Message CTA at
  all — there's no valid "message this planner" action for anyone under the current backend rules.

**Editing** (`/profile/edit`) is real too — `PUT /artists/me` / `PUT /planners/me`, including the
1–4 category picker (grouped by `category_groups`, capped client-side to match the backend's
`ArrayMaxSize(4)`) and a free-text chip input for languages/event types.

## Messaging inbox + thread

`/messages` (inbox) and `/messages/[id]` (thread) are real now — no more placeholder.

**One structural thing worth flagging:** `/messages/[id]` deliberately lives *outside* the
`(app)` route group, unlike every other logged-in page. The mockup (`08_message_thread.html`)
shows a dedicated full-height chat view with no bottom nav — makes sense, since a persistent tab
bar would just compete with the compose box. So the thread page skips `<AppShell>` entirely and
manages its own back button, auth redirect, and full-height layout. `/messages` (the inbox list)
still uses the normal shell.

**What's real:**
- Inbox: search (client-side filter over name + last message), All/Unread chips, real unread
  badges, polls every 10s.
- Thread: real messages via `GET /conversations/:id/messages`, sending via `POST .../messages`,
  read receipts (single/double check) from the real `read_at` column, marks the thread read on
  open, polls every 4s.
- The bottom-nav Messages badge (built in the shell slice) now polls every 10s instead of
  fetching once — otherwise it'd go stale after reading messages, since `(app)/layout.tsx`
  doesn't remount between page navigations.

**What the mockups made up, left out on purpose:** a live "typing…" indicator and an "Active now"
presence line (no websocket/presence layer exists — would need one to be real, not just decorative);
a "Booking discussion · [date] · [event]" context banner (conversations aren't linked to bookings
in the schema); a paperclip/attachment icon (`SendMessageDto` is just `{ body: string }`, no
attachment support). A "View profile" button in the thread header was also left out — the
conversation only carries `artist_id`/`planner_id` (**user** ids), and the public profile routes
are keyed by **profile** id, with no lookup endpoint to bridge the two.

**Gotcha carried over from the reviews endpoints:** same pattern here — `GET /conversations`
returns `artist_id`/`planner_id` as user ids, and there's no single endpoint that returns one
conversation with the other party's display name attached (`GET /conversations/:id` returns just
the raw row). The thread page works around this by reusing the inbox's list endpoint and finding
the matching row client-side — a bit wasteful, but avoids needing a backend change.

## Availability calendar

`/calendar` (artist-only — planners see a short explanatory note instead) is real now, and the
"Manage →" link on the Availability section of your own profile takes you there.

**Why day-tapping doesn't quite match the mockup:** `11_availability_calendar.html`'s script
tracks a `Set` of individual blocked dates and coalesces adjacent ones for display — a purely
client-side model. The real backend stores **ranges** (`availability_blocks` rows with a
`start_date`/`end_date` and a real `id`), created and deleted as whole blocks — there's no
"un-block just this one day out of a 5-day block" endpoint. So instead of the mockup's tap-any-day
toggle, tapping an available day opens a small start/end date form (prefilled with that day),
and removing a block deletes the whole real row via the list below — each row there maps 1:1 to
an actual `availability_blocks` id, not a coalesced guess.

**Also left out:** the mockup's blue "Booked" calendar state (confirmed bookings shown alongside
self-blocked dates). `availability_blocks` doesn't distinguish "artist blocked this themselves"
from "this is a confirmed booking" — that distinction would need the Bookings module wired in,
which isn't built on the frontend yet (see below). Only two real states are shown: available and
unavailable.

## Bookings

`/bookings` (list) and `/bookings/[id]` (detail) are real, plus a "Propose booking" action in
the message thread (planner-only) and accept/decline/cancel/review actions on the detail page.

**No mockup exists for this screen** — unlike every other slice so far, none of the 14
`design/screens/*.html` files cover a bookings list or detail view (the dashboard mockups show
"Recent messages" and "Quick actions," never bookings). So this one's new ground, built to match
the established visual language (chips, status-badge colors from the mockups' `.s-active`/
`.s-pending`/`.s-rejected` classes) rather than translating an existing screen.

**Where it lives:** there's no bottom-nav slot for it either (matches the mockups — artist nav is
Home/Search/Messages/Calendar/Profile, planner nav swaps Calendar for Saved, neither has room for
Bookings). Reachable via a card on the dashboard, and via "Propose booking" from within a
conversation thread — which matches how a real booking would start: message first, then formalize.

**What's wired up:**
- Planners propose a booking (event name, date, location, duration, fee, notes) from a thread —
  calls `POST /bookings` with `conversationId` prefilled from the thread.
- Artists accept/decline pending requests; either party can cancel a pending or accepted booking.
- Completed bookings get a "Leave a review" form (the real 5-dimension rating from
  `SubmitReviewDto`) — ties into the mutual-blind review mechanic from the backend memory notes.

**The recurring gap, now hit a third time:** same as the messaging thread header and the
dropped "View profile" link — there's no endpoint to resolve a bare `user_id` to a display name.
Bookings list/detail need to show "who this is with," but `listMine()`/`findOne()` return raw
`artist_id`/`planner_id` with no join. The workaround (`lib/use-party-directory.ts`) reuses
`GET /conversations` to build a lookup table, since that endpoint already resolves "the other
party" per thread — but it only finds someone if the current user has actually messaged them.
Bookings without a linked conversation (possible since `conversationId` is optional on create,
and true for one of the seeded example bookings) fall back to a plain "An artist"/"A planner"
label instead of a broken lookup.

This is the third time this exact gap has come up. A small `GET /users/:id/public-info`-style
endpoint (name + thumbnail + role, keyed by user id) would cleanly fix all three spots — the
thread header, the dropped profile link, and this fallback label. Want me to add it?

**Left out on purpose:** editing/re-proposing a declined or cancelled booking (the backend has no
update endpoint, only cancel — you'd create a new one), and any payment/deposit handling (out of
scope for the Bookings module as built).

## Notifications

`/notifications` is real, reachable via the bell icon in the top bar (whose unread dot has
actually worked since the shell slice; it just had nowhere to lead until now).

**Correction to how this started:** the first version of this slice said "every notification type
that exists is booking-related" — that was true of the backend at the time, but it was a gap, not
a design choice. Receiving a message, and admin actions like account approval/suspension, ID
verification, and payment review, all silently updated the database with **no notification to the
affected person at all**. Fixed on the backend as part of this slice:

- `messaging.service.ts` → `sendMessage()` now notifies the other participant (`new_message`).
  Deduped: if an unread `new_message` notification for that same conversation already exists, a
  second one doesn't pile on — otherwise a burst of messages before you check your inbox would
  show up as several near-identical entries.
- `admin.service.ts` now notifies the affected user from `updateUserStatus()` (`account_approved`/
  `account_suspended`/`account_banned`), `reviewDocument()` (`id_verified`/`id_rejected`), and
  `reviewPayment()` (`payment_confirmed`/`payment_rejected`). Previously these only wrote to
  `audit_log`, which is admin-only record-keeping — the user being acted on had no way to find out.

**Left out on purpose:** flag resolution notifications. `flags.target_id` is polymorphic (a
user id for profile flags, a message id for message flags per the schema comment), so "who to
notify" isn't a single obvious lookup the way the other three admin actions are — would need
target-type-aware resolution to notify the right person without misattributing. Flagged as a
possible follow-up rather than guessing.

**Click-through logic:** notifications with a `conversation_id` open the message thread;
`booking_id` opens the booking. Account/ID/payment notifications have neither — no dedicated
detail page exists for "your account status" or "your payment" yet, so opening one just marks it
read.

## Admin dashboard/panel

`/admin` (dashboard) and `/admin/panel` (tabbed management) are real. Admins get routed here
instead of `/dashboard` everywhere — root redirect, the wordmark link, and a guard on
`/dashboard` itself in case of a stale bookmark.

**Structure vs. the mockups:** `12_admin_dashboard.html` maps to `/admin` — real stat cards
(Total Artists, Total Planners, Pending Accounts, Open Flags, all from `GET /admin/stats`), real
queue counts, and a real recent-activity feed from the audit log. `14_admin_panel.html`'s tab bar
(Users / Payments / Flags / Audit log) maps to `/admin/panel`, extended with **three tabs beyond
the mockup**: Documents (ID verification is a separate operation from changing account status —
approving a document also flips `is_verified` on the artist profile, so it needed its own review
flow), Categories, and Reviews. Neither category management nor review moderation appears in any
of the 14 mockups, despite full CRUD existing on the backend — same situation as Bookings earlier:
real, necessary admin functions with no screen to translate, so built fresh in the established
style.

**What's real vs. deliberately left out:**
- Every queue count, every list, every action button calls a real endpoint — nothing here is
  placeholder data.
- **`13_admin_analytics.html` was not built as a separate page.** It's almost entirely fictional:
  page views, conversion rate, and sign-ups-over-time all need analytics/pageview tracking that
  doesn't exist anywhere in the schema — there's no table recording a page view or a signup
  event with a timestamp for trending. The *one* piece of that mockup backed by real data — the
  artist/planner split — is already covered by the Total Artists/Total Planners cards on `/admin`,
  so a whole separate page for just that felt thin. Building the rest would mean fabricating
  numbers, which I didn't want to do even for a screen that's "just for admins."
- **Flags now link to the profile for `profile`-type reports.** `flags.target_id` is polymorphic —
  a user id for profile flags, a message/conversation id for the other two — so for `profile`
  flags specifically, `target_id` is resolved via `GET /users/:id/public-info` (the same directory
  hook Bookings and Messages already use) to a real name and a link to `/artists/[id]` or
  `/planners/[id]`. `message`/`conversation` flags are still shown as a plain labeled id — those
  genuinely don't map to a single obvious profile to send someone to.
- Payment amount-mismatch detection (the mockup shows a flagged "$120, expected $240" row) isn't
  real either — `payments` has no "expected amount" column to compare against; the admin judges
  the reference code and amount manually.

## Account live status

Every own-profile view (`/profile`, and your own `/artists/[id]` / `/planners/[id]`) now opens with
a status banner explaining whether you're actually visible to the other side yet — `GET /artists`
and `GET /planners` both filter to `status = 'active'` only, so "not active" literally means
"can't be found."

**The actual approval model, for reference:** there's no in-app payment submission — a planner
transfers their membership fee externally (OMT/Wish/Western Union), an admin matches it manually
against the reference code, and confirms it via the Payments tab in `/admin/panel`. Artists don't
pay; their gate is ID document review. That's why the banner's copy differs by role:
- **Artist, pending:** "Awaiting Admin Approval" — waiting on ID document review.
- **Planner, pending:** "Awaiting Payment & Admin Confirmation" — waiting on the external transfer
  to be matched and confirmed.
- Suspended/banned get their own explanation too, reusing the same tone as the notification copy
  from that slice.

One small bug fixed while wiring this up: `SafeUser.status` in `types/auth.ts` was typed as
`"pending"`, but the real backend enum value is `"pending_review"` (confirmed against the
`user_status` Postgres enum). Nothing compared against it yet, so it hadn't caused a bug, but it
would have the moment anything did — fixed now before this feature needed the exact value.

## Media upload

Both `/profile/edit` forms (artist and planner) now have a real "Photos & videos" grid — upload,
delete, and set-primary-photo, all wired to the backend's actual S3 presign/confirm flow
(`POST /media/presign` → direct browser PUT to S3 → `POST /media/confirm`).

**A real gap this closed, on the backend:** the media upload endpoints were never role-restricted
to artists — `deleteMedia`'s thumbnail-sync helper already updated both `artist_profiles` and
`planner_profiles` — but nothing ever *queried* a planner's media back out. A planner could
upload a photo, it'd silently become their `thumbnail_url`, and then vanish — no gallery, no way
to see or manage what they'd uploaded. Fixed by mirroring `ArtistsService.findOne()`/`findMe()`'s
media-attaching query into `PlannersService`, so planners now get the same real gallery artists
already had (`PlannerProfileView` also gained the "Media" section it never had).

**Validation mirrors the backend's real limits, checked client-side first for instant feedback,
before the round trip:** photos ≤10MB, videos ≤250MB and ≤60 seconds, 20 items total per profile.
Video duration is read in-browser (loading the file into a hidden `<video>` element and reading
`.duration`) since the backend requires it up front, at both presign and confirm.

**S3 bucket CORS is documented, not fixable from here:** the presigned URL uploads go straight
from the browser to S3, so the bucket needs CORS configured to allow `PUT` from the frontend's
origin — that's an AWS console setting, outside this codebase either way. The exact policy JSON
to paste in is now written up in the backend repo's `docs/s3-cors-setup.md`. On this side,
`uploadMedia()` (`lib/media-api.ts`) now distinguishes the two failure modes that used to look
identical: `fetch()` to S3 rejecting outright (almost always the CORS case — the browser blocked
the request before it reached S3) versus a resolved-but-non-2xx response (CORS was fine, S3
rejected it for some other reason, e.g. an expired presigned URL). `MediaManager.tsx` shows the
CORS-specific message, pointing at that doc, instead of a generic "upload failed."

## Account settings

`/account` is real now. Before building it, I checked what the backend could actually support —
worth documenting since it shapes what's on the page:
- **No self-service email or logged-in password change existed at first.** Only
  forgot/reset-password (for a logged-out user) and phone OTP verification were ever built.
- **No account deletion endpoint exists at all.**

So I added two small, contained backend endpoints — `PATCH /auth/password` (current password
verified via bcrypt before allowing the change) and `PATCH /auth/email` — since both are basic
enough functionality that building the page without them felt wrong. I did **not** add account
deletion at the time: unlike password/email change, that's a genuinely consequential,
hard-to-reverse operation (what happens to their bookings, reviews, messages?) that deserved an
explicit product decision, not something to wire up unprompted. (It's since been added — see
"Account deletion" below — once that decision was made.)

**Email change doesn't take effect immediately.** `PATCH /auth/email` requires the current
password (mirroring password change), checks the new address isn't already claimed by another
account, and re-sends the *existing* verification-email flow — but to the new address, not the
current one — rather than trusting it right away. The current email keeps working for login the
entire time this is pending. Confirming via that link (the same `/auth/verify-email` page used at
signup) is what actually swaps the address over. The account page shows a "pending confirmation
for X — check that inbox" note whenever a change is outstanding, and clears once confirmed.

**Two more bugs fixed while building this** (same shape as the `pending`/`pending_review` one
from the live-status banner): `SafeUser` in `types/auth.ts` declared `phoneVerified`/
`emailVerified` as booleans, but `/auth/me` actually returns `phoneVerifiedAt`/`emailVerifiedAt`
as timestamp-or-null. Nothing about this was cosmetic — the dashboard's "Verify your phone
number →" prompt used `!user.phoneVerified`, which is `!undefined` since that field never
existed, so **the prompt was showing for every user with a phone number regardless of whether
they'd actually verified it.** Fixed both the type and the dashboard check.

## Saved artists (planner favorites)

`/saved` is real now too. Like Bookings and the admin Categories/Reviews tabs, this needed a
**small new backend feature** — there was no favorites/bookmarks table or endpoint at all.

Added: a `saved_artists` table (migration `006`), and a `saved` module (`GET/POST/DELETE
/saved-artists`, planner-only). The heart toggle now appears on artist search cards and the
artist detail page (planner viewers only) and actually persists — tap it while browsing, it
shows up on `/saved`, tap again to remove.

## The last five: public-info, flag notifications, account deletion, analytics, tests

Everything previously listed as "left on the table" is now built. In order:

### `GET /users/:id/public-info`

Added — name, thumbnail, role, and profile id for a bare user id, nothing else (no email/phone/
status). This replaced real workarounds rather than sitting unused alongside them:
- The messaging thread header no longer fetches the *entire* conversations list just to find one
  row — it now calls the raw `GET /conversations/:id` (already existed, just unused before) plus
  this new endpoint. It also gained a real "View profile" link, which was dropped earlier for lack
  of exactly this.
- Bookings' "who this is with" fallback (`use-party-directory.ts`, which only found someone if
  you'd already messaged them) is gone, replaced by `use-public-info-map.ts` — reliable regardless
  of whether a conversation exists.

### Flag-resolution notifications

`resolveFlag()` now sends real notifications. Two decisions worth knowing:
- **The reporter is always notified** ("Your report has been reviewed") — this sidesteps the
  target_id polymorphism entirely, since `reporter_id` is unambiguous regardless of whether the
  flag target is a profile, message, or conversation.
- **The flagged party is only notified when the decision is `actioned`**, not on `dismissed` —
  telling someone an unsubstantiated complaint about them existed serves no one. When it *is*
  actioned, `target_id` is resolved based on `target_type`: direct for `profile`, via the
  message's `sender_id` for `message`, via whichever conversation participant isn't the reporter
  for `conversation`.

### Account deletion

Soft delete only — `DELETE /auth/me` (password required to confirm; skipped for OAuth-only
accounts, since there's nothing to check and they already proved identity via their session).
Deliberately **not** a hard delete: bookings, reviews, and messages reference the user, and that
history should survive one party leaving. Reuses the existing `banned` status so every exclusion
check (search, login) already covers it, plus a new `deleted_at` column so the admin panel can
show "Deleted" instead of a confusing "Banned" for someone who left on their own. Email gets
anonymized (`deleted-{id}@deleted.aynu.local`) so the address can be reused.

### Real analytics

A real `/admin/panel?tab=analytics`, deliberately narrower than the mockup. `13_admin_analytics.
html` wanted page views, conversion rate, and sign-ups-by-region — none of that has any backing
data (nothing logs a page view or a funnel step anywhere). What's shown instead is derived
entirely from columns that already exist: daily signups for the last 30 days (split by role, from
`users.created_at`), and a top-cities breakdown (from `location_city` on both profile tables). No
new tracking infrastructure, no fabricated numbers.

### Tests

Neither project had any test infrastructure at all. Both now do — a real, working foundation, not
exhaustive coverage:

**Backend** (`npm test`, Jest): 53 tests across 8 suites. DTO validation (password strength regex,
review score bounds), and service-level unit tests against a hand-rolled Knex mock
(`src/test-utils/knex-mock.ts`) for the business logic most worth protecting: booking
status-transition guards, the review mutual-blind window and unlock-on-pair logic, the
new-message notification dedup, the flag-resolution paths, the planner event-types endpoint, and
the email-change flow (`requestEmailChange`/`verifyEmail`'s forked behavior). The 25 pre-existing
type errors that used to require `isolatedModules: true` as a workaround are fixed now (see the
backend README) — tests type-check against the real `tsconfig.json` directly, one less moving
part.

**Frontend** (`npm test`, Vitest): 24 tests across 3 files, covering the pure utility functions
that are cheap to test and easy to get subtly wrong — the calendar grid math, relative-time/
date-divider formatting (using fake timers for determinism), and the badge-color hash.

Neither suite touches components or does integration/e2e testing yet — that's the natural next
layer if this is worth investing in further, but requires more infrastructure (a test database for
the backend, React Testing Library + mocked fetch for the frontend) than made sense to add
unprompted alongside four other features.

## Next up

The original roadmap, plus every gap found along the way, plus the five items raised after that,
are all built now — plus a further round covering security-hardening and a few remaining gaps:
1. ~~A logged-in shell~~ ✅
2. ~~Public search/browse~~ ✅ — both directions
3. ~~Artist/booker profile pages~~ ✅ — view + edit, both roles
4. ~~Messaging inbox + thread~~ ✅
5. ~~Availability calendar~~ ✅
6. ~~Bookings~~ ✅
7. ~~Notifications~~ ✅
8. ~~Admin dashboard/panel~~ ✅
9. ~~Media upload~~ ✅
10. ~~Account settings~~ ✅
11. ~~Saved artists~~ ✅
12. ~~`GET /users/:id/public-info`~~ ✅
13. ~~Flag-resolution notifications~~ ✅
14. ~~Account deletion~~ ✅
15. ~~Real analytics~~ ✅
16. ~~Tests~~ ✅ — foundation, not exhaustive coverage
17. ~~Auth tokens migrated to httpOnly cookies~~ ✅ — see "Auth: httpOnly cookies" above
18. ~~Planner event-type chips backed by a real endpoint~~ ✅ — no longer a static list
19. ~~S3 CORS documented + CORS-specific upload error handling~~ ✅
20. ~~Self-service email change~~ ✅ — see "Account settings" above
21. ~~Admin Flags link to the profile for `profile`-type reports~~ ✅

What's left is genuinely open-ended at this point, not missing screens:
- Expanding test coverage — component tests, integration/e2e, a real test database.
- Applying the S3 CORS policy in the actual AWS console (`docs/s3-cors-setup.md` in the backend
  repo has the exact JSON) — that's an account-access step, not something fixable from either repo.
- Whatever surfaces from actually using this day to day.

## Do not run `npm audit fix --force` in this repo

`npm audit` reports 2 moderate advisories against `postcss 8.4.31`. That copy of postcss is
vendored *inside* Next.js, so it isn't ours to bump — and `--force` "resolves" it by downgrading
`next` from **16.2.10 to 9.3.3**, seven major versions back, which is dramatically worse than the
advisory it closes. 16.2.10 is the current Next release, so there is no clean fix today.

Leave these open and re-check when Next ships a patched postcss. (Backend dependencies were a
different story — those were real, reachable, and are now at zero; see the backend README's
audit section.)
