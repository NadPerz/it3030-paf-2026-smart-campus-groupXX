# Smart Campus — AUTH & USERS · Stitch Prompt Set

> **How to use this file in Google Stitch**
> 1. Open [stitch.google.com](https://stitch.google.com) and start a new canvas.
> 2. Paste **Prompt 0 (Global Context)** first — this sets the product identity, palette and feel for the whole canvas.
> 3. Paste each numbered screen prompt **one at a time** (or in batches of 2–3 related screens). Never combine layout changes with component changes in the same prompt.
> 4. After each generation, screenshot the result before continuing.
> 5. To apply a theme change across all screens, Shift-click all screens first, then send a single style prompt.

---

## Prompt 0 — Global Context (paste this first)

```
Design a web app called "Smart Campus Hub" — a university campus operations portal used by students, staff, and administrators to manage facility bookings, incident tickets, and resource management. The users are university students and academic staff in Sri Lanka (SLIIT).

The overall feel: clean, trustworthy, professional. Inspired by Linear and Notion — spacious whitespace, crisp typography, subtle shadows. Not playful, not corporate-heavy.

Platform: desktop web app, 1440px wide canvas. Design both the full-page views and any modal/drawer overlays.

Global design tokens to use across every screen:
- Background: #F8FAFC
- Surface (cards, panels): #FFFFFF
- Primary action: #1D4ED8
- Primary hover: #1E40AF
- Danger: #DC2626
- Warning / amber: #D97706
- Success / green: #16A34A
- Border: #E5E7EB
- Text primary: #111827
- Text secondary: #6B7280
- Text muted: #9CA3AF
- Sidebar background: #1E293B

Status badge tokens:
- PENDING — background #FFFBEB, text #92400E
- ACTIVE — background #F0FDF4, text #166534
- SUSPENDED — background #FEF2F2, text #991B1B

Role badge tokens:
- USER — background #EFF6FF, text #1E40AF
- ADMIN — background #F5F3FF, text #6D28D9
- TECHNICIAN — background #F0FDF4, text #15803D

Typography: Inter font family. Page titles 22px weight 700. Section labels 12px weight 600 uppercase letter-spacing 0.8px. Body 14px weight 400. Badges 12px weight 600. Captions 12px weight 400.

Spacing system: 24px card padding, 32px section gap, 16px form field gap, 56px table row height. Border radius: 12px cards, 8px buttons and inputs, 20px badge pills.
```

---

## Prompt 1 — A1: Login / Landing Page

> **What this screen is:** The single unauthenticated entry point. The only action is "Continue with Google". No password fields, no sign-up link.

```
Design a login page for Smart Campus Hub. Platform: desktop web, 1440px wide.

Layout: full-viewport centered layout. Background #F8FAFC. A single white card centered both horizontally and vertically, max-width 440px, border-radius 16px, box-shadow 0 4px 24px rgba(0,0,0,0.08), padding 48px.

Inside the card from top to bottom:
1. University logo placeholder — a rounded square icon 48x48px in #1D4ED8 with a white building/campus glyph, centered.
2. App name "Smart Campus Hub" — 28px, font-weight 700, color #111827, centered, margin-top 16px.
3. A thin 1px horizontal divider in #E5E7EB, margin 20px 0.
4. Subtitle text — "One platform for bookings, resources and support across your campus." — 15px, color #6B7280, text-align center, line-height 1.6.
5. A "Continue with Google" button — full-width, 48px tall, border-radius 8px, white background, 1.5px solid border #E5E7EB, flex row with a Google G icon (multicolor SVG, 20px) on the left, label "Continue with Google" in 15px font-weight 600 color #111827, centered with gap 10px between icon and text. On hover: border-color #4285F4, background #F0F4FF.
6. A loading state variant of the same button: replace the Google icon with a 16px circular spinner in #1D4ED8, label changes to "Redirecting…", button is disabled with opacity 0.65.
7. An inline error banner below the button — only shown when auth fails. Red-tinted pill: background #FEF2F2, border 1px solid #FECACA, border-radius 8px, padding 10px 14px, text "Sign-in failed. Please try again." in 13px color #991B1B with a warning triangle icon on the left. Hidden by default.
8. Legal caption at the bottom — "By signing in you accept the Campus Terms of Use." — 12px, color #9CA3AF, text-align center, margin-top 24px.

Show both the default state and the loading state side by side as two artboards on the canvas.
```

---

## Prompt 2 — A2: OAuth Callback Screen

> **What this screen is:** A transient loading screen shown while the JWT token is being processed. Users see it for under 1 second normally. Must have a visible error fallback.

```
Design two states of an OAuth callback loading screen for Smart Campus Hub. Desktop web, 1440px.

Both states share the same full-viewport centered layout, background #F8FAFC, centered white card 440px wide, border-radius 16px, padding 48px, box-shadow 0 4px 24px rgba(0,0,0,0.08).

State 1 — Loading:
- A 48px animated circular spinner in #1D4ED8 centered, with a visible spin animation ring (3px stroke, partial arc).
- Below: "Signing you in…" — 18px font-weight 600 color #111827, text-align center, margin-top 20px.
- Below: "This will only take a moment." — 13px color #9CA3AF, text-align center, margin-top 8px.

State 2 — Error fallback:
- A 48px warning circle icon in #D97706 (amber), centered.
- "Sign-in failed" — 20px font-weight 700 color #111827, centered, margin-top 20px.
- "We couldn't complete your sign-in. Please try again." — 14px color #6B7280, centered, margin-top 8px, line-height 1.6.
- A "Back to Login" button — full-width, 48px, background #1D4ED8, color white, border-radius 8px, 15px font-weight 600, margin-top 24px.

Place both states side by side on the canvas with labels "Loading State" and "Error State".
```

---

## Prompt 3 — A3: Pending Approval Gate

> **What this screen is:** Shown to users whose account was just created via Google OAuth but awaits admin approval. Auto-polls every 10s. Has a blurred dashboard preview below the card as a visual motivator.

```
Design a "pending approval" gate screen for Smart Campus Hub. Desktop web, 1440px. Background #F8FAFC.

Layout: vertically stacked, centered. Top: a white card. Below it: a blurred dashboard preview strip.

Main card — max-width 480px, centered, white background, border-radius 16px, padding 40px, box-shadow 0 4px 24px rgba(0,0,0,0.08), text-align center:

1. Hourglass icon — 64px, amber color #D97706, centered.
2. Heading: "Account Pending Review" — 22px font-weight 700 color #111827, margin-top 16px.
3. Body text: "Your account has been created. An administrator will review and approve it shortly." — 15px color #6B7280, line-height 1.6, margin-top 8px.
4. User info chip — rounded card inside the card, background #EFF6FF, border-radius 10px, padding 12px 16px, flex row, align-items center, gap 12px, margin-top 20px: left side shows a 44px circular avatar with a blue (#1D4ED8) initials fallback; right side shows user name in 14px font-weight 600 color #111827 and email in 13px color #6B7280, text-align left.
5. Info box — background #FFFBEB, border 1px solid #FCD34D, border-radius 10px, padding 14px 16px, margin-top 16px, text-align left: bold label "What happens next?" in 13px font-weight 600 color #92400E; ordered list below in 13px color #78350F line-height 1.8: "1. An administrator will review your account", "2. This page checks your status automatically every 10 seconds", "3. You'll be redirected automatically once approved."
6. Animated status indicator — flex row centered, gap 8px, margin-top 16px: a 8px pulsing dot in #16A34A (green, CSS pulse animation), text "Checking approval status…" in 13px color #9CA3AF.
7. Inline message zone — a rectangular chip, background #F0F9FF, border-radius 8px, padding 10px 14px, text "ℹ Still pending — check back soon." in 13px color #0369A1. Show it as a visible state.
8. "Check Now" button — full-width, 48px, background #1D4ED8, color white, border-radius 8px, font-weight 600, margin-top 16px.
9. "Sign Out" button — full-width, 48px, background transparent, border 1.5px solid #E5E7EB, color #374151, border-radius 8px, font-weight 600, margin-top 8px.

Blurred dashboard preview strip (below the main card, margin-top 32px):
- max-width 760px, centered, position relative.
- A white panel, border-radius 12px, padding 20px, box-shadow 0 2px 8px rgba(0,0,0,0.06), filter blur(6px), opacity 0.35, pointer-events none.
- Inside: a 4-column grid of placeholder feature cards (Resources, Bookings, Tickets, Notifications) each with a small icon and label, background #F8FAFC, border-radius 8px, padding 20px, text-align center.
- Overlaid centered on top of the blurred strip: a 32px lock icon emoji 🔒 in full opacity.
```

---

## Prompt 4 — A4: Suspended Account Gate

> **What this screen is:** Shown to users whose account has been suspended by an admin. Same auto-poll as A3. Red colour scheme. Includes a contact helpdesk link.

```
Design a "suspended account" gate screen for Smart Campus Hub. Desktop web, 1440px. Background #F8FAFC.

Layout: full-viewport centered. Single white card, max-width 480px, border-radius 16px, padding 40px, box-shadow 0 4px 24px rgba(0,0,0,0.08), text-align center.

Inside the card top to bottom:
1. Shield-X icon (or lock with X) — 64px, color #DC2626, centered.
2. Heading: "Account Suspended" — 22px font-weight 700 color #DC2626, margin-top 16px.
3. Body: "Your access to Smart Campus has been suspended by an administrator." — 15px color #6B7280, line-height 1.6, margin-top 8px.
4. User info chip — same layout as A3 pending screen but with background #FFF5F5 (rose-tinted). Avatar initials fallback in #DC2626.
5. Info box — background #FFF5F5, border 1px solid #FECACA, border-radius 10px, padding 14px 16px, text-align left: bold label "What this means" in 13px font-weight 600 color #991B1B; unordered list in 13px color #7F1D1D line-height 1.8: "Your access to all features has been revoked", "This page checks your status automatically every 10 seconds", "You'll be redirected automatically if reactivated."
6. Contact line — "Need help? " followed by a mailto link "it-support@university.ac.lk" in #1D4ED8 underline, 13px color #6B7280, margin-top 12px.
7. Animated status indicator — same pulsing dot pattern as A3 but dot color #6B7280.
8. Inline message zone — same chip pattern as A3 but background #FEF2F2, text color #991B1B, text "Account is still suspended. Contact support if this is a mistake."
9. "Check Status" button — full-width, 48px, background #1D4ED8 (blue, not red — calmer), color white, border-radius 8px, font-weight 600, margin-top 16px.
10. "Sign Out" button — ghost/outline style, same as A3.
```

---

## Prompt 5 — U1: My Profile Page

> **What this screen is:** Full authenticated user profile. Has the shared Navbar at top. Editable display name only. Email, role and member-since are read-only.

```
Design a "My Profile" page for Smart Campus Hub. Desktop web, 1440px. Includes the top navigation bar.

Top navigation bar — full width, height 60px, background #1D4ED8, padding 0 32px, flex row space-between align-items center:
- Left: logo text "Smart Campus Hub" in 18px font-weight 700 white.
- Center: nav links "Resources", "Bookings", "Tickets" in 14px white with 24px gap between. Add a notifications bell icon (outline, white, 20px) with a small circular red badge showing "3".
- Right: "Admin Panel" pill badge (white text, white semi-transparent border), then a user avatar (32px circle) + name "Jane Smith" in 14px white, then a "Logout" ghost button in 13px white outline.

Page body — background #F8FAFC, padding 40px 0:
A centered content column, max-width 600px, margin 0 auto.

Back link at top: "← Back" in 14px color #1D4ED8, margin-bottom 24px, flex row align-items center with left chevron icon.

Profile header card — white, border-radius 12px, padding 24px, box-shadow 0 1px 4px rgba(0,0,0,0.06), flex row align-items center, gap 20px:
- Left: 96px circular avatar with 3px solid border #1D4ED8. Below the avatar: a role badge pill for "USER" — background #EFF6FF, text #1E40AF, border-radius 20px, 12px font-weight 600, padding 3px 12px.
- Right: user name "Jane Smith" in 20px font-weight 700 color #111827. Email "jane.smith@university.ac.lk" in 14px color #6B7280, margin-top 4px. Status badge "ACTIVE" — background #F0FDF4, text #166534, border-radius 20px, 12px font-weight 600, padding 3px 12px, margin-top 8px, inline. Then "Member since January 15, 2026" in 12px color #9CA3AF, margin-top 6px. Small caption below email: "(Profile picture managed by Google)" in 11px color #9CA3AF italic.

Edit form card — white, border-radius 12px, padding 24px, box-shadow 0 1px 4px rgba(0,0,0,0.06), margin-top 16px:
- Section label "EDIT PROFILE" — 12px font-weight 600 uppercase letter-spacing 0.8px color #9CA3AF, margin-bottom 20px.
- Field "Display Name" — label 12px font-weight 600 color #6B7280 uppercase; below it a text input, full-width, height 44px, border-radius 8px, border 1.5px solid #E5E7EB, padding 0 12px, 14px color #111827, value "Jane Smith". On focus: border-color #1D4ED8.
- Field "Email (managed by Google)" — same label style; value "jane.smith@university.ac.lk" shown as plain 14px text color #9CA3AF (read-only, no input box).
- Field "Role (assigned by admin)" — same label; value shown as role badge pill "USER" (background #EFF6FF, text #1E40AF).
- Field "Member Since" — same label; value "January 15, 2026" in 14px color #9CA3AF.
- Success message zone — "✓ Name updated successfully!" in 13px color #16A34A, font-weight 600, visible state.
- Error message zone — "Failed to update. Please try again." in 13px color #DC2626, visible state.
- Button row at bottom: "Edit Name" button — 140px wide, 44px tall, background #1D4ED8, color white, border-radius 8px, font-weight 600. When editing show "Save Changes" (blue, same) + "Cancel" (ghost, #E5E7EB border) side by side.

Show the page in two artboard states side by side: default (view mode) and editing mode (input active, Save/Cancel buttons visible).
```

---

## Prompt 6 — U2: User Management List (Admin)

> **What this screen is:** Admin-only page inside the dark sidebar AdminLayout. Includes stat cards, pending banner, filter chips, search bar, and a data table with overflow action menu per row.

```
Design an admin User Management page for Smart Campus Hub. Desktop web, 1440px. Two-column layout: left sidebar + main content.

LEFT SIDEBAR — 260px wide, height 100vh (minus 60px top navbar), background #1E293B:
- Top section: admin user info, padding 24px 20px, border-bottom 1px solid rgba(255,255,255,0.10). Flex row gap 12px: 42px circular avatar with blue initials fallback; right: name "Jane Smith" in 14px font-weight 600 white; role badge below name — "ADMIN" in 11px font-weight 600, background rgba(109,40,217,0.2), color #C4B5FD, border-radius 10px, padding 2px 8px inline-block.
- Section label "MANAGEMENT" — 11px font-weight 600 uppercase letter-spacing 1px color rgba(255,255,255,0.35), padding 16px 20px 8px.
- Menu items list — each item 44px tall, padding 0 20px, flex row gap 12px, font-size 14px:
  - "User Management" (active): background rgba(255,255,255,0.10), border-left 4px solid #3B82F6, color white, icon "👥".
  - "Resource Management" (inactive): color rgba(255,255,255,0.35), cursor not-allowed, icon "🏛️", "Soon" badge right-aligned in 10px rgba(255,255,255,0.2) bg.
  - "Booking Management" same inactive style, icon "📅".
  - "Ticket Management" same inactive style, icon "🔧".
  - "Notification Management" same inactive style, icon "🔔", but show a small amber "3" badge to indicate pending count.
- Bottom footer: "Smart Campus Hub © 2026" in 11px color rgba(255,255,255,0.25), padding 16px 20px.

MAIN CONTENT AREA — flex 1, background #F8FAFC, padding 32px, overflow auto:

Page header row — flex space-between align-items center, margin-bottom 8px:
- Left: "User Management" in 22px font-weight 700 color #111827.
- Right: amber clickable badge "⚠ 3 Pending" — background #FFFBEB, border 1px solid #FCD34D, border-radius 20px, padding 6px 14px, 13px font-weight 600 color #92400E.

Subtitle: "Manage accounts, roles and campus access." in 14px color #6B7280, margin-bottom 24px.

Pending warning banner — full-width, background #FFFBEB, border 1px solid #FCD34D, border-radius 10px, padding 12px 16px, flex row align-items center, gap 10px, margin-bottom 24px:
- Warning icon ⚠️ 18px amber.
- Text "3 users are waiting for approval" in 14px color #92400E font-weight 500.
- Right-aligned "Review Now" button — background #F59E0B, color white, border-radius 6px, padding 5px 14px, 13px font-weight 600.

Stats row — 4-column grid, gap 16px, margin-bottom 24px:
- Card 1: "Total Users" value "47" — background #EFF6FF, border-left 4px solid #1D4ED8, border-radius 10px, padding 16px 20px. Number 28px font-weight 700 color #1D4ED8. Label 13px color #6B7280.
- Card 2: "Active" value "38" — background #F0FDF4, border-left 4px solid #16A34A. Number color #16A34A.
- Card 3: "Pending" value "3" — background #FFFBEB, border-left 4px solid #D97706. Number color #D97706.
- Card 4: "Suspended" value "6" — background #FEF2F2, border-left 4px solid #DC2626. Number color #DC2626.

Search + filter bar — flex row, gap 12px, margin-bottom 16px:
- Search input — flex 1, height 40px, border-radius 8px, border 1.5px solid #E5E7EB, padding 0 12px 0 36px, placeholder "Search name or email…", magnifier icon inside left, 14px color #111827.
- Filter chips — pill-shaped toggle buttons: "ALL (47)" active state: background #1D4ED8 text white. "ACTIVE (38)", "PENDING (3)", "SUSPENDED (6)" inactive: white bg, border 1.5px solid #E5E7EB, color #6B7280. Each chip 36px tall, border-radius 20px, 13px font-weight 500.

Data table — white, border-radius 12px, box-shadow 0 1px 4px rgba(0,0,0,0.06), overflow hidden:
- Sticky thead row: background #F8FAFC, border-bottom 2px solid #E5E7EB. Columns: User | Email | Role | Status | Joined | Actions. All 12px font-weight 600 uppercase color #6B7280, padding 12px 16px.
- Row 1 (ACTIVE user): 56px tall, white bg, border-bottom 1px solid #F3F4F6.
  - User cell: flex row gap 10px, 36px circular avatar, name "Jane Smith" 14px font-weight 500 color #111827.
  - Email: "jane@university.ac.lk" 14px color #6B7280.
  - Role: "USER" badge pill — background #EFF6FF, text #1E40AF, 12px font-weight 600, border-radius 20px, padding 3px 10px.
  - Status: "ACTIVE" badge — background #F0FDF4, text #166534, same pill style.
  - Joined: "Jan 2026" 13px color #9CA3AF.
  - Actions: "···" icon button (three dots), 32px circle, border 1px solid #E5E7EB, hover background #F3F4F6.
- Row 2 (PENDING user): background #FFFBEB (amber tint). Same columns. Status badge: PENDING amber. Actions menu visible open in a dropdown popover to the right of the button: white panel, border-radius 10px, box-shadow 0 4px 16px rgba(0,0,0,0.12), padding 6px 0, min-width 160px. Items: "✓ Approve" (14px, green #16A34A), "🗑 Delete" (14px, red #DC2626) with a thin divider between them.
- Row 3 (ADMIN user — current logged-in admin): "You" caption next to the name in 11px color #9CA3AF. Actions column: "—" (dash, no actions on self).
- Row 4 (SUSPENDED user): background white. Status badge: SUSPENDED red. Actions dropdown items: "▶ Reactivate" (blue), "🗑 Delete" (red).

Show the table with the Row 2 actions dropdown open so the popover is visible.
```

---

## Prompt 7 — U2 Modal: Suspend / Delete Confirmation

> **What this overlay is:** A centered modal that replaces `window.confirm()`. Opens when admin picks a destructive action from the row menu.

```
Design two confirmation modal overlays for Smart Campus Hub admin interface. Desktop web.

Both modals share: a full-viewport dim backdrop rgba(0,0,0,0.40), centered white modal panel, max-width 420px, border-radius 16px, padding 32px, box-shadow 0 8px 32px rgba(0,0,0,0.16).

Modal 1 — Suspend User:
- Warning icon circle — 48px circle background #FFFBEB, centered, containing a pause/pause-circle icon in #D97706 28px.
- Heading "Suspend User" — 18px font-weight 700 color #111827, margin-top 16px, text-align center.
- Body "Are you sure you want to suspend Jane Smith? They will lose all access until reactivated." — 14px color #6B7280, text-align center, line-height 1.6, margin-top 8px.
- Button row — flex row gap 12px, margin-top 24px, justify-content center:
  - "Cancel" button — 140px, 44px, ghost style, border 1.5px solid #E5E7EB, color #374151, border-radius 8px, font-weight 600.
  - "Suspend" button — 140px, 44px, background #D97706, color white, border-radius 8px, font-weight 600.

Modal 2 — Delete User (more severe):
- Danger icon circle — 48px circle background #FEF2F2, containing an X/trash icon in #DC2626 28px.
- Heading "Remove User" — 18px font-weight 700 color #DC2626.
- Body "Are you sure you want to permanently remove Jane Smith? This action cannot be undone." — same text style as above.
- Button row: "Cancel" (same ghost style) + "Delete User" button — background #DC2626, color white, 140px, 44px, border-radius 8px, font-weight 600.

Place both modals on the canvas side by side with their backdrop shown.
```

---

## Prompt 8 — U3: User Detail Slide-Over Drawer

> **What this screen is:** A right-side drawer that slides in over the U2 list when admin clicks "View Profile" from the row actions menu. 400px wide. Has full user details + all admin actions in one panel.

```
Design a slide-over drawer panel for user detail review in Smart Campus Hub admin interface. Desktop web.

The drawer overlays the right side of the U2 user list page. Show it rendered on top of the dimmed U2 page (backdrop rgba(0,0,0,0.30) covering the table behind it).

Drawer panel — position fixed right 0 top 0, width 400px, height 100vh, background white, box-shadow -4px 0 24px rgba(0,0,0,0.12), display flex flex-direction column.

Drawer header — padding 20px 24px, border-bottom 1px solid #E5E7EB, flex row align-items center justify-content space-between:
- "User Details" in 16px font-weight 700 color #111827.
- × close button — 32px circle, border 1px solid #E5E7EB, color #6B7280, hover background #F3F4F6.

Drawer body — padding 24px, flex-direction column, gap 24px, overflow-y auto:

User identity block — flex row, gap 16px, align-items center:
- 80px circular avatar, 3px solid border #E5E7EB.
- Right: name "Ali Perera" in 18px font-weight 700 color #111827. Email "ali@university.ac.lk" in 13px color #6B7280, margin-top 4px. Status badge "PENDING" (background #FFFBEB, text #92400E, border-radius 20px, 12px font-weight 600, padding 3px 10px) on its own line, margin-top 6px.

Details section — two-column label/value grid, row-gap 14px:
- "Role" label (12px uppercase font-weight 600 color #9CA3AF) + "USER" role badge pill inline + a "Change ▾" text link in 12px #1D4ED8 next to it.
- "Status" label + "PENDING" badge.
- "Member Since" label + "March 15, 2026" in 14px color #6B7280.

Role change popover (show it open): a small floating panel attached to the "Change ▾" link, white, border-radius 10px, box-shadow 0 4px 16px rgba(0,0,0,0.10), padding 6px 0, width 160px. Three rows: "● USER" (active, with filled circle and text #1D4ED8 background #EFF6FF row), "  ADMIN", "  TECHNICIAN" — each 36px tall, padding 8px 16px, 14px color #374151.

Thin divider — 1px solid #E5E7EB.

Actions section — section label "ACTIONS" (12px uppercase font-weight 600 #9CA3AF, margin-bottom 12px):
- "Approve User" button — full-width, 44px, background #16A34A, color white, border-radius 8px, font-weight 600, flex row center gap 8px with checkmark icon. Shown because status = PENDING.
- "Delete User" button — full-width, 44px, background white, border 1.5px solid #DC2626, color #DC2626, border-radius 8px, font-weight 600, flex row center gap 8px with trash icon. Margin-top 8px.
- Note below "Delete": "Removing this user is permanent and cannot be undone." in 12px color #9CA3AF, text-align center, margin-top 6px.

Show a second variant of the drawer where status = ACTIVE: replace "Approve User" button with "Suspend User" button — background white, border 1.5px solid #D97706, color #D97706, and add a "Change Role" action between it and Delete.

Place both drawer variants on the canvas (PENDING state and ACTIVE state) side by side, each rendered over the dimmed U2 table.
```

---

## Prompt 9 — Toast Notification System

> **What these are:** In-app toast notifications that replace all `alert()` calls. Appear top-right, auto-dismiss after 4 seconds.

```
Design a toast notification system for Smart Campus Hub. Desktop web.

Toasts appear top-right corner of the viewport, margin 24px from top and right edges. Each toast is 320px wide, border-radius 10px, padding 14px 16px, box-shadow 0 4px 16px rgba(0,0,0,0.12), flex row align-items center, gap 12px.

Show four toast variants stacked vertically (newest on top, 8px gap between):

Toast 1 — Success: background #F0FDF4, left border 4px solid #16A34A. Icon: checkmark circle 20px in #16A34A. Text: "Jane Smith approved" in 14px font-weight 600 color #111827. Sub-text: "Account is now active." in 12px color #6B7280, margin-top 2px. X dismiss button right-aligned, 16px, color #9CA3AF.

Toast 2 — Error: background #FEF2F2, left border 4px solid #DC2626. Icon: X circle 20px in #DC2626. Text: "Failed to update role" 14px font-weight 600 color #111827. Sub-text: "Please try again." 12px color #6B7280. X dismiss button.

Toast 3 — Warning: background #FFFBEB, left border 4px solid #D97706. Icon: warning triangle 20px in #D97706. Text: "Action requires confirmation" 14px font-weight 600. Sub-text: "Use the confirm dialog." 12px color #6B7280. X dismiss button.

Toast 4 — Info: background #EFF6FF, left border 4px solid #1D4ED8. Icon: info circle 20px in #1D4ED8. Text: "Status auto-checked" 14px font-weight 600. Sub-text: "No changes found." 12px color #6B7280. X dismiss button.

Show all four stacked on a #F8FAFC background with a progress bar along the bottom of each toast showing 4-second auto-dismiss timer (thin 3px bar in the border colour, partially filled).
```

---

## Batch Suggestion for Stitch Canvas

Use this order when generating on the canvas to keep the flow coherent:

| Batch | Prompts | Reason |
|-------|---------|--------|
| 1 | Prompt 0 (Global Context) | Sets the global tokens — always first |
| 2 | Prompts 1 + 2 | Auth entry screens — both simple single-card layouts |
| 3 | Prompts 3 + 4 | Gate screens — similar structure, easy to theme-match together |
| 4 | Prompt 5 | Profile page — first screen with full Navbar + layout |
| 5 | Prompt 6 | User management list — most complex, do alone |
| 6 | Prompt 7 | Modals — overlay dependent on Prompt 6 existing |
| 7 | Prompt 8 | Drawer — overlay dependent on Prompt 6 existing |
| 8 | Prompt 9 | Toast system — standalone, do last |

> **Consistency tip:** After generating all screens, Shift-click all of them and send: *"Ensure Inter font, #1D4ED8 primary buttons, #E5E7EB borders, and 8px input border-radius are consistent across all screens."*

---

Sources:
- [Stitch Prompt Guide — Google AI Developers Forum](https://discuss.ai.google.dev/t/stitch-prompt-guide/83844)
- [Google Stitch Complete Guide: Vibe Design, Voice Canvas & Free AI UI Tool (2026) — NxCode](https://www.nxcode.io/resources/news/google-stitch-complete-guide-vibe-design-2026)
- [I Designed a Multi-Screen App in Google Stitch — Medium](https://medium.com/@cengizdonmez/i-designed-a-multi-screen-app-in-google-stitch-heres-my-entire-process-7e73c20aaf83)
- [Design Mobile App UI with Google Stitch — Codecademy](https://www.codecademy.com/article/google-stitch-tutorial-ai-powered-ui-design-tool)
- [Google Stitch — Design UI using AI — Google Labs Blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/)
