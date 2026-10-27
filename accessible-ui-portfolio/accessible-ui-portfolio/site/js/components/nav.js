/**
 * Responsive navigation toggle (disclosure pattern).
 * - Button exposes state with aria-expanded and points at the menu with aria-controls.
 * - Escape closes the menu and returns focus to the toggle.
 * - Without JS the menu is always visible (progressive enhancement).
 */
export function initNav(root = document) {
  const toggle = root.querySelector('[data-nav-toggle]');
  if (!toggle) return;

  const menu = document.getElementById(toggle.getAttribute('aria-controls'));
  if (!menu) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
}
