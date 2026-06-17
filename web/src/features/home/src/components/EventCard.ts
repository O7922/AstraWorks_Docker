interface Props {
  title: string;
  icon: string;
}

export function EventCard(p: Props): string {
  return `
    <section class="card p-4 flex items-center gap-3">
      <span class="text-2xl">${p.icon}</span>
      <h2 class="text-sm font-semibold">${p.title}</h2>
      <span class="ml-auto text-brand-400 text-lg">›</span>
    </section>
  `;
}
