// ===== 字変 共通サウンド管理 =====
// 全ページで <script src="js/audio.js"></script> を読み込むだけで
// BGM再生・音量設定（設定画面での変更含む）が自動的に反映されます。
// ※iOSは <audio>.volume が効かないため Web Audio API(GainNode) で制御します。

(function () {
  const bgmEl = document.getElementById('bgm');
  if (!bgmEl) return;

  let audioCtx = null;
  let gainNode = null;

  // 保存されている音量を取得（未設定なら80%）
  function getVol() {
    const savedVol = localStorage.getItem('vol_bgm');
    return (savedVol !== null ? Number(savedVol) : 80) / 100;
  }

  // Web Audio API のグラフを構築（iOSでも音量制御できる確実な方法）
  function setupAudioGraph() {
    if (audioCtx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
      gainNode = audioCtx.createGain();
      const source = audioCtx.createMediaElementSource(bgmEl);
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      gainNode.gain.value = getVol();
    } catch (e) {
      // Web Audio 非対応環境は volume プロパティにフォールバック
      gainNode = null;
      bgmEl.volume = getVol();
    }
  }

  // 音量を反映（GainNode優先 / 無ければ volume プロパティ）
  function applyBgmVolume() {
    const vol = getVol();
    if (gainNode) {
      gainNode.gain.value = vol;
    } else {
      bgmEl.volume = vol;
    }
    // 音量0なら確実にミュート（.muted はiOSでも効く）
    bgmEl.muted = (vol <= 0);
  }
  applyBgmVolume();

  // 自動再生ブロック対策：最初のタップ/クリックで AudioContext生成＋再生開始
  const tryPlayBgm = () => {
    setupAudioGraph();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    applyBgmVolume();
    bgmEl.play().catch(() => {});
    document.removeEventListener('click', tryPlayBgm);
    document.removeEventListener('touchstart', tryPlayBgm);
  };
  document.addEventListener('click', tryPlayBgm, { once: true });
  document.addEventListener('touchstart', tryPlayBgm, { once: true });

  // 他のタブ/ページで音量が変更された場合にも追従
  window.addEventListener('storage', (e) => {
    if (e.key === 'vol_bgm') applyBgmVolume();
  });

  // ===== ページ復元時に音量を再適用 =====
  // bfcache復元（戻る/進むボタン）で pageshow が発火
  window.addEventListener('pageshow', (e) => {
    applyBgmVolume();
    if (e.persisted) {
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      bgmEl.play().catch(() => {});
    }
  });

  // タブが非表示→表示に戻った時にも再適用
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      applyBgmVolume();
    }
  });

  // saveVolume から呼べるように公開
  window._applyBgmVolume = applyBgmVolume;
})();

// ===== 効果音（SE）再生用ヘルパー =====
// 使い方: playSE('images/se/card_place.mp3') のように呼び出す
function playSE(src) {
  const savedVol = localStorage.getItem('vol_se');
  const vol = (savedVol !== null ? Number(savedVol) : 80) / 100;
  if (vol <= 0) return; // 音量0なら再生自体スキップ
  const se = new Audio(src);
  se.volume = vol;
  se.muted = false;
  se.play().catch(() => {});
}

// ===== 音量保存共通関数（setting.html から呼び出し） =====
function saveVolume(type, val) {
  localStorage.setItem('vol_' + type, val);
  if (type === 'bgm') {
    const bgmEl = document.getElementById('bgm');
    if (bgmEl) {
      // フォールバック環境用に volume / muted も更新
      bgmEl.volume = Number(val) / 100;
      bgmEl.muted = (Number(val) <= 0);
      // GainNode があれば即座に反映
      if (window._applyBgmVolume) window._applyBgmVolume();
    }
  }
}