# Choir Management System — Master Build Prompt

## Role

You are a senior software architect, product designer, UX engineer, backend engineer, database designer, security engineer, and DevOps engineer.

Your task is to design and build a production-ready **Choir Management System** for **"كورال سمر شفا"**.

This is a small/medium community system, **not an enterprise system**.

### Expected scale

- Initial users: ~100
- Maximum expected users: **300–500 total**
- Design for 500 users comfortably.
- Do NOT over-engineer for thousands/millions of users.
- Prefer simple, maintainable, low-cost architecture.

---

# 1. NON-NEGOTIABLE PRODUCT PRINCIPLES

1. The system must be **mobile-first for members**.
2. Members will primarily use Android/iOS phones.
3. The system must still be fully responsive on tablet and desktop.
4. Admin UI can be desktop-first but must remain responsive.
5. Arabic RTL must be first-class.
6. English LTR must also work.
7. The system must be secure and server-authoritative.
8. Never trust attendance, GPS, roles, points, or payment values supplied by the browser.
9. Preserve historical data.
10. Never retroactively rewrite historical points/rules.
11. Admins must have strong manual override capabilities.
12. Avoid unnecessary enterprise architecture.
13. Prefer free/open-source technologies and free tiers.
14. **Do not introduce paid services unless absolutely necessary.**
15. If a free Cloudflare service is sufficient, prefer it.
16. Do not add AI features to the product unless explicitly requested later.

---

# 2. BRAND / DESIGN DIRECTION

Use the supplied choir logo as the primary brand reference.

Brand direction:

- Burgundy / dark red
- Gold
- White
- Warm cream/off-white
- Very light neutral backgrounds
- Minimal visual noise
- Elegant, calm, modern
- Christian choir/community feeling without excessive decoration
- Rounded cards
- Clear typography
- Subtle shadows
- Generous spacing
- No crowded dashboards

The UI should feel like a polished modern mobile app rather than an old-school administration website.

Do not overuse colors.

Use the logo and brand colors consistently for:
- buttons
- active navigation
- status indicators
- headers
- important actions

---

# 3. TECHNOLOGY STACK

Prefer the following stack unless there is a strong technical reason to change it.

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- TanStack Query where client-side server-state management is useful
- Accessible UI components
- Responsive design
- RTL/LTR support

## Backend

Prefer a TypeScript backend that works naturally with Cloudflare.

Preferred architecture:

- Next.js application
- Cloudflare Workers / Cloudflare deployment
- Server-side API routes / server actions where appropriate
- Business logic separated into service modules
- Never put business rules only in React components

If using Next.js on Cloudflare requires an adapter/runtime integration, use the currently supported Cloudflare-compatible approach.

## Database

Prefer:

### Cloudflare D1

Reason:
- Expected scale is only 300–500 users.
- Relational data is required.
- D1 is SQL/SQLite based.
- Cloudflare provides a free tier.
- It keeps the architecture simple.

Use:

- Drizzle ORM
- SQL migrations
- Proper indexes
- Foreign keys
- Transactions where appropriate

Do NOT introduce PostgreSQL/Supabase/Neon unless D1 creates a concrete blocker.

## File Storage

Prefer:

### Cloudflare R2

For:
- member profile photos
- choir song audio
- lyrics/documents if needed
- other uploaded files

Do not store large files directly in the database.

Use signed/private access where appropriate.

## Hosting / Infrastructure

Prefer Cloudflare:

- Cloudflare Workers
- Cloudflare Pages / Workers Static Assets where appropriate
- Cloudflare D1
- Cloudflare R2
- Cloudflare DNS
- Cloudflare SSL/TLS
- Cloudflare Turnstile if CAPTCHA/bot protection is needed

Use GitHub + GitHub Actions for source control and CI/CD.

## Important FREE-FIRST rule

Before adding any external service, ask:

> Can Cloudflare or an open-source solution handle this for free?

If yes, use that.

