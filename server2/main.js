// ═══════════════════════════════════════════
//  NIT-MAP / main.js
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  // ─────────────────────────────────────────
  // 1. モーダル 開く・閉じる
  // ─────────────────────────────────────────
  const overlay      = document.getElementById('eventModal');
  const openBtn      = document.getElementById('openModalBtn');
  const closeBtn     = document.getElementById('closeModalBtn');
  const closeBtn2    = document.getElementById('closeModalBtn2');
  const navEventReg  = document.getElementById('nav-event-reg');

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // 背景スクロール禁止
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ボタンから開く
  if (openBtn)     openBtn.addEventListener('click', openModal);
  // サイドバーの「イベント登録」からも開く
  if (navEventReg) navEventReg.addEventListener('click', openModal);

  // ✕ ボタン・キャンセルボタンで閉じる
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (closeBtn2) closeBtn2.addEventListener('click', closeModal);

  // オーバーレイ（背景）クリックで閉じる
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // ESCキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });


  // ─────────────────────────────────────────
  // 2. サイドバー アコーディオン
  // ─────────────────────────────────────────
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const accordion = header.closest('.accordion');
      const bodyId    = header.dataset.target;
      const body      = document.getElementById(bodyId);

      const isOpen = !accordion.classList.contains('closed');

      if (isOpen) {
        accordion.classList.add('closed');
        body.classList.add('closed');
      } else {
        accordion.classList.remove('closed');
        body.classList.remove('closed');
      }
    });
  });


  // ─────────────────────────────────────────
  // 3. サイドバー ナビアイテム アクティブ切り替え
  // ─────────────────────────────────────────
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });


  // ─────────────────────────────────────────
  // 4. タグ入力（Enter で追加・✕ で削除）
  // ─────────────────────────────────────────
  const tagInput = document.getElementById('tagInput');
  const tagWrap  = document.getElementById('tagWrap');

  if (tagInput && tagWrap) {
    // タグ追加
    tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const value = tagInput.value.trim().replace(/,$/, '');
        if (!value) return;

        const tag = createTagEl(value);
        tagWrap.insertBefore(tag, tagInput);
        tagInput.value = '';
      }
      // Backspaceで最後のタグを削除
      if (e.key === 'Backspace' && tagInput.value === '') {
        const tags = tagWrap.querySelectorAll('.tag');
        if (tags.length > 0) tags[tags.length - 1].remove();
      }
    });

    // タグエリアをクリックすると入力欄にフォーカス
    tagWrap.addEventListener('click', () => tagInput.focus());

    // 既存タグの削除ボタンをJSで管理
    tagWrap.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('.tag').remove());
    });
  }

  function createTagEl(text) {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `${escapeHtml(text)} <span class="tag-remove">✕</span>`;
    tag.querySelector('.tag-remove').addEventListener('click', () => tag.remove());
    return tag;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }


  // ─────────────────────────────────────────
  // 5. ピンカラー 選択切り替え
  // ─────────────────────────────────────────
  const colorDots = document.querySelectorAll('.color-dot');

  colorDots.forEach(dot => {
    dot.addEventListener('click', () => {
      colorDots.forEach(d => d.classList.remove('selected'));
      dot.classList.add('selected');
    });
  });


  // ─────────────────────────────────────────
  // 6. 優先度チップ 選択切り替え
  // ─────────────────────────────────────────
  const priorityChips = document.querySelectorAll('.priority-chip');

  priorityChips.forEach(chip => {
    chip.addEventListener('click', () => {
      priorityChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });


  // ─────────────────────────────────────────
  // 7. 公開ステータス トグル切り替え
  // ─────────────────────────────────────────
  const toggleOpts = document.querySelectorAll('.toggle-opt');

  toggleOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      // 同じ .toggle-group 内だけ切り替える
      const group = opt.closest('.toggle-group');
      group.querySelectorAll('.toggle-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
    });
  });


  // ─────────────────────────────────────────
  // 8. 画像アップロードゾーン クリック
  // ─────────────────────────────────────────
  const uploadZone = document.querySelector('.upload-zone');

  if (uploadZone) {
    const fileInput = document.createElement('input');
    fileInput.type   = 'file';
    fileInput.accept = 'image/png, image/jpeg, image/webp';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    uploadZone.addEventListener('click', () => fileInput.click());

    // ドラッグ＆ドロップ
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = 'var(--accent-lt)';
      uploadZone.style.background  = 'var(--accent-glow)';
    });
    uploadZone.addEventListener('dragleave', () => {
      uploadZone.style.borderColor = '';
      uploadZone.style.background  = '';
    });
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = '';
      uploadZone.style.background  = '';
      const file = e.dataTransfer.files[0];
      if (file) handleImageFile(file);
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) handleImageFile(fileInput.files[0]);
    });

    function handleImageFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadZone.innerHTML = `
          <img src="${e.target.result}"
               style="max-height:120px;border-radius:4px;object-fit:cover;" />
          <div class="upload-text" style="margin-top:8px">${escapeHtml(file.name)}</div>
          <div class="upload-text" style="margin-top:2px;color:var(--muted)">
            クリックで変更
          </div>`;
        uploadZone.addEventListener('click', () => fileInput.click(), { once: true });
      };
      reader.readAsDataURL(file);
    }
  }

}); // DOMContentLoaded