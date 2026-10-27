/**
 * Accordion — WAI-ARIA Authoring Practices "Accordion" pattern.
 * https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
 *
 * Markup contract:
 *   <div class="accordion" data-accordion>
 *     <h3 class="accordion__heading">
 *       <button class="accordion__trigger" aria-expanded="false" aria-controls="panel-id">…</button>
 *     </h3>
 *     <div class="accordion__panel" id="panel-id" role="region" aria-labelledby="trigger-id">…</div>
 *   </div>
 *
 * Keyboard: Enter/Space toggle (native button), ArrowUp/ArrowDown move between
 * headers, Home/End jump to first/last header.
 */
export function initAccordions(root = document) {
  root.querySelectorAll('[data-accordion]').forEach((accordion) => {
    const triggers = [...accordion.querySelectorAll('.accordion__trigger')];

    triggers.forEach((trigger) => {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      panel.hidden = trigger.getAttribute('aria-expanded') !== 'true';

      trigger.addEventListener('click', () => {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
      });

      trigger.addEventListener('keydown', (event) => {
        const index = triggers.indexOf(trigger);
        let next = null;

        switch (event.key) {
          case 'ArrowDown': next = triggers[(index + 1) % triggers.length]; break;
          case 'ArrowUp': next = triggers[(index - 1 + triggers.length) % triggers.length]; break;
          case 'Home': next = triggers[0]; break;
          case 'End': next = triggers[triggers.length - 1]; break;
          default: return;
        }

        event.preventDefault();
        next.focus();
      });
    });
  });
}
