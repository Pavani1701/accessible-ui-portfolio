import { initNav } from './components/nav.js';
import { initAccordions } from './components/accordion.js';
import { initTabs } from './components/tabs.js';
import { initModals } from './components/modal.js';
import { initSortableTables } from './components/sortable-table.js';

// Flag that JS is available so CSS can progressively enhance (e.g. hide the
// mobile menu only when the toggle button will actually work).
document.documentElement.classList.add('js');

initNav();
initAccordions();
initTabs();
initModals();
initSortableTables();

// Demo wiring for the components page --------------------------------------
const statusRegion = document.getElementById('demo-status');

document.getElementById('save-draft')?.addEventListener('click', () => {
  const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  statusRegion.textContent = `Draft saved at ${time}.`;
});

document.getElementById('withdraw-dialog')?.addEventListener('modal:confirm', () => {
  statusRegion.textContent = 'Your application PSS-204871 has been withdrawn.';
});
