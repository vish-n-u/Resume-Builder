# Resume Edit Drawer Design

**Date:** 2026-03-15
**Status:** Approved

## Summary

Add a quick-edit drawer to the `ApplicationPreview` modal that lets users edit their tailored resume without leaving the apply flow. Only the three sections AI actually tailors are editable: Professional Summary, Experience descriptions, and Skills.

## Trigger

"Edit Resume" button on the Resume tab in `ApplicationPreview`. Slides in a drawer panel from the right side of the modal.

## Drawer: `ResumeEditDrawer`

Three sections:

1. **Professional Summary** — single textarea, full width
2. **Experience** — each role listed with position + company as read-only labels, editable textarea for description/bullets below
3. **Skills** — tag-based list with add (text input + enter) and remove (× on each tag)

Header has a title ("Edit Resume") and a close (×) button.

## Interaction & State

- `resume` in `ApplicationPreview` is lifted from a prop to local `useState` initialized from the prop
- As user types → local state updates immediately → `ResumePreview` re-renders live
- On field blur → `PUT /api/resumes/update` saves to DB (existing endpoint, no server changes needed)
- Drawer close button dismisses the panel; preview stays updated

## Components

| Action | File |
|--------|------|
| Create | `client/src/components/ResumeEditDrawer.jsx` |
| Modify | `client/src/components/ApplicationPreview.jsx` |

## API

No new endpoints. Uses existing `PUT /api/resumes/update` with the resume `_id` and updated fields.

## Error Handling

- Save failure on blur: show a toast error, keep local state (user's edits are not lost)
- The drawer does not block sending — user can close and send even if a save is in-flight