Avoid paid:
- hosting
- database
- file storage
- email
- analytics
- authentication
- monitoring
- APIs

where a suitable free/open-source alternative exists.

If email is not required for the first version, do not add an email provider just for the sake of it.

---

# 4. CLOUDFLARE FREE-TIER TARGET

The architecture should intentionally fit within Cloudflare's free tiers as much as realistically possible.

Current target:

- Workers Free
- D1 Free
- R2 free monthly allowance
- Static assets/CDN through Cloudflare
- No paid CDN
- No paid database
- No paid object storage

Design queries efficiently.

Avoid:
- full-table scans
- unnecessary polling
- excessive client requests
- huge API payloads
- loading entire attendance histories when only summaries are needed

Add database indexes for common queries.

Implement pagination for admin tables.

The system should display clear operational warnings if a future usage limit becomes a concern.

Do NOT promise that the entire system will remain free forever; design it so that the initial 300–500-user deployment can realistically operate within free tiers, with a straightforward upgrade path if usage later grows.

---

# 5. USER ROLES

Support multiple roles per user.

Roles:

```text
MEMBER
ADMIN
SUPER_ADMIN
SUBSCRIPTION_MANAGER
```

Roles can be combined.

Examples:

```text
MEMBER
MEMBER + ADMIN
MEMBER + SUBSCRIPTION_MANAGER
```

## MEMBER

Can:
- view own profile
- view own attendance
- check in/out
- submit absence excuse
- submit late request
- view own points
- view own quarter history
- view songs
- view own subscriptions if enabled
- view all personal history

Cannot:
- manage other members
- change rules
- manage rehearsals
- manage points
- manage subscriptions for others

## ADMIN

Can manage normal choir operations:

- members
- rehearsals
- attendance
- excuses
- songs
- quarters
- points/rules
- evaluations
- reports
- manual adjustments
- settings available to admins

## SUPER_ADMIN

Super Admin is essentially Admin +:

- promote member to Admin
- remove Admin role
- manage admin access
- audit sensitive role changes

Do not create an enterprise RBAC system.

## SUBSCRIPTION_MANAGER

This role is intentionally narrow.

Recommended real-world combination:

```text
MEMBER + SUBSCRIPTION_MANAGER
```

The person remains a normal choir member and additionally manages subscriptions.

Can:
- view members needed for collection
- view subscription balances
- see monthly dues
- record payments
- record partial payments
- view payment history
- see outstanding balances
- add permitted payment notes

Cannot:
- manage attendance
- manage points
- manage rehearsals
- manage songs
- manage quarters
- manage users/roles
- change global rules
- become Admin automatically

Sensitive financial actions such as changing the monthly fee, waiving debt, or deleting/correcting historical payments should be restricted to Admin/Super Admin unless explicitly configured otherwise.

---

# 6. AUTHENTICATION & MEMBER APPROVAL

New registration does NOT automatically make someone an active choir member.

Account lifecycle:

```text
PENDING
APPROVED
REJECTED
```

Flow:

```text
Sign Up
   ↓
PENDING
   ↓
Admin Review
   ├── Approve → Member Access
   └── Reject → No Member Portal Access
```

Approval must be enforced server-side.

Do not allow a user to bypass approval by calling an API directly.

Registration fields can include:

- full name
- email
- phone
- password
- profile photo
- choir part/category
- other configurable member information

Use secure password hashing and secure sessions/cookies.

Do not store raw passwords.

---

# 7. QUARTERS

The choir works in quarters of approximately four months.

A Quarter is a first-class entity.

Each Quarter has:

- id
- name
- start date
- end date
- status
- policies/settings
- attendance rules
- points rules
- excuse limits
- evaluation configuration

Possible statuses:

```text
UPCOMING
ACTIVE
CLOSED
```

Historical data must never be deleted/reset when a quarter closes.

A member's history should be viewable quarter by quarter.

Example:

```text
Quarter 1
Attendance: 91%

Quarter 2
Attendance: 96%

Quarter 3
Attendance: 88%
```

