import { ScheduleItem, esc, hm, dayPrefix, navUrl } from '../lib/schedule';

const TIMETABLE_PAGE = '../timetable/timetable.html';

export function ScheduleCard(item: ScheduleItem | null, now = new Date()): string {
  const editLink = `
    <button data-nav="${TIMETABLE_PAGE}"
            class="absolute top-3 right-3 text-xs text-brand-600 px-2 py-1 rounded-full hover:bg-brand-50">
      🗓 時間割
    </button>`;

  if (!item) {
    return `
      <section class="card p-5 relative">
        ${editLink}
        <div class="text-center space-y-1">
          <p class="text-xs text-gray-500">次のスケジュール</p>
          <p class="text-lg font-bold text-gray-500 py-2">予定はありません</p>
          <p class="text-xs text-gray-400">時間割やイベントを登録するとここに表示されます</p>
        </div>
        <button data-nav="${TIMETABLE_PAGE}" class="btn-primary w-full mt-4 py-2.5 text-sm">
          時間割を設定する
        </button>
      </section>`;
  }

  const ongoing = item.start <= now;
  const timeLabel = ongoing
    ? `${item.kind === 'class' ? '授業中' : '開催中'}（〜${hm(item.end)}）`
    : `${dayPrefix(item.start, now)}${hm(item.start)}〜（開始）`;

  const badge = item.kind === 'class'
    ? `<span class="pill !py-0.5">📘 ${item.periodNo}限</span>`
    : `<span class="pill !py-0.5">🎉 イベント</span>`;

  const routeBtn = item.placeId != null && item.placeId !== ''
    ? `<button data-nav="${esc(navUrl(item.placeId))}" class="btn-primary w-full mt-4 py-2.5 text-sm">
         ここへのルートを案内
       </button>`
    : `<button disabled class="w-full mt-4 py-2.5 text-sm rounded-full bg-gray-200 text-gray-500">
         場所が未登録のため案内できません
       </button>`;

  return `
    <section class="card p-5 relative">
      ${editLink}
      <div class="text-center space-y-1">
        <p class="text-xs text-gray-500">次のスケジュール</p>
        <div class="flex justify-center">${badge}</div>
        <p class="text-2xl font-bold tracking-tight">${esc(timeLabel)}</p>
        <p class="text-base font-semibold">${esc(item.title)}</p>
        <p class="text-sm text-gray-600">${esc(item.place || '場所未設定')}</p>
      </div>
      ${routeBtn}
    </section>`;
}
