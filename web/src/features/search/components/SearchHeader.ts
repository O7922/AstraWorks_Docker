export function SearchHeader(): string {
  return `
    <header class="sticky top-0 z-10 bg-bg">
      <div class="flex items-center gap-2 px-3 py-2">
        <button data-nav-back
                class="w-10 h-10 rounded-full flex items-center justify-center text-xl active:bg-gray-200/60"
                aria-label="戻る">←</button>
        <button data-search-clear
                class="w-10 h-10 rounded-full flex items-center justify-center text-xl active:bg-gray-200/60"
                aria-label="クリア">×</button>
        <input id="search-input" type="search" placeholder="検索"
               autocomplete="off" autofocus
               class="flex-1 bg-transparent text-xl font-medium outline-none placeholder:opacity-90" />
      </div>
    </header>
  `;
}