Rules can differ between quarters.

Past quarter results must remain historically correct even if future rules change.

---

# 8. REHEARSALS

Admin creates rehearsals ahead of time.

Example:

```text
Date: Saturday
Start: 7:00 PM
End: 10:00 PM
Location: Church
Latitude: ...
Longitude: ...
Radius: 100m
Quarter: Q3
```

No manual "Open Attendance" / "Close Attendance" buttons.

Attendance availability is derived from rehearsal schedule.

Before start:
- check-in unavailable

During scheduled window:
- check-in/check-out available according to configured rules

After end:
- attendance closes

Backend validates:
- rehearsal time
- current time
- user
- location
- radius

Do not trust frontend GPS validation.

Store useful attendance evidence:
- check-in timestamp
- check-out timestamp
- latitude/longitude if appropriate
- calculated distance
- status/classification
- rehearsal id
- member id

---

# 9. ATTENDANCE

Attendance statuses should be configurable.

Examples:

```text
PRESENT / ON_TIME
LATE
VERY_LATE
EXTREME_LATE
ABSENT
EXCUSED_ABSENCE
EARLY_LEAVE
```

Do not hard-code the exact point values.

Admin controls the rules.

Example:

```text
7:00–7:15 → On Time
7:16–7:30 → Late
7:31–8:00 → Very Late
8:01+      → Extreme Late
```

These are examples only.

Admin must be able to change the ranges.

---

# 10. EXCUSE SYSTEM

Keep this simple.

Member sees two actions:

### "I will be absent"

Form:
- rehearsal
- reason/note

Admin:
- Approve
- Reject

If approved and the member does not attend:
- classify according to the quarter's approved excuse policy

If rejected and the member does not attend:
- normal absence rules apply

### "I will be late"

Form:
- rehearsal
- reason
- expected delay duration

Example:

```text
Reason: Transportation problem
Expected delay: 30 minutes
```

IMPORTANT:

Do NOT ask the member for an exact expected arrival time.

Do NOT compare expected arrival time against actual check-in.

The request is only an informational/approval request.

Actual attendance is always determined by the real check-in timestamp.

Example:

Member says:
> "I may be 30 minutes late."

If actual check-in is 7:25:
- apply the rule for 7:25.

If actual check-in is 7:48:
- apply the rule for 7:48.

If no check-in:
- apply the configured absence/approved-late policy.

The Attendance Engine remains the source of truth.

---

# 11. POINTS ENGINE

This must be highly configurable.

Do NOT design the system around only today's known rules.

Create a generic rule/policy engine.

Admin should be able to configure:

- automatic attendance points
- absence penalties
- late penalties
- excused absence behavior
- early leave
- bonuses
- manual bonuses
- manual deductions
- special contributions
- service
- participation
- quarter evaluation
- other future point categories

Example:

```text
On Time → +10
Late → +5
Very Late → +2
Absent → -10
Excused Absence → 0
Early Leave → -5
```

These are examples, not permanent hard-coded rules.

---

# 12. OCCURRENCE-BASED RULES

The system must support rules such as:

```text
First 3 absences in a quarter → 0 points
4th and later absence → -10 points each
```

But do NOT hard-code "3".

Admin configures it.

Possible UI:

```text
Rule:
Absence

Allowed occurrences:
3

After:
3

Points:
-10

Apply:
Per occurrence
```

The engine should support ranges:

```text
1–3 → 0
4+  → -10
```

Also support future rules like:

```text
First 2 late arrivals → 0
3rd+ late arrival → -5
```

---

# 13. POINT RULE VERSIONING

Never rewrite historical results.

If Quarter 1 used:

```text
First 3 absences = free
```

and Quarter 2 uses:

```text
First 2 absences = free
```

Quarter 1 must continue using its original policy.

Use:
- quarter-scoped rules
- effective dates/versioning where appropriate
- immutable point transaction history

---

