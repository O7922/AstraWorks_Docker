export function SearchBar(): string {
  return `
    <section data-nav="../search/search.html"
             class="card flex items-center gap-2 px-4 py-3 cursor-pointer">
      <span class="text-gray-400">🔍</span>
      <input
        type="text"
        placeholder="検索"
        readonly
        tabindex="-1"
        class="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400 cursor-pointer pointer-events-none"
      />
    </section>
  `;
}
