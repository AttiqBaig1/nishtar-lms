# Nishtar Medical Academy LMS (Multan)

Learning management system with three dashboards:

| Role | Signs in with | Can do |
|---|---|---|
| **Admin** | email + password | Everything: courses & YouTube lectures, access keys, students & progress, announcements, **staff accounts**, **academy settings** |
| **Supervisor** | email + password | Courses & YouTube lectures, access keys, students & progress, announcements |
| **Student** | **access key only** | Watch the lectures their key unlocks, notes, own account. Nothing else. |

Live demo: https://attiqbaig1.github.io/nishtar-lms/

## How it works

1. **Lectures are unlisted YouTube videos.** Upload to YouTube, set visibility to *Unlisted*, then paste the share link in
   *Courses & Lectures → Manage Curriculum → Add Lecture*. Students watch inside the academy page; their name and
   phone float over the video as a watermark, and YouTube's title/logo links are blocked.
2. **Admin or supervisor generates an access key** (`NMA-XXXX-XXXX-XXXX`) for a course (or all courses), with the
   student's name, phone, validity and device limit, then sends it on WhatsApp in one click.
3. **The student signs in with the key** (Login → Student). The first sign-in activates the key and creates the
   student's profile; after that the same key signs the same student in. Expired, revoked or wrong keys are refused
   (5 wrong keys → 15-minute lockout per device).
4. **Login changes are verified by email code.** Changing a password, changing the login email, or resetting a
   forgotten password sends a 6-digit code (10-minute expiry, 5 tries). Changing an existing email needs a code to the
   current address *and* to the new one. Students can add/change a verified email the same way.

## Demo logins

| | |
|---|---|
| Admin | `admin@demo.com` / `Admin@123` |
| Supervisor | `supervisor@demo.com` / `Super@123` |
| Student (active) | key `NMA-AHM1-PHAC-2025` |
| Student (first login) | key `NMA-7F3K-9Q2M-XW4P` |

## Important: this is the demo build

Everything is stored in the browser (`localStorage`), so keys and students exist only on the device where they were
created, and "emails" appear in the on-screen **Demo Inbox** instead of a real mailbox. To run it for real students,
connect a backend (for example Supabase: database + auth + email) and a mail service; the data layer is
`src/services/storageService.ts`, so the swap is contained in one file.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000/nishtar-lms/
npm run build      # dist/ (also writes 404.html for GitHub Pages)
```

Deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`.
