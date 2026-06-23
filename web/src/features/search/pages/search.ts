import { SearchHeader } from '../components/SearchHeader';
import { SearchResultItem, type SearchResult } from '../components/SearchResultItem';

const API_BASE = 'http://localhost:3000';

async function searchPlaces(q: string): Promise<SearchResult[]> {
  if (!q) return [];

  // スペース・カンマ・読点で複数キーワードに分割
  const tokens = q.split(/[\s,、　]+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const params = new URLSearchParams();
  for (const t of tokens) params.append('name', t);

  const res = await fetch(`${API_BASE}/routes/places?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: Array<{ id: number; name: string }> = await res.json();

  return data.map(d => ({
    id: String(d.id),
    displayName: d.name,
  }));
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

  let lastReqId = 0;
  input?.addEventListener('input', debounce(async () => {
    state.q = input.value.trim();
    const reqId = ++lastReqId;

    if (state.q === '') {
      state.results = [];
      paint();
      return;
    }

    try {
      const results = await searchPlaces(state.q);
      if (reqId !== lastReqId) return;
      state.results = results;
      paint();
    } catch (err) {
      if (reqId !== lastReqId) return;
      console.error('[search] API error:', err);
      state.results = [];
      paint();
    }
  }, 200));

  paint();

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
