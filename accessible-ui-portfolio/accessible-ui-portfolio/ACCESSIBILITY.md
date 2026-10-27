# Accessibility conformance notes

**Target:** WCAG 2.1 Level AA, which is also the technical standard behind the revised Section 508.
**Scope:** `index.html`, `components.html`, `apply.html` (all states: errors, modal open, review, confirmation).

## How it was tested

| Method | Tooling | Where |
| --- | --- | --- |
| Automated rules | axe-core 4.x via `@axe-core/playwright`, tags `wcag2a wcag2aa wcag21a wcag21aa` | `tests/a11y.spec.js`, runs in CI |
| Keyboard and focus behavior | Playwright | `tests/keyboard.spec.js`, runs in CI |
| Reflow | 320 × 640 viewport, checks for no horizontal overflow | CI (`mobile-320` project) |
| Screen readers | NVDA + Firefox, JAWS + Chrome, VoiceOver + Safari | Manual (checklist below) |
| Zoom / text spacing | Browser zoom to 200% and 400%; text-spacing bookmarklet | Manual |
| Contrast | Token ratios documented in `_tokens.scss`, verified with axe and the WebAIM contrast checker | Automated + manual |
| Forced colors | Windows High Contrast / `forced-colors: active` emulation in DevTools | Manual |

Automated tools catch only some issues, so the manual checklist below is part of the definition of done.

## WCAG 2.1 AA success criteria: how each is addressed

| SC | Name | Implementation |
| --- | --- | --- |
| 1.1.1 | Non-text Content | Decorative SVG icons use `aria-hidden="true" focusable="false"`; meaning is carried by text. |
| 1.3.1 | Info and Relationships | Semantic landmarks, heading hierarchy, `<fieldset>`/`<legend>` for radio groups and the date input, `<th scope="col">` and `<caption>` for tables, `<dl>` for review answers. |
| 1.3.5 | Identify Input Purpose | `autocomplete` tokens (`given-name`, `family-name`, `bday-*`, `email`, `tel`). |
| 1.4.1 | Use of Color | Status badges carry text. The current nav item and step have a border indicator, and completed steps add visually hidden "(completed)" text. Error fields add a thick left border as well as red. |
| 1.4.3 / 1.4.11 | Contrast (Minimum) / Non-text Contrast | Text is at least 4.5:1 and input borders and focus rings at least 3:1, in light and dark themes. |
| 1.4.4 / 1.4.10 | Resize Text / Reflow | rem-based type and spacing; layout reflows at 320px; the data table scrolls inside a focusable, labelled region. |
| 1.4.12 | Text Spacing | No fixed heights on text containers. |
| 1.4.13 | Content on Hover or Focus | No hover-only content. |
| 2.1.1 / 2.1.2 | Keyboard / No Keyboard Trap | All controls are native buttons, links or inputs. The modal's focus trap is released on Escape, Cancel or Confirm. |
| 2.4.1 | Bypass Blocks | A skip link is the first focusable element and targets `<main tabindex="-1">`. |
| 2.4.2 | Page Titled | Unique titles; the form title reflects the current step and an "Error:" prefix. |
| 2.4.3 | Focus Order | Focus moves to the step heading on step change, to the error summary on failure, and to the confirmation heading on submit; the modal returns focus to its opener. |
| 2.4.6 | Headings and Labels | Descriptive labels. "Change" buttons include visually hidden context ("Change first name"). |
| 2.4.7 | Focus Visible | Two-tone yellow and dark focus ring on every interactive element; `Highlight` color in forced-colors mode. |
| 2.5.3 | Label in Name | Accessible names start with the visible label text. |
| 3.1.1 | Language of Page | `<html lang="en">`. |
| 3.2.2 | On Input | No context changes on input. Navigation happens only on explicit button presses. |
| 3.3.1 | Error Identification | Inline error text with an "Error:" prefix for screen readers, `aria-invalid="true"`, and an error summary with links to each field. |
| 3.3.2 | Labels or Instructions | Every input has a visible `<label>`; hints are linked with `aria-describedby`. |
| 3.3.3 | Error Suggestion | Messages say how to fix the problem, for example "Enter a 10-digit phone number, like 515 555 0123". |
| 3.3.4 | Error Prevention | A check-your-answers step with "Change" links, plus re-validation of every step on submit. |
| 4.1.2 | Name, Role, Value | ARIA states are kept in sync by JS (`aria-expanded`, `aria-selected`, `aria-sort`, `aria-current`). |
| 4.1.3 | Status Messages | `role="status"` regions announce "Draft saved", sort changes and filter result counts without moving focus. |

## Manual screen reader checklist

- [ ] Skip link is announced first and moves to main content.
- [ ] Navigation landmark is announced as "Main navigation"; the current page is announced as "current page".
- [ ] Tabs are announced as "tab, 1 of 3, selected"; arrow keys change the tab and the panel.
- [ ] Accordion buttons are announced as "collapsed" or "expanded".
- [ ] The modal announces its title and description on open; the background can't be reached; Escape closes it and focus returns to the opener.
- [ ] Sorting announces "Sorted by Applicant, ascending"; filtering announces "Showing 2 of 8 cases".
- [ ] On "Continue" with errors, "There is a problem" is read with the list of errors; each link moves to its field, which reads its label, the error and the hint.
- [ ] Date of birth reads as a group: "What is your date of birth?, For example…".
- [ ] On a step change, "Step 2 of 4, Contact details, heading level 2" is read.
- [ ] On submit, "Application submitted" is read along with the reference number.

## Known limitations

- This is a static front-end demo with no back end, so the "submitted" data is not persisted.
- Without JavaScript, all form steps are shown at once and the "Continue" buttons do nothing. A production version would post each step to the server, for example with ASP.NET MVC and model validation.
