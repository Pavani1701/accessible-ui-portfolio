/**
 * Accessible multi-step application form.
 *
 * Accessibility behaviors implemented here:
 *  - Error summary at the top of the step receives focus when validation fails
 *    and links to each invalid field (WCAG 3.3.1 Error Identification).
 *  - Each invalid field gets aria-invalid="true" and its error message is
 *    added to aria-describedby, so it is read when the field gets focus.
 *  - Error text is specific and tells the user how to fix it (WCAG 3.3.3).
 *  - On a step change, focus moves to the new step heading and the page
 *    <title> is updated, so screen reader users know where they are (2.4.2, 2.4.3).
 *  - Step indicator uses aria-current="step"; completed steps are labelled in
 *    text, not just with color (1.4.1).
 *  - Users can review and change answers before submitting (3.3.4).
 */
import { initNav } from './components/nav.js';

document.documentElement.classList.add('js');
initNav();

const form = document.getElementById('apply-form');
const steps = [...form.querySelectorAll('[data-step]')];
const indicatorItems = [...document.querySelectorAll('.step-indicator li')];
const errorSummary = document.getElementById('error-summary');
const errorList = errorSummary.querySelector('.error-summary__list');
const confirmation = document.getElementById('confirmation');
const baseTitle = 'Apply for Child Care Assistance – Prairie State Services (Demo)';

let current = 0;
const attempted = new Set(); // steps the user has tried to submit

// Validation -----------------------------------------------------------------

function isValidDate(m, d, y) {
  if (!/^\d{1,2}$/.test(m) || !/^\d{1,2}$/.test(d) || !/^\d{4}$/.test(y)) return false;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.getFullYear() === Number(y) && date.getMonth() === Number(m) - 1 && date.getDate() === Number(d);
}

/** Returns an error message for a [data-validate] element, or '' if valid. */
function getError(el) {
  const { dataset } = el;

  if (dataset.validate === 'choice') {
    return el.querySelector('input:checked') ? '' : dataset.required;
  }

  if (dataset.validate === 'date') {
    const [m, d, y] = ['month', 'day', 'year'].map((p) => el.querySelector(`[data-part="${p}"]`).value.trim());
    if (!m && !d && !y) return dataset.required;
    if (!isValidDate(m, d, y)) return dataset.invalid;
    if (new Date(Number(y), Number(m) - 1, Number(d)) > new Date()) return dataset.future;
    return '';
  }

  if (el.type === 'checkbox') {
    return el.checked ? '' : dataset.required;
  }

  const value = el.value.trim();
  if (!value) return dataset.required || '';
  if (dataset.pattern && !new RegExp(dataset.pattern).test(value)) return dataset.patternMessage;
  if (dataset.min !== undefined) {
    const n = Number(value);
    if (!/^\d+$/.test(value) || n < Number(dataset.min) || n > Number(dataset.max)) return dataset.rangeMessage;
  }
  return '';
}

/** The element that should receive focus for a given validated element. */
function focusTarget(el) {
  return el.matches('fieldset') ? el.querySelector('input, select') : el;
}

