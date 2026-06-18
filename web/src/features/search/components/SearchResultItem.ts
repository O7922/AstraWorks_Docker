export interface SearchResult {
  id: string;
  displayName: string;       // 例: "B棟601教室"
  building?: string;         // 例: "B"
  floor?: number;            // 例: 6
  distanceMeters?: number;   // 例: 100
}

export function SearchResultItem(p: SearchResult): string {
  const initial = (p.building || p.displayName.charAt(0)).toUpperCase();
  const floorLabel = p.floor != null ? `${p.floor}階` : '';
  const distanceLabel = p.distanceMeters != null
    ? `現在地から${Math.round(p.distanceMeters)}m`
    : '';
  const sub = [floorLabel, distanceLabel].filter(Boolean).join(' ・ ');

  return `
    <li class="flex items-center gap-3 px-4 py-3 border-b border-brand-100/60">
      <div class="w-11 h-11 rounded-full bg-brand-100 text-brand-700 font-semibold text-base flex items-center justify-center shrink-0">
        ${initial}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-base font-medium truncate">${p.displayName}</p>
        <p class="text-sm text-gray-500">${sub}</p>
      </div>
      <button data-nav-to="${p.id}"
              class="px-4 py-2 rounded-full bg-white border border-brand-200 text-brand-600 text-sm font-medium active:bg-brand-50 shrink-0">
        ナビ開始
      </button>
    </li>
  `;
}