# 14. MANUAL POINT ADJUSTMENTS / EXCEPTIONS

Admin must be able to manually correct cases the system cannot understand.

Example:

A member gave a verbal excuse and did not submit it through the app.

Admin can record:

```text
Manual Adjustment
Member: X
Quarter: Q3
Rehearsal: Sep 12
Type: Verbal Excuse
Points: +10 / 0 / configured
Reason: Verbal excuse approved by choir admin
Note: ...
```

Other examples:

- member was present but GPS failed
- incorrect attendance classification
- special contribution
- special service
- correction of an administrative mistake
- exceptional case

CRITICAL:

Do not silently overwrite the original automatic transaction.

Prefer:

```text
Automatic transaction
+
Manual adjustment
=
Final result
```

Maintain an audit trail:

- who made the adjustment
- when
- why
- old value if applicable
- new value
- related member/rehearsal/quarter

Manual adjustments can happen at any time:
- during the quarter
- near quarter end
- after a rehearsal
- whenever an exceptional case is discovered

---

# 15. MEMBER PORTAL UX

Member Portal is **mobile-first**.

Primary devices:
- Android
- iOS

Desktop/tablet must still work.

## Dashboard

Keep it intentionally simple.

The first page after login should answer:

> "What is my status right now?"

Show:

- account approval status
- next/current rehearsal
- check-in/check-out action
- current attendance status
- current excuse request status
- small current-quarter summary if useful

Do NOT put the entire history and analytics on the dashboard.

## Profile

Profile is where detailed history lives.

Include:

- personal profile
- current quarter summary
- quarter calendar
- rehearsal history
- rehearsal details
- points history
- excuse history
- previous quarter history
- subscription history if enabled

---

# 16. QUARTER SUMMARY FOR MEMBER

Example:

```text
Quarter 3

Attendance: 91%

Present: 18
Late: 3
Absent: 2
Excused: 1

Points: 142
```

The summary represents the selected quarter up to the current date/state.

---

# 17. QUARTER CALENDAR

Member can select a quarter.

Calendar displays rehearsals.

Use simple status indicators:

```text
Green  = Present
Yellow = Late
Red    = Absent
Blue   = Excused
Gray   = No rehearsal / not applicable
```

Member taps a rehearsal.

Open:

## Rehearsal Details

Show:

- date
- time
- location
- attendance status
- check-in time
- check-out time
- classification
- excuse request
- approval/rejection
- points earned/deducted
- manual adjustments if applicable
- notes where appropriate

The member should be able to understand exactly what happened.

---

# 18. SUBSCRIPTIONS

Every member can have a monthly subscription.

This is a separate subsystem from attendance and points.

Member classification can be configured by Admin:

```text
Student
Working
Other
```

Admin controls the amount.

The subscription is manually managed.

The system should track:

- monthly required amount
- amount paid
- remaining amount
- payment date
- payment method if needed
- notes
- adjustments
- payment history

---

# 19. ACCUMULATED SUBSCRIPTION DEBT

Do NOT treat the subscription as only the current month.

If a member owes:

```text
July      150
August    150
September 150
```

Total due:

```text
450
```

If they pay:

```text
200
```

Then:

```text
Total Due:       450
Total Paid:      200
Outstanding:     250
```

The system must show exactly which months are unpaid/partially paid.

Payment allocation should be deterministic and auditable.

Prefer configurable allocation policy, for example:

```text
oldest due month first
```

or allow an authorized Admin/Subscription Manager to explicitly allocate a payment to specific months.

Never lose the original monthly charge.

---

# 20. SUBSCRIPTION DATA MODEL

Separate:

### Monthly Charges

```text
July      150
August    150
September 150
```

from:

### Payments

```text
Sep 10    200
```

Then calculate:

```text
Total Due
- Total Paid
= Outstanding Balance
```

Also support:

- partial payment
- waived charge
- manual adjustment
- correction
- historical payment records

Do not delete financial history silently.

---

