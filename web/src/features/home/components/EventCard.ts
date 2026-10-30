import { ScheduleItem, esc, hm } from '../lib/schedule';

const EVENT_PAGE = '../event/event.html';
const COLLAPSED_COUNT = 2; // 閉じている時に見せる件数

function row(ev: ScheduleItem, now: Date): string {
  const ongoing = ev.start <= now && now < ev.end;
  const ended = ev.end <= now;
  const time = ev.start.toDateString() === now.toDateString() ? `${hm(ev.start)}〜` : '終日';
  const tag = ongoing
    ? '<span class="text-[10px] px-1.5 rounded bg-brand-500 text-white shrink-0">開催中</span>'
    : ended ? '<span class="text-[10px] px-1.5 rounded bg-gray-200 text-gray-500 shrink-0">終了</span>' : '';
  return `
    <li data-nav="${EVENT_PAGE}"
        class="flex items-center gap-2 text-xs min-w-0 px-2 py-1.5 rounded-lg cursor-pointer
               hover:bg-brand-50 ${ended ? 'text-gray-400' : 'text-gray-600'}">
      <span class="shrink-0 w-11">${time}</span>
      <span class="truncate">${esc(ev.title)}</span>
      ${tag}
    </li>`;
}

export function EventCard(events: ScheduleItem[], now = new Date(), expanded = false): string {
  const header = `
    <div data-nav="${EVENT_PAGE}" class="flex items-center gap-3 cursor-pointer">
      <span class="text-2xl">🍽</span>
      <h2 class="text-sm font-semibold">本日のイベント</h2>
      ${events.length ? `<span class="text-xs px-2 rounded-full bg-brand-100 text-brand-700">${events.length}件</span>` : ''}
      <span class="ml-auto text-brand-400 text-lg">›</span>
    </div>`;

  if (!events.length) {
    return `
      <section class="card p-4">
        ${header}
        <p class="mt-1 pl-9 text-xs text-gray-400">本日のイベントはありません</p>
      </section>`;
  }

  const shown = expanded ? events : events.slice(0, COLLAPSED_COUNT);
  const rest = events.length - COLLAPSED_COUNT;

  const toggle = rest > 0
    ? `<button type="button" data-toggle-events
               class="mt-1 ml-7 px-2 py-1 text-xs text-brand-600 rounded-full hover:bg-brand-50">
         ${expanded ? '閉じる ▲' : `すべて表示（ほか ${rest} 件）▼`}
       </button>`
    : '';

  return `
    <section class="card p-4">
      ${header}
      <ul class="mt-2 pl-7 space-y-0.5 ${expanded ? 'max-h-60 overflow-y-auto' : ''}">
        ${shown.map(ev => row(ev, now)).join('')}
      </ul>
      ${toggle}
    </section>`;
}