function setDescribedBy(el, id, add) {
  const ids = new Set((el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
  if (add) ids.add(id); else ids.delete(id);
  if (ids.size) el.setAttribute('aria-describedby', [...ids].join(' '));
  else el.removeAttribute('aria-describedby');
}

function showFieldError(el, message) {
  const field = el.closest('.field');
  const errorEl = field.querySelector('.error-message');
  const invalidTargets = el.matches('fieldset')
    ? (el.dataset.validate === 'date' ? [...el.querySelectorAll('input')] : [])
    : [el];

  field.classList.toggle('field--error', Boolean(message));
  errorEl.hidden = !message;
  errorEl.innerHTML = message ? `<span class="visually-hidden">Error:</span> ${message}` : '';
  setDescribedBy(el, errorEl.id, Boolean(message));

  invalidTargets.forEach((t) => {
    if (message) t.setAttribute('aria-invalid', 'true');
    else t.removeAttribute('aria-invalid');
  });
}

function validateStep(stepEl) {
  const errors = [];
  stepEl.querySelectorAll('[data-validate]').forEach((el) => {
    const message = getError(el);
    showFieldError(el, message);
    if (message) errors.push({ el, message });
  });
  return errors;
}

function renderErrorSummary(errors) {
  errorList.innerHTML = '';
  errors.forEach(({ el, message }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${focusTarget(el).id}`;
    a.textContent = message;
    li.append(a);
    errorList.append(li);
  });
  errorSummary.hidden = errors.length === 0;
}

// Clicking an error summary link focuses the field and scrolls its label into view.
errorList.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  event.preventDefault();
  const target = document.getElementById(link.hash.slice(1));
  target.closest('.field').scrollIntoView({ block: 'start' });
  target.focus({ preventScroll: true });
});

// Re-validate a field when the user leaves it, but only after they have
// tried to continue once — we don't nag people before they've finished typing.
form.addEventListener('focusout', (event) => {
  const stepEl = event.target.closest('[data-step]');
  if (!stepEl || !attempted.has(steps.indexOf(stepEl))) return;
  const validated = event.target.closest('[data-validate]');
  if (!validated) return;

  // For grouped inputs, wait until focus has actually left the group.
  window.setTimeout(() => {
    if (validated.matches('fieldset') && validated.contains(document.activeElement)) return;
    showFieldError(validated, getError(validated));
    const remaining = [...stepEl.querySelectorAll('[data-validate]')]
      .map((el) => ({ el, message: getError(el) }))
      .filter((e) => e.message);
    renderErrorSummary(remaining);
  }, 0);
});

// Step navigation ------------------------------------------------------------

function goToStep(index, { focusEl, focus = true } = {}) {
  current = index;

  steps.forEach((step, i) => { step.hidden = i !== index; });

  indicatorItems.forEach((li, i) => {
    li.classList.toggle('is-complete', i < index);
    if (i === index) li.setAttribute('aria-current', 'step');
    else li.removeAttribute('aria-current');
    li.querySelector('.step-indicator__status').textContent = i < index ? ' (completed)' : '';
  });

  errorSummary.hidden = true;

  const heading = steps[index].querySelector('h2');
  const label = heading.querySelector('[data-title]').textContent.trim();
  document.title = `Step ${index + 1} of ${steps.length}: ${label} – ${baseTitle}`;

  if (steps[index].dataset.step === 'review') buildReview();

  if (focus) (focusEl || heading).focus();
}

form.addEventListener('click', (event) => {
  if (event.target.closest('[data-next]')) {
    attempted.add(current);
    const errors = validateStep(steps[current]);
    if (errors.length) {
      renderErrorSummary(errors);
      document.title = `Error: ${document.title.replace(/^Error: /, '')}`;
      errorSummary.focus();
      return;
    }
    goToStep(current + 1);
  }

  if (event.target.closest('[data-back]')) {
    goToStep(current - 1);
  }

  const change = event.target.closest('[data-change]');
  if (change) {
    const el = document.getElementById(change.dataset.change);
    const stepIndex = steps.indexOf(el.closest('[data-step]'));
    goToStep(stepIndex, { focusEl: focusTarget(el) });
  }
});

// Review ---------------------------------------------------------------------

function answerFor(el) {
  if (el.dataset.validate === 'choice') {
    const checked = el.querySelector('input:checked');
    return checked ? form.querySelector(`label[for="${checked.id}"]`).textContent.trim() : 'Not provided';
  }
  if (el.dataset.validate === 'date') {
    const [m, d, y] = ['month', 'day', 'year'].map((p) => el.querySelector(`[data-part="${p}"]`).value.trim());
    return new Date(Number(y), Number(m) - 1, Number(d))
      .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  if (el.tagName === 'SELECT') return el.options[el.selectedIndex].text;
  return el.value.trim() || 'Not provided';
}

function buildReview() {
  const list = document.getElementById('review-list');
  list.innerHTML = '';

  form.querySelectorAll('[data-review-label]').forEach((el) => {
    const row = document.createElement('div');
    row.className = 'summary-list__row';

    const dt = document.createElement('dt');
    dt.textContent = el.dataset.reviewLabel;

    const dd = document.createElement('dd');
    dd.textContent = answerFor(el);

    const action = document.createElement('dd');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn--link';
    button.dataset.change = el.id;
    // Visually "Change", but announced as "Change first name" (WCAG 2.4.6 / 2.5.3).
    button.innerHTML = `Change<span class="visually-hidden"> ${el.dataset.reviewLabel.toLowerCase()}</span>`;
    action.append(button);

    row.append(dt, dd, action);
    list.append(row);
  });
}

// Submit ---------------------------------------------------------------------

form.addEventListener('submit', (event) => {
  event.preventDefault();

  // Defensive re-validation of every step before "sending".
  for (let i = 0; i < steps.length; i += 1) {
    if (validateStep(steps[i]).length) {
      attempted.add(i);
      goToStep(i);
      renderErrorSummary(validateStep(steps[i]));
      errorSummary.focus();
      return;
    }
  }

  const ref = `PSS-${Math.floor(100000 + Math.random() * 900000)}`;
  document.getElementById('confirmation-ref').textContent = ref;
  document.getElementById('confirmation-email').textContent = form.elements.email.value.trim();

  form.hidden = true;
  document.querySelector('.step-indicator').hidden = true;
  confirmation.hidden = false;
  document.title = `Application submitted – ${baseTitle}`;
  confirmation.querySelector('h2').focus();
});

goToStep(0, { focus: false }); // don't steal focus on initial page load
