import { ScheduleCard }  from '../components/ScheduleCard';
import { EventCard }     from '../components/EventCard';
import { SearchBar }     from '../components/SearchBar';
import { CategoryRow }   from '../components/CategoryRow';
import { MapPreview }    from '../components/MapPreview';
import { BottomNav }     from '../components/BottomNav';
import { getNextSchedule, getTodayEvents, purgeExpiredEvents } from '../lib/schedule';

export function renderHome(root: HTMLElement): void {
  root.innerHTML = `
    <main class="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-4 pb-24 space-y-3">
      <div id="schedule-slot"></div>
      <div id="event-slot"></div>
      ${SearchBar()}
      ${CategoryRow([
        { label: 'レストラン', icon: '🍴' },
        { label: 'トイレ',      icon: '🚻' },
        { label: 'バス',        icon: '🚌' },
        { label: '図書館',      icon: '📚' },
      ])}
      ${MapPreview()}
    </main>
    ${BottomNav([
      { label: 'ホーム',   icon: '🏠', active: true,  href: '../home/index.html' },
      { label: 'マップ',   icon: '🗺',  active: false, href: '../map/3Dmap.html' },
      { label: 'イベント', icon: '📅', active: false, href: '../event/event.html' },
      { label: '設定',     icon: '⚙️', active: false, href: '../settings/settings.html' },
    ])}
  `;

  // 上2枚のカードだけ再描画（3Dマップのiframeは作り直さない）
  const scheduleSlot = root.querySelector<HTMLElement>('#schedule-slot')!;
  const eventSlot    = root.querySelector<HTMLElement>('#event-slot')!;
  let eventsExpanded = false; // 本日のイベントの開閉状態（再描画しても保持）
  const refresh = () => {
    const now = new Date();
    purgeExpiredEvents(now); // 終了から24時間たったイベントを自動削除
    scheduleSlot.innerHTML = ScheduleCard(getNextSchedule(now), now);
    eventSlot.innerHTML    = EventCard(getTodayEvents(now), now, eventsExpanded);
  };
  refresh();
  setInterval(refresh, 30_000);                       // 時間経過で次の予定へ切替
  window.addEventListener('pageshow', refresh);      // 戻るボタン(bfcache)で戻った時
  window.addEventListener('storage', refresh);       // 別タブで編集した時
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });

  // クリック委譲: data-nav 属性を持つ要素のクリックを遷移に変換
  root.addEventListener('click', (e) => {
    // 本日のイベントの開閉（遷移はしない）
    if ((e.target as HTMLElement).closest('[data-toggle-events]')) {
      eventsExpanded = !eventsExpanded;
      refresh();
      return;
    }
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-nav]');
    if (!target) return;
    const href = target.dataset.nav;
    if (href) location.href = href;
  });
}
