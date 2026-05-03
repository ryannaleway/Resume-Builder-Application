# Accessibility Notes

## Accessibility Goals

This project was developed with the goal of meeting WCAG 2.1+ expectations and achieving the assignment requirement of a Lighthouse accessibility score of 93 or higher.

## Accessibility Work Included

- semantic headings and section structure throughout the SPA
- explicit labels on form controls
- `aria-label` usage on inputs and buttons that need clearer context
- `aria-live` regions for alerts, counts, and preview updates
- keyboard-accessible Bootstrap components
- visible button text instead of icon-only controls for major actions
- print mode that removes navigation clutter from resume output
- local asset loading so UI availability does not depend on third-party CDNs

## Manual Checks To Run Before Submission

1. Start the app with `npm start`.
2. Open [http://localhost:3000](http://localhost:3000).
3. Run Lighthouse on the main SPA routes you intend to submit:
   - `/`
   - `/auth`
   - `/builder`
   - `/preview`
4. Capture the highest relevant accessibility score screenshots and include them with the submission ZIP.

## Lighthouse Documentation Placeholder

Record your final measured accessibility results here before submission:

- `/auth`: `____`
- `/`: `____`
- `/builder`: `____`
- `/preview`: `____`

## Important Note

This repository now includes the structural changes most likely to improve the score, but the exact Lighthouse value still depends on the final browser/runtime environment used during grading. The screenshots or exported report should be captured locally right before submission.
