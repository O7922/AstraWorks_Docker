import { SearchHeader } from '../components/SearchHeader';
import { SearchResultItem, type SearchResult } from '../components/SearchResultItem';

// === モックデータ（APIマージ後は searchPlaces を fetch に置き換える） ===
const MOCK_DATA: SearchResult[] = [
  { id: 'B601', displayName: 'B棟601教室', building: 'B', floor: 6, distanceMeters: 100 },
  { id: 'B602', displayName: 'B棟602教室', building: 'B', floor: 6, distanceMeters: 100 },
  { id: 'B603', displayName: 'B棟603教室', building: 'B', floor: 6, distanceMeters: 100 },
  { id: 'B604', displayName: 'B棟604教室', building: 'B', floor: 6, distanceMeters: 120 },
  { id: 'B605', displayName: 'B棟605教室', building: 'B', floor: 6, distanceMeters: 130 },
  { id: 'A101', displayName: 'A棟101教室', building: 'A', floor: 1, distanceMeters: 200 },
  { id: 'A201', displayName: 'A棟201教室', building: 'A', floor: 2, distanceMeters: 180 },
  { id: 'A301', displayName: 'A棟301教室', building: 'A', floor: 3, distanceMeters: 160 },
  { id: 'C101', displayName: 'C棟101教室', building: 'C', floor: 1, distanceMeters: 250 },
  { id: 'LIB',  displayName: '図書館',     building: '図', floor: 1, distanceMeters: 300 },
];

// API マージ後はここを fetch に置き換えるだけでOK
async function searchPlaces(q: string): Promise<SearchResult[]> {
  // TODO: 本実装
  // const res = await fetch(`/api/places/search?q=${encodeURIComponent(q)}`);
  // const data = await res.json();
  // return data.results as SearchResult[];

  // --- モック: 部分一致での予測検索 ---
  const lower = q.toLowerCase();
  return MOCK_DATA.filter(r =>
    r.displayName.toLowerCase().includes(lower) ||
    r.id.toLowerCase().includes(lower)
  );
}

export function renderSearch(root: HTMLElement): void {
  const state = { q: '', results: [] as SearchResult[] };

  function renderList(): string {
    return state.results.map(SearchResultItem).join('');
  }

  function paint(): void {
    const list   = root.querySelector('#search-results');
    const prompt = root.querySelector('#search-prompt');
    const empty  = root.querySelector('#search-empty');
    if (list) list.innerHTML = renderList();

    if (state.q === '') {
      prompt?.classList.remove('hidden');
      empty?.classList.add('hidden');
    } else if (state.results.length === 0) {
      prompt?.classList.add('hidden');
      empty?.classList.remove('hidden');
    } else {
      prompt?.classList.add('hidden');
      empty?.classList.add('hidden');
    }
  }

  root.innerHTML = `
    ${SearchHeader()}
    <p id="search-prompt"
       class="text-center text-gray-500 text-sm py-10">
      教室名や建物名を入力してください
    </p>
    <ul id="search-results" class="pb-6"></ul>
    <p id="search-empty"
       class="hidden text-center text-gray-500 text-sm py-10">
      該当する場所が見つかりません
    </p>
  `;

  const input = root.querySelector<HTMLInputElement>('#search-input');

  // 入力ごとに非同期検索。古いリクエストはreqIdで破棄
  let lastReqId = 0;
  input?.addEventListener('input', debounce(async () => {
    state.q = input.value.trim();
    const reqId = ++lastReqId;

    if (state.q === '') {
      state.results = [];
      paint();
      return;
    }

    const results = await searchPlaces(state.q);
    if (reqId !== lastReqId) return; // レース防止
    state.results = results;
    paint();
  }, 200));

  paint(); // 初回描画（プロンプト表示）

  // クリック委譲
  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;

    if (t.closest('[data-nav-back]')) {
      if (history.length > 1) history.back();
      else location.href = '../home/index.html';
      return;
    }
    if (t.closest('[data-search-clear]')) {
      if (input) {
        input.value = '';
        input.focus();
        input.dispatchEvent(new Event('input'));
      }
      return;
    }
    const navBtn = t.closest<HTMLElement>('[data-nav-to]');
    if (navBtn) {
      const id = navBtn.dataset.navTo;
      if (id) location.href = `../map/3Dmap.html?to=${encodeURIComponent(id)}&mode=navigate`;
    }
  });
}

function debounce<F extends (...args: any[]) => void>(fn: F, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
