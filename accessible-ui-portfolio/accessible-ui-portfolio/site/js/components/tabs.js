/**
 * Tabs — WAI-ARIA Authoring Practices "Tabs with Automatic Activation".
 * https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 *
 * - Roving tabindex: only the selected tab is in the Tab sequence.
 * - ArrowLeft/ArrowRight move and activate, Home/End jump to first/last.
 * - Each panel is labelled by its tab and is itself focusable (tabindex="0")
 *   so keyboard users can reach panels that start with non-interactive content.
 */
export function initTabs(root = document) {
  root.querySelectorAll('[data-tabs]').forEach((container) => {
    const tabs = [...container.querySelectorAll('[role="tab"]')];

    const select = (tab, { focus = true } = {}) => {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
      });
      if (focus) tab.focus();
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => select(tab));

      tab.addEventListener('keydown', (event) => {
        const index = tabs.indexOf(tab);
        let next = null;

        switch (event.key) {
          case 'ArrowRight': next = tabs[(index + 1) % tabs.length]; break;
          case 'ArrowLeft': next = tabs[(index - 1 + tabs.length) % tabs.length]; break;
          case 'Home': next = tabs[0]; break;
          case 'End': next = tabs[tabs.length - 1]; break;
          default: return;
        }

        event.preventDefault();
        select(next);
      });
    });

    const initial = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    select(initial, { focus: false });
  });
}
