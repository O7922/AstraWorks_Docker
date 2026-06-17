export function MapPreview(): string {
  return `
    <section class="relative card overflow-hidden aspect-[4/3] md:aspect-[16/9]">
      <div id="map3d" class="absolute inset-0
        bg-gradient-to-br from-brand-100 via-brand-50 to-emerald-50
        flex items-center justify-center text-brand-700/40 text-sm">
        3Dマップ（Three.js）
      </div>
      <button class="btn-primary absolute bottom-3 right-3 px-4 py-2 text-xs">
        ▲ ナビ開始
      </button>
    </section>
  `;
}
