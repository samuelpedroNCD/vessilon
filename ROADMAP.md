# Vessilon — Build Roadmap

The operating system for yacht brokerage. This is the living, step-by-step plan,
derived from the V1 phasing in the Product Feature Specification (§13). We work
top-to-bottom; **◀ marks the current phase**. Check items off as they land.

**Stack:** Next.js (App Router, TS) · Supabase (Postgres + Auth + RLS) · Vercel.
**Architecture pillars:** Yacht is the primary object · LOB-aware · role-based +
RLS · multi-tenant from line one · AI-augmented (reviewable).

---

## Phase 0 — Foundation & infra ✓
- [x] Design system ported (Bridge tokens, Geist, Tide mark) — `app/globals.css`, `components/TideMark.tsx`
- [x] Landing page reflecting the full platform — `app/page.tsx`
- [x] Auth: login (split) + signup (multi-step onboarding) — `app/(auth)/`
- [x] Favicon — `app/icon.svg`, `app/apple-icon.tsx`
- [x] Supabase wired (`lib/supabase/*`), GitHub repo, Vercel auto-deploy

## Phase 1 — Auth complete + App shell + Overview ◀ (current)
- [x] Forgot / reset password — `app/(auth)/forgot-password`, `app/(auth)/reset-password`
- [x] App shell (topbar + grouped sidebar + agent rail) — `components/app/AppShell.tsx`, `app/(app)/app.css`
- [x] Sign-out via user menu — `components/app/UserMenu.tsx`
- [x] Overview / "Today" dashboard landing (representative data, personalized from auth) — `app/(app)/dashboard/page.tsx`
- [ ] Disable email confirmation in Supabase ✓ (done in dashboard) — keep custom SMTP for prod (later)

## Phase 2 — Data model & multi-tenancy ✓
Yacht-centric schema, `org_id` on every table, RLS by org + role + assignment. Applied to the live project.
- [x] `organisations`, `profiles` (auth.users ↔ org + role), `offices` — `0001_init_core.sql`
- [x] Core objects: `yachts`, `owners`, `clients`, `leads`, `opportunities`, `interactions`, `tasks`, `documents`, `brochures`, `companies` (`profiles` = Broker Individual)
- [x] Config-driven LOB stages (all 6 LOBs, spec §8) — `0003_signup_and_seed.sql` `seed_lob_stages()`
- [x] RLS policies (org isolation + broker assignment) + helpers (`current_org_id`/`is_staff`/`is_admin`) — `0002_rls.sql` · isolation verified
- [x] Signup→org trigger + backfill; demo org seeded; `lib/database.types.ts` generated + clients typed
- [x] Overview dashboard wired to real org data (`lib/queries/overview.ts`) with empty-state · demo: `demo@nocodedistrict.com`

## Phase 3 — Fleet (Yacht-first) ✓
- [x] Fleet list `/fleet` (filters/search by status·LOB·type, KPI strip) + `/fleet/new` + `/fleet/[id]/edit` (full CRUD)
- [x] Yacht detail `/fleet/[id]` (specs grid, particulars, activity timeline, linked opps/clients/docs/tasks; compliance/crew/AIS stubbed)
- [x] Reusable Toolbar/PageHeader/Pill/EmptyState + form vocabulary; demo yachts enriched with specs

## Phase 4 — CRM core ✓
- [x] Leads `/leads` CRUD + AI-confidence/temperature + **lead→client convert** (verified)
- [x] Clients `/clients` CRUD + linked opps/interactions/tasks + **log interaction** (updates last-interaction, verified)
- [x] Owners `/owners` CRUD (linked yachts)
- [x] Tasks `/tasks` (list, filters, create, **complete/reopen** verified) + Interactions `/interactions` feed + quick-log
- [x] All under RLS via server actions; sidebar wired (Leads/Clients/Fleet/Owners/Tasks/Activity); empty-states for new orgs

## Phase 5 — Pipeline (multi-LOB) ◀ (next)
- [ ] Opportunities model + Kanban + List views
- [ ] Sale stages first, then Charter / New Builds / Co-Ownership / Trade / Services
- [ ] Weighted forecast, SLA/aging indicators, stage audit log

## Phase 6 — Brochures + AI listing copy
- [ ] Brochure generation (Sale / Charter / Full-Spec) from yacht data
- [ ] AI listing descriptions (Claude API, reviewable before publish)
- [ ] Tracked share links + auto-logged interactions

## Phase 7 — Live dashboards
- [ ] Rewire Overview to real Supabase data
- [ ] CEO Dashboard (sales/revenue, leads/clients, broker activity, fleet, tasks)
- [ ] DataRoom Analytics (fleet composition, pipeline health, data quality)

## Phase 8 — Marketing Room
- [ ] Dashboard, Objectives/OKRs, Campaign manager, Key results, Assets

## Phase 9 — Settings & RBAC
- [ ] Org settings (brand, billing, domain), User management, invites
- [ ] Roles & permission matrix, row-level security config, approval roles
- [ ] Platform settings: LOB enable/disable, pipeline stage customisation, approval triggers

## Phase 10 — Platform features (V1 finish)
- [ ] Notes (on every record), Internal Chat, Calendar (basic)

---

## Future (V2 / V3) — not in V1
**V2:** Email (Gmail/Outlook), Booking links, Meetings, Forms + embedding, Sequences,
Prospecting (Apollo), Agreements, Proposals, native Listing Sync + white-label site,
Client Portal, DataStudio (GA/Brevo/Meta), Survey builder, Finance/commission, AI Copilot, Mobile PWA.
**V3:** Co-brokerage network, Revenue intelligence/forecasting, Vessel tracking (AIS),
native iOS/Android, enterprise multi-tenancy, e-signature, LinkedIn Ads.

---
_Source of truth: Vessilon Product Feature Specification v1.0. Update this file as phases complete._
