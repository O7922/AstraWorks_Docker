export function MapPreview(): string {
  return `
    <section class="relative card overflow-hidden aspect-[4/3] md:aspect-[16/9]">
      <iframe
        src="/features/map/3Dmap.html"
        class="absolute inset-0 w-full h-full border-0"
        title="3Dマップ"
        loading="lazy"
      ></iframe>
      <button class="btn-primary absolute bottom-3 right-3 px-4 py-2 text-xs">
        ▲ ナビ開始
      </button>
    </section>
  `;
}