# 21. SUBSCRIPTION MANAGER UX

The Subscription Manager should have a focused interface.

Example:

```text
Members
--------------------------------
Ahmed Mohamed
Student

Total Due:      450 EGP
Paid:           200 EGP
Outstanding:    250 EGP

[Record Payment]
```

Then:

```text
July       150   Unpaid
August     150   Partial
September  150   Paid
```

Only show management capabilities relevant to subscriptions.

---

# 22. SONGS

Admin can manage choir songs.

Potential fields:

- title
- lyrics
- key
- notes
- audio
- voice-part information
- uploaded files

Members can view/listen to songs according to permissions.

Store audio/files in R2, not D1.

---

# 23. REPORTING / ANALYTICS

Admin dashboard can provide:

### Attendance

- current attendance percentage
- present
- absent
- late
- excused
- trends
- member attendance
- rehearsal attendance
- quarter comparisons

### Points

- current points
- point transactions
- bonuses
- deductions
- manual adjustments
- quarter comparisons

### Subscriptions

- total expected
- collected
- outstanding
- monthly collection
- member balances
- unpaid/partial members

Keep reports practical for 300–500 users.

Do not build a huge enterprise BI platform.

---

# 24. DATABASE — CORE ENTITIES

Design a clean relational schema.

Suggested entities:

```text
users
roles
user_roles

members

quarters

rehearsals
attendance

excuse_requests

point_rules
point_rule_versions
point_transactions

evaluations
evaluation_categories
evaluation_criteria

subscription_charges
subscription_payments
subscription_adjustments

songs
song_files

audit_logs
```

Use foreign keys and indexes.

Important relationships:

```text
User
  ↓
Member

Member
  ↓
Attendance
  ↓
Rehearsal
  ↓
Quarter

Member
  ↓
Point Transactions
  ↓
Quarter

Member
  ↓
Subscription Charges
  ↓
Subscription Payments
```

---

# 25. SECURITY

Implement:

- secure authentication
- secure password hashing
- secure cookies/sessions
- server-side authorization
- role checks on every protected operation
- input validation with Zod
- rate limiting where appropriate
- CSRF protection where applicable
- XSS-safe rendering
- SQL injection protection through ORM/parameterized queries
- file upload validation
- file type/size limits
- signed/private file URLs when needed
- audit logging for sensitive operations
- least-privilege permissions

Never trust:
- frontend role
- frontend points
- frontend attendance status
- frontend GPS result
- frontend subscription balance
- frontend payment amount

---

# 26. GEOLOCATION SECURITY

For check-in:

1. Browser requests location permission.
2. Browser sends location to backend.
3. Backend gets rehearsal coordinates/radius.
4. Backend calculates distance.
5. Backend decides whether check-in is allowed.
6. Backend records the result.

Do not let the client simply send:

```text
isWithinRadius: true
```

and trust it.

---

# 27. AUDIT LOGGING

Audit sensitive operations:

- role changes
- member approval/rejection
- manual point adjustments
- attendance corrections
- subscription adjustments
- payment corrections
- major rule changes

Audit record:

```text
actor
action
entity
entityId
oldValue
newValue
reason
timestamp
```

Do not over-log every harmless UI interaction.

---

# 28. API / BUSINESS LOGIC ARCHITECTURE

Use clear service boundaries.

Suggested modules:

```text
auth/
members/
quarters/
rehearsals/
attendance/
excuses/
points/
subscriptions/
songs/
evaluations/
reports/
audit/
```

Business logic should live in services/domain modules.

Examples:

```text
AttendanceService
ExcuseService
PointsEngine
SubscriptionService
QuarterPolicyService
AuditService
```

The frontend should not implement the final business rules.

---

# 29. PROJECT STRUCTURE

Use a maintainable structure similar to:

```text
src/
  app/
  components/
  features/
    auth/
    members/
    attendance/
    rehearsals/
    excuses/
    points/
    subscriptions/
    quarters/
    songs/
    evaluations/
    reports/
  server/
    services/
    repositories/
    policies/
  db/
    schema/
    migrations/
  lib/
  types/
  hooks/
  utils/
```

