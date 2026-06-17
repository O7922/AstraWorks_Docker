interface Item { label: string; icon: string; }

export function CategoryRow(items: Item[]): string {
  return `
    <section class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
      ${items.map(i => `
        <button class="pill whitespace-nowrap">
          <span>${i.icon}</span>${i.label}
        </button>
      `).join('')}
    </section>
  `;
}
