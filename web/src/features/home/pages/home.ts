import { ScheduleCard }  from '../components/ScheduleCard';
import { EventCard }     from '../components/EventCard';
import { SearchBar }     from '../components/SearchBar';
import { CategoryRow }   from '../components/CategoryRow';
import { MapPreview }    from '../components/MapPreview';
import { BottomNav }     from '../components/BottomNav';

export function renderHome(root: HTMLElement): void {
  root.innerHTML = `
    <main class="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-4 pb-24 space-y-3">
      ${ScheduleCard({
        timeLabel: '11:10〜（開始）',
        title: '次のスケジュール',
        place: 'B棟601教室',
      })}
      ${EventCard({ title: '本日のイベント', icon: '🍽' })}
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
      { label: 'マップ',   icon: '🗺',  active: true,  href: '../map/3Dmap.html' },
      { label: 'イベント', icon: '📅', active: false, href: '../event/event.html' },
      { label: '通知',     icon: '🔔', active: false, href: '../notification/notification.html' },
    ])}
  `;

  // クリック委譲: data-nav 属性を持つ要素のクリックを遷移に変換
  root.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-nav]');
    if (!target) return;
    const href = target.dataset.nav;
    if (href) location.href = href;
  });
}
