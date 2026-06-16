interface Props {
  timeLabel: string;
  title: string;
  place: string;
}

export function ScheduleCard(p: Props): string {
  return `
    <section class="card p-5">
      <div class="text-center space-y-1">
        <p class="text-xs text-gray-500">${p.title}</p>
        <p class="text-2xl font-bold tracking-tight">${p.timeLabel}</p>
        <p class="text-base font-semibold text-gray-700">${p.place}</p>
      </div>
      <button class="btn-primary w-full mt-4 py-2.5 text-sm">
        ここへのルートを案内
      </button>
    </section>
  `;
}