Adapt to the chosen Next.js architecture.

Avoid creating hundreds of meaningless abstractions.

---

# 30. TESTING

At minimum:

## Unit tests

Test:

- distance calculation
- attendance classification
- points rules
- occurrence-based rules
- excuse outcomes
- subscription balance calculation
- payment allocation
- permissions

## Integration tests

Test:

- registration → approval
- check-in
- check-out
- excuse approval
- late request
- automatic points
- manual adjustment
- monthly subscription
- partial payment
- accumulated debt
- role permissions

## E2E tests

Critical user flows:

```text
Member registration
Admin approval
Member check-in
Member excuse
Admin approval/rejection
Member quarter history
Subscription Manager records payment
Admin manual adjustment
```

---

# 31. PWA / MOBILE EXPERIENCE

A PWA can be considered if it provides real value.

Possible features:

- install to home screen
- fast loading
- mobile-friendly shell
- offline-friendly static UI where safe

BUT:

Do not make offline attendance/check-in authoritative.

Check-in requires a server connection and server validation.

---

# 32. NOTIFICATION STRATEGY

Keep notifications optional initially.

Do not pay for SMS.

Possible free/low-cost options later:

- in-app notifications
- browser/PWA notifications
- email only if a genuinely free option is available and reliable

Do not make notifications a dependency for core functionality.

---

# 33. DEPLOYMENT

Preferred production architecture:

```text
GitHub
   ↓
GitHub Actions
   ↓
Cloudflare
   ├── Web App / Workers
   ├── D1
   ├── R2
   ├── DNS
   └── SSL/TLS
```

Development:

```text
Local Next.js
Local/remote D1 development
Local R2-compatible workflow
Environment variables
Migration scripts
```

Production:

```text
Cloudflare
Production Worker
Production D1
Production R2
```

Keep dev/staging/production data separated.

---

# 34. BACKUPS / DATA SAFETY

Historical data is important.

Plan for:

- D1 backups / recovery features where available
- periodic database export
- migration versioning
- R2 object protection
- recovery documentation

Do not rely on one copy of important data.

---

# 35. ADMIN NAVIGATION

Suggested:

```text
Dashboard
Members
Rehearsals
Attendance
Excuse Requests
Points & Rules
Quarters
Subscriptions
Songs
Reports
Settings
```

Super Admin additionally:

```text
Admin Management
Audit Log
```

Subscription Manager gets a focused management experience:

```text
Subscription Dashboard
Members
Payments
Outstanding Balances
```

plus normal Member Portal access.

---

# 36. MEMBER NAVIGATION

Mobile-first:

```text
Home
Attendance
Profile
More
```

Possible More:

```text
Songs
Excuse History
Points History
Subscriptions
Settings
```

Keep the bottom navigation small.

---

# 37. UX RULES

Avoid:

- crowded screens
- huge tables on mobile
- too many colors
- tiny buttons
- excessive modal dialogs
- complicated forms
- unnecessary animations

Prefer:

- cards
- clear hierarchy
- bottom sheets where appropriate
- simple forms
- large touch targets
- clear status badges
- confirmation for destructive actions
- progressive disclosure

---

# 38. RESPONSIVE STRATEGY

## Member

Mobile-first:

```text
360px+
↓
Mobile
↓
Tablet
↓
Desktop
```

## Admin

Desktop-first but responsive:

```text
Desktop dashboard
↓
Tablet
↓
Mobile fallback
```

Never create a separate codebase for mobile.

---

# 39. DEVELOPMENT ROADMAP

## Phase 1 — Foundation

- repository
- Next.js
- TypeScript
- Tailwind
- Cloudflare setup
- D1
- R2
- authentication
- roles
- database migrations
- base UI
- RTL/LTR

## Phase 2 — Member System

