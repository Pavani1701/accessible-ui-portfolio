/**
 * Modal dialog built on the native <dialog> element.
 *
 * showModal() provides, for free and consistently across modern browsers:
 *   - a focus trap and an inert background (WCAG 2.4.3 Focus Order)
 *   - Escape to close
 *   - role="dialog" + aria-modal semantics
 * This module adds the parts the platform leaves to us:
 *   - open triggers via [data-modal-open="dialog-id"]
 *   - moving initial focus to a sensible element ([autofocus] or the first button)
 *   - returning focus to the element that opened the dialog
 *   - emitting a "modal:confirm" event when the confirm action is used
 */
export function initModals(root = document) {
  root.querySelectorAll('[data-modal-open]').forEach((opener) => {
    const dialog = document.getElementById(opener.dataset.modalOpen);
    if (!dialog || typeof dialog.showModal !== 'function') return;

    opener.addEventListener('click', () => {
      dialog.returnFocusTo = opener;
      dialog.showModal();
      const initial = dialog.querySelector('[autofocus]') || dialog.querySelector('button');
      initial?.focus();
    });
  });

  root.querySelectorAll('dialog.modal').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      const action = event.target.closest('[data-modal-action]')?.dataset.modalAction;
      if (action) {
        dialog.close(action);
        return;
      }
      // Clicking the backdrop (the dialog box itself, outside .modal__inner) closes it.
      if (event.target === dialog) dialog.close('cancel');
    });

    dialog.addEventListener('close', () => {
      if (dialog.returnValue === 'confirm') {
        dialog.dispatchEvent(new CustomEvent('modal:confirm', { bubbles: true }));
      }
      dialog.returnFocusTo?.focus();
    });
  });
}
