# Jobs Page Redesign: List + Detail Panel

**Date:** 2026-03-14
**Status:** Approved

## Summary

Replace the Tinder-style swipe UI on the Jobs page with a standard list + detail panel layout, similar to LinkedIn Jobs or Indeed. The swipe mechanic and all related components are removed entirely.

## Layout

### Desktop (md+)
Two-panel layout filling the page below the filter bar:

- **Left panel (~320px):** Scrollable list of job rows. Each row shows:
  - Company initial avatar (colored)
  - Job title (truncated if long)
  - Company name · Location
  - Badges: remote/on-site, salary range (if available)
  - Selected row highlighted with blue border + light blue background

- **Right panel (flex-1):** Detail view for the selected job, sticky within its panel:
  - Large company avatar, job title, company name
  - Badges: remote/on-site, location, salary
  - Required skills as tags
  - Full job description
  - "Apply with AI Resume" button (primary) — triggers existing ApplicationPreview modal
  - "Apply on Company Site" button (secondary) — opens `job.applyUrl` in new tab (only shown when `applyUrl` exists)

Default state: first job in the list is auto-selected when the feed loads.

### Mobile (below md)
- Full-width job list only (no side panel)
- Tapping a job row opens a **bottom sheet** with the full job detail
- Bottom sheet is dismissible (tap backdrop or drag down)
- Same two action buttons inside the sheet

## Filter Bar
Unchanged from current implementation — keyword, location, type filters with clear-all.

## Data & State
- Fetch logic in `Jobs.jsx` is unchanged (`/api/jobs/feed`)
- `selectedJob` state: local useState in `Jobs.jsx`, initialized to `feed[0]` after fetch
- Apply flow: unchanged — clicking "Apply with AI Resume" calls `/api/applications/prepare`, shows `ApplicationPreview` modal
- External apply: clicking "Apply on Company Site" calls `/api/jobs/dismiss` to remove from feed and opens `job.applyUrl`

## Components

| Component | Purpose |
|-----------|---------|
| `Jobs.jsx` | Page — keep fetch/filter/apply logic, remove swipe handlers, add `selectedJob` state |
| `JobList.jsx` | Left panel — renders list of `JobRow` items |
| `JobRow.jsx` | Single row in the list |
| `JobDetail.jsx` | Right panel / bottom sheet body — full job info + action buttons |
| `JobBottomSheet.jsx` | Mobile-only wrapper around `JobDetail` with sheet behavior |

## Removed
- `SwipeContainer.jsx` — deleted
- `JobCard.jsx` — deleted
- `react-tinder-card` dependency — removed from `package.json`
- Swipe left/right handlers from `Jobs.jsx`

## Error & Empty States
- Loading: spinner centered in the list area (unchanged)
- Empty feed: "No jobs found" message with briefcase icon (unchanged, shown in list area)
- Error: red banner at top (unchanged)
- No job selected: right panel shows a "Select a job to view details" placeholder