- registration
- approval
- member profiles
- member dashboard
- mobile navigation
- rehearsal calendar

## Phase 3 — Attendance

- rehearsal creation
- GPS check-in
- GPS check-out
- radius validation
- attendance history
- attendance classifications

## Phase 4 — Excuses

- absence request
- late request
- admin approval/rejection
- excuse history
- quarter limits

## Phase 5 — Points Engine

- point rules
- automatic rules
- occurrence-based rules
- quarter-specific policies
- point transactions
- manual adjustments
- audit logs

## Phase 6 — Subscriptions

- monthly charges
- student/working classification
- payment recording
- partial payments
- accumulated balances
- payment history
- Subscription Manager role
- manual financial adjustments

## Phase 7 — Songs

- song management
- lyrics
- audio
- member access

## Phase 8 — Reporting

- attendance reports
- points reports
- subscription reports
- quarter comparisons

## Phase 9 — Hardening

- security review
- permissions review
- performance
- indexes
- rate limiting
- upload security
- error handling
- backups

## Phase 10 — Production

- Cloudflare deployment
- domain
- SSL
- production database
- production storage
- CI/CD
- monitoring
- final QA

---

# 40. IMPORTANT ARCHITECTURAL DECISIONS

The following must remain true:

### A. Attendance is not Points

Attendance records what happened.

Points rules determine what that means in points.

### B. Excuses are not Attendance

An excuse is a request/decision.

Actual attendance remains actual attendance.

### C. Expected delay is NOT compared to check-in

Late requests contain:
- reason
- expected delay duration

Actual check-in determines late classification.

### D. Automatic and manual points coexist

Do not replace automatic records with manual corrections.

### E. Subscriptions are separate

Subscription accounting does not automatically affect points.

### F. Quarter is a first-class boundary

Rules and historical results are quarter-aware.

### G. Roles are composable

A user can be:

```text
MEMBER + SUBSCRIPTION_MANAGER
```

without being an Admin.

---

# 41. WHAT THE AI MUST PRODUCE

When implementing this project, work in small verified stages.

For each stage:

1. Explain the architecture decision briefly.
2. Implement it.
3. Run type checking.
4. Run linting.
5. Run tests.
6. Fix errors.
7. Do not move to the next major module until the current one is stable.

Do not generate a giant untested code dump.

Before writing code, create:

- architecture diagram
- database ERD
- route map
- permission matrix
- folder structure
- environment variable plan
- deployment plan

Then implement incrementally.

---

# 42. FREE-FIRST IMPLEMENTATION RULE

The target is a **zero-cost initial deployment** whenever realistic.

Preferred:

```text
Cloudflare Workers Free
Cloudflare D1 Free
Cloudflare R2 Free allowance
Cloudflare DNS
Cloudflare SSL
GitHub Free
Open-source libraries
```

Do not add paid infrastructure just because it is popular.

If a free tier has a hard limitation that could realistically affect a 300–500 member choir, document it and propose the cheapest migration path.

The system must not depend on a paid AI API.

---

# 43. FINAL PRODUCT GOAL

The finished system should feel like:

> A clean, modern, mobile-first digital management system for a real choir.

It should be:

- simple
- secure
- transparent
- maintainable
- inexpensive
- responsive
- easy for members
- powerful for admins
- flexible for future rules
- appropriate for 300–500 users

Do not turn this into an enterprise SaaS.

Build exactly what a 300–500 member choir needs, with a clean architecture that can grow if necessary.

---

# 44. FIRST TASK

Before writing application code:

1. Review this specification.
2. Produce the final recommended architecture.
3. Produce the ERD/database schema.
4. Produce the role/permission matrix.
5. Produce the route/page map.
6. Produce the project folder structure.
7. Produce the Cloudflare deployment architecture.
8. Identify any contradictions or missing decisions.
9. Make reasonable low-complexity assumptions where possible.
10. Only ask questions when the missing decision would materially change the architecture.

Then begin implementation from Phase 1.
