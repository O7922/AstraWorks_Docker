interface Tab { label: string; icon: string; active: boolean; href: string; }

export function BottomNav(tabs: Tab[]): string {
  return `
    <nav class="fixed bottom-0 left-0 right-0
                bg-white/95 backdrop-blur border-t border-gray-200">
      <div class="mx-auto max-w-md md:max-w-2xl lg:max-w-4xl
                  flex items-center px-2 py-1.5 safe-bottom">
        ${tabs.map(t => `
          <button class="tab-btn ${t.active ? 'active' : ''}" data-nav="${t.href}">
            <span class="text-lg">${t.icon}</span>
            <span class="text-[10px]">${t.label}</span>
          </button>
        `).join('')}
      </div>
    </nav>
  `;
}
