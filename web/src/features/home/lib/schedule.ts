// =====================================================================
// ホーム用: 時間割(astra.timetable.v1) と イベント(astra.events.v1) を
// localStorage から読み、「次のスケジュール」「本日のイベント」を算出する
//  ・API/DBは未使用（端末ローカル保存のみ）
//  ・イベントのキーは event.html と共通
// =====================================================================

export const EVENT_KEY = 'astra.events.v1';
export const TIMETABLE_KEY = 'astra.timetable.v1';

export interface StoredEvent {
  id: string;
  title: string;
  startAt: string; // datetime-local 形式 (YYYY-MM-DDTHH:mm)
  endAt: string;
  placeId: string | number | null;
  placeName: string;
}

export interface Period { start: string; end: string; } // "HH:mm"
export interface Cell { subject: string; room: string; placeId: string | number | null; }
export interface Timetable {
  periods: Period[];
  showSat: boolean;
  cells: Record<string, Cell>; // key: "<曜日 1=月..6=土>-<時限index 0始まり>"
}

export interface ScheduleItem {
  kind: 'class' | 'event';
  title: string;
  place: string;
  placeId: string | number | null;
  start: Date;
  end: Date;
  periodNo?: number;
}

export const DEFAULT_TIMETABLE: Timetable = {
  periods: [
    { start: '09:30', end: '11:00' },
    { start: '11:10', end: '12:40' },
    { start: '13:30', end: '15:00' },
    { start: '15:10', end: '16:40' },
  ],
  showSat: false,
  cells: {},
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadEvents(): StoredEvent[] {
  const v = readJson<unknown>(EVENT_KEY, []);
  return Array.isArray(v) ? (v as StoredEvent[]) : [];
}

export function loadTimetable(): Timetable {
  const v = readJson<Partial<Timetable>>(TIMETABLE_KEY, {});
  return {
    periods: Array.isArray(v.periods) && v.periods.length ? v.periods : DEFAULT_TIMETABLE.periods,
    showSat: !!v.showSat,
    cells: v.cells && typeof v.cells === 'object' ? v.cells : {},
  };
}

function at(base: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(base);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

/** 今日から days 日分の授業を日時付きで展開 */
function expandClasses(tt: Timetable, now: Date, days = 7): ScheduleItem[] {
  const items: ScheduleItem[] = [];
  for (let off = 0; off < days; off++) {
    const day = new Date(now);
    day.setDate(now.getDate() + off);
    const dow = day.getDay(); // 0=日 1=月 ... 6=土
    if (dow === 0 || (dow === 6 && !tt.showSat)) continue;
    tt.periods.forEach((p, i) => {
      const c = tt.cells[`${dow}-${i}`];
      if (!c || !c.subject) return;
      items.push({
        kind: 'class',
        title: c.subject,
        place: c.room,
        placeId: c.placeId ?? null,
        start: at(day, p.start),
        end: at(day, p.end),
        periodNo: i + 1,
      });
    });
  }
  return items;
}

function eventItems(events: StoredEvent[]): ScheduleItem[] {
  return events
    .map((e): ScheduleItem => ({
      kind: 'event',
      title: e.title,
      place: e.placeName,
      placeId: e.placeId ?? null,
      start: new Date(e.startAt),
      end: new Date(e.endAt),
    }))
    .filter(e => !isNaN(e.start.getTime()) && !isNaN(e.end.getTime()));
}

/** 現在進行中 or 次に始まる予定（授業・イベント混在）。開始時刻が早いもの優先 */
export function getNextSchedule(now = new Date()): ScheduleItem | null {
  const all = [...expandClasses(loadTimetable(), now), ...eventItems(loadEvents())]
    .filter(it => it.end > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime() || (a.kind === 'class' ? -1 : 1));
  return all[0] ?? null;
}

/** 終了したイベントを localStorage から自動削除するまでの時間（24時間・event.html と同じ値） */
export const EVENT_DELETE_MS = 24 * 60 * 60 * 1000;

/** 終了から EVENT_DELETE_MS 経過したイベントを削除。削除件数を返す */
export function purgeExpiredEvents(now = new Date()): number {
  const events = loadEvents();
  const t = now.getTime();
  const kept = events.filter(e => {
    const end = new Date(e.endAt).getTime();
    return isNaN(end) || end + EVENT_DELETE_MS > t;
  });
  if (kept.length !== events.length) {
    try { localStorage.setItem(EVENT_KEY, JSON.stringify(kept)); } catch { /* 容量エラー等は無視 */ }
  }
  return events.length - kept.length;
}

/** 終了したイベントをホームに残しておく時間（1時間） */
export const ENDED_KEEP_MS = 60 * 60 * 1000;

/**
 * 今日に開催期間がかかっているイベント
 *  ・終了から1時間を過ぎたものは除外
 *  ・開催中/これから → 終了済み の順、それぞれ開始順
 */
export function getTodayEvents(now = new Date()): ScheduleItem[] {
  const s = new Date(now); s.setHours(0, 0, 0, 0);
  const e = new Date(s); e.setDate(s.getDate() + 1);
  const t = now.getTime();
  return eventItems(loadEvents())
    .filter(ev => ev.start < e && ev.end >= s)
    .filter(ev => ev.end.getTime() + ENDED_KEEP_MS > t)
    .sort((a, b) => {
      const ea = a.end.getTime() <= t ? 1 : 0;
      const eb = b.end.getTime() <= t ? 1 : 0;
      return ea - eb || a.start.getTime() - b.start.getTime();
    });
}

// ---------- 表示ヘルパ ----------
export const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>
  )[c]);

export const hm = (d: Date): string => `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;

const WEEK = ['日', '月', '火', '水', '木', '金', '土'];

/** 今日→"", 明日→"明日 ", それ以外→"10/9(金) " */
export function dayPrefix(d: Date, now = new Date()): string {
  const a = new Date(now); a.setHours(0, 0, 0, 0);
  const b = new Date(d); b.setHours(0, 0, 0, 0);
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000);
  if (diff <= 0) return '';
  if (diff === 1) return '明日 ';
  return `${d.getMonth() + 1}/${d.getDate()}(${WEEK[d.getDay()]}) `;
}

export const MAP_NAV_PAGE = '../map/3Dmap.html';
export const navUrl = (placeId: string | number) =>
  `${MAP_NAV_PAGE}?to=${encodeURIComponent(String(placeId))}&mode=navigate`;
