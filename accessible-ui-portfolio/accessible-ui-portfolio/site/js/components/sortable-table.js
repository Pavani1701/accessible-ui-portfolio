/**
 * Sortable, filterable data table.
 *
 * - Sort controls are real <button>s inside <th> (keyboard + screen reader friendly).
 * - aria-sort is set ONLY on the currently sorted column, per the ARIA spec.
 * - Results are announced through a polite live region instead of moving focus,
 *   so users keep their place (WCAG 4.1.3 Status Messages).
 * - Rows can supply a machine-sortable value via data-sort-value (e.g. ISO dates).
 */
export function initSortableTables(root = document) {
  root.querySelectorAll('[data-sortable-table]').forEach((table) => {
    const tbody = table.tBodies[0];
    const headers = [...table.tHead.rows[0].cells];
    const status = document.getElementById(table.dataset.statusId);
    const filterInput = document.getElementById(table.dataset.filterId);
    const emptyRow = tbody.querySelector('.table__empty');
    const dataRows = () => [...tbody.rows].filter((r) => r !== emptyRow);
    const total = dataRows().length;

    const announce = (message) => {
      if (!status) return;
      // Clear first so the same message is re-announced if repeated.
      status.textContent = '';
      window.setTimeout(() => { status.textContent = message; }, 50);
    };

    const cellValue = (row, index) => {
      const cell = row.cells[index];
      return cell.dataset.sortValue ?? cell.textContent.trim();
    };

    headers.forEach((th, index) => {
      const button = th.querySelector('.sort-btn');
      if (!button) return;

      button.addEventListener('click', () => {
        const direction = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';

        headers.forEach((h) => h.removeAttribute('aria-sort'));
        th.setAttribute('aria-sort', direction);

        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        const sorted = dataRows().sort((a, b) => {
          const result = collator.compare(cellValue(a, index), cellValue(b, index));
          return direction === 'ascending' ? result : -result;
        });
        sorted.forEach((row) => tbody.insertBefore(row, emptyRow));

        announce(`Sorted by ${button.textContent.trim()}, ${direction}.`);
      });
    });

    if (filterInput) {
      let timer;
      filterInput.addEventListener('input', () => {
        const query = filterInput.value.trim().toLowerCase();
        let visible = 0;

        dataRows().forEach((row) => {
          const match = !query || row.textContent.toLowerCase().includes(query);
          row.hidden = !match;
          if (match) visible += 1;
        });

        if (emptyRow) emptyRow.hidden = visible !== 0;

        // Debounce the announcement so screen readers aren't flooded per keystroke.
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          announce(visible === 0 ? 'No cases match your filter.' : `Showing ${visible} of ${total} cases.`);
        }, 400);
      });
    }
  });
}
