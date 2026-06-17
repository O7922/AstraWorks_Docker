export function SearchBar(): string {
  return `
    <section class="card flex items-center gap-2 px-4 py-3">
      <span class="text-gray-400">🔍</span>
      <input
        type="text"
        placeholder="検索"
        class="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
      />
    </section>
  `;
}
